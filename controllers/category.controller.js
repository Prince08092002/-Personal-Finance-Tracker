const Category = require('../models/category.model');

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);
        console.log(`[CONTROLLER] getCategories called by ${req.user.name} (${req.user.userId})`);
        const [categories, total] = await Promise.all([
            Category.findAllByUser(req.user.userId, limit, offset),
            Category.countAllByUser(req.user.userId)
        ]);
        res.status(200).json({
            success: true,
            count: categories.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        console.log(`[CONTROLLER] createCategory called by ${req.user.name} (${req.user.userId}) - Name: ${name}`);

        if (!name) {
            res.status(400);
            throw new Error('Please provide category name');
        }

        const categoryId = await Category.create(req.user.userId, name);
        res.status(201).json({ success: true, data: { id: categoryId, name } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400);
            return next(new Error('Category already exists for this user'));
        }
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory
};
