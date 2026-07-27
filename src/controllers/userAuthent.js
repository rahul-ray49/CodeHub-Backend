const User=require('../models/user');
const {validate}=require('../utils/validate');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const Submission=require("../models/submission");
const crypto=require("crypto");
const cloudinary=require("../config/cloudinary");
const fs=require("fs");
const sendVerificationEmail = require("../utils/brevoMail");

const register = async (req, res) => {
    try {
        console.log("1. Register Started");
        validate(req.body);
        console.log("2. Validation Done");
        const { firstName, emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        console.log("3. Existing User Checked");

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");
        console.log("4. Token Generated");

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("5. Password Hashed");


        const user = await User.create({
            ...req.body,
            password: hashedPassword,
            role: "user",
            verificationToken
        });
        console.log("6. User Created");


       
        const verificationLink = `${process.env.BACKEND_URL}/email/verify/${verificationToken}`;
        console.log("7. Before sendMail");
        console.log(process.env.BREVO_EMAIL);
        console.log(process.env.BREVO_PASS ? "PASS FOUND" : "PASS MISSING");

        await sendVerificationEmail({
                to: emailId,
                subject: "Verify Your Email",
                html:  `
                <h2>Welcome to CodeHub 🚀</h2>

                <p>Hi ${user.firstName},</p>

                <p>Thank you for registering on CodeHub.</p>

                <p>Please click the button below to verify your email address.</p>

                <a
                    href="${verificationLink}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                    "
                >
                    Verify Email
                </a>

                <p style="margin-top:20px;">
                    If you didn't create this account, you can safely ignore this email.
                </p>
            `
            });
        console.log("8. After sendMail");
        console.log("9. Sending Response");

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email."
        });

    } catch (err) {

        console.error(err);

        if (
            err.message === "invalid email" ||
            err.message === "some fields missing" ||
            err.message === "password should be strong"
        ) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    }
};

const login=async(req,res)=>{

    try{
        const {emailId,password}=req.body;

        if(!emailId){
           return res.status(400).json({
                success:false,
                message: "Invalid credentials"
            });
        }
        if(!password){
            return res.status(400).json({
                success:false,
                message: "Invalid credentials"
            });
        }

        const user=await User.findOne({emailId:emailId});

         if(!user){
           return res.status(400).json({
                 success:false,
                 message: "User does not exist"
               });
        }

         if(!user.isVerified){
            return res.status(401).json({
            success:false,
            message:"Please verify your email first"
        });
}
        const match=await bcrypt.compare(password,user.password);

         if(!match){
                  return res.status(400).json({
                    success:false,
                    message: "Invalid credentials"
                 });
             }
      const sessionId = crypto.randomUUID();
      const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role,
        profileImage:user.profileImage
      };
      const token=jwt.sign({_id:user._id,emailId:user.emailId,role:user.role,sessionId},process.env.JWT_SECRET,{expiresIn:60*60});
      user.sessionId = sessionId;
      await user.save();
      res.cookie('token',token,{httpOnly:true, secure: process.env.NODE_ENV === "production",sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",maxAge:60*60*1000});


      return res.status(200).json({
        success:true,
        user:reply,
        message:"Loggedin Successfully"
      });



    }
    catch(err){

        console.error(err);

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
    }
}

const logout=async(req,res)=>{
    try{
      const {token}=req.cookies;


      if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token not found"
        });
    }



      const payload=jwt.decode(token);

      if (!payload) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

      const user = await User.findById(payload._id);

        if (user) {
            user.sessionId = null;
            await user.save();
        }

      


      await redisClient.set(`token:${token}`,"blocked");
      await redisClient.expire(`token:${token}`,payload.exp);

      //token added to token blocklist in redis
      

      res.cookie("token",null,{expires: new Date(Date.now())});
      


      return res.status(200).json({
        success:true,
        message:"Logged out Successfully"
      });


    }
    catch(err){
       return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
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


        const existingUser = await User.findOne({ emailId });

        if(existingUser){
            return res.status(409).json({
                success:false,
                message:"Email already registered"
            });
        }


        const user=await User.create({...req.body,verificationToken:null,isVerified:true});
        res.status(201).json({
            success:true,
            message:"Admin Registered Successfully"
        });

    }
    catch(err){
        console.error(err);

        if(err.message === "Missing mandatory fields" || err.message === "Invalid email format" || err.message === "Password should be strong"){
         return res.status(400).json({
            success: false,
            message: err.message
        });
    }
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });
    }
}

const deleteProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        const user = req.result;

        // Delete profile image
        if (user.profileImage?.public_id) {
            await cloudinary.uploader.destroy(user.profileImage.public_id);
        }

        // Block current token
        await redisClient.set(
            `token:${token}`,
            "Blocked",
            "EX",
            60 * 60
        );

        // Delete user (post middleware will delete submissions)
        await User.findByIdAndDelete(user._id);

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



const getUserProfile=async(req,res)=>{

    
    try{

        const userId=req.result._id;
        const user= await User.findById(userId) .select("-password -verificationToken").populate("problemSolved","difficulty");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User Not Found"
            })
        }

        const solvedProblems=user.problemSolved;
        let easy=0;
        let medium=0;
        let hard=0;

        const totalSolved=solvedProblems.length;


        for (const problem of solvedProblems) {

            if (problem.difficulty === "easy") {
                easy++;
            }
            else if (problem.difficulty === "medium") {
                medium++;
            }
            else {
                hard++;
            }

        }

      return  res.status(200).json({
            success:true,
            message:"Profile Fetched Successfully",
            user,
            easy,
            medium,
            hard,
            totalSolved
        })

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const getUserProfileForUpdation = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId).select("username firstName lastName about profileImage");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const updateProfile = async (req, res) => {
    try {

        const userId = req.result._id;

        const { firstName, lastName, about } = req.body;

        const user = await User.findById(userId).select(
            "firstName lastName about profileImage"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (typeof firstName === "string") {
            user.firstName = firstName.trim();
        }

        if (typeof lastName === "string") {
            user.lastName = lastName.trim();
        }

        if (typeof about === "string") {
            user.about = about.trim();
        }

        if (req.file) {

            if (user.profileImage?.public_id) {
                try {
                    await cloudinary.uploader.destroy(
                        user.profileImage.public_id
                    );
                } catch (err) {
                    console.log("Old image delete failed:", err.message);
                }
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "codehub/profile-images",
                resource_type: "image"
            });

            user.profileImage = {
                url: result.secure_url,
                public_id: result.public_id
            };

            fs.unlink(req.file.path, (err) => {
                if (err) console.log(err);
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                about: user.about,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

const resendVerificationEmail = async (req, res) => {
    try {

        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        const crypto_token = crypto.randomBytes(32).toString("hex");

        user.verificationToken = crypto_token;

        await user.save();

        const verificationLink =
            `${process.env.BACKEND_URL}/email/verify/${crypto_token}`;

        await sendVerificationEmail({
                to: user.emailId,
                subject: "Verify Your Email",
                html:  `
                <h2>Welcome to CodeHub 🚀</h2>

                <p>Hi ${user.firstName},</p>

                <p>Thank you for registering on CodeHub.</p>

                <p>Please click the button below to verify your email address.</p>

                <a
                    href="${verificationLink}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                    "
                >
                    Verify Email
                </a>

                <p style="margin-top:20px;">
                    If you didn't create this account, you can safely ignore this email.
                </p>
            `
            });
        
        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to resend verification email"
        });

    }
};

module.exports={
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
    getUserProfile,
    updateProfile,
    getUserProfileForUpdation,
    resendVerificationEmail
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
