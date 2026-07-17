const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configure the Email Transporter
// NOTE: For local testing, use a Gmail account with an "App Password" 
// or a free developer mailbox service like Ethereal Email.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Add this to your .env file
    pass: process.env.EMAIL_PASS  // Add this to your .env file (App Password)
  }
});

// ==========================================
// 1. POST /api/auth/register
// ==========================================
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code and 15-minute expiration timestamp
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Save the user as unverified with the tracking markers initialized
    const user = await User.create({ 
      email: email.toLowerCase(), 
      passwordHash, 
      name,
      isVerified: false,
      verificationCode,
      codeExpires
    });

    // Fire the email verification package
    const mailOptions = {
      from: `"Finance Manager" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Finance Manager Account',
      text: `Welcome, ${user.name}! Your 6-digit verification code is: ${verificationCode}. It will expire in 15 minutes.`
    };

    await transporter.sendMail(mailOptions);

    // Do NOT send a JWT login token yet! Send a message telling the frontend to redirect to the OTP page.
    res.status(201).json({
      message: 'Registration successful! Verification code sent to email.',
      email: user.email
    });

  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// ==========================================
// 2. NEW ENDPOINT: POST /api/auth/verify-code
// ==========================================
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Guard: If they double-click, just let them pass through smoothly
    if (user.isVerified) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({
        message: 'Account successfully verified!',
        token,
        user: { id: user._id, email: user.email, name: user.name }
      });
    }

    // Guard: Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Incorrect verification code' });
    }

    // Guard: Check if the 15-minute window has expired
    if (new Date() > user.codeExpires) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Success! Update status and clear security code placeholders
    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpires = null;
    await user.save();

    // Now issue their official login JWT token since they have cleared authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Account successfully verified!',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });

  } catch (err) {
    console.error('verifyCode error:', err);
    res.status(500).json({ error: 'Server error processing verification' });
  }
};

// ==========================================
// 3. POST /api/auth/login
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Security Gate: Check if they ever cleared their email confirmation code
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Your account is not verified. Please verify your email before logging in.',
        requiresVerification: true 
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

// ==========================================
// 4. NEW ENDPOINT: POST /api/auth/resend-code
// ==========================================
exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified.' });
    }

    // Refresh code and expiration timestamp
    const newCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = newCode;
    user.codeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const mailOptions = {
      from: `"Finance Manager" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your New Verification Code',
      text: `Your new 6-digit verification code is: ${newCode}. It will expire in 15 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'A fresh verification code has been dispatched to your inbox.' });

  } catch (err) {
    console.error('resendCode error:', err);
    res.status(500).json({ error: 'Failed to send new code' });
  }
};

// GET /api/v1/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};