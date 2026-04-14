const db = require('../config/db');

const Category = {
    // Get all categories for a user (including default ones)
    findAllByUser: async (userId, limit, offset) => {
        console.log(`[MODEL] Find categories for user ${userId} with limit=${limit} offset=${offset}`);
        const [rows] = await db.query(
            `
            SELECT x.id, x.name, x.user_id
            FROM (
              -- User-specific categories
              SELECT c.id, c.name, c.user_id
              FROM categories c
              WHERE c.user_id = ?

              UNION ALL

              -- Default categories (deduped by name), excluded if user has same name
              SELECT MIN(c0.id) AS id, c0.name, c0.user_id
              FROM categories c0
              WHERE c0.user_id IS NULL
                AND NOT EXISTS (
                  SELECT 1
                  FROM categories u
                  WHERE u.user_id = ? AND u.name = c0.name
                )
              GROUP BY c0.name, c0.user_id
            ) x
            ORDER BY x.name ASC
            LIMIT ? OFFSET ?
            `,
            [userId, userId, limit, offset]
        );
        return rows;
    },
    countAllByUser: async (userId) => {
        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM (
              SELECT c.id
              FROM categories c
              WHERE c.user_id = ?

              UNION ALL

              SELECT MIN(c0.id) AS id
              FROM categories c0
              WHERE c0.user_id IS NULL
                AND NOT EXISTS (
                  SELECT 1
                  FROM categories u
                  WHERE u.user_id = ? AND u.name = c0.name
                )
              GROUP BY c0.name, c0.user_id
            ) x
            `,
            [userId, userId]
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
