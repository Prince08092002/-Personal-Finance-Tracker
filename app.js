const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const expenseRoutes = require('./routes/expense.routes');
const incomeRoutes = require('./routes/income.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const budgetRoutes = require('./routes/budget.routes');
const transactionRoutes = require('./routes/transaction.routes');
const errorHandler = require('./middleware/error.middleware');

console.log('[CHECKPOINT: APP_INIT] Bootstrapping Express App...');

const app = express();

// Middleware to allow cross-origin requests from React
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[CHECKPOINT: REQUEST] Incoming HTTP request: ${req.method} ${req.url}`);
    next();
});

// ✅ ADD THIS ROOT ROUTE
app.get('/', (req, res) => {
    res.send('API Running...');
});

console.log('[CHECKPOINT: APP_INIT] Attaching API Routes...');
// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

console.log('[CHECKPOINT: APP_INIT] Attaching Error Handler Middleware...');
// Custom Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;