const port = 3000
const path = require("path")
const {app, express} = require("./server")

//connection to database
require("./mongo")

//Controllers
const { createUser, logUser, getUserById } = require("./controllers/users")
const { getposts, createpost,  getpostsById,  deletepost,  modifpost, likepost } = require("./controllers/posts")

//Middleware
const { authenticateUser } = require("./middleware/auth")
const multer = require("./middleware/multer")

//routes
app.post("/api/auth/signup", createUser)
app.post("/api/auth/login", logUser)
// Add new api getUserById
app.get("/api/auth/:id", getUserById)
app.get("/api/posts", authenticateUser, getposts)
app.post("/api/posts", authenticateUser , multer, createpost)
app.get("/api/posts/:id", authenticateUser, getpostsById)


app.delete("/api/posts/:id", authenticateUser, deletepost)
app.put("/api/posts/:id", authenticateUser , multer, modifpost)
app.get("/", (req, res) => res.send("Hello World"))
app.post("/api/posts/:id/like", authenticateUser, likepost)

//Listen 
app.use("/images",  express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("Listening on port ", +port))