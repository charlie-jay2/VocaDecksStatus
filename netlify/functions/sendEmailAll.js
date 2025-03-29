const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const EMAIL = process.env.EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Check if the model is already compiled
const EmailSubscription = mongoose.models.EmailSubscription || mongoose.model("EmailSubscription", new mongoose.Schema({
    id: String,
    email: String,
}));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: APP_PASSWORD,
    },
});

exports.handler = async (event, context) => {
    if (event.httpMethod === "POST") {
        const { subject, body } = JSON.parse(event.body);

        if (!subject || !body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Subject and body are required." }),
            };
        }

        try {
            // Fetch emails from the `emailsubscriptions` collection
            const subscriptions = await EmailSubscription.find();

            const emails = subscriptions.map((subscription) => subscription.email);

            if (emails.length === 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "No email subscriptions found." }),
                };
            }

            // Construct the email body with HTML content
            const htmlBody = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            /* Inline styles for email */
                            body {
                                margin: 0;
                                padding: 0;
                                background-color: #f5f5f5;
                                font-family: Arial, sans-serif;
                            }
                            table {
                                max-width: 600px;
                                margin: auto;
                                background-color: #ffffff;
                                border-radius: 8px;
                                width: 100%;
                            }
                            td {
                                padding: 20px;
                            }
                            h2 {
                                font-size: 18px;
                                font-weight: bold;
                                color: #333333;
                                text-align: center;
                            }
                            p {
                                font-size: 16px;
                                color: #333333;
                                text-align: center;
                            }
                            .footer {
                                text-align: center;
                                font-size: 12px;
                                color: #888888;
                                padding: 20px;
                            }
                            .footer a {
                                color: #007bff;
                                text-decoration: none;
                            }
                            img {
                                display: block;
                                margin: 20px auto;
                                max-width: 150px;
                                height: auto;
                            }
                            .cta-button {
                                display: inline-block;
                                background-color: #5bbaff;
                                color: #ffffff;
                                text-decoration: none;
                                padding: 12px 20px;
                                font-size: 16px;
                                border-radius: 5px;
                                font-weight: bold;
                                margin-top: 10px;
                            }
                        </style>
                    </head>
                    <body>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center">
                                    <h2>${subject}</h2>
                                    <p>${body}</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" class="footer">
                                    <img src="https://iili.io/3ACiacv.png" alt="VocaDecks Logo" />
                                    <p>&copy; 2025 VocaDecks. All Rights Reserved.</p>
                                    <p><a href="https://www.vocadecks.com" target="_blank">www.vocadecks.com</a></p>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
            `;

            const mailOptions = {
                from: EMAIL,
                to: emails,
                subject: subject,
                html: htmlBody, // Send HTML email
            };

            await transporter.sendMail(mailOptions);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Email sent to all subscribed users." }),
            };
        } catch (error) {
            console.error("Error sending email:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error sending email." }),
            };
        }
    }
};
