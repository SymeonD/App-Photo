import { Pool } from "pg";
import { Client } from "pg";
import * as fs from "fs";

import { User } from "./User";
import { Post } from "./Post";
import { Photo } from "./Photo";
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from 'uuid';


export class DAO {
    _pool;
    _client;
  
    constructor() {
      this._pool = new Pool({
        // TODO: Remplacer par des variables d'environnement
        user: "postgres",
        host: "db",
        max: 40,
        database: "postgres",
        password: "postgres",
        port: 5432,
      });
      this._pool.connect();
    }

    creationHash(mdp: string): string {
        var mdpHash: string;
        const { createHash } = require("crypto");
        const hash = createHash("sha256");
        hash.update(mdp + process.env.SALT);
        mdpHash = hash.digest("hex");
        return mdpHash;
    }   
    
    // ----- Users

    async getUsers(): Promise<User[]> {
        var query: string = "SELECT * FROM users";
        var users: User[] = [];
        return await this._pool
          .query(query)
          .then((res) => {
            var i;
            for (i in res.rows) {
              var tempo: User = new User(
                res.rows[i]["id_user"],
                res.rows[i]["mail_user"],
                res.rows[i]["password_user"],
                res.rows[i]["pseudo_user"],
                res.rows[i]["profile_picture_user"],
                res.rows[i]["description_user"]
              );
              users.push(tempo);
            }
    
            return users;
          })
          .catch((e) => {
            return users;
          });
    }

    // ----- User

    async getUserById(id : string): Promise<User> {
        var users: User[] = [];
        var values: string[] = [
            id
        ];
        var query: string =
            "SELECT * FROM users WHERE id_user=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for (i in res.rows) {
                  var tempo: User = new User(
                    res.rows[i]["id_user"],
                    res.rows[i]["mail_user"],
                    res.rows[i]["password_user"],
                    res.rows[i]["pseudo_user"],
                    res.rows[i]["profile_picture_user"],
                    res.rows[i]["description_user"]
                  );
                  users.push(tempo);
                }
        
