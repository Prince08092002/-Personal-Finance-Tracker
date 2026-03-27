const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getTransactions } = require('../controllers/transaction.controller');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTransactions);

module.exports = router;

