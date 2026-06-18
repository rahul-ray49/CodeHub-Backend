const jwt=require("jsonwebtoken");
const User=require("../models/user");
const redisClient=require("../config/redis");

const adminMiddleware=async(req,res,next)=>{

    try{
        const {token}=req.cookies;



        if(!token){
            throw new Error("Token is not present,adminMiddleware");        
        }
        
        const payload=jwt.verify(token,process.env.JWT_SECRET);

        const {_id}=payload;

        if(!_id){
            throw new Error("Invalid token,adminMiddleware");
        }

        const result=await User.findById(_id);

        if(payload.role!="admin"){
            throw new Error("Invalid token");
        }

        if(!result){
            throw new Error("User doesn't exist,adminMiddleware");
        }

        

        const IsBlocked=await redisClient.exists(`token:${token}`);
        //Check whether present in redis blocklist or not

        
        if(IsBlocked){
            throw new Error("Invalid token,adminMiddleware");
        }

        req.result=result;
        //humne req.result me user ki details store kar di hai taki aage ke controllers me use kar sake




        next();



    }
    catch(err){
        res.status(401).send("Admin Middleware message:"+err.message);

    }

}
module.exports=adminMiddleware;