                return users;
              })
              .catch((e) => {
                return users;
              });
    }

    async getUserByPseudo(pseudo : string): Promise<User> {
        var users: User[] = [];
        var values: string[] = [
            pseudo
        ];
        var query: string =
            "SELECT * FROM users WHERE pseudo_user=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for (i in res.rows) {
                  var tempo: User = new User(
                    res.rows[i]["id_user"],
                    res.rows[i]["mail_user"],
                    res.rows[i]["password_user"],
                    res.rows[i]["pseudo_user"],
                    res.rows[i]["profile_picture_user"],
                    res.rows[i]["description_user"]
                  );
                  users.push(tempo);
                }
        
                return users;
              })
              .catch((e) => {
                return users;
              });
    }

    async createUser(
        mail: string,
        password: string,
        pseudo: string,
        profile_picture: string,
        description: string
    ): Promise<string> {
        var passwordHash: string;
        passwordHash = this.creationHash(password);
        let id_user = uuidv4();
        var query: string =
        "INSERT INTO users values($1,$2,$3,$4,$5,$6)";
        const values: string[] = [
        id_user,
        mail,
        passwordHash,
        pseudo,
        profile_picture,
        description
        ];
        for(var i=0;i<values.length;i++){ // Si un des éléments est null on retourne faux
            if(values[i] == ""){
                return "";
            }
        }
        return await this._pool
        .query(query, values)
        .then((res) => {
            return id_user;
        })
        .catch((e) => {
            if (e.code == 23505) {
                console.log("⚠️: Le compte existe déjà");
            } else {
                console.error(e.stack);
            }
            return false;
        });
    }
    
    async patchUser(user: User): Promise<Boolean> {
        var hash: string = null;
        if (user._password_user != null) {
          // s'il y a un mdp on le hash
          hash = this.creationHash(user._password_user);
        }
        var values: string[] = [
          user._id_user,
          user._mail_user,
          hash,
          user._pseudo_user,
          user._profile_picture_user,
          user._description_user
        ];
        var query: string =
          "UPDATE users SET mail_user=COALESCE($2,mail_user), password_user=COALESCE($3,password_user), pseudo_user=COALESCE($4,pseudo_user), profile_picture_user=COALESCE($5,profile_picture_user), description_user=COALESCE($6,description_user) WHERE id_user=$1";
        return await this._pool
          .query(query, values)
          .then((res) => {
            return true;
          })
          .catch((e) => {
            return false;
          });
    }

    async delUser(id : string): Promise<Boolean> {
        var values: string[] = [
            id
        ];
        var query: string =
            "DELETE FROM users WHERE id_user=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                return true;
            })
            .catch((e) => {
                return false;
            })
    }
    
    // ----- Posts

    async getUserPostsById(id : string): Promise<Post[]> {
        var posts: Post[] = [];
        var values: string[] = [
            id
        ];
        var query: string = 
            "SELECT * FROM posts WHERE id_user=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for (i in res.rows) {
                  var tempo: Post = new Post(
                    res.rows[i]["id_post"],
                    res.rows[i]["description_post"],
                    res.rows[i]["id_user"],
                    res.rows[i]["localisation_post"],
                    res.rows[i]["date_post"]
                  );
                  posts.push(tempo);
                }
        
                return posts.reverse();
              })
              .catch((e) => {
                return posts;
              });
    }

    async getUserPostsByDate(id : string, date: string, opt: string): Promise<Post[]> {
        var posts: Post[] = [];
        var values: string[] = [
            id, date
        ];
        if(opt == 'before'){
            var query: string = 
            "SELECT * FROM posts WHERE id_user=$1 and date_post<$2";
        }else{
            var query: string = 
            "SELECT * FROM posts WHERE id_user=$1 and date_post=$2";
        }
        
            return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for (i in res.rows) {
                  var tempo: Post = new Post(
                    res.rows[i]["id_post"],
                    res.rows[i]["description_post"],
                    res.rows[i]["id_user"],
                    res.rows[i]["localisation_post"],
                    res.rows[i]["date_post"]
                  );
                  posts.push(tempo);
                }
        
                return posts.reverse();
              })
              .catch((e) => {
                return posts;
              });
    }
    
    // ----- Post

    async getPost(id : string): Promise<Post>  {
        var posts: Post[] = [];
        var values: string [] = [
            id
        ];
        var query: string = 
            "SELECT * FROM posts WHERE id_post=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for(i in res.rows){
                    var tempo: Post = new Post(
                        res.rows[i]["id_post"],
                        res.rows[i]["description_post"],
                        res.rows[i]["id_user"],
                        res.rows[i]["localisation_post"],
                        res.rows[i]["date_post"]
                    );
                    posts.push(tempo);
                }   
                return posts;
            })
            .catch((e) => {
                return posts;
            });
    }

    async createPost(
        description: string,
        id_user: string,
        localisation: string,
        date_post
    ): Promise<string> {
        var values: string[] = [
            uuidv4(),
            description,
            id_user,
            localisation,
            date_post
        ];
        for(var i=0;i<values.length;i++){ // Si un des éléments est null on retourne faux
            if(values[i] == ""){
                return "";
            }
        };
        var query: string =
            "INSERT INTO Posts values($1, $2, $3, $4, $5)";
        return await this._pool
            .query(query, values)
            .then((res) => {
                return values[0];
            })
            .catch((e) => {
                if (e.code == 23505) {
                    console.log("⚠️: Le post existe déjà");
                } else {
                    console.error(e.stack);
                }
                return "";
            });
    }

    // ---- Photos

    async getNumPhoto(id : string): Promise<number>{
        var values: string[] = [
            id
        ];
        var query: string =
            "SELECT count(*) FROM photos WHERE id_post=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                return parseInt(res.rows[0].count);
            })
            .catch((e) => {
                return 1;
            });
    }

    async getPhotosById(id : string): Promise<Photo[]> {
        var photos: Photo[] = [];
        var values: string[] = [
            id
        ];
        var query: string =
            "SELECT * FROM photos WHERE id_post=$1";
        return await this._pool
            .query(query, values)
            .then((res) => {
                var i;
                for(i in res.rows){
                    var tempo: Photo = new Photo(
                        res.rows[i]["id_photo"],
                        res.rows[i]["id_post"],
                        res.rows[i]["link_photo"]
                    )
                    photos.push(tempo)
                }
                return photos;
            })
            .catch((e) => {
                return photos;
            });
    }

    // ---- Photo

    async postPhoto(id_post: string, link_photo: string): Promise<Boolean>{
        const values = [id_post, link_photo];
        const query :string=
            "INSERT INTO photos VALUES(default,$1,$2)";
        return await this._pool
            .query(query, values)
            .then((res) => {
                return true;
            })
            .catch((e) => {
                console.error(e.stack);
                return false;
            });
    };

    // ---- Connect
    //TODO: Add token access

    async connect(pseudo: string, password: string): Promise<string>{
        const query :string = 
            "SELECT id_user FROM users WHERE pseudo_user=$1 and password_user=$2"
        const passwordHash = this.creationHash(password);
        const values = [pseudo, passwordHash];
        
        return await this._pool
            .query(query, values)
            .then((res) => {
                if(res.rows.length == 0){
                    return "";
                }else{
                    return res.rows[0];
                }
            })
            .catch((e) => {return false})
    }   
}