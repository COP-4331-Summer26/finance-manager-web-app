const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  limit: { type: Number, default: 0 },
  color: { type: String, default: '#888888' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);