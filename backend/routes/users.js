const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getMe } = require('../controllers/authController');
const { deleteAccount } = require('../controllers/settingsController');

router.get('/me', authenticate, getMe);
router.delete('/me', authenticate, deleteAccount);

module.exports = router;