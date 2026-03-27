const express = require('express');
const { getCategories, createCategory } = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all category routes
router.use(protect);

router.route('/')
    .get(getCategories)
    .post(createCategory);

module.exports = router;
