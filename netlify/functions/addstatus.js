// functions/addstatus.js
const mongoose = require('mongoose');
const { MONGO_URL } = process.env;

exports.handler = async function (event, context) {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }

        const { title, description, status } = JSON.parse(event.body);
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

        const db = mongoose.connection;
        const newStatus = { title, description, status, createdAt: new Date() };
        await db.collection('status').insertOne(newStatus);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Status added successfully', status: newStatus }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add status', error: error.message }),
        };
    }
};
