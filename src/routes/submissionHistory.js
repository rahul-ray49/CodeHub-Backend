const express=require("express");

const submissionHistoryRouter=express.Router();

const userMiddleware=require("../middleware/userMiddleware");
const {userSubmissionHistory,submittedProblemHistory}=require("../controllers/userSubmissionHistory");
const {submittedProblem}=require("../controllers/userProblem");


submissionHistoryRouter.get("/submission-history",userMiddleware,userSubmissionHistory);
submissionHistoryRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);
submissionHistoryRouter.get("/submission-history-details/:sid",userMiddleware,submittedProblemHistory);


module.exports=submissionHistoryRouter;