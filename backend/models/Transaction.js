const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchant: {
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
    default: Date.now
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  cardLastFour: {
    type: String,
    required: false,
    match: [/^\d{4}$/, 'Please enter exactly 4 digits'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);