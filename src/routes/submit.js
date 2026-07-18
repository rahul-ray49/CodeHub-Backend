const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {submitCode,runCode} = require("../controllers/userSubmission");
const {runLimiter,submitLimiter} = require("../middleware/rateLimiter");

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id",userMiddleware, runLimiter,runCode);

module.exports=submitRouter;