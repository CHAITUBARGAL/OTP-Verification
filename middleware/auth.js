import jwt from 'jsonwebtoken'
// import ENV from '../config.js'
const JWT_SECRET = process.env.JWT_SECRET;
export default async function Auth(req, res, next){
    try {
        // Accesss authprize header to validate request
        const token = req.headers.authorization.split(" ")[1];
        //retrive the user details for the logged in user
        const  decodedToken = await jwt.verify(token, JWT_SECRET);
        
        req.user = decodedToken;
        // res.json(decodedToken);
        next()
        
    } catch (error) {
        res.status(401).send({error: "Authentication failed"})
    }
}

export function localVariables(req, res, next){
    req.app.locals ={
        OTP : null,
        resetSession : false
    }
    next()
}