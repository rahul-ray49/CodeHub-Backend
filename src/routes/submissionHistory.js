const express=require("express");
const {historyLimiter} = require("../middleware/rateLimiter");
const submissionHistoryRouter=express.Router();

const userMiddleware=require("../middleware/userMiddleware");
const {userSubmissionHistory,submittedProblemHistory}=require("../controllers/userSubmissionHistory");
const {submittedProblem}=require("../controllers/userProblem");


submissionHistoryRouter.get("/submission-history",userMiddleware, historyLimiter,userSubmissionHistory);
submissionHistoryRouter.get("/submittedProblem/:pid",userMiddleware, historyLimiter,submittedProblem);
submissionHistoryRouter.get("/submission-history-details/:sid",userMiddleware, historyLimiter,submittedProblemHistory);


module.exports=submissionHistoryRouter;