const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const userMiddleware=require("../middleware/userMiddleware");

const aiRouter = express.Router();

aiRouter.post("/chat",userMiddleware, chatWithAI);
module.exports = aiRouter;
