const express = require('express');

const verifyEmailRouter=  express.Router();
const {verifyEmail}=require('../controllers/verifyEmail');
const {
    emailVerifyLimiter
} = require("../middleware/rateLimiter");

verifyEmailRouter.get('/verify/:token',emailVerifyLimiter,verifyEmail);

module.exports=verifyEmailRouter;