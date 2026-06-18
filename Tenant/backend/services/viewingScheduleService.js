const db = require('../config/database');
const axios = require('axios');
const cacheService = require('./cacheService');

const LANDLORD_API_URL = process.env.LANDLORD_API_URL || 'http://localhost:3333/api';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-internal-key';
const NOTIFICATION_TIMEOUT_MS = parseInt(process.env.NOTIFICATION_TIMEOUT_MS || '5000', 10);
const NOTIFICATION_MAX_RETRIES = parseInt(process.env.NOTIFICATION_MAX_RETRIES || '2', 10);

class ViewingScheduleService {
  async invalidateRoomCaches(roomId = null) {
    await cacheService.delByPattern('rooms:');
    if (roomId) {
      await cacheService.delByPattern(roomId);
    }
  }

  async generateScheduleId() {
    const [rows] = await db.query(
      'SELECT ScheduleID FROM VIEWING_SCHEDULE ORDER BY ScheduleID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].ScheduleID.substring(3));
      return 'SCH' + String(lastId + 1).padStart(5, '0');
    }
    return 'SCH00001';
  }

  async createSchedule(tenantId, roomId, dateTime) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const scheduleId = await this.generateScheduleId();
      const now = new Date();

      // Get tenant and room info
      const [tenantRows] = await connection.query(
        `SELECT Name FROM TENANT WHERE TenantID = ?`,
        [tenantId]
      );
      const tenantName = tenantRows[0]?.Name || 'Người thuê';

      const [roomRows] = await connection.query(
        `SELECT r.LandlordID, CONCAT(r.RoomType, ' - ', r.RoomCode) as RoomName
         FROM ROOM r
         WHERE r.RoomID = ?`,
        [roomId]
      );
      const roomInfo = roomRows[0];

      // Create viewing schedule
      await connection.query(
        `INSERT INTO VIEWING_SCHEDULE (ScheduleID, TenantID, RoomID, DateTime, Status, CreatedAt, UpdatedAt)
         VALUES (?, ?, ?, ?, 'Chờ duyệt', ?, ?)`,
        [scheduleId, tenantId, roomId, dateTime, now, now]
      );

      await connection.commit();
      await this.invalidateRoomCaches(roomId);

      // Send notification to landlord (async, don't wait)
      if (roomInfo) {
        this.notifyLandlordNewSchedule(roomInfo.LandlordID, tenantName, roomInfo.RoomName, dateTime, scheduleId)
          .catch(err => console.error('Failed to notify landlord:', err));
      }

