const ai = require("../config/gemini");

const chatWithAI = async (req, res) => {
    try {

        const { contents } = req.body;

       if (!contents || !Array.isArray(contents)) {
            return res.status(400).json({
                success: false,
                message: "Contents are required."
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                maxOutputTokens: 700,
                systemInstruction: `
                               You are CodeHub AI.

                                You ONLY answer programming and computer science questions.

                                Response Rules:

                                - Keep answers concise.
                                - Default response length: 5-8 lines.
                                - If the user asks a definition, answer in under 80 words.
                                - Do not explain beyond what is asked.
                                - Use bullet points whenever possible.
                                - Give code ONLY if the user explicitly asks for code.
                                - Give detailed explanations ONLY when the user specifically asks "explain in detail" or "deep dive".
                                - Mention time and space complexity only for algorithm-related questions.
                                - Never add unnecessary introductions or conclusions.

                                If the question is not related to programming or computer science, reply exactly:

                                "I am CodeHub AI. I only answer programming and computer science related questions."
                                `
            }
        });

        return res.status(200).json({
            success: true,
            reply: response.text
        });
       

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    chatWithAI
};