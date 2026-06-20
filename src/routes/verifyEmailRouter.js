const express = require('express');

const verifyEmailRouter=  express.Router();
const {verifyEmail}=require('../controllers/verifyEmail')

verifyEmailRouter.get('/verify/:token',verifyEmail);

module.exports=verifyEmailRouter;