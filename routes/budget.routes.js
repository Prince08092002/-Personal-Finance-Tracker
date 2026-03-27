const express = require('express');
const { getBudgets, setBudget } = require('../controllers/budget.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getBudgets)
    .post(setBudget);

module.exports = router;

