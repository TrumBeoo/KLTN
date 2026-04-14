const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  async generateAccountId() {
    const [rows] = await pool.query(
      'SELECT AccountID FROM ACCOUNT ORDER BY AccountID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].AccountID.substring(3));
      return 'ACC' + String(lastId + 1).padStart(5, '0');
    }
    return 'ACC00001';
  }

  async generateLandlordId() {
    const [rows] = await pool.query(
      'SELECT LandlordID FROM LANDLORD ORDER BY LandlordID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].LandlordID.substring(3));
      return 'LAN' + String(lastId + 1).padStart(5, '0');
    }
    return 'LAN00001';
  }

  async checkUsernameExists(username) {
    const [rows] = await pool.query(
      'SELECT AccountID FROM ACCOUNT WHERE Username = ?',
      [username]
    );
    return rows.length > 0;
  }

  async checkEmailExists(email) {
    const [rows] = await pool.query(
      `SELECT a.AccountID FROM ACCOUNT a
       LEFT JOIN TENANT t ON a.AccountID = t.AccountID
       LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID
       WHERE t.Email = ? OR l.Email = ?`,
      [email, email]
    );
    return rows.length > 0;
  }

  async loginUser(username, password) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    
    let query = `
      SELECT a.AccountID, a.Username, a.Password, a.Role, a.Status,
             COALESCE(t.Name, l.Name) as Name,
             COALESCE(t.Email, l.Email) as Email,
             COALESCE(t.Phone, l.Phone) as Phone
      FROM ACCOUNT a
      LEFT JOIN TENANT t ON a.AccountID = t.AccountID
      LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID
      WHERE ${isEmail ? '(t.Email = ? OR l.Email = ?)' : 'a.Username = ?'}
    `;

    const params = isEmail ? [username, username] : [username];
    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
    }

    const user = rows[0];

    if (user.Status !== 'Active') {
      return { error: 'Tài khoản đã bị khóa' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
    }

    delete user.Password;
    return user;
  }

  async registerUser(username, password, name, email, phone, role = 'Landlord') {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const accountId = await this.generateAccountId();
      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.query(
        'INSERT INTO ACCOUNT (AccountID, Username, Password, Role, Status) VALUES (?, ?, ?, ?, ?)',
        [accountId, username, hashedPassword, role, 'Active']
      );

      const now = new Date();

      if (role === 'Landlord') {
        const landlordId = await this.generateLandlordId();
        await connection.query(
          'INSERT INTO LANDLORD (LandlordID, AccountID, Name, Email, Phone, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [landlordId, accountId, name, email, phone, now, now]
        );
      }

      await connection.commit();
      return accountId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updatePassword(accountId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE ACCOUNT SET Password = ? WHERE AccountID = ?',
      [hashedPassword, accountId]
    );
    return result.affectedRows > 0;
  }

  async getUserProfile(accountId) {
    const [rows] = await pool.query(
      `SELECT l.LandlordID, l.Name, l.Email, l.Phone, l.Address, l.City, l.District, l.Ward, l.CreatedAt, l.UpdatedAt
       FROM LANDLORD l
       WHERE l.AccountID = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async updateUserProfile(accountId, name, email, phone, address, city, district, ward) {
    const [result] = await pool.query(
      `UPDATE LANDLORD SET Name = ?, Email = ?, Phone = ?, Address = ?, City = ?, District = ?, Ward = ?, UpdatedAt = NOW()
       WHERE AccountID = ?`,
      [name, email, phone, address, city, district, ward, accountId]
    );
    return result.affectedRows > 0;
  }

  generateToken(user) {
    return jwt.sign(
      {
        accountId: user.AccountID,
        username: user.Username,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
}

module.exports = new UserService();
