const jwt=require("jsonwebtoken");
const User=require("../models/user");
const redisClient=require("../config/redis");

const adminMiddleware=async(req,res,next)=>{

    try{
        const {token}=req.cookies;



        if(!token){
           return res.status(401).json({
                success:false,
                message:"Token not found"
           });       
        }
        
        const payload=jwt.verify(token,process.env.JWT_SECRET);

        const {_id}=payload;

        if(!_id){
           return res.status(401).json({
                success:false,
                message:"Invalid token"
           });       
        }

        const result=await User.findById(_id);

        if(payload.role!=="admin"){
           return res.status(403).json({
                success:false,
                message:"Access denied, you are not an admin"
           });       
        }

        if(!result){
            return res.status(401).json({
                success:false,
                message:"User doesn't exist,adminMiddleware"
            });
        }

        

        const IsBlocked=await redisClient.exists(`token:${token}`);
        //Check whether present in redis blocklist or not

        
        if(IsBlocked){
            return res.status(401).json({
                success:false,
                message:"Invalid token,adminMiddleware"
            });
        }

        req.result=result;
        //humne req.result me user ki details store kar di hai taki aage ke controllers me use kar sake




        next();



    }
    catch(err){

            console.error(err);

           if(err.name==="JsonWebTokenError" || err.name==="TokenExpiredError"){
        return res.status(401).json({
            success:false,
            message:"Invalid or expired token"
        });
    }

        res.status(500).json({
            success:false,
            message:"Internal server error"
        });

    }

}
module.exports=adminMiddleware;



