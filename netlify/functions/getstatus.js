const mongoose = require("mongoose");

// Connect to MongoDB using the provided MONGO_URL environment variable
exports.handler = async (event, context) => {
    try {
        // Explicitly connect to the VocaDecksStatus database
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "VocaDecksStatus",  // Specify the database name here
        });

        // Fetch the status updates from the 'Status' collection in the VocaDecksStatus database
        const statuses = await mongoose.connection.db.collection("status").find().toArray();

        return {
            statusCode: 200,
            body: JSON.stringify({ statuses }),  // Send the statuses as a response
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching statuses", error: error.message }),
        };
    }
};
