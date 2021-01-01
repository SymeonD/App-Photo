import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as jwt from "jsonwebtoken";
import { DAO } from "./model/DAO";
import { User } from "./model/User";
import { Post } from "./model/Post";
import { Photo } from "./model/Photo";

const app = express();
const https = require("https");
const http = require("http");
const upload = fileUpload();
const PORT = process.env.PORT || 3000;
const dao = new DAO();
const auth_user = require("./auth/auth_user");
var cors = require("cors");

// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
});

app.use(express.json())
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }))

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
  if(req.query.id){ // if searching by id
    var user: User = await dao.getUserById(
      req.query.id
    );
  }else{ // if searching by pseudo
    var user: User = await dao.getUserByPseudo(
      req.query.pseudo
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
  let url_profile_picture;
  if (!req.files) {
    res.status(400).send("Missing file");
  } else {
    let profile_picture = req.files.profile_picture;
    url_profile_picture = "profile_picture_"+req.body["pseudo"]+"."+profile_picture.name.split('.').pop();
    profile_picture.mv("./uploads/"+ req.body["pseudo"] + "/" + url_profile_picture);
  }
  var id_user : string = await dao.createUser(
    req.body["mail"],
    req.body["password"],
    req.body["pseudo"],
    url_profile_picture,
    req.body["description"]
  );
  if (id_user != "") {
    res.status(201).json({id:id_user});
  } else {
    res.status(500).send("User hasn't been added");
  }
});

app.post("/connect", async(req,res) => {
  var id_user : string = await dao.connect(
    req.body["pseudo"],
    req.body["password"]
  )
  if(id_user != ""){
    res.status(201).json({id:id_user["id_user"]});
  }else{
    res.status(404).send("No user found with this credentials")
  }
})

app.patch("/user", async (req, res) => {
  var user : User = new User(
    req.body["id"],
    req.body["mail"],
    req.body["password"],
    req.body["pseudo"],
    req.body["profile_picture"],
    req.body["description"]
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
  var posts: Post[];
  if(req.query.date){
    posts = await dao.getUserPostsByDate(
      req.query.id,
      req.query.date
    );
  }else{
    posts = await dao.getUserPostsById( //Id of the user
      req.query.id
    );
  }
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
  var today = new Date();
  var id_post_resp: string = await dao.createPost(
    req.body["description"],
    req.body["id_user"],
    req.body["localisation"],
    today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  );
  if(id_post_resp == ''){
    res.status(401).send("The creation didn't went through"); 
  }else{
    res.status(201).json({id_post: id_post_resp}) 
  }
})

// ----- Photos

app.get("/photos", async (req, res) => {
  var photos: Photo[] = await dao.getPhotosById(
    req.query.id
  )
  if(photos.length == 0){
    res.status(404).send("There is currently no photos for this date"); 
  }else{
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(photos));
  }
})

// ----- Photo

app.post("/photo", async (req, res) => {
  var nbr = await dao.getNumPhoto(req.body["id_post"]);
  let url_photo;
  if (!req.files) {
    res.status(400).send("Missing file");
  } else {
    let photo = req.files.photo;
    let today = new Date();
    url_photo = today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')+'-'+nbr+"."+photo.name.split('.').pop();
    photo.mv("./uploads/"+ req.body["pseudo"] + "/" + url_photo);
  }
  var success = await dao.postPhoto(
    req.body["id_post"],
    url_photo
  );
  if (success) {
    res.status(201).send("Photo has been added");
  } else {
    res.status(500).send("Photo hasn't been added");
  }
});

// ----- Connect

app.post("/connect", async(req,res) => {
  var id_user : string = await dao.connect(
    req.body["pseudo"],
    req.body["password"]
  )
  if(id_user != ""){
    res.status(201).json({id:id_user["id_user"]});
  }else{
    res.status(404).send("No user found with this credentials")
  }
})