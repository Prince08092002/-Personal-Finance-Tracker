const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { validateSignup, validateLogin } = require('../utils/validators');

const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCK_SECONDS = 30;

// Helper to determine real DB identifier properties based on input
const parseIdentifier = (identifier) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    return {
        isEmail,
        email: isEmail ? identifier : `phone_${identifier}@placeholder.com`,
        phone: !isEmail ? identifier : null
    };
};

const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const identifier = email; // Received from frontend

        const validationError = validateSignup(name, identifier, password);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const existingUser = await User.findByIdentifier(identifier);
        
        if (existingUser) {
            if (existingUser.is_deleted) {
                return res.status(409).json({ 
                    success: false, 
                    action: 'PROMPT_RESTORE', 
                    message: "This account was previously deleted. Do you want to restore it?" 
                });
            } else {
                return res.status(400).json({ success: false, message: 'Account already exists' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const { email: cleanEmail, phone: cleanPhone } = parseIdentifier(identifier);

        const newUserId = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            phone_number: cleanPhone
        });

        res.status(201).json({
            success: true,
            data: { id: newUserId, name, email: identifier }
        });

    } catch (error) { next(error); }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const identifier = email;

        const validationError = validateLogin(identifier, password);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const user = await User.findByIdentifier(identifier);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.is_deleted) {
             return res.status(409).json({ 
                 success: false, 
                 action: 'PROMPT_RESTORE', 
                 message: "This account was previously deleted. Do you want to restore it?" 
             });
        }

        if (user.lock_until && new Date(user.lock_until).getTime() > Date.now()) {
            const retryAfterSec = Math.max(1, Math.ceil((new Date(user.lock_until).getTime() - Date.now()) / 1000));
            return res.status(429).json({
                success: false,
                action: 'LOGIN_LOCKED',
                message: `Try again after ${retryAfterSec} seconds`,
                retryAfterSec
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const { locked } = await User.recordFailedLoginAttempt(user.id, {
                maxAttempts: MAX_LOGIN_ATTEMPTS,
                lockSeconds: LOGIN_LOCK_SECONDS
            });

            if (locked) {
                return res.status(429).json({
                    success: false,
                    action: 'LOGIN_LOCKED',
                    message: `Try again after ${LOGIN_LOCK_SECONDS} seconds`,
                    retryAfterSec: LOGIN_LOCK_SECONDS
                });
            }

            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        await User.clearLoginLock(user.id);

        const token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            token,
            data: { id: user.id, name: user.name, 
                    email: user.email.startsWith('phone_') ? null : user.email, 
                    phone_number: user.phone_number }
        });

    } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.is_deleted) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) { next(error); }
};

const updateProfilePhone = async (req, res, next) => {
    try {
        const { phone_number } = req.body;
        await User.updatePhone(req.user.userId, phone_number);
        res.json({ success: true, message: 'Phone number updated' });
    } catch (error) { next(error); }
};

const deleteAccount = async (req, res, next) => {
    try {
        await User.delete(req.user.userId);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) { next(error); }
};

// ==== NEW RESTORATION ROUTES ====

// @route POST /api/auth/restore/direct
const restoreDirect = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findByIdentifier(identifier);
        
        if (!user || !user.is_deleted) {
            return res.status(400).json({ success: false, message: 'Valid deleted account not found.' });
        }

        if (user.lock_until && new Date(user.lock_until).getTime() > Date.now()) {
            const retryAfterSec = Math.max(1, Math.ceil((new Date(user.lock_until).getTime() - Date.now()) / 1000));
            return res.status(429).json({
                success: false,
                action: 'LOGIN_LOCKED',
                message: `Try again after ${retryAfterSec} seconds`,
                retryAfterSec
            });
        }

        // Verify password before restoring
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const { locked } = await User.recordFailedLoginAttempt(user.id, {
                maxAttempts: MAX_LOGIN_ATTEMPTS,
                lockSeconds: LOGIN_LOCK_SECONDS
            });

            if (locked) {
                return res.status(429).json({
                    success: false,
                    action: 'LOGIN_LOCKED',
                    message: `Try again after ${LOGIN_LOCK_SECONDS} seconds`,
                    retryAfterSec: LOGIN_LOCK_SECONDS
                });
            }

            return res.status(401).json({ success: false, message: 'Invalid credentials. Cannot restore.' });
        }

        await User.clearLoginLock(user.id);

        // Restore Account
        await User.restoreAccount(user.id);

        // Generate Login Token
        const token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            message: 'Account restored successfully. Welcome back!',
            token,
            data: { id: user.id, name: user.name }
        });

    } catch (error) { next(error); }
};

// @route POST /api/auth/overwrite
const overwriteAccount = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const identifier = email;

        const validationError = validateSignup(name, identifier, password);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const existingUser = await User.findByIdentifier(identifier);
        
        if (!existingUser || !existingUser.is_deleted) {
            return res.status(400).json({ success: false, message: 'Cannot overwrite active account.' });
        }

        // HARD DELETE the old user
        await User.hardDelete(existingUser.id);

        // Standard Signup
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const { email: cleanEmail, phone: cleanPhone } = parseIdentifier(identifier);

        const newUserId = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            phone_number: cleanPhone
        });

        const token = jwt.sign({ userId: newUserId, name }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            success: true,
            message: 'New account created successfully.',
            token,
            data: { id: newUserId, name }
        });

    } catch (error) { next(error); }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfilePhone,
    deleteAccount,
    restoreDirect,
    overwriteAccount
};
