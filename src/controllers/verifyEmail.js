const User=require('../models/user');

const verifyEmail = async(req,res)=>{

    try{

        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token
        });

        if(!user){
            throw new Error("Invalid token");
        }

        if(user.isVerified){
         return res.status(200).json({
         message:"Email already verified"
      });
     }


        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        res.status(200).json({
            message:"Email Verified Successfully"
        });

    }
    catch(err){

        res.status(400).json({
            message: err.message
        });

    }
}

module.exports={verifyEmail};