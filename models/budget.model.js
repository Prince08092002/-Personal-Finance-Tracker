const db = require('../config/db');

const getMonthRange = (monthKey) => {
    // monthKey: YYYY-MM
    const [yearStr, monthStr] = monthKey.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12

    // Use UTC to avoid timezone shifting date boundaries.
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const nextMonthStart = new Date(Date.UTC(year, month, 1));

    const start = monthStart.toISOString().slice(0, 10);
    const end = nextMonthStart.toISOString().slice(0, 10);
    return { start, end };
};

const Budget = {
    upsert: async ({ userId, categoryId, monthKey, budgetAmount }) => {
        await db.query(
            `INSERT INTO budgets (user_id, category_id, month_key, budget_amount)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE budget_amount = VALUES(budget_amount)`,
            [userId, categoryId, monthKey, budgetAmount]
        );
        // Return updated row (best-effort).
        const [rows] = await db.query(
            `SELECT id, user_id, category_id, month_key, budget_amount, updated_at
             FROM budgets
             WHERE user_id = ? AND category_id = ? AND month_key = ?
             LIMIT 1`,
            [userId, categoryId, monthKey]
        );
        return rows[0] || null;
    },

    getBudgetsForUserMonth: async ({ userId, monthKey }) => {
        const { start, end } = getMonthRange(monthKey);

        // Include both default (user_id IS NULL) and user custom categories.
        const [rows] = await db.query(
            `
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                COALESCE(b.budget_amount, 0) AS budget_amount,
                COALESCE(SUM(e.amount), 0) AS actual_amount
            FROM categories c
            LEFT JOIN budgets b
                ON b.user_id = ? AND b.category_id = c.id AND b.month_key = ?
            LEFT JOIN expenses e
                ON e.user_id = ? AND e.category_id = c.id
                AND e.expense_date >= ? AND e.expense_date < ?
            WHERE c.user_id IS NULL OR c.user_id = ?
            GROUP BY c.id, c.name, b.budget_amount
            ORDER BY c.name ASC
            `,
            [userId, monthKey, userId, start, end, userId]
        );

        const totals = rows.reduce(
            (acc, r) => {
                acc.totalBudget += Number(r.budget_amount || 0);
                acc.totalActual += Number(r.actual_amount || 0);
                return acc;
            },
            { totalBudget: 0, totalActual: 0 }
        );

        const items = rows.map((r) => {
            const budgetAmount = Number(r.budget_amount || 0);
            const actualAmount = Number(r.actual_amount || 0);
            const progress = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
            return {
                categoryId: r.category_id,
                categoryName: r.category_name,
                monthKey,
                budgetAmount,
                actualAmount,
                remainingAmount: budgetAmount - actualAmount,
                progressPercent: progress
            };
        });

        return { monthKey, totalBudget: totals.totalBudget, totalActual: totals.totalActual, items };
    }
};

module.exports = Budget;

