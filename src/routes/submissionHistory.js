const express=require("express");

const submissionHistoryRouter=express.Router();

const userMiddleware=require("../middleware/userMiddleware");
const {userSubmissionHistory}=require("../controllers/userSubmissionHistory");
const {submittedProblem}=require("../controllers/userProblem");


submissionHistoryRouter.get("/submission-history",userMiddleware,userSubmissionHistory);
submissionHistoryRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);


module.exports=submissionHistoryRouter;