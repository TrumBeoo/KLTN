const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    console.log('✓ Kết nối MySQL thành công');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✓ Database ${process.env.DB_NAME} đã sẵn sàng`);

    await connection.query(`USE ${process.env.DB_NAME}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ACCOUNT (
        AccountID CHAR(10) PRIMARY KEY,
        Username VARCHAR(30) UNIQUE NOT NULL,
        Password CHAR(64) NOT NULL,
        Role ENUM('Tenant', 'Landlord', 'Admin') NOT NULL,
        Status ENUM('Active', 'Block') DEFAULT 'Active'
      )
    `);
    console.log('✓ Bảng ACCOUNT đã sẵn sàng');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS TENANT (
        TenantID CHAR(10) PRIMARY KEY,
        AccountID CHAR(10),
        Name VARCHAR(50),
        Age INT,
        Budget DECIMAL(10,2),
        Habit VARCHAR(255),
        Preference VARCHAR(255),
        Phone VARCHAR(15),
        Email VARCHAR(50),
        CreatedAt DATETIME,
        UpdatedAt DATETIME,
        FOREIGN KEY (AccountID) REFERENCES ACCOUNT(AccountID)
      )
    `);
    console.log('✓ Bảng TENANT đã sẵn sàng');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS LANDLORD (
        LandlordID CHAR(10) PRIMARY KEY,
        AccountID CHAR(10),
        Name VARCHAR(50),
        Phone VARCHAR(15),
        Email VARCHAR(50),
        CreatedAt DATETIME,
        UpdatedAt DATETIME,
        FOREIGN KEY (AccountID) REFERENCES ACCOUNT(AccountID)
      )
    `);
    console.log('✓ Bảng LANDLORD đã sẵn sàng');

    const [accounts] = await connection.query('SELECT COUNT(*) as count FROM ACCOUNT');
    if (accounts[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);

      await connection.query(
        'INSERT INTO ACCOUNT (AccountID, Username, Password, Role, Status) VALUES (?, ?, ?, ?, ?)',
        ['ACC0000001', 'tenant@email.com', hashedPassword, 'Tenant', 'Active']
      );

      await connection.query(
        'INSERT INTO TENANT (TenantID, AccountID, Name, Email, Phone, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['TEN0000001', 'ACC0000001', 'Tenant User', 'tenant@email.com', '0123456789', new Date(), new Date()]
      );

      console.log('✓ Dữ liệu mẫu đã được tạo');
      console.log('  - Tenant: tenant@email.com / 123456');
    }

    console.log('\n✅ Database khởi tạo thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();
