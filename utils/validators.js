// Simple input validation utility

const validateSignup = (name, identifier, password) => {
    console.log('[CHECKPOINT: VALIDATOR] Validating signup inputs...');
    if (!name || !identifier || !password) {
        return 'Name, email/phone, and password are required.';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long.';
    }
    // Check if it matches email OR phone (all digits, length >= 7)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{7,}$/;
    
    if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        return 'Invalid email or phone number format.';
    }
    console.log('[CHECKPOINT: VALIDATOR/SUCCESS] Signup inputs validated successfully.');
    return null; // null means no errors
};

const validateLogin = (identifier, password) => {
    console.log('[CHECKPOINT: VALIDATOR] Validating login inputs...');
    if (!identifier || !password) {
        return 'Email/Phone and password are required.';
    }
    console.log('[CHECKPOINT: VALIDATOR/SUCCESS] Login inputs validated.');
    return null;
};

module.exports = {
    validateSignup,
    validateLogin
};
