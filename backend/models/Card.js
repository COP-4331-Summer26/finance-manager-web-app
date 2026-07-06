const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  last4: { type: String, required: true, minlength: 4, maxlength: 4 },
  limit: { type: Number, required: true },
  statementDate: { type: Number, required: true } // day of month, e.g. 15
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);