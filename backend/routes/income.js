const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createIncome } = require('../controllers/incomeController');

router.use(authenticate);

router.post('/', createIncome);

module.exports = router;