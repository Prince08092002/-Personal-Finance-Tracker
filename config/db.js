const mysql = require('mysql2');
require('dotenv').config();

console.log('[CHECKPOINT: DATABASE] Initializing MySQL connection pool...');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'finance_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Check connection
promisePool.getConnection()
  .then(connection => {
    console.log('[CHECKPOINT: DATABASE/SUCCESS] Successfully connected to the MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('[CHECKPOINT: DATABASE/ERROR] MySQL connection failed:', err.message);
  });

module.exports = promisePool;
