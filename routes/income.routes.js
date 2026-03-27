const express = require('express');
const { getIncome, addIncome, updateIncome, deleteIncome } = require('../controllers/income.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all income routes
router.use(protect);

router.route('/')
    .get(getIncome)
    .post(addIncome);

router.route('/:id')
    .put(updateIncome)
    .delete(deleteIncome);

module.exports = router;
