const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoSection")
const {getAllProblemsWithVideoStatus}=require("../controllers/userProblem");

videoRouter.get("/problems",adminMiddleware,getAllProblemsWithVideoStatus);
videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:videoId",adminMiddleware,deleteVideo);


module.exports = videoRouter;