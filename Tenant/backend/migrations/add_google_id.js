const pool = require('../config/database');

async function addGoogleIdColumn() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding GoogleID column to ACCOUNT table...');
    
    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'ACCOUNT' 
      AND COLUMN_NAME = 'GoogleID'
    `);
    
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE ACCOUNT 
        ADD COLUMN GoogleID VARCHAR(255) NULL UNIQUE AFTER Password
      `);
      console.log('GoogleID column added successfully');
    } else {
      console.log('GoogleID column already exists');
    }
    
  } catch (error) {
    console.error('Error adding GoogleID column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
addGoogleIdColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
