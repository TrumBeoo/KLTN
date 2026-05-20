const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinaryService = require('./cloudinaryService');

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

  async generateTenantId() {
    const [rows] = await pool.query(
      'SELECT TenantID FROM TENANT ORDER BY TenantID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].TenantID.substring(3));
      return 'TEN' + String(lastId + 1).padStart(5, '0');
    }
    return 'TEN00001';
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
       LEFT JOIN MOVING_PROVIDER mp ON a.AccountID = mp.AccountID
       WHERE t.Email = ? OR l.Email = ? OR mp.Email = ?`,
      [email, email, email]
    );
    return rows.length > 0;
  }

  async loginUser(username, password) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    
    let query = `
      SELECT a.AccountID, a.Username, a.Password, a.Role, a.Status,
             COALESCE(t.Name, l.Name, mp.Name) as Name,
             COALESCE(t.Email, l.Email, mp.Email) as Email,
             COALESCE(t.Phone, l.Phone, mp.Phone) as Phone
      FROM ACCOUNT a
      LEFT JOIN TENANT t ON a.AccountID = t.AccountID
      LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID
      LEFT JOIN MOVING_PROVIDER mp ON a.AccountID = mp.AccountID
      WHERE ${isEmail ? '(t.Email = ? OR l.Email = ? OR mp.Email = ?)' : 'a.Username = ?'}
    `;

    const params = isEmail ? [username, username, username] : [username];
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

  async registerUser(username, password, name, email, phone, role = 'Tenant') {
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

      if (role === 'Tenant') {
        const tenantId = await this.generateTenantId();
        await connection.query(
          'INSERT INTO TENANT (TenantID, AccountID, Username, Name, Email, Phone, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [tenantId, accountId, username, name, email, phone, now, now]
        );
      } else if (role === 'Provider') {
        const providerId = await this.generateProviderId();
        await connection.query(
          'INSERT INTO MOVING_PROVIDER (ProviderID, AccountID, Name, Phone, Email, VerifiedStatus, IsActive, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [providerId, accountId, name, phone, email, 'pending', true, now, now]
        );
      } else {
        const landlordId = await this.generateLandlordId();
        await connection.query(
          'INSERT INTO LANDLORD (LandlordID, AccountID, Username, Name, Email, Phone, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [landlordId, accountId, username, name, email, phone, now, now]
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

  async generateProviderId() {
    const [rows] = await pool.query(
      'SELECT ProviderID FROM MOVING_PROVIDER ORDER BY ProviderID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].ProviderID.substring(3));
      return 'PRO' + String(lastId + 1).padStart(7, '0');
    }
    return 'PRO0000001';
  }

  async updatePassword(accountId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE ACCOUNT SET Password = ? WHERE AccountID = ?',
      [hashedPassword, accountId]
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

  async uploadAvatar(accountId, fileBuffer) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [account] = await connection.query(
        'SELECT AvatarPublicID FROM ACCOUNT WHERE AccountID = ?',
        [accountId]
      );

      if (account[0]?.AvatarPublicID) {
        await cloudinaryService.deleteFile(account[0].AvatarPublicID);
      }

      const uploadResult = await cloudinaryService.uploadImage(fileBuffer, 'avatars');

      await connection.query(
        'UPDATE ACCOUNT SET AvatarURL = ?, AvatarPublicID = ? WHERE AccountID = ?',
        [uploadResult.secure_url, uploadResult.public_id, accountId]
      );

      await connection.commit();
      return { avatarURL: uploadResult.secure_url };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteAvatar(accountId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [account] = await connection.query(
        'SELECT AvatarPublicID FROM ACCOUNT WHERE AccountID = ?',
        [accountId]
      );

      if (account[0]?.AvatarPublicID) {
        await cloudinaryService.deleteFile(account[0].AvatarPublicID);
      }

      await connection.query(
        'UPDATE ACCOUNT SET AvatarURL = NULL, AvatarPublicID = NULL WHERE AccountID = ?',
        [accountId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserById(accountId) {
    const [rows] = await pool.query(
      `SELECT a.AccountID, a.Username, a.Role, a.Status, a.AvatarURL,
              COALESCE(t.Name, l.Name, mp.Name) as Name,
              COALESCE(t.Email, l.Email, mp.Email) as Email,
              COALESCE(t.Phone, l.Phone, mp.Phone) as Phone
       FROM ACCOUNT a
       LEFT JOIN TENANT t ON a.AccountID = t.AccountID
       LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID
       LEFT JOIN MOVING_PROVIDER mp ON a.AccountID = mp.AccountID
       WHERE a.AccountID = ?`,
      [accountId]
    );
    return rows[0] || null;
  }

  async findOrCreateGoogleUser({ googleId, email, name, avatarURL }) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if user exists by GoogleID
      let [users] = await connection.query(
        'SELECT AccountID, Role FROM ACCOUNT WHERE GoogleID = ?',
        [googleId]
      );

      if (users.length > 0) {
        const accountId = users[0].AccountID;
        await connection.commit();
        const user = await this.getUserById(accountId);
        return user;
      }

      // Check if user exists by email
      [users] = await connection.query(
        `SELECT a.AccountID, a.Role FROM ACCOUNT a
         LEFT JOIN TENANT t ON a.AccountID = t.AccountID
         WHERE t.Email = ?`,
        [email]
      );

      if (users.length > 0) {
        // Link Google account to existing user
        const accountId = users[0].AccountID;
        await connection.query(
          'UPDATE ACCOUNT SET GoogleID = ?, AvatarURL = ? WHERE AccountID = ?',
          [googleId, avatarURL, accountId]
        );
        await connection.commit();
        const user = await this.getUserById(accountId);
        return user;
      }

      // Create new user
      const accountId = await this.generateAccountId();
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 5);
      const timestamp = Date.now().toString().slice(-4);
      const username = `${emailPrefix}_${timestamp}`;

      await connection.query(
        'INSERT INTO ACCOUNT (AccountID, Username, Password, Role, Status, GoogleID, AvatarURL) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [accountId, username, '', 'Tenant', 'Active', googleId, avatarURL]
      );

      const tenantId = await this.generateTenantId();
      const now = new Date();

      await connection.query(
        'INSERT INTO TENANT (TenantID, AccountID, Username, Name, Email, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [tenantId, accountId, username, name, email, now, now]
      );

      await connection.commit();
      
      // Fetch the complete user after commit
      const user = await this.getUserById(accountId);
      return user;
    } catch (error) {
      await connection.rollback();
      console.error('Error in findOrCreateGoogleUser:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserService();
