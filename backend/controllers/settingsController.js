const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Card = require('../models/Card');

// DELETE /api/users/me
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Transaction.deleteMany({ userId });
    await Category.deleteMany({ userId });
    await Card.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data deleted' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};