const db = require('../config/database');

class RoomService {
  async getRoomById(roomId, currentUserId = null) {
    const [rooms] = await db.query(
      `SELECT r.*, l.Name as LandlordName, l.Phone as LandlordPhone, l.Email as LandlordEmail
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       WHERE r.RoomID = ?`,
      [roomId]
    );
    
    if (rooms.length === 0) return null;
    
    const room = rooms[0];
    
    // Check if current user has a schedule for this room
    let userHasSchedule = false;
    if (currentUserId) {
      const [userSchedules] = await db.query(
        `SELECT COUNT(*) as count FROM VIEWING_SCHEDULE vs
         JOIN TENANT t ON vs.TenantID = t.TenantID
         WHERE vs.RoomID = ? AND t.AccountID = ? AND vs.Status IN ('Chờ duyệt', 'Đã duyệt')`,
        [roomId, currentUserId]
      );
      userHasSchedule = userSchedules[0].count > 0;
    }
    
    // Check for approved schedules first (highest priority)
    const [approvedSchedules] = await db.query(
      `SELECT COUNT(*) as count FROM VIEWING_SCHEDULE 
       WHERE RoomID = ? AND Status = 'Đã duyệt'`,
      [roomId]
    );
    
    // Check for pending schedules
    const [pendingSchedules] = await db.query(
      `SELECT COUNT(*) as count FROM VIEWING_SCHEDULE 
       WHERE RoomID = ? AND Status = 'Chờ duyệt'`,
      [roomId]
    );
    
    // Set DisplayStatus based on priority: approved > pending > available
    if (room.Status === 'available') {
      if (approvedSchedules[0].count > 0) {
        room.DisplayStatus = 'viewing'; // Đã đặt lịch
      } else if (pendingSchedules[0].count > 0 && !userHasSchedule) {
        room.DisplayStatus = 'pending_viewing'; // Chờ duyệt
      } else {
        room.DisplayStatus = 'available'; // Còn trống
      }
    } else {
      room.DisplayStatus = room.Status;
    }
    
    return room;
  }

  async getRoomAmenities(roomId) {
    const [amenities] = await db.query(
      `SELECT a.AmenityID, a.Name, a.Description
       FROM ROOM_AMENITY ra
       JOIN AMENITY a ON ra.AmenityID = a.AmenityID
       WHERE ra.RoomID = ?`,
      [roomId]
    );
    
    return amenities;
  }

  async getRoomImages(roomId) {
    const [images] = await db.query(
      `SELECT ImageID, ImageURL, \`Order\`
       FROM ROOM_IMAGE
       WHERE RoomID = ?
       ORDER BY \`Order\` ASC`,
      [roomId]
    );
    
    return images;
  }

  async getAllRooms(limit = 20, offset = 0) {
    const [rooms] = await db.query(
      `SELECT r.*, l.Name as LandlordName, b.BuildingName, b.Address as BuildingAddress,
              (SELECT COUNT(*) FROM VIEWING_SCHEDULE vs WHERE vs.RoomID = r.RoomID AND vs.Status = 'Chờ duyệt') as PendingViewings,
              (SELECT COUNT(*) FROM VIEWING_SCHEDULE vs WHERE vs.RoomID = r.RoomID AND vs.Status = 'Đã duyệt') as ApprovedViewings
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       WHERE r.Status IN ('available', 'viewing')
       ORDER BY r.UpdatedAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Add DisplayStatus for each room based on priority
    return rooms.map(room => {
      let displayStatus = room.Status;
      if (room.Status === 'available') {
        if (room.ApprovedViewings > 0) {
          displayStatus = 'viewing'; // Đã đặt lịch
        } else if (room.PendingViewings > 0) {
          displayStatus = 'pending_viewing'; // Chờ duyệt
        }
      }
      return {
        ...room,
        DisplayStatus: displayStatus
      };
    });
  }
}

module.exports = new RoomService();
