const db = require('../config/database');
const notificationService = require('./notificationService');

class ViewingScheduleService {
  async getSchedulesByLandlord(landlordId) {
    const [rows] = await db.query(
      `SELECT 
        vs.ScheduleID,
        vs.TenantID,
        vs.RoomID,
        vs.DateTime,
        vs.Status,
        vs.CreatedAt,
        t.Name as TenantName,
        t.Phone as TenantPhone,
        t.Email as TenantEmail,
        r.Price,
        r.Status as RoomStatus
       FROM VIEWING_SCHEDULE vs
       JOIN TENANT t ON vs.TenantID = t.TenantID
       JOIN ROOM r ON vs.RoomID = r.RoomID
       WHERE r.LandlordID = ?
       ORDER BY vs.DateTime DESC`,
      [landlordId]
    );
    
    return rows;
  }

  async approveSchedule(scheduleId, landlordId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get schedule info
      const [schedules] = await connection.query(
        `SELECT vs.*, t.TenantID, r.LandlordID
         FROM VIEWING_SCHEDULE vs
         JOIN TENANT t ON vs.TenantID = t.TenantID
         JOIN ROOM r ON vs.RoomID = r.RoomID
         WHERE vs.ScheduleID = ? AND r.LandlordID = ?`,
        [scheduleId, landlordId]
      );

      if (schedules.length === 0) {
        throw new Error('Không tìm thấy lịch xem');
      }

      const schedule = schedules[0];

      // Update schedule status
      await connection.query(
        `UPDATE VIEWING_SCHEDULE SET Status = 'Đã duyệt', UpdatedAt = NOW() WHERE ScheduleID = ?`,
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

  async rejectSchedule(scheduleId, landlordId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get schedule info
      const [schedules] = await connection.query(
        `SELECT vs.*, t.TenantID, r.LandlordID, r.Status as RoomStatus
         FROM VIEWING_SCHEDULE vs
         JOIN TENANT t ON vs.TenantID = t.TenantID
         JOIN ROOM r ON vs.RoomID = r.RoomID
         WHERE vs.ScheduleID = ? AND r.LandlordID = ?`,
        [scheduleId, landlordId]
      );

      if (schedules.length === 0) {
        throw new Error('Không tìm thấy lịch xem');
      }

      const schedule = schedules[0];

      // Update schedule status
      await connection.query(
        `UPDATE VIEWING_SCHEDULE SET Status = 'Từ chối', UpdatedAt = NOW() WHERE ScheduleID = ?`,
        [scheduleId]
      );

      // Reset room status if no other pending schedules
      const [pendingSchedules] = await connection.query(
        `SELECT COUNT(*) as count FROM VIEWING_SCHEDULE 
         WHERE RoomID = ? AND Status = 'Chờ duyệt'`,
        [schedule.RoomID]
      );

      if (pendingSchedules[0].count === 0) {
        await connection.query(
          `UPDATE ROOM SET Status = 'available', UpdatedAt = NOW() WHERE RoomID = ?`,
          [schedule.RoomID]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async cancelSchedule(scheduleId, landlordId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get schedule info
      const [schedules] = await connection.query(
        `SELECT vs.*, t.TenantID, r.LandlordID, r.Status as RoomStatus
         FROM VIEWING_SCHEDULE vs
         JOIN TENANT t ON vs.TenantID = t.TenantID
         JOIN ROOM r ON vs.RoomID = r.RoomID
         WHERE vs.ScheduleID = ? AND r.LandlordID = ?`,
        [scheduleId, landlordId]
      );

      if (schedules.length === 0) {
        throw new Error('Không tìm thấy lịch xem');
      }

      const schedule = schedules[0];

      // Delete the schedule
      await connection.query(
        `DELETE FROM VIEWING_SCHEDULE WHERE ScheduleID = ?`,
        [scheduleId]
      );

      // Reset room status if no other pending schedules
      const [pendingSchedules] = await connection.query(
        `SELECT COUNT(*) as count FROM VIEWING_SCHEDULE 
         WHERE RoomID = ? AND Status IN ('Chờ duyệt', 'Đã duyệt')`,
        [schedule.RoomID]
      );

      if (pendingSchedules[0].count === 0) {
        await connection.query(
          `UPDATE ROOM SET Status = 'available', UpdatedAt = NOW() WHERE RoomID = ?`,
          [schedule.RoomID]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getLandlordId(accountId) {
    const [rows] = await db.query(
      `SELECT LandlordID FROM LANDLORD WHERE AccountID = ?`,
      [accountId]
    );
    
    return rows.length > 0 ? rows[0].LandlordID : null;
  }
}

module.exports = new ViewingScheduleService();
