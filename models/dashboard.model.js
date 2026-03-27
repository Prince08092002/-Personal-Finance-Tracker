const db = require('../config/db');

const Dashboard = {
    // Get total income
    getTotalIncome: async (userId) => {
        const [rows] = await db.query(
            'SELECT COALESCE(SUM(amount), 0) as totalIncome FROM income WHERE user_id = ?',
            [userId]
        );
        return rows[0].totalIncome;
    },

    // Get total expense
    getTotalExpense: async (userId) => {
        const [rows] = await db.query(
            'SELECT COALESCE(SUM(amount), 0) as totalExpense FROM expenses WHERE user_id = ?',
            [userId]
        );
        return rows[0].totalExpense;
    },

    // Get category-wise expense breakdown
    getCategoryExpenseBreakdown: async (userId) => {
        const [rows] = await db.query(`
            SELECT c.name as category, COALESCE(SUM(e.amount), 0) as total
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
            GROUP BY c.id, c.name
            ORDER BY total DESC
        `, [userId]);
        return rows;
    },

    // Get recent transactions (last 5 income + expenses)
    getRecentTransactions: async (userId, limit, offset) => {
        const [rows] = await db.query(`
            (SELECT 'income' as type, source as title, amount, income_date as date, id 
             FROM income WHERE user_id = ?)
            UNION ALL
            (SELECT 'expense' as type, c.name as title, e.amount, e.expense_date as date, e.id
             FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.user_id = ?)
            ORDER BY date DESC
            LIMIT ? OFFSET ?
        `, [userId, userId, limit, offset]);
        return rows;
    },
    getRecentTransactionsCount: async (userId) => {
        const [rows] = await db.query(`
            SELECT (
                (SELECT COUNT(*) FROM income WHERE user_id = ?) +
                (SELECT COUNT(*) FROM expenses WHERE user_id = ?)
            ) AS total
        `, [userId, userId]);
        return Number(rows[0].total || 0);
    }
};

module.exports = Dashboard;
