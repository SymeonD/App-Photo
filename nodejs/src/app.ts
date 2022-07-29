import * as express from "express";
// import * as fileUpload from "express-fileupload";
import * as jwt from "jsonwebtoken";
import { DAO } from "./model/DAO";
import { User } from "./model/User";
import { Post } from "./model/Post";
import { Photo } from "./model/Photo";

const app = express();
const https = require("https");
const http = require("http");
// const upload = fileUpload();
const PORT = process.env.PORT || 3000;
const dao = new DAO();
const auth_user = require("./auth/auth_user");
var cors = require("cors");
const bp = require('body-parser')

// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
});

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

// ----- Users
 
app.get("/users", async (req, res) => {
  var users: User[] = await dao.getUsers();
  if (users.length == 0) {
    res.status(404).send("There is currently no users");
  } else {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(users));
  }
});

// ----- User

app.get("/user", async (req, res) => {
  if(req.body["id"]){ // if searching by id
    var user: User = await dao.getUserById(
      req.body["id"]
    );
  }else{ // if searching by pseudo
    var user: User = await dao.getUserByPseudo(
      req.body["pseudo"]
    );
  }
  if (user[0] != null) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(user));
  } else {
    res.status(404).send("No user was found");
  }
});

app.post("/user", async (req, res) => {
  var success = await dao.createUser(
    req.body["mail"],
    req.body["password"],
    req.body["pseudo"]
  );
  if (success) {
    res.status(201).send("User has been added");
  } else {
    res.status(500).send("User hasn't been added");
  }
});

app.patch("/user", async (req, res) => {
  var user : User = new User(
    req.body["id"],
    req.body["mail"],
    req.body["password"],
    req.body["pseudo"]
  );
  var success = await dao.patchUser(user);
  if (success) {
    res.status(201).send("User has been patched");
  } else {
    res.status(500).send("User hasn't been patched");
  }
})

app.delete("/user", async (req, res) => {
  var success = await dao.delUser(
    req.body["id"]
  );
  if (success) {
    res.status(201).send("User has been deleted");
  } else {
    res.status(500).send("User hasn't been deleted");
  }
});

// ----- Posts

app.get("/posts", async (req, res) => {
  var posts: Post[] = await dao.getUserPosts(
    req.body["id"]
  );
  if (posts.length == 0) {
    res.status(404).send("There is currently no posts from this user");
  } else {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(posts));
  }
});

// ---- Post

app.get("/post", async (req, res) => {
  var post: Post = await dao.getPost(
    req.body["id"]
  ) 
  if(post[0] != null){
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(post));
  }else{
    res.status(404).send("There is currently no post with this id"); 
  }
})

app.post("/post", async (req,res) => {
  var id_post: string = await dao.createPost(
    req.body["description"],
    req.body["id_user"],
    req.body["localisation"],
    req.body["date_post"]
  );
  console.log(id_post);
  res.status(404).send("There is currently no post with this id"); 
})

// ----- Photos

app.get("/photos", async (req, res) => {
  var photos: Photo[] = await dao.getPhotos(
    req.body["id"]
  )
  if(photos.length == 0){
    res.status(404).send("There is currently no photos"); 
  }else{
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(photos));
  }
})

// ----- Connect

app.post("/connect", async(req,res) => {
  console.log("identifiants:",req.body["pseudo"], req.body["password"])
  var success : boolean = await dao.connect(
    req.body["pseudo"],
    req.body["password"]
  )
  if(success){
    res.status(201).send("Here you go");
  }else{
    res.status(404).send("No user found with this credentials")
  }
})