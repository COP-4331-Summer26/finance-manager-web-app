const Card = require('../models/Card');

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id });
    res.json(cards);
  } catch (err) {
    console.error('getCards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { name, last4, limit, statementDate } = req.body;
    if (!name || !last4 || limit == null || statementDate == null) {
      return res.status(400).json({ error: 'name, last4, limit, and statementDate are required' });
    }
    const card = await Card.create({
      userId: req.user.id,
      name,
      last4,
      limit,
      statementDate
    });
    res.status(201).json(card);
  } catch (err) {
    console.error('createCard error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    console.error('deleteCard error:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};