const express = require('express'); // go into node modules, find express files, and save its functions and scripts to the Express variable
const router = express.Router(); 
const Transaction = require('../models/Transaction'); 

// Create
router.post('/', async (req, res) => {
    try {
        const { userId, title, amount, type, category, date, cardLastFour } = req.body;

        const newTransaction = new Transaction({
            userId, title, amount, type, category, date, cardLastFour
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error("[Create Error]", error.message);
        res.status(500).json({ error: "Failed to save the transaction." });
    }
});

// Read transactions
router.get('/', async (req, res) => {
    try {
        // Find all transactions, and sort them by date (newest first)
        const transactions = await Transaction.find().sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("[Read Error]", error.message);
        res.status(500).json({ error: "Failed to fetch transactions." });
    }
});

// Update a transaction
router.put('/:id', async (req, res) => {
    try {
        // Find by the ID in the URL, update with the body data
        // { new: true } tells Mongoose to send back the updated version, not the old one
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } 
        );

        if (!updatedTransaction) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error("[Update Error]", error.message);
        res.status(500).json({ error: "Failed to update the transaction." });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!deletedTransaction) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        res.status(200).json({ message: "Transaction successfully deleted." });
    } catch (error) {
        console.error("[Delete Error]", error.message);
        res.status(500).json({ error: "Failed to delete the transaction." });
    }
});

module.exports = router;