const mongoose = require("mongoose");

// Define the schema
const statusSchema = new mongoose.Schema({
    service: String,
    status: {
        type: String,
        enum: ["operational", "down", "maintenance", "minor", "major", "offline", "unreleased"],
        default: "operational",
    },
    title: String,
    description: String,
});

// Use existing model if already compiled, otherwise create a new one
const Status = mongoose.models.Status || mongoose.model("Status", statusSchema);

exports.handler = async (event, context) => {
    const { service, status, title, description } = JSON.parse(event.body);

    try {
        // Connect to the VocaDecksStatus database explicitly
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "VocaDecksStatus", // Explicitly connect to VocaDecksStatus database
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Update or create the service document
        const result = await Status.updateOne(
            { service: service },
            { $set: { status: status, title: title, description: description } },
            { upsert: true }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Status updated successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating status", error: error.message }),
        };
    }
};
