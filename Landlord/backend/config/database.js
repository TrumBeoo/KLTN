const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  maxIdle: 10,
  idleTimeout: 60000,
  connectTimeout: 10000
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

pool.getConnection().then(conn => {
  console.log('✓ Database connected successfully');
  conn.release();
}).catch(err => {
  console.error('✗ Database connection failed:', err.message);
});

module.exports = pool;
