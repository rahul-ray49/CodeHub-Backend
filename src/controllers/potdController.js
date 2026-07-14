const Problem=require("../models/problem")





const getProblemOfTheDay = async (req, res) => {

    try {

        // Total number of problems present in database
        const totalProblems = await Problem.countDocuments();

        if (totalProblems === 0) {
            return res.status(404).json({
                success: false,
                message: "No Problems Available"
            });
        }

        // Current Date
        const today = new Date();

        // 31 December of Previous Year
        const startOfYear = new Date(today.getFullYear(), 0, 0);

        // Difference in milliseconds
        const diff = today - startOfYear;

        // Milliseconds in one day
        const oneDay = 1000 * 60 * 60 * 24;

        // Day number of current year
        const dayOfYear = Math.floor(diff / oneDay);

        // Generate today's index
        const index = dayOfYear % totalProblems;

        // Fetch today's problem
        const problem = await Problem.findOne()
            .sort({ createdAt: 1 })
            .skip(index)
            .select("_id title difficulty tags score problemNumber");

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            problem
        });

    }
    catch (err) {

        console.log("POTD ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

}

module.exports={getProblemOfTheDay};