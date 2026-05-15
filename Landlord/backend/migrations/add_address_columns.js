const pool = require('../config/database');

async function addAddressColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding address columns to LANDLORD table...');
    
    // Check if Address column exists
    const [addressCol] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'LANDLORD' 
      AND COLUMN_NAME = 'Address'
    `);
    
    if (addressCol.length === 0) {
      await connection.query(`
        ALTER TABLE LANDLORD 
        ADD COLUMN Address VARCHAR(255) NULL AFTER Phone,
        ADD COLUMN City VARCHAR(100) NULL AFTER Address,
        ADD COLUMN District VARCHAR(100) NULL AFTER City,
        ADD COLUMN Ward VARCHAR(100) NULL AFTER District
      `);
      console.log('Address columns added successfully');
    } else {
      console.log('Address columns already exist');
    }
    
  } catch (error) {
    console.error('Error adding address columns:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
addAddressColumns()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
