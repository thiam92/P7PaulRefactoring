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
           if(req.file){
           const filename = post.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
              Product.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });  
           }
           else {
            Product.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
           }
 
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
  } : { ...req.body};

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
    const { userId, like} = req.body


    Product.findOne({ _id: req.params.id })
    .then(post => {
        let newUsersLiked = post.usersLiked
        let newUsersDisliked = post.usersDisliked
        if (like === 1) {
            if (post.usersLiked.includes(userId)) {
                newUsersLiked.splice(newUsersLiked.indexOf(userId), 1)
            } else {
                newUsersLiked.push(userId)
            }
        }
        if (like === -1) {
            if (post.usersDisliked.includes(userId)) {
                newUsersDisliked.splice(newUsersDisliked.indexOf(userId), 1)
            } else {
                newUsersDisliked.push(userId)
            }
        }
        if (like === 0) {
            if (post.usersLiked.includes(userId)) {
                newUsersLiked.splice(newUsersLiked.indexOf(userId), 1)
            }
            if (post.usersDisliked.includes(userId)) {
                newUsersDisliked.splice(newUsersDisliked.indexOf(userId), 1)
            } 
        }
        Product.updateOne(
            { _id: req.params.id }, 
            { 
                likes: newUsersLiked.length,
                dislikes: newUsersDisliked.length,
                usersLiked: newUsersLiked,
                usersDisliked: newUsersDisliked 
            }
        )
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
        
  
    })
}
module.exports = { getposts, createpost,  getpostsById,  deletepost,  modifpost, likepost }