      return scheduleId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async notifyLandlordNewSchedule(landlordId, tenantName, roomName, viewingDateTime, scheduleId) {
    try {
      console.log('=== Sending notification to Landlord ===');
      console.log('LandlordID:', landlordId);
      console.log('Tenant Name:', tenantName);
      console.log('Room Name:', roomName);
      console.log('DateTime:', viewingDateTime);
      console.log('API URL:', LANDLORD_API_URL);
      
      const date = new Date(viewingDateTime);
      // Hiển thị giờ Việt Nam (UTC+7) trong thông báo
      const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
      const dateStr = date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const content = `${tenantName} đã đặt lịch xem "${roomName}" vào ${time} ngày ${dateStr}`;
      const link = `/viewing-schedules`;

      const response = await this.postNotificationWithRetry(
        `${LANDLORD_API_URL}/notifications/create`,
        {
          targetId: landlordId,
          content,
          type: 'Lịch xem',
          link
        },
        () => this.createFallbackNotification(landlordId, content, 'Lịch xem', link)
      );

      console.log('Notification sent successfully:', response?.data || { fallback: true });
    } catch (error) {
      console.error('Error notifying landlord:');
      console.error('Message:', error.message);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
  }

  async postNotificationWithRetry(url, payload, fallbackFn) {
    let lastError = null;

    for (let attempt = 1; attempt <= NOTIFICATION_MAX_RETRIES; attempt += 1) {
      try {
        return await axios.post(url, payload, {
          timeout: NOTIFICATION_TIMEOUT_MS,
          headers: {
            'x-internal-api-key': INTERNAL_API_KEY
          }
        });
      } catch (error) {
        lastError = error;
        console.error(`[Notification] Attempt ${attempt}/${NOTIFICATION_MAX_RETRIES} failed:`, error.message);
      }
    }

    if (fallbackFn) {
      await fallbackFn();
      return null;
    }

    throw lastError;
  }

  async createFallbackNotification(targetId, content, type, link = null) {
    if (!targetId || !targetId.startsWith('LAN')) {
      throw new Error(`Fallback notification target is invalid: ${targetId}`);
    }

    const [rows] = await db.query(
      'SELECT 1 FROM LANDLORD WHERE LandlordID = ? LIMIT 1',
      [targetId]
    );

    if (rows.length === 0) {
      throw new Error(`Fallback landlord target does not exist: ${targetId}`);
    }

    const notificationId = `NTF${Date.now().toString(36).slice(-3).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    await db.query(
      `INSERT INTO NOTIFICATION (NotificationID, TargetID, Content, Type, Status, Link, CreatedAt)
       VALUES (?, ?, ?, ?, 'Chưa đọc', ?, NOW())`,
      [notificationId, targetId, content, type, link]
    );
  }

  async getTenantInfo(accountId) {
    const [rows] = await db.query(
      `SELECT t.TenantID, t.Name, t.Phone, t.Email
       FROM TENANT t
       JOIN ACCOUNT a ON t.AccountID = a.AccountID
       WHERE a.AccountID = ?`,
      [accountId]
    );
    
    return rows.length > 0 ? rows[0] : null;
  }

  async getUserScheduleForRoom(tenantId, roomId) {
    const [rows] = await db.query(
      `SELECT ScheduleID, DateTime, Status, CreatedAt
       FROM VIEWING_SCHEDULE
       WHERE TenantID = ? AND RoomID = ? AND Status IN ('Chờ duyệt', 'Đã duyệt')
       ORDER BY CreatedAt DESC
       LIMIT 1`,
      [tenantId, roomId]
    );
    
    return rows.length > 0 ? rows[0] : null;
  }

  async cancelSchedule(scheduleId, tenantId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if schedule exists and belongs to tenant
      const [scheduleRows] = await connection.query(
        `SELECT RoomID, Status FROM VIEWING_SCHEDULE 
         WHERE ScheduleID = ? AND TenantID = ?`,
        [scheduleId, tenantId]
      );

      if (scheduleRows.length === 0) {
        await connection.rollback();
        return false;
      }

      const schedule = scheduleRows[0];
      
      // Only allow cancellation if status is 'Chờ duyệt'
      if (schedule.Status !== 'Chờ duyệt') {
        await connection.rollback();
        return false;
      }

      const now = new Date();

      // Delete the schedule record completely
      await connection.query(
        `DELETE FROM VIEWING_SCHEDULE WHERE ScheduleID = ?`,
        [scheduleId]
      );

      await connection.commit();
      await this.invalidateRoomCaches(schedule.RoomID);
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getRoomInfo(roomId) {
    const [rows] = await db.query(
      `SELECT r.RoomID, r.LandlordID, r.Price, r.Status, l.Name as LandlordName, l.Email as LandlordEmail
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       WHERE r.RoomID = ?`,
      [roomId]
    );
    
    return rows.length > 0 ? rows[0] : null;
  }

  async getAvailableTimeSlots(roomId, date) {
    // Kiểm tra phòng có đang được thuê không
    const [roomRows] = await db.query(
      `SELECT Status FROM ROOM WHERE RoomID = ?`,
      [roomId]
    );
    
    if (roomRows.length === 0 || roomRows[0].Status === 'rented') {
      return [];
    }

    // Lấy các lịch đã đặt trong ngày
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [bookedSlots] = await db.query(
      `SELECT DateTime FROM VIEWING_SCHEDULE
       WHERE RoomID = ? AND DateTime BETWEEN ? AND ? 
       AND Status IN ('Chờ duyệt', 'Đã duyệt')`,
      [roomId, startOfDay, endOfDay]
    );

    // Tạo danh sách khung giờ từ 8h-20h
    const allSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Lọc bỏ các khung giờ đã đặt
    const bookedHours = bookedSlots.map(slot => {
      const dt = new Date(slot.DateTime);
      return `${dt.getHours().toString().padStart(2, '0')}:00`;
    });

    return allSlots.filter(slot => !bookedHours.includes(slot));
  }
}

module.exports = new ViewingScheduleService();
