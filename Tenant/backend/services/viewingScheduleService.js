const db = require('../config/database');

class ViewingScheduleService {
  async generateScheduleId() {
    const [rows] = await db.query(
      'SELECT ScheduleID FROM VIEWING_SCHEDULE ORDER BY ScheduleID DESC LIMIT 1'
    );
    
    if (rows.length > 0) {
      const lastId = parseInt(rows[0].ScheduleID.substring(3));
      return 'SCH' + String(lastId + 1).padStart(7, '0');
    }
    return 'SCH0000001';
  }

  async createSchedule(tenantId, roomId, dateTime) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const scheduleId = await this.generateScheduleId();
      const now = new Date();

      // Create viewing schedule
      await connection.query(
        `INSERT INTO VIEWING_SCHEDULE (ScheduleID, TenantID, RoomID, DateTime, Status, CreatedAt, UpdatedAt)
         VALUES (?, ?, ?, ?, 'Chờ duyệt', ?, ?)`,
        [scheduleId, tenantId, roomId, dateTime, now, now]
      );

      // Note: We don't change room status to "viewing" to avoid confusion
      // Room status should remain as is until actually rented

      await connection.commit();
      return scheduleId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
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
}

module.exports = new ViewingScheduleService();
