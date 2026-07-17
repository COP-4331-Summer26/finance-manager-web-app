const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false 
  },
  verificationCode: {
    type: String,
    default: null
  },
  codeExpires: {
    type: Date,
    default: null
  }
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);