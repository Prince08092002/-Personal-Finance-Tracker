const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all expense routes
router.use(protect);

router.route('/')
    .get(getExpenses)
    .post(addExpense);

router.route('/:id')
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
