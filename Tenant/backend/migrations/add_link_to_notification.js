const db = require('../config/database');

async function addLinkColumn() {
  const connection = await db.getConnection();
  
  try {
    console.log('Adding Link column to NOTIFICATION table...');
    
    // Check if column already exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'NOTIFICATION' AND COLUMN_NAME = 'Link'`
    );
    
    if (columns.length > 0) {
      console.log('Link column already exists');
      return;
    }
    
    // Add Link column
    await connection.query(
      `ALTER TABLE NOTIFICATION ADD COLUMN Link VARCHAR(255) NULL AFTER Type`
    );
    
    console.log('Link column added successfully');
  } catch (error) {
    console.error('Error adding Link column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
addLinkColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
