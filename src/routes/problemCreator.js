const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem} = require("../controllers/userProblem");
const userMiddleware=require("../middleware/userMiddleware");
// Create
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);
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