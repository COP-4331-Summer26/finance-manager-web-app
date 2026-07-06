const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getSummary } = require('../controllers/summaryController');

router.use(authenticate);

router.get('/', getSummary);

module.exports = router;