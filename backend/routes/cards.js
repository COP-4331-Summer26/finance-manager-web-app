const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getCards, createCard, updateCard, deleteCard } = require('../controllers/cardController');

router.use(authenticate);

router.get('/', getCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;