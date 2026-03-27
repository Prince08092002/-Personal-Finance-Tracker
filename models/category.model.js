const db = require('../config/db');

const Category = {
    // Get all categories for a user (including default ones)
    findAllByUser: async (userId, limit, offset) => {
        console.log(`[MODEL] Find categories for user ${userId} with limit=${limit} offset=${offset}`);
        const [rows] = await db.query(
            'SELECT id, name, user_id FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name ASC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );
        return rows;
    },
    countAllByUser: async (userId) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM categories WHERE user_id IS NULL OR user_id = ?',
            [userId]
        );
        return Number(rows[0].total || 0);
    },

    // Create a new custom category for a user
    create: async (userId, name) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Create category for user - ${userId}`);
        const [result] = await db.query(
            'INSERT INTO categories (user_id, name) VALUES (?, ?)',
            [userId, name]
        );
        return result.insertId;
    },
    
    // Check if category exists for a user (or is default)
    findByIdAndUser: async (id, userId) => {
        const [rows] = await db.query(
            'SELECT id, name FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
            [id, userId]
        );
        return rows[0];
    }
};

module.exports = Category;
