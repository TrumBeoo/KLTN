const db = require('../config/database');
const { generateID } = require('../utils/validation');

class NotificationService {
  async getTenantIdByAccountId(accountId) {
    const [rows] = await db.query(
      'SELECT TenantID FROM TENANT WHERE AccountID = ? LIMIT 1',
      [accountId]
    );
    return rows[0]?.TenantID || null;
  }

  async getNotificationTotal(accountId) {
    try {
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return 0;

      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM NOTIFICATION WHERE TargetID = ?',
        [tenantId]
      );
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Get notification total error:', error);
      throw error;
    }
  }

  async tenantExists(tenantId) {
    const [rows] = await db.query(
      'SELECT 1 FROM TENANT WHERE TenantID = ? LIMIT 1',
      [tenantId]
    );
    return rows.length > 0;
  }

  // Lấy danh sách thông báo của tenant
  async getNotifications(accountId, limit = 20, offset = 0) {
    try {
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return [];

      const query = `
        SELECT 
          NotificationID,
          Content,
          Type,
          Status,
          Link,
          CreatedAt,
          TargetID as TenantID
        FROM NOTIFICATION
        WHERE TargetID = ?
        ORDER BY CreatedAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [notifications] = await db.query(query, [tenantId, limit, offset]);
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(accountId) {
    try {
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return 0;

      const [safeResult] = await db.query(
        `SELECT COUNT(*) as count
         FROM NOTIFICATION
         WHERE TargetID = ? AND Status = 'ChÆ°a Ä‘á»c'`,
        [tenantId]
      );
      return safeResult[0]?.count || 0;

      const query = `
        SELECT COUNT(*) as count
        FROM NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
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
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return false;

      const [safeResult] = await db.query(
        `UPDATE NOTIFICATION
         SET Status = 'ÄĂ£ Ä‘á»c'
         WHERE NotificationID = ? AND TargetID = ?`,
        [notificationId, tenantId]
      );
      return safeResult.affectedRows > 0;

      const query = `
        UPDATE NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
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
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return 0;

      const [safeResult] = await db.query(
        `UPDATE NOTIFICATION
         SET Status = 'ÄĂ£ Ä‘á»c'
         WHERE TargetID = ? AND Status = 'ChÆ°a Ä‘á»c'`,
        [tenantId]
      );
      return safeResult.affectedRows;

      const query = `
        UPDATE NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
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
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return false;

      const [safeResult] = await db.query(
        'DELETE FROM NOTIFICATION WHERE NotificationID = ? AND TargetID = ?',
        [notificationId, tenantId]
      );
      return safeResult.affectedRows > 0;

      const query = `
        DELETE n FROM NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
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
      const tenantId = await this.getTenantIdByAccountId(accountId);
      if (!tenantId) return 0;

      const [safeResult] = await db.query(
        'DELETE FROM NOTIFICATION WHERE TargetID = ?',
        [tenantId]
      );
      return safeResult.affectedRows;

      const query = `
        DELETE n FROM NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
        WHERE a.AccountID = ?
      `;
      
      const [result] = await db.query(query, [accountId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  }

  // Tạo thông báo cho tenant (được gọi từ landlord backend)
  async createNotification(tenantId, content, type, link = null) {
    if (!tenantId || !tenantId.startsWith('TEN')) {
      console.error(`[Notification] Invalid targetId format: ${tenantId}. Expected TEN...`);
      throw new Error(`Invalid targetId: ${tenantId}`);
    }
    try {
      const exists = await this.tenantExists(tenantId);
      if (!exists) {
        throw new Error(`Target tenant does not exist: ${tenantId}`);
      }

      const notificationId = generateID('NTF');
      const query = `
        INSERT INTO NOTIFICATION (NotificationID, TargetID, Content, Type, Status, Link, CreatedAt)
        VALUES (?, ?, ?, ?, 'Chưa đọc', ?, NOW())
      `;
      
      await db.query(query, [notificationId, tenantId, content, type, link]);
      return notificationId;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
