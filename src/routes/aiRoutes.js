const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const userMiddleware=require("../middleware/userMiddleware");
const { analyzeProblemCode } = require("../controllers/aiSuggestions");
const adminMiddleware=require("../middleware/adminMiddleware");

const aiRouter = express.Router();

aiRouter.post("/chat",userMiddleware, chatWithAI);
aiRouter.post("/analyze/:problemId",userMiddleware,analyzeProblemCode)
module.exports = aiRouter;
