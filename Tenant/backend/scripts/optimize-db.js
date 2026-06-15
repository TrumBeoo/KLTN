const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runOptimization() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  try {
    console.log('🚀 Starting database optimization...');
    
    const sqlFile = fs.readFileSync(
      path.join(__dirname, '../migrations/add_performance_indexes.sql'),
      'utf8'
    );
    
    // Split by semicolon and filter empty statements
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
        const shortStatement = statement.substring(0, 80).replace(/\n/g, ' ');
        console.log('✅ Executed:', shortStatement + '...');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          const indexMatch = statement.match(/INDEX (\w+)/);
          const indexName = indexMatch ? indexMatch[1] : 'unknown';
          console.log(`⚠️  Index ${indexName} already exists, skipping...`);
        } else {
          console.error('❌ Error:', err.message);
        }
      }
    }
    
    console.log('\n✨ Database optimization completed!');
    console.log('📊 Summary: Indexes created and tables optimized for better performance');
  } catch (error) {
    console.error('Error running optimization:', error);
  } finally {
    await connection.end();
  }
}

runOptimization();
