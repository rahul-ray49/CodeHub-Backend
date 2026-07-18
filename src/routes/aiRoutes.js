const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const userMiddleware=require("../middleware/userMiddleware");
const { analyzeProblemCode } = require("../controllers/aiSuggestions");
const adminMiddleware=require("../middleware/adminMiddleware");
const {
    aiChatLimiter,
    aiAnalyzeLimiter
} = require("../middleware/rateLimiter");
const aiRouter = express.Router();

aiRouter.post("/chat",userMiddleware,aiChatLimiter, chatWithAI);
aiRouter.post("/analyze/:problemId",userMiddleware,aiAnalyzeLimiter,analyzeProblemCode)
module.exports = aiRouter;
