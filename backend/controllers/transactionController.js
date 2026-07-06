const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { limit, sort, category, start, end } = req.query;
    const filter = { userId: req.user.id };

    if (category) filter.category = category;
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    let query = Transaction.find(filter);
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(parseInt(limit, 10));

    const transactions = await query.exec();
    res.json(transactions);
  } catch (err) {
    console.error('getTransactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { merchant, amount, category, date, notes, type, cardLastFour } = req.body;

    if (!merchant || amount == null || !category || !type) {
      return res.status(400).json({ error: 'merchant, amount, category, and type are required' });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      merchant,
      amount,
      category,
      type,
      date,
      notes,
      cardLastFour
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('createTransaction error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    console.error('updateTransaction error:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('deleteTransaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};