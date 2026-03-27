const db = require('../config/db');

const Income = {
    // Get all income for a user
    findAllByUser: async (userId, limit, offset) => {
        console.log(`[MODEL] Find income for user ${userId} with limit=${limit} offset=${offset}`);
        const [rows] = await db.query(`
            SELECT id, source, amount, frequency, income_date 
            FROM income
            WHERE user_id = ?
            ORDER BY income_date DESC
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
        return rows;
    },
    countAllByUser: async (userId) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM income WHERE user_id = ?',
            [userId]
        );
        return Number(rows[0].total || 0);
    },

    // Add new income
    create: async (incomeData) => {
        const { userId, source, amount, frequency, incomeDate } = incomeData;
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Create income for user - ${userId}`);
        const [result] = await db.query(
            'INSERT INTO income (user_id, source, amount, frequency, income_date) VALUES (?, ?, ?, ?, ?)',
            [userId, source, amount, frequency, incomeDate]
        );
        return result.insertId;
    },

    // Update income record
    update: async (id, userId, incomeData) => {
        const { source, amount, frequency, incomeDate } = incomeData;
        const [result] = await db.query(
            'UPDATE income SET source = ?, amount = ?, frequency = ?, income_date = ? WHERE id = ? AND user_id = ?',
            [source, amount, frequency, incomeDate, id, userId]
        );
        return result.affectedRows;
    },

    // Delete income record
    delete: async (id, userId) => {
        const [result] = await db.query(
            'DELETE FROM income WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    }
};

module.exports = Income;
