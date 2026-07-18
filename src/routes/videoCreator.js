const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoSection")
const {getAllProblemsWithVideoStatus}=require("../controllers/userProblem");
const {
    adminProblemLimiter,
    uploadSignatureLimiter,
    saveVideoLimiter,
    deleteVideoLimiter
} = require("../middleware/rateLimiter");

videoRouter.get("/problems",adminMiddleware,adminProblemLimiter,getAllProblemsWithVideoStatus);
videoRouter.get("/create/:problemId",adminMiddleware,uploadSignatureLimiter,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoLimiter,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideoLimiter,deleteVideo);


module.exports = videoRouter;