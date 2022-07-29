import * as jwt from 'jsonwebtoken';

module.exports = (req,res,next) => {
    if(req.headers.authorization){ // s'il y a un token d'authorization
        const token :string = req.headers.authorization.split(' ')[1];
        try {
            var decodedToken = jwt.verify(token, process.env.TOKEN); 
          } 
        catch(err) {
            res.status(401).send("invalid token");
        }
    }
    else{
        res.status(401).send("Requête imcomplete");
    }
};

