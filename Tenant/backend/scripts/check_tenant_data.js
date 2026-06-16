const pool = require('../config/database');

async function checkTenantData() {
  try {
    // Check if there are any tenants with null names
    const [tenants] = await pool.query(`
      SELECT t.TenantID, t.AccountID, t.Username, t.Name, t.Email, 
             a.Role, a.Status
      FROM TENANT t
      JOIN ACCOUNT a ON t.AccountID = a.AccountID
      LIMIT 10
    `);

    console.log('\n=== Sample Tenant Data ===');
    console.log(tenants);

    // Check specific email
    const email = 'nva@gmail.com'; // Replace with actual email
    const [userByEmail] = await pool.query(`
      SELECT a.AccountID, a.Username, a.Password, a.Role, a.Status,
             COALESCE(t.Name, l.Name, mp.Name) as Name,
             COALESCE(t.Email, l.Email, mp.Email) as Email,
             COALESCE(t.Phone, l.Phone, mp.Phone) as Phone
      FROM ACCOUNT a
      LEFT JOIN TENANT t ON a.AccountID = t.AccountID
      LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID
      LEFT JOIN MOVING_PROVIDER mp ON a.AccountID = mp.AccountID
      WHERE t.Email = ? OR l.Email = ? OR mp.Email = ?
    `, [email, email, email]);

    console.log('\n=== User by email (' + email + ') ===');
    console.log(userByEmail);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTenantData();
