const db = require('../config/db');

const User = {
    // Find user by email or phone
    findByIdentifier: async (identifier) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Find user by identifier - ${identifier}`);
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? OR phone_number = ?', [identifier, identifier]);
        return rows[0];
    },

    // Find user by ID
    findById: async (id) => {
         console.log(`[CHECKPOINT: MODEL] Executing DB Query: Find user by ID - ${id}`);
         const [rows] = await db.query('SELECT id, name, email, phone_number, is_deleted, created_at FROM users WHERE id = ?', [id]);
         return rows[0];
    },

    // Create a new user
    create: async (userData) => {
        const { name, email, password, phone_number } = userData;
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Create user`);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone_number, is_deleted) VALUES (?, ?, ?, ?, 0)',
            [name, email, password, phone_number || null]
        );
        return result.insertId;
    },

    // Update user phone number
    updatePhone: async (id, phoneNumber) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Update phone - User ${id}`);
        const [result] = await db.query(
            'UPDATE users SET phone_number = ? WHERE id = ?',
            [phoneNumber, id]
        );
        return result.affectedRows;
    },

    // SOFT Delete user account
    delete: async (id) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Soft Delete user - ${id}`);
        const [result] = await db.query(
            'UPDATE users SET is_deleted = 1 WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },
    
    // HARD Delete user account (Overwrite)
    hardDelete: async (id) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: HARD Delete user - ${id}`);
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },
    
    // Save OTP
    saveOTP: async (id, otp) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Save OTP for user - ${id}`);
        const [result] = await db.query(
            'UPDATE users SET otp_code = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
            [otp, id]
        );
        return result.affectedRows;
    },
    
    // Restore Account
    restoreAccount: async (id) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Restore user - ${id}`);
        const [result] = await db.query(
            'UPDATE users SET is_deleted = 0, otp_code = NULL, otp_expiry = NULL WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },

    recordFailedLoginAttempt: async (id, { maxAttempts, lockSeconds }) => {
        await db.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [id]);
        const [rows] = await db.query('SELECT failed_login_attempts FROM users WHERE id = ? LIMIT 1', [id]);
        const attempts = Number(rows[0]?.failed_login_attempts || 0);

        if (attempts >= maxAttempts) {
            await db.query(
                'UPDATE users SET lock_until = DATE_ADD(NOW(), INTERVAL ? SECOND), failed_login_attempts = 0 WHERE id = ?',
                [lockSeconds, id]
            );
            return { locked: true, attempts: maxAttempts };
        }

        return { locked: false, attempts };
    },

    clearLoginLock: async (id) => {
        await db.query('UPDATE users SET failed_login_attempts = 0, lock_until = NULL WHERE id = ?', [id]);
    }
};

module.exports = User;
