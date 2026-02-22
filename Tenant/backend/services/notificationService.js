const db = require('../config/database');
const { generateID } = require('../utils/validation');

class NotificationService {
  // Lấy danh sách thông báo của tenant
  async getNotifications(accountId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT 
          n.NotificationID,
          n.Content,
          n.Type,
          n.Status,
          n.CreatedAt,
          t.TenantID
        FROM NOTIFICATION n
        JOIN TENANT t ON n.TargetID = t.TenantID
        JOIN ACCOUNT a ON t.AccountID = a.AccountID
        WHERE a.AccountID = ?
        ORDER BY n.CreatedAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [notifications] = await db.query(query, [accountId, limit, offset]);
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(accountId) {
    try {
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
  async createNotification(tenantId, content, type) {
    try {
      const notificationId = generateID('NTF');
      const query = `
        INSERT INTO NOTIFICATION (NotificationID, TargetID, Content, Type, Status, CreatedAt)
        VALUES (?, ?, ?, ?, 'Chưa đọc', NOW())
      `;
      
      await db.query(query, [notificationId, tenantId, content, type]);
      return notificationId;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
