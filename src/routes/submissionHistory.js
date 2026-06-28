const express=require("express");

const submissionHistoryRouter=express.Router();

const userMiddleware=require("../middleware/userMiddleware");
const {userSubmissionHistory}=require("../controllers/userSubmissionHistory");


submissionHistoryRouter.get("/submission-history",userMiddleware,userSubmissionHistory);

module.exports=submissionHistoryRouter;