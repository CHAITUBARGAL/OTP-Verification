import UserModel from "../model/User.model.js";
import bcrypt from 'bcrypt'
import jwt  from "jsonwebtoken";
// import ENV from '../config.js'  
const JWT_SECRET = process.env.JWT_SECRET;
import otpGenerator from 'otp-generator'

// Middle layer for verify user
export async function verifyUser(req, res, next){
    try {
        const {username} = req.method == "GET" ? req.query : req.body;
        // check the user exitance
        let exist = await UserModel.findOne({ username});
        if(!exist) return res.status(404).send({ error : "Cant find user"});
        next();

    } catch (error) {
        return res.status(404).send({error : "Authentication Error"});
        
    }
}

// POST : http://localhost:5000/api/register
export async function register(req, res){
   try {
    const {username, password, profile, email} = req.body;
    // check the existing user
    const existUsername = new Promise((resolve, reject)=>{
        UserModel.findOne({username}, function(err, user){
            if(err) reject(new Error(err))
            if(user) reject({error: "Please use unique username"});

            resolve();
        })
    });
    // Check for existing email
    const existEmail = new Promise((resolve, reject)=>{
        UserModel.findOne({email}, function(err, email){
            if(err) reject(new Error(err))
            if(email) reject({error: "Please use unique email"});

            resolve();
        })
    });

    Promise.all([existUsername, existEmail])
    .then(()=>{
        if(password){
            bcrypt.hash(password, 10)
            .then(hashPassword =>{

                const user= new UserModel({
                    
                username,
                password: hashPassword,
                profile: profile  || "",
                email
                });

                // return save result as respoonse 
                user.save()
                .then(result => res.status(201).send({msg: "User Register Successfully"}))
                .catch(error => res.status(500).send({error}))
            }).catch(error =>{
                return res.status(500).send({
                    error : "Enabled to hashed password"
                })
            })
     
        }
    }).catch(error =>{
        return res.status(500).send({
            error : "Enable to hashed Passsword"
        })
    })
  
} catch (error) {
    return res.status(500).send(error);
   }
}

// POST : http://localhost:5000/api/login
export async function login(req, res){
   const { username, password}= req.body 
   try {
    UserModel.findOne({username})
    .then(user =>{
        bcrypt.compare(password, user.password)
        .then(passwordCheck =>{

            if(!passwordCheck) return res.status(400).send({error: "Dont have password"});

            // create JWT token
           const token= jwt.sign({
                userId: user._id,
                username: user.username
            }, JWT_SECRET, {expiresIn : "24h"});

            return res.status(200).send({
                msg: "Login Successful...!",
                username: user.username,
                token
            });

        })
        .catch(error =>{
            return res.status(400).send({error: "Password does not match"})
        })
    })
    .catch(error =>{
        return res.status(404).send({error: "Username not found"});
    })
    
   } catch (error) {
    return res.status(500).send({error});
    
   }
}

// GET : http://localhost:5000/api/user/example123
export async function getUser(req, res){
    const {username} = req.params;
    try {
        if(!username) return res.status(501).send({error : "Invalid Username"});
        
        UserModel.findOne({username}, function(err, user){
            if(err) return res.status(500).send({err});
            if(!user) return res.status(501).send({error : "Couldnt find User"});
            // Remove password from user
            // mongodb return unnecessary data with object so covert it into json
            const { password, ...rest }= Object.assign({}, user.toJSON());

            return res.status(201).send(rest)
        })
    } catch (error) {
        return res.status(404).send({error : "Cant find user"});
        
    }

}


// PUT : http://localhost:5000/api/updateuser
export async function updateUser(req,res){
    try {
        // const id = req.query.id;
        const { userId } = req.user;
      
        if(userId){
            const body = req.body;
            // update the data
            UserModel.updateOne({_id : userId }, body, function(err, data){
                if(err) throw err;

                return res.status(201).send({msg : "Record Updated...!"});
            })
        }else{
            return res.status(401).send({error : "User Not found...!"});
        }
    } catch (error) {
        return res.status(401).send({error});
        
    }
}
// GET : http://localhost:5000/api/generateOTP
export async function generateOTP(req, res){
 req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets : false, upperCaseAlphabets:false, specialChars: false})
 res.status(201).send({ code: req.app.locals.OTP})
    }

// GET : http://localhost:5000/api/verifyOTP
export async function verifyOTP(req, res){
    const { code} = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;  //reset the otp value
        req.app.locals.resetSession = true  //start session for reset password
        return res.status(201).send({msg: 'Verify Successfully'})
         }
         return res.status(400).send({error : "Invalid OTP"})
}
// GET : http://localhost:5000/api/createResetSession
export async function createResetSession(req, res){
    if(req.app.locals.resetSession){
        
        return res.status(201).send({ flag: req.app.locals.resetSession })
    }
    return res.status(440).send({error : "Session expired"})
}
// PUT : http://localhost:5000/api/resetPassword
export async function resetPassword(req, res){
    try {
        if(!req.app.locals.resetSession)  return res.status(440).send({error : "Session expired"})
        const {username, password} = req.body;
        try{
            UserModel.findOne({ username })
            .then(user =>{
                bcrypt.hash(password, 10)
                .then(hashPassword =>{
                    UserModel.updateOne({username: user.username},
                        {password: hashPassword}, function(err, data){
                            if(err) throw err;
                            return res.status(201).send({msg: "Record Updated...!"})
                        });
                })
                .catch( e =>{
                    return res.status(500).send({
                        error: "Enable to hashed password"
                    })
                })
            })
            .catch(error =>{
                return res.status(404).send({ error : "Username not found"});
            })
        
        
    }catch(error){
        return res.status(500).send({error})
    }
    
     }catch (error) {
        return res.status(401).send({error})
        
    }
}