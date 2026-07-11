const Problem = require("../models/problem");
const { analyzeCode } = require("../services/aiservice");
const mongoose = require("mongoose");

const analyzeProblemCode = async (req, res) => {
    try {

        const { problemId } = req.params;
        const { code, language, runResult = null } = req.body;
        const user=req.result;

        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }

        const userId=req.result._id;

        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem id"
            });
        }


        // Validation
        if(  typeof code !== "string" ||code.trim() === "" || typeof language !== "string" ||language.trim() === ""){
             return res.status(400).json({
                success: false,
                message: "Code and language are required."
            });
        }
        //Gemini ka context limit hota hai.
        if (code.length > 25000) {
            return res.status(400).json({
                success: false,
                message: "Code is too large."
            });
        }

        const cleanedCode = code.trim();
        const normalizedLanguage = language.trim().toLowerCase();

        // Fetch Problem
        const problem = await Problem.findById(problemId).select("title description tags visibleTestCases referenceSolution").lean();

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        // AI Analysis
        const analysis = await analyzeCode({
            problem,
            code:cleanedCode,
            language:normalizedLanguage,
            runResult
        });

        return res.status(200).json({
            success: true,
            message: "AI analysis completed successfully.",
            analysis
        });

    } catch (error) {

        console.error("AI Controller Error:", error);

        if (error.message === "Invalid JSON returned by Gemini.") {
            return res.status(502).json({
                success: false,
                message: "AI returned an invalid response. Please try again."
            });
        }

        if (error.message === "Unexpected AI response structure.") {
            return res.status(502).json({
                success: false,
                message: "AI response format was invalid. Please try again."
            });
        }

        if (
            error.code === "ENOTFOUND" ||
            error.cause?.code === "ENOTFOUND"
        ) {
            return res.status(503).json({
                success: false,
                message: "AI service is temporarily unavailable. Please try again later."
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze code."
        });
    }
};

module.exports = {
    analyzeProblemCode
};