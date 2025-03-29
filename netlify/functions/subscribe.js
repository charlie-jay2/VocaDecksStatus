const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const EmailSubscription = mongoose.model(
    "EmailSubscription",
    new mongoose.Schema({ email: String })
);

exports.handler = async (event, context) => {
    if (event.httpMethod === "POST") {
        const { email } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email is required." }),
            };
        }

        try {
            // Check if the email already exists in the database
            const existingEmail = await EmailSubscription.findOne({ email });
            if (existingEmail) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "You are already subscribed." }),
                };
            }

            // Save the email to the database
            const newSubscription = new EmailSubscription({ email });
            await newSubscription.save();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription successful!" }),
            };
        } catch (error) {
            console.error("Error saving email:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "There was an error. Please try again." }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
    };
};
