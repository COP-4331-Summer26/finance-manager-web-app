const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategory
} = require('../controllers/categoryController');

router.use(authenticate);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);

module.exports = router;