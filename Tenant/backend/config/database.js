const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  maxIdle: 20,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

module.exports = pool;
