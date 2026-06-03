const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== KIỂM TRA SCHEMA ===\n');

    const [columns] = await connection.query('DESCRIBE UPLOAD_DETAIL');
    
    columns.forEach(col => {
      console.log(`${col.Field}:`);
      console.log(`  Type: ${col.Type}`);
      console.log(`  Null: ${col.Null}`);
      console.log(`  Default: ${col.Default}`);
      console.log();
    });

  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();
