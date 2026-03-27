require('dotenv').config();

const app = require('./app');   // ✅ first import app

console.log('[CHECKPOINT: SERVER_BOOT] Starting initialization sequence...');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[CHECKPOINT: SERVER_READY] 🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log('[CHECKPOINT: WAITING] Waiting for incoming requests...');
});