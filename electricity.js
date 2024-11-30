require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors'); // Import CORS package

// Initialize Express app
const app = express();
const port = 3000;

// Enable CORS for the frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Allow only your frontend to make requests
    methods: ['GET', 'POST'], // Allow specific methods (GET, POST)
    allowedHeaders: ['Content-Type'] // Allow specific headers
}));

// Middlewares
app.use(bodyParser.json()); // to parse JSON bodies

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/quarterDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Twilio credentials (directly hardcoded based on your provided information)
const accountSid = 'ACb726ddff4d8aa9382f3e8cc90fabbc2c';
const authToken = 'b686bd2a8d04facdb681c0fbd2d2b941';
const twilioPhoneNumber = '+17753736816';

const client = twilio(accountSid, authToken);

// MongoDB Schema for storing house head information
const houseHeadSchema = new mongoose.Schema({
    houseHeadName: String,
    phoneNumber: String,
    details: String
});

const HouseHead = mongoose.model('HouseHead', houseHeadSchema);

// API Endpoint: Save House Head
app.post('/saveHouseHead', async (req, res) => {
    const { houseHeadName, phoneNumber, details } = req.body;

    try {
        const newHouseHead = new HouseHead({ houseHeadName, phoneNumber, details });
        await newHouseHead.save();
        res.status(200).json({ message: 'House Head saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving house head', error });
    }
});

// API Endpoint: Get all House Heads
app.get('/getHouseHeads', async (req, res) => {
    try {
        const houseHeads = await HouseHead.find();
        res.status(200).json(houseHeads);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving house heads', error });
    }
});

// API Endpoint: Send SMS to a phone number
app.post('/sendSms', async (req, res) => {
    const { recipients, message } = req.body;

    try {
        const results = [];

        for (let phoneNumber of recipients) {
            // Ensure phone number includes a country code
            if (!/^\+\d{10,15}$/.test(phoneNumber)) {
                phoneNumber = phoneNumber.startsWith('0')
                    ? `+91${phoneNumber.slice(1)}`
                    : `+91${phoneNumber}`;
            }

            // Send SMS using Twilio
            try {
                const response = await client.messages.create({
                    body: message,
                    from: twilioPhoneNumber,
                    to: phoneNumber
                });

                results.push({ phoneNumber, status: 'success', sid: response.sid });
            } catch (error) {
                console.error(`Failed to send SMS to ${phoneNumber}:`, error);
                results.push({ phoneNumber, status: 'failed', reason: error.message });
            }
        }

        res.status(200).json({ message: 'SMS processing completed', results });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ message: 'Failed to send SMS', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
