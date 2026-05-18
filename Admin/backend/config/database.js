const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'KLTN',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Helper functions
const executeQuery = async (query, values = []) => {
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(query, values)
    return results
  } finally {
    connection.release()
  }
}

const getConnection = async () => {
  return await pool.getConnection()
}

module.exports = {
  pool,
  executeQuery,
  getConnection
}
