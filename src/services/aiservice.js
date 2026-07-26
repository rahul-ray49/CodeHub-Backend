const { buildBugAnalysisPrompt } = require("../utils/promptBuilder");
const ai = require("../config/gemini");

const analyzeCode = async ({
    problem,
    code,
    language,
    runResult = null
}) => {

    try{

    

    const prompt = buildBugAnalysisPrompt({
        problem,
        code,
        language,
        runResult
    });

    const response = await ai.models.generateContent({
            model:  "gemini-3.5-flash",
            contents: prompt,
             config: {
                temperature: 0.2,
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
                thinkingConfig: {
                    thinkingBudget: 0
                }
            },
            
        });

   

    let text = response.text;

    if (!text) {
            throw new Error("Empty response received from Gemini.");
    
        }


    text = text.replace(/```(?:json)?/gi, "").trim();



      try {

            const analysis = JSON.parse(text);

            if (
                !analysis.overall ||
                !Array.isArray(analysis.issues) ||
                !analysis.complexity
            ) {
                throw new Error("Unexpected AI response structure.");
            }
            return analysis;

        } catch (parseError) {

            console.error("JSON Parse Error:", parseError);
            console.log("Gemini Response:", text);

            throw new Error("Invalid JSON returned by Gemini.");
        }
   

    // Parse JSON

    // Return object
} catch(error){

     console.error("AI Service Error:", error);

     throw error;
}

};

module.exports = {
    analyzeCode
};

