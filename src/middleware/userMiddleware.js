const jwt=require('jsonwebtoken');
const User=require('../models/user');
const redisClient=require('../config/redis');



const userMiddleware=async(req,res,next)=>{
    try{
        const token=req.cookies.token;
        
       
        if(!token){
            throw new Error("Token not present , userMiddleware");
        }
        //check agar kuch valid token hai ki nahi

        
        const payload=jwt.verify(token,process.env.JWT_SECRET); 
        //agar token present hai toh uska payload nikalo aur verify karo ki token valid hai ki nahi
        //agar token valid hai toh payload me user ki id aur emailId milegi jo token create karte time humne store kiya tha, agar token invalid hai toh ye line error throw karegi



        const {_id}=payload; 
        //_id ye woh wali id hai jo mongodb me user create karte time generate hoti hai, aur payload me humne _id aur emailId store kiya hai token create karte time
        


        if(!_id){
            throw new Error("Invalid token, userMiddleware");
        }

        const result=await User.findOne({_id});

        if(!result){
            throw new Error("User not found, userMiddleware");
        }


       

        const IsBlocked=await redisClient.exists(`token:${token}`);
        //check whether present in redis blocklist or not


        if(IsBlocked){
            throw new Error("Token is blocked, userMiddleware");
        }


       


        req.result=result;
        //agar token blocked nahi hai toh req.body mai user ki detauls ko store kar dete hai taki aage ke controllers me use kar sake
        
        
        
        next();


    }
    catch(err){
        res.status(400).send("userMiddleware,message:"+err.message);
    }
}

module.exports=userMiddleware;