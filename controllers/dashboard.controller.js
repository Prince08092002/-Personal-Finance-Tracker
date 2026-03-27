const Dashboard = require('../models/dashboard.model');

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 5));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page, limit, offset } = parsePagination(req.query);
        console.log(`[CONTROLLER] getDashboardData called by ${req.user.name} (${userId})`);

        const [totalIncome, totalExpense, categoryWiseExpense, recentTransactions, recentTransactionTotal] = await Promise.all([
            Dashboard.getTotalIncome(userId),
            Dashboard.getTotalExpense(userId),
            Dashboard.getCategoryExpenseBreakdown(userId),
            Dashboard.getRecentTransactions(userId, limit, offset),
            Dashboard.getRecentTransactionsCount(userId)
        ]);

        // Convert strings to nested numbers to ensure accurate math
        const incomeNum = Number(totalIncome || 0);
        const expenseNum = Number(totalExpense || 0);
        const remainingBalance = incomeNum - expenseNum;

        const data = {
            totalIncome: incomeNum,
            totalExpense: expenseNum,
            remainingBalance,
            categoryWiseExpense,
            recentTransactions,
            recentTransactionsPagination: {
                page,
                limit,
                total: recentTransactionTotal,
                totalPages: Math.ceil(recentTransactionTotal / limit)
            }
        };

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardData
};
