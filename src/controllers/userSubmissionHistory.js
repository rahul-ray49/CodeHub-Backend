const User=require("../models/user");
const Submission=require("../models/submission");
const Problem=require("../models/problem");



const userSubmissionHistory=async(req,res)=>{
   

    try{

        const userId = req.result._id;
        const user=await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalSubmissions=await Submission.countDocuments({userId});

        const totalPages=Math.ceil(totalSubmissions/limit);

        const submissions=await Submission.find({userId}).select("problemId status language createdAt").sort({createdAt:-1}).skip(skip).limit(limit).populate("problemId","title");

        return res.status(200).json({
            success: true,
            submissions,
            message:totalSubmissions===0?"No Submission history Found":"Submission History Fetched Successfully",

            pagination: {
                currentPage: page,
                totalPages,
                totalSubmissions,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });






    }
    catch(error){

         console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }


}


const submittedProblemHistory=async(req,res)=>{

      try {

        const userId = req.result._id;
        const submissionId = req.params.sid;
        const submission = await Submission.findById(submissionId).select("userId problemId code language status runtime memory testCasesPassed testCasesTotal createdAt");
       
        if (!submission) {

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });

        }
        
        if (submission.userId.toString() !== userId.toString()) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized Access"
            });

        }

        return res.status(200).json({

            success: true,
            message: "Submission fetched successfully.",
            submission

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Internal Server Error"

        });

    }

}




module.exports={userSubmissionHistory,submittedProblemHistory};