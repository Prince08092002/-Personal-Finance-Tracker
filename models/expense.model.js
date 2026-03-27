const db = require('../config/db');

const Expense = {
    // Get all expenses for a user, including the category name
    findAllByUser: async (userId, limit, offset) => {
        console.log(`[MODEL] Find expenses for user ${userId} with limit=${limit} offset=${offset}`);
        const [rows] = await db.query(`
            SELECT e.id, e.amount, e.description, e.expense_date, e.category_id, c.name as category_name
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.expense_date DESC
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
        return rows;
    },
    countAllByUser: async (userId) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM expenses WHERE user_id = ?',
            [userId]
        );
        return Number(rows[0].total || 0);
    },

    // Add a new expense
    create: async (expenseData) => {
        const { userId, categoryId, amount, description, expenseDate } = expenseData;
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Create expense for user - ${userId}`);
        const [result] = await db.query(
            'INSERT INTO expenses (user_id, category_id, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
            [userId, categoryId, amount, description, expenseDate]
        );
        return result.insertId;
    },

    // Update an expense
    update: async (id, userId, expenseData) => {
        const { categoryId, amount, description, expenseDate } = expenseData;
        const [result] = await db.query(
            'UPDATE expenses SET category_id = ?, amount = ?, description = ?, expense_date = ? WHERE id = ? AND user_id = ?',
            [categoryId, amount, description || null, expenseDate, id, userId]
        );
        return result.affectedRows;
    },
    
    // Delete an expense
    delete: async (id, userId) => {
        console.log(`[CHECKPOINT: MODEL] Executing DB Query: Delete expense - ${id} for user - ${userId}`);
        const [result] = await db.query(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    }
};

module.exports = Expense;
