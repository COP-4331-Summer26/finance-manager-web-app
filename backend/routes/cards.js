const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getCards, createCard } = require('../controllers/cardController');

router.use(authenticate);

router.get('/', getCards);
router.post('/', createCard);

module.exports = router;