const Income = require('../models/income.model');

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

// @desc    Get all income
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);
        console.log(`[CONTROLLER] getIncome called by ${req.user.name} (${req.user.userId})`);
        const [income, total] = await Promise.all([
            Income.findAllByUser(req.user.userId, limit, offset),
            Income.countAllByUser(req.user.userId)
        ]);
        res.status(200).json({
            success: true,
            count: income.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: income
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res, next) => {
    try {
        const { source, amount, frequency, incomeDate } = req.body;
        console.log(`[CONTROLLER] addIncome called by ${req.user.name} (${req.user.userId})`);

        if (!source || !amount || !incomeDate) {
            res.status(400);
            throw new Error('Please provide source, amount, and income date');
        }

        const validFrequencies = ['monthly', 'weekly', 'one-time'];
        const dataFrequency = validFrequencies.includes(frequency) ? frequency : 'one-time';

        const incomeId = await Income.create({
            userId: req.user.userId,
            source,
            amount,
            frequency: dataFrequency,
            incomeDate
        });

        res.status(201).json({ success: true, message: 'Income added', data: { id: incomeId } });
    } catch (error) {
        next(error);
    }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
    try {
        const incomeId = req.params.id;
        const { source, amount, frequency, incomeDate } = req.body;
        console.log(`[CONTROLLER] updateIncome called by ${req.user.name} (${req.user.userId}) for income ${incomeId}`);

        if (!source || !amount || !incomeDate) {
            return res.status(400).json({ success: false, message: 'Please provide source, amount, and income date' });
        }

        const validFrequencies = ['monthly', 'weekly', 'one-time'];
        const dataFrequency = validFrequencies.includes(frequency) ? frequency : 'one-time';

        const affectedRows = await Income.update(incomeId, req.user.userId, {
            source,
            amount,
            frequency: dataFrequency,
            incomeDate
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Income not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Income updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
    try {
        const incomeId = req.params.id;
        console.log(`[CONTROLLER] deleteIncome called by ${req.user.name} (${req.user.userId}) for income ${incomeId}`);
        const affectedRows = await Income.delete(incomeId, req.user.userId);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Income not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Income deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getIncome,
    addIncome,
    updateIncome,
    deleteIncome
};
