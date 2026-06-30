// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now // If the user forgets to send a date, it defaults to right now
    },
    cardLastFour: {
        type: String,
        required: false, // Not required, in case it was a cash transaction
        match: [/^\d{4}$/, 'Please enter exactly 4 digits'], // Strict validation rule
        trim: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Transaction', transactionSchema);