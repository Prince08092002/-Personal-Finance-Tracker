const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    console.log('[AUTH] Checking authorization header...');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            console.log('[AUTH] Bearer token found, verifying...');
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let name = decoded.name;
            if (!name) {
                const user = await User.findById(decoded.userId);
                name = user?.name || 'Unknown User';
            }

            req.user = {
                userId: decoded.userId,
                name
            };

            console.log(`[AUTH] Authenticated user: ${req.user.name} (${req.user.userId})`);
            next();
        } catch (error) {
            console.error('[AUTH] JWT verification failed:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn('[AUTH] Not authorized, no token provided.');
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
