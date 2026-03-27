const Expense = require('../models/expense.model');
const Category = require('../models/category.model');

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);
        console.log(`[CONTROLLER] getExpenses called by ${req.user.name} (${req.user.userId})`);
        const [expenses, total] = await Promise.all([
            Expense.findAllByUser(req.user.userId, limit, offset),
            Expense.countAllByUser(req.user.userId)
        ]);
        res.status(200).json({
            success: true,
            count: expenses.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: expenses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
    try {
        const { categoryId, amount, description, expenseDate } = req.body;
        console.log(`[CONTROLLER] addExpense called by ${req.user.name} (${req.user.userId})`);

        if (!categoryId || !amount || !expenseDate) {
            res.status(400);
            throw new Error('Please provide category ID, amount, and expense date');
        }

        // Verify category exists and belongs to user (or is default)
        const category = await Category.findByIdAndUser(categoryId, req.user.userId);
        if (!category) {
            res.status(404);
            throw new Error('Category not found or invalid');
        }

        const expenseId = await Expense.create({
            userId: req.user.userId,
            categoryId,
            amount,
            description,
            expenseDate
        });

        res.status(201).json({ success: true, message: 'Expense added', data: { id: expenseId } });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        const { categoryId, amount, description, expenseDate } = req.body;
        console.log(`[CONTROLLER] updateExpense called by ${req.user.name} (${req.user.userId}) for expense ${expenseId}`);

        if (!categoryId || !amount || !expenseDate) {
            return res.status(400).json({ success: false, message: 'Please provide category ID, amount, and expense date' });
        }

        const category = await Category.findByIdAndUser(categoryId, req.user.userId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found or invalid' });
        }

        const affectedRows = await Expense.update(expenseId, req.user.userId, {
            categoryId,
            amount,
            description,
            expenseDate
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        console.log(`[CONTROLLER] deleteExpense called by ${req.user.name} (${req.user.userId}) for expense ${expenseId}`);
        
        const affectedRows = await Expense.delete(expenseId, req.user.userId);
        
        if (affectedRows === 0) {
            res.status(404);
            throw new Error('Expense not found or unauthorized');
        }

        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense
};
