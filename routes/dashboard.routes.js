const express = require('express');
const { getDashboardData } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.route('/')
    .get(getDashboardData);

module.exports = router;
