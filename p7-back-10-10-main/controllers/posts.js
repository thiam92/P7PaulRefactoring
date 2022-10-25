const { default: mongoose } = require("mongoose")
const { unlink } = require("fs/promises")
const { Product } = require("../models/postschema")
const fs = require('fs');
  //récuperation posts
  function getposts(req, res) {
    Product.find({})
      .then((products) => res.send(products))
      .catch((error) => res.status(500).send(error))
  }
  
  //recuperation posts par id
  function getpostsById (req, res) {
    const id = req.params.id
    Product.findById(id)
    .then(product =>res.send(product))
    .catch(console.error)
  }

  //supprimer post
  function deletepost(req, res) {
    Product.findOne({_id: req.params.id})
    .then(post => {
           const filename = post.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
              Product.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });   
    })
    .catch( error => {
        res.status(500).json({ error });
    });

  }

  //modification post
  function modifpost(req, res) {
    const {
      params: { id }
    } = req
  
    const postObject = req.file ? {
      ...JSON.parse(req.body.post),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  Product.findOne({_id: req.params.id})
      .then((sauce) => { 
              Product.updateOne({ _id: req.params.id}, { ...postObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'post modifiée!'}))
              .catch(error => res.status(401).json({ error }));   
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
      
  }

  
  // fonction gerant la creation de post
  function createpost(req, res) {
//    const { body, file } = req
 //   console.log({ file })
  //  const { fileName } = file
    const post = JSON.parse( req.body.post)
    console.log(post)
    const {name, email, description, userId } = post 


    let post_image_url = null;
    if (req.file) {
      console.log('file')
        post_image_url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
    }
    //creation produit en suivant le schema product
    const product = new Product({
      userId: userId,
      name: name,
      email: email,
      description: description,
    // imageUrl: makeImageUrl(req, fileName),
      imageUrl: post_image_url,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
    })
    product
      .save()
      .then((message) => {
        return res.status(201).send({ message })
      })
      .catch((err) => res.status(500).send(err))
  }

  // fonction gerant like et dislike
  function likepost(req, res) {
    const id = req.params.id
    const { userId, like} = req.body
    // si like different de 1/0/-1 alors arret fonction +err
    if (![1, -1, 0].includes(like)) return res.status(403).send({ message: "Invalid like value" })
    // sinon 
    Product.findById(id)
    // une fois produit recu depuis la base de donnée, updateVote dessus
    .then(product => updateLike(product, like, userId, res))
    //return du produit et save de celui ci apres incrementVote ou resetVote
    .then((pr) => pr.save())
    //update du produit
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err))
}

function updateLike(product, like, userId, res) {
  // si like ou dislike alors appel incrementevote
  if (like === 1 || like === -1) return incrementLike(product, userId, like)
  // sinon appel resetVote (quand annulation like ou dislike)
  return resetLike(product, userId, res)
}

// fonction annulation like ou dislike
function resetLike(product, userId, res) {
  const { usersLiked, usersDisliked } = product
  // si pour chacune de ces arrays userId est trouvé alors return : 
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have voted both ways")

    // si userID n'est trouvé dans aucune de ces arrays alors return : 
  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("User seems to not have voted")

    //si user trouvé dans like
  if (usersLiked.includes(userId)) {
    //like -1
    --product.likes 
    product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    //si user trouvé dans dislike
  } else {
    //dislike -1
    --product.dislikes
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
  }
  return product
}

// fonction like ou dislike
function incrementLike(product, userId, like) {
  const { usersLiked, usersDisliked } = product

  // votersArray = a, si like on push dans usersLiked sinon on push dans usersDisliked
  const votersArray = like === 1 ? usersLiked : usersDisliked
  // si usersId deja dans le array alors on ne fait rien (a deja voté)
  if (votersArray.includes(userId)) return product
  // sinon on push l'id dans l'array
  votersArray.push(userId)

  // est ce que like =1, si oui alors like +1 sinon dislike
  like === 1 ? ++product.likes : ++product.dislikes
  return product
}

  module.exports = { getposts, createpost,  getpostsById,  deletepost,  modifpost, likepost }