const express = require('express');
const {
    createProblemLimiter,
    updateProblemLimiter,
    deleteProblemLimiter,
    problemFetchLimiter,
    videoFetchLimiter
} = require("../middleware/rateLimiter");

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,getAllProblem2,solvedAllProblemByUser2,getVideoByProblemId} = require("../controllers/userProblem");
const userMiddleware=require("../middleware/userMiddleware");
const {getProblemOfTheDay}=require("../controllers/potdController");
// Create
problemRouter.post("/create",adminMiddleware,createProblemLimiter,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblemLimiter,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblemLimiter,deleteProblem);

problemRouter.get("/potd",userMiddleware, problemFetchLimiter, getProblemOfTheDay);
problemRouter.get("/problemById/:id",userMiddleware, problemFetchLimiter,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,  problemFetchLimiter,getAllProblem);
problemRouter.get("/getAllProblem2",userMiddleware, problemFetchLimiter,getAllProblem2);
problemRouter.get("/problemSolvedByUser",userMiddleware,problemFetchLimiter,solvedAllProblembyUser);
problemRouter.get("/ProblemSolvedByUser2",userMiddleware, problemFetchLimiter,solvedAllProblemByUser2);
problemRouter.get("/video/:problemId",userMiddleware, videoFetchLimiter,getVideoByProblemId);
// fetch
// update
// delete 

module.exports=problemRouter;


// problemRouter.post("/create",problemCreate);
// problemRouter.patch("/:id", problemUpdate);
// problemRouter.delete("/:id",problemDelete);
// yaha pe humne problem ke liye ek router banaya hai jisme humne 5 routes banaye hai, create, update, delete, fetch aur get all problems.
// Create, update aur delete route pe hum aage chalke kuch middleware lagayenge kyunki problem ko create,update aur delete bas admin kar sakta hai aur koi normal user nahi.


// problemRouter.get("/:id",problemFetch);
// problemRouter.get("/", getAllProblem);
// problemRouter.get("/user", solvedProblem);
// yaha pe humne 3 get routes banaye hai, ek specific problem ko fetch karne ke liye.
//  ek saari problems ko fetch karne ke liye.
//  ek solved problems ko fetch karne ke liye.
//aur inko access both admin aur user dono kar sate hai.