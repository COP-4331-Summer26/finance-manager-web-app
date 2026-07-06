const Transaction = require('../models/Transaction');

exports.createIncome = async (req, res) => {
  try {
    const { merchant, amount, date, cardLastFour, category, notes } = req.body;

    if (!merchant || amount == null) {
      return res.status(400).json({ error: 'merchant and amount are required' });
    }

    const income = await Transaction.create({
      userId: req.user.id,
      merchant,
      amount,
      type: 'income',
      category: category || 'Income',
      date: date || Date.now(),
      notes,
      cardLastFour
    });

    res.status(201).json(income);
  } catch (err) {
    console.error('createIncome error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create income entry' });
  }
};