const Budget = require('../models/budget.model');
const Category = require('../models/category.model');

const isValidMonthKey = (monthKey) => /^\d{4}-\d{2}$/.test(monthKey);

const getCurrentMonthKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const getBudgets = async (req, res, next) => {
    try {
        const monthKey = req.query.month || getCurrentMonthKey();
        if (!isValidMonthKey(monthKey)) {
            return res.status(400).json({ success: false, message: 'Invalid month. Use YYYY-MM.' });
        }

        console.log(`[CONTROLLER] getBudgets by ${req.user.name} (${req.user.userId}) month=${monthKey}`);
        const data = await Budget.getBudgetsForUserMonth({ userId: req.user.userId, monthKey });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const setBudget = async (req, res, next) => {
    try {
        const { categoryId, budgetAmount } = req.body;
        const monthKey = req.body.month_key || req.body.month;

        if (!monthKey || !isValidMonthKey(monthKey)) {
            return res.status(400).json({ success: false, message: 'Invalid month. Use YYYY-MM.' });
        }

        const budgetValue = Number(budgetAmount);
        if (!categoryId && categoryId !== 0) {
            return res.status(400).json({ success: false, message: 'Please provide categoryId.' });
        }
        if (Number.isNaN(budgetValue) || budgetValue < 0) {
            return res.status(400).json({ success: false, message: 'Please provide a valid budgetAmount (>= 0).' });
        }

        // Ensure category belongs to the user (or default category).
        const category = await Category.findByIdAndUser(categoryId, req.user.userId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found or invalid.' });
        }

        console.log(`[CONTROLLER] setBudget by ${req.user.name} (${req.user.userId}) category=${categoryId} month=${monthKey}`);
        await Budget.upsert({
            userId: req.user.userId,
            categoryId,
            monthKey,
            budgetAmount: budgetValue
        });

        const data = await Budget.getBudgetsForUserMonth({ userId: req.user.userId, monthKey });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBudgets,
    setBudget
};

