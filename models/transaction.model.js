const db = require('../config/db');

const buildTransactionsSql = ({ userId, type, q, from, to, countOnly }) => {
    const qLike = q ? `%${q}%` : null;

    const incomeWhere = ['user_id = ?'];
    const incomeParams = [userId];
    if (qLike) incomeWhere.push('source LIKE ?');
    if (qLike) incomeParams.push(qLike);
    if (from) {
        incomeWhere.push('income_date >= ?');
        incomeParams.push(from);
    }
    if (to) {
        incomeWhere.push('income_date <= ?');
        incomeParams.push(to);
    }

    const expenseWhere = ['e.user_id = ?'];
    const expenseParams = [userId];
    if (qLike) expenseWhere.push('(c.name LIKE ? OR e.description LIKE ?)');
    if (qLike) {
        expenseParams.push(qLike);
        expenseParams.push(qLike);
    }
    if (from) {
        expenseWhere.push('e.expense_date >= ?');
        expenseParams.push(from);
    }
    if (to) {
        expenseWhere.push('e.expense_date <= ?');
        expenseParams.push(to);
    }

    const incomeSelect = `
        SELECT
            'income' AS type,
            i.id AS id,
            i.source AS title,
            i.amount AS amount,
            i.income_date AS date
        FROM income i
        WHERE ${incomeWhere.join(' AND ')}
    `;

    const expenseSelect = `
        SELECT
            'expense' AS type,
            e.id AS id,
            CASE
              WHEN e.description IS NULL OR e.description = '' THEN c.name
              ELSE CONCAT(c.name, ' - ', e.description)
            END AS title,
            e.amount AS amount,
            e.expense_date AS date
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE ${expenseWhere.join(' AND ')}
    `;

    const normalizedType = type || 'all';
    let unionSql;
    let unionParams;

    if (normalizedType === 'income') {
        unionSql = incomeSelect;
        unionParams = incomeParams;
    } else if (normalizedType === 'expense') {
        unionSql = expenseSelect;
        unionParams = expenseParams;
    } else {
        unionSql = `${incomeSelect} UNION ALL ${expenseSelect}`;
        unionParams = [...incomeParams, ...expenseParams];
    }

    if (countOnly) {
        const countSql = `SELECT COUNT(*) AS total FROM (${unionSql}) t`;
        return { sql: countSql, params: unionParams };
    }

    // Data query (pagination).
    const dataSql = `
        SELECT * FROM (${unionSql}) t
        ORDER BY t.date DESC, t.type DESC
        LIMIT ? OFFSET ?
    `;

    return { sql: dataSql, params: [...unionParams] };
};

const Transactions = {
    getTransactions: async (filters) => {
        const { userId, type, q, from, to, limit, offset } = filters;
        const { sql, params } = buildTransactionsSql({ userId, type, q, from, to, countOnly: false });
        const finalParams = [...params, limit, offset];
        const [rows] = await db.query(sql, finalParams);
        return rows;
    },

    countTransactions: async (filters) => {
        const { userId, type, q, from, to } = filters;
        const { sql, params } = buildTransactionsSql({ userId, type, q, from, to, countOnly: true });
        const [rows] = await db.query(sql, params);
        return Number(rows[0]?.total || 0);
    }
};

module.exports = Transactions;

