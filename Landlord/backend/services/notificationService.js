const db = require('../config/database');
const { generateID } = require('../utils/validation');

class NotificationService {
  async getLandlordIdByAccountId(accountId) {
    const [rows] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ? LIMIT 1',
      [accountId]
    );
    return rows[0]?.LandlordID || null;
  }

  async getNotificationTotal(accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return 0;

      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM NOTIFICATION WHERE TargetID = ?',
        [landlordId]
      );
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Get notification total error:', error);
      throw error;
    }
  }

  async landlordExists(landlordId) {
    const [rows] = await db.query(
      'SELECT 1 FROM LANDLORD WHERE LandlordID = ? LIMIT 1',
      [landlordId]
    );
    return rows.length > 0;
  }

  // Lấy danh sách thông báo của landlord
  async getNotifications(accountId, limit = 20, offset = 0) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return [];

      const query = `
        SELECT 
          NotificationID,
          Content,
          Type,
          Status,
          Link,
          CreatedAt,
          TargetID as LandlordID
        FROM NOTIFICATION
        WHERE TargetID = ?
        ORDER BY CreatedAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [notifications] = await db.query(query, [landlordId, limit, offset]);
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return 0;

      const [safeResult] = await db.query(
        `SELECT COUNT(*) as count
         FROM NOTIFICATION
         WHERE TargetID = ? AND Status = 'ChÆ°a Ä‘á»c'`,
        [landlordId]
      );
      return safeResult[0]?.count || 0;

      const query = `
        SELECT COUNT(*) as count
        FROM NOTIFICATION n
        JOIN LANDLORD l ON n.TargetID = l.LandlordID
        JOIN ACCOUNT a ON l.AccountID = a.AccountID
        WHERE a.AccountID = ? AND n.Status = 'Chưa đọc'
      `;
      
      const [result] = await db.query(query, [accountId]);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  // Đánh dấu thông báo là đã đọc
  async markAsRead(notificationId, accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return false;

      const [safeResult] = await db.query(
        `UPDATE NOTIFICATION
         SET Status = 'ÄĂ£ Ä‘á»c'
         WHERE NotificationID = ? AND TargetID = ?`,
        [notificationId, landlordId]
      );
      return safeResult.affectedRows > 0;

      const query = `
        UPDATE NOTIFICATION n
        JOIN LANDLORD l ON n.TargetID = l.LandlordID
        JOIN ACCOUNT a ON l.AccountID = a.AccountID
        SET n.Status = 'Đã đọc'
        WHERE n.NotificationID = ? AND a.AccountID = ?
      `;
      
      const [result] = await db.query(query, [notificationId, accountId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return 0;

      const [safeResult] = await db.query(
        `UPDATE NOTIFICATION
         SET Status = 'ÄĂ£ Ä‘á»c'
         WHERE TargetID = ? AND Status = 'ChÆ°a Ä‘á»c'`,
        [landlordId]
      );
      return safeResult.affectedRows;

      const query = `
        UPDATE NOTIFICATION n
        JOIN LANDLORD l ON n.TargetID = l.LandlordID
        JOIN ACCOUNT a ON l.AccountID = a.AccountID
        SET n.Status = 'Đã đọc'
        WHERE a.AccountID = ? AND n.Status = 'Chưa đọc'
      `;
      
      const [result] = await db.query(query, [accountId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Xóa thông báo
  async deleteNotification(notificationId, accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return false;

      const [safeResult] = await db.query(
        'DELETE FROM NOTIFICATION WHERE NotificationID = ? AND TargetID = ?',
        [notificationId, landlordId]
      );
      return safeResult.affectedRows > 0;

      const query = `
        DELETE n FROM NOTIFICATION n
        JOIN LANDLORD l ON n.TargetID = l.LandlordID
        JOIN ACCOUNT a ON l.AccountID = a.AccountID
        WHERE n.NotificationID = ? AND a.AccountID = ?
      `;
      
      const [result] = await db.query(query, [notificationId, accountId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // Xóa tất cả thông báo
  async deleteAllNotifications(accountId) {
    try {
      const landlordId = await this.getLandlordIdByAccountId(accountId);
      if (!landlordId) return 0;

      const [safeResult] = await db.query(
        'DELETE FROM NOTIFICATION WHERE TargetID = ?',
        [landlordId]
      );
      return safeResult.affectedRows;

      const query = `
        DELETE n FROM NOTIFICATION n
        JOIN LANDLORD l ON n.TargetID = l.LandlordID
        JOIN ACCOUNT a ON l.AccountID = a.AccountID
        WHERE a.AccountID = ?
      `;
      
      const [result] = await db.query(query, [accountId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  }

  // Tạo thông báo cho landlord
  async createNotification(landlordId, content, type, link = null) {
    if (!landlordId || !landlordId.startsWith('LAN')) {
      console.error(`[Notification] Invalid targetId format: ${landlordId}. Expected LAN...`);
      throw new Error(`Invalid targetId: ${landlordId}`);
    }
    try {
      const exists = await this.landlordExists(landlordId);
      if (!exists) {
        throw new Error(`Target landlord does not exist: ${landlordId}`);
      }

      const notificationId = generateID('NTF');
      const query = `
        INSERT INTO NOTIFICATION (NotificationID, TargetID, Content, Type, Status, Link, CreatedAt)
        VALUES (?, ?, ?, ?, 'Chưa đọc', ?, NOW())
      `;
      
      await db.query(query, [notificationId, landlordId, content, type, link]);
      return notificationId;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
