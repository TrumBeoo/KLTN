const db = require('../config/database');
const axios = require('axios');

const LANDLORD_API_URL = process.env.LANDLORD_API_URL || 'http://localhost:3333/api';

class ViewingScheduleService {
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
      
      const time = new Date(viewingDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const date = new Date(viewingDateTime).toLocaleDateString('vi-VN');
      const content = `${tenantName} đã đặt lịch xem "${roomName}" vào ${time} ngày ${date}`;
      const link = `/viewing-schedules`;
      
      const response = await axios.post(`${LANDLORD_API_URL}/notifications/create`, {
        targetId: landlordId,
        content: content,
        type: 'Lịch xem',
        link: link
      });
      
      console.log('Notification sent successfully:', response.data);
    } catch (error) {
      console.error('Error notifying landlord:');
      console.error('Message:', error.message);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
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
