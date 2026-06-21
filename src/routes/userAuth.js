const express = require('express');

const authRouter=express.Router();

const {register,login,logout,adminRegister,deleteProfile}=require('../controllers/userAuthent');

const userMiddleware=require('../middleware/userMiddleware');

const adminMiddleware=require('../middleware/adminMiddleware');


//Registering the user
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
});
//authRouter.post('getProfile',getProfile);

//login
//logout
//getprofile

module.exports=authRouter;



//so basically humne yaha pe authRouter banaya hai jisme humne 4 routes banaye hai, register, login, logout aur admin register.
//  Register aur login route pe koi middleware nahi laga hai kyunki ye routes public hai, matlab koi bhi user inhe access kar sakta hai. 
// Lekin logout route pe humne userMiddleware lagaya hai kyunki logout karne ke liye user ka authenticated hona zaroori hai.
//  Aur admin register route pe humne adminMiddleware lagaya hai kyunki sirf admin hi naye admin ko register kar sakta hai.  