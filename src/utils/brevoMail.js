const axios = require("axios");

const sendVerificationEmail = async ({ to, subject, html }) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "CodeHub",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                }
            }
        );

        console.log("Email Sent Successfully");
        console.log(response.data);

        return response.data;
    } catch (err) {
        console.error("Brevo Email Error");

        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }

        throw err;
    }
};

module.exports = sendVerificationEmail;