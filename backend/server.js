// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Initialize the Express application
const app = express();

// 2. Apply Middleware
app.use(cors()); // Permits cross-origin requests from our future React frontend
app.use(express.json()); // Automatically parses incoming JSON data in request bodies

// 3. Define the port (Fallback to 5000 if not specified in the environment)
const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("[Database] Successfully connected to MongoDB Atlas!");
    })
    .catch((error => {
        console.error("[Database] Connection failed:", error.message);
    }))

// 4. Create a simple health-check endpoint
app.get('/api/status', (req, res) => {
    res.json({ message: "Contact Manager API is up and running!" });
});

// 5. Boot up the server
app.listen(PORT, () => {
    console.log(`[Server] Listening on port: ${PORT}`);
});