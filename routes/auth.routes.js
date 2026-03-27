const express = require('express');
const { signup, login, getProfile, updateProfilePhone, deleteAccount, restoreDirect, overwriteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ✅ Test route
router.get('/', (req, res) => {
    res.send('Auth API Working');
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Restoration & Overwrite routes
router.post('/restore/direct', restoreDirect);
router.post('/overwrite', overwriteAccount);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile/phone', protect, updateProfilePhone);
router.delete('/profile', protect, deleteAccount);

module.exports = router;