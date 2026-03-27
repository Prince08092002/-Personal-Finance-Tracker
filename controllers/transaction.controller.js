const Transactions = require('../models/transaction.model');

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getTransactions = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);
        const type = req.query.type || 'all';
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const from = req.query.from && isValidDate(req.query.from) ? req.query.from : null;
        const to = req.query.to && isValidDate(req.query.to) ? req.query.to : null;

        const normalizedType = ['all', 'income', 'expense'].includes(type) ? type : 'all';

        console.log(`[CONTROLLER] getTransactions by ${req.user.name} (${req.user.userId}) type=${normalizedType} q=${q ? '[set]' : '[empty]'} from=${from || 'any'} to=${to || 'any'}`);

        const [items, total] = await Promise.all([
            Transactions.getTransactions({
                userId: req.user.userId,
                type: normalizedType,
                q,
                from,
                to,
                limit,
                offset
            }),
            Transactions.countTransactions({
                userId: req.user.userId,
                type: normalizedType,
                q,
                from,
                to
            })
        ]);

        res.status(200).json({
            success: true,
            count: items.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: items
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions
};

