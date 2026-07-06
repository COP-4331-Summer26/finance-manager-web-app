const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month query param is required in YYYY-MM format' });
    }

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate }
    });

    let totalIncome = 0;
    let totalSpent = 0;
    const spentByCategory = {};

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalSpent += tx.amount;
        spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + tx.amount;
      }
    });

    const categories = await Category.find({ userId: req.user.id });

    const categoryBreakdown = categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      limit: cat.limit,
      spent: Math.round((spentByCategory[cat.name] || 0) * 100) / 100
    }));

    res.json({
      totalBalance: Math.round((totalIncome - totalSpent) * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      categoryBreakdown
    });
  } catch (err) {
    console.error('getSummary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};