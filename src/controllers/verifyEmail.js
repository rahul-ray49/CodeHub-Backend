const User=require('../models/user');

const verifyEmail = async(req,res)=>{

    try{

        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token
        });

        if(!user){
           return res.status(400).json({
            success:false,
            message:"Invalid token"
           });
        }

        if(user.isVerified){
         return res.status(200).json({
            success:true,
            message:"Email already verified"
         });
        }


        user.isVerified = true;
        user.verificationToken = null;

        await user.save();
        res.redirect(`${process.env.FRONTEND_URL}/login`);

    }
    catch(err){

        res.status(500).json({
            success:false,
            message:"Internal server error"
        });

    }
}

module.exports={verifyEmail};