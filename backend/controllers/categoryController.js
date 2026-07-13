const Category = require('../models/Category');

// GET /api/v1/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// POST /api/v1/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, limit, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = await Category.create({
      userId: req.user.id,
      name,
      limit,
      color
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// PUT /api/v1/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.json(categories);
  } catch (err) {
    console.error('getCategories error:', err); // ADD THIS
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const Transaction = require('../models/Transaction');

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Cascade delete: remove every transaction tagged with this category's name
    await Transaction.deleteMany({ userId: req.user.id, category: category.name });

    await Category.deleteOne({ _id: category._id });

    res.json({ message: 'Category and associated transactions deleted' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};