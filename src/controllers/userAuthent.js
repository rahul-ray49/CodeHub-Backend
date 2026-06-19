const User=require('../models/user');
const {validate}=require('../utils/validate');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const Submission=require("../models/submission");


const register=async(req,res)=>{
    try{
      // validate the data
      console.log(req.body);
      validate(req.body);

      const {firstName,emailId,password}=req.body;
      
      //request body mein password ko hash karna hai

        req.body.password=await bcrypt.hash(password,10);
        req.body.role="user";
        
        
        //by default role user rakh denge jab bhi koi register karega
        //agar admin create karna hai toh uske liye alag se ek route bana denge jisme admin hi access kar sakta hai aur us route me role ko admin set kar denge



      
        //create the user in database

        const user=await User.create(req.body);


    // create a token for the user
      const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id
      };
      const token=jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
      res.cookie('token',token,{maxAge:60*60*1000});
      res.status(201).json({
        user:reply,
        message:"User Registered successfully"
      });

      


    }
    catch(err){
        res.status(400).send("message:"+err.message);
    }
}

const login=async(req,res)=>{

    try{
        const {emailId,password}=req.body;

        if(!emailId){
            throw new Error("Invalid credentials");
        }
        if(!password){
            throw new Error("Invalid credentials");
        }

        const user=await User.findOne({emailId:emailId});

        if(!user){
            throw new Error("Invalid credentials");
        }
        const match=await bcrypt.compare(password,user.password);

        if(!match){
            throw new Error("Invalid credentials");
        }
      const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id
      };
      const token=jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
      res.cookie('token',token,{maxAge:60*60*1000});
      res.status(200).json({
        user:reply,
        message:"Loggedin Successfully"
      });



    }
    catch(err){
        res.status(400).send("message:"+err.message);
    }
}

const logout=async(req,res)=>{
    try{
      const {token}=req.cookies;
      const payload=jwt.decode(token);


      await redisClient.set(`token:${token}`,"blocked");
      await redisClient.expire(`token:${token}`,payload.exp);

      //token added to token blocklist in redis
      

      res.cookie("token",null,{expires: new Date(Date.now())});
      res.send("User logged out successfully");





    }
    catch(err){
        res.status(503).send("message:"+err.message);
    }

}

const adminRegister=async(req,res)=>{
    try{
        //validate the data
        //if the user is admin or not check karna hai
        //agar admin hai toh hi aage badhna dena hai 
        //nahi toh nerro throw kar dena hai
        //iske liye hum adminmiddleware banayenge jismein hum basically verify krenge ki user kon hai normal user hai ya admin hai
        //basically admin he new admin ko register karega niormal user admins ko addd nahi karta sakta hai
        validate(req.body);
        const {firstName,emailId,password}=req.body;

        req.body.password=await bcrypt.hash(password,10);
        req.body.role="admin";

        const user=await User.create(req.body);
        const token=jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("Admin registered successfully");

    }
    catch(err){
        res.status(400).send("message:"+err.message);
    }
}

const deleteProfile=async(req,res)=>{
    try{
        const userId=req.result._id;
        //jo bhi delete request aaye req.result mai se User ki id nikalo mongoDB wali

        await User.findByIdAndDelete(userId);
        //isse id delete ho gayi

        //abb user ke related jitne bhi submission hai unhe bhi delete karna hoga so

        //await Submission.deleteMany({userId});
        //iska alternate tarika bhi hai.

        res.status(200).send("User Deleted Successfully"); 
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
}

module.exports={
    register,
    login,
    logout,
    adminRegister,
    deleteProfile
}








//I.steps we did to register a user
//1. Validate the input data
//2. Hash the password
//3.when the user is registered its role is always user by default.
//4.save the user in database
//5. Create a token for the user and send it in response as cookie
//6. The token payload contains user id, emailId and role which we will use later for authentication and authorization







//II. Steps we did to login a user
//1. Validate the input data
//2. Check if the user with given emailId exists in database
//3. If user exists then compare the password with the hashed password stored in database
//4. If password matches then create a token for the user and send it in response as cookie
//5. The token payload contains user id, emailId and role which we will use later for authentication and authorization
//6. If any of the above step fails then send an error response with message "Invalid credentials"
//7.ye token phir res.cookie ke through client ko bhej diya jayega aur client is token ko apne browser ke cookies me store kar lega taki jab bhi user koi request kare toh us request ke sath ye token bhi bhej de taki server us token ko verify karke user ko authenticate kar sake







//III. Steps we did to logout a user
//1. Get the token from cookies
//2. Decode the token to get the payload which contains user id, emailId and role
//3. Add the token to token blocklist in redis with key as "token:token" and value as "blocked"
//4.redis mai jab ye save hoga token toh uski expiry token ki expiry ke according set kardenge matlab jis time par token expire hoga ussi time par redis mai se woh token ka key bhi delete ho jaye
//5.hum aisa isliye karte hai taki agar token chori bhi hogaya toh redis mai check hoga kya iss token se kisine logout kiya hai agar haan kiya hai toh ye token valid nahi hoga
//6.aur redis mai token ki expiry ko humne token ki expiry ke time ke equal set kar diya taki jad token expire ho jaye to usko redis mai rakhne ka koi matlab nahi hai
