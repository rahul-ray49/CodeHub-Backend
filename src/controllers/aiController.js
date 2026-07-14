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
            model: "gemini-flash-latest",
            contents,
            config: {
                maxOutputTokens: 2000,
                systemInstruction: `
                               You are CodeHub AI.

                                You ONLY answer programming and computer science questions.

                                Response Rules:

                                - Keep answers concise but explain the concept in a way that user understands it in one go.
                                - Default response length: choose the default response length in such a way that the user understands in one go.
                                - If the user asks a definition, answer in under few words.
                                - Do not explain beyond what is asked.
                                - Use bullet points whenever possible.
                                - Give code ONLY if the user explicitly asks for code.
                                - Give more detailed explanations ONLY when the user specifically asks "explain in detail" or "deep dive".
                                - Mention time and space complexity only for algorithm-related questions.
                                - Never add unnecessary introductions or conclusions.
                                - Give user a descriptive and easily understandable answers only
                                - if in some questions user asks why this is beneficial then explain in depth.


                                Code Formatting Rules:

                                - Whenever you provide code, return ONLY the code.
                                - Do NOT use language identifiers like cpp, javascript, python, java, etc.
                                - Preserve proper indentation and line breaks.
                                - Return code exactly as it would appear in a source file.
                                - Do not surround code with Markdown or HTML.
                                - If an explanation is required, write the explanation first, then leave one blank line, then output the code in plain text.
                                 

                                Code Generation Rules:

                                - Whenever the user asks for code, return the code exactly as it would appear in a source file.
                                - Never use Markdown code blocks.
                                - Never use triple backticks.
                                - Never use language identifiers such as cpp, c, java, python, or javascript.
                                - Do not use inline code formatting.
                                - Preserve proper indentation and line breaks.
                                - Return compilable code.
                                - Start the response directly with the first line of code (e.g., #include, import, package, etc.).
                                - Do not write "Here is the code:" or any similar introduction.
                                - If the user asks for code only, return only the code without any explanation.

                                Example Output Format (C++):

                                #include <iostream>
                                using namespace std;

                                int main() {
                                    int a, b;
                                    cin >> a >> b;
                                    cout << a + b;
                                    return 0;
                                }


                                 If the question is not related to programming or computer science or weather, reply exactly:

                                "I am CodeHub AI. I only answer programming and computer science related questions."
                                `
            }
        });

        let text=response.text;
     

        text = text.replace(/\$/g, "");
        text = text.replace(/\\log/g, "log");
        text = text.replace(/\\times/g, "x");
        text = text.replace(/\\le/g, "<=");
        text = text.replace(/\\ge/g, ">=");
        text = text.replace(/\\neq/g, "!=");

        text = text.replace(/```[\w-]*\n?/g, "");
        text = text.replace(/```/g, "");

        text = text.replace(/`([^`]*)`/g, "$1");

        text = text.replace(/\*\*(.*?)\*\*/g, "$1");

        text = text.replace(/\*(.*?)\*/g, "$1");

        text = text.replace(/^#+\s*/gm, "");

        text = text.replace(/^Sure!?[\s\n]*/i, "");
        text = text.replace(/^Certainly!?[\s\n]*/i, "");
        text = text.replace(/^Here('?|’)s the code:?[\s\n]*/i, "");
        text = text.replace(/^Here is the code:?[\s\n]*/i, "");
        text = text.replace(/^Here('?|’)s the solution:?[\s\n]*/i, "");
        text = text.replace(/^Here is the solution:?[\s\n]*/i, "");

        text = text.replace(/\n{3,}/g, "\n\n");

        text = text.trim();

        return res.status(200).json({
            success: true,
            reply: text
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