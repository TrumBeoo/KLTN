const db = require('../config/database');

class RoomService {
  async getRoomById(roomId, currentUserId = null) {
    const [rooms] = await db.query(
      `SELECT r.*, 
              l.Name as LandlordName, l.Phone as LandlordPhone, l.Email as LandlordEmail,
              loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
              loc.Latitude, loc.Longitude
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       WHERE r.RoomID = ?`,
      [roomId]
    );
    
    if (rooms.length === 0) return null;
    
    const room = rooms[0];
    
    // Lấy services từ bảng liên kết
    const [services] = await db.query(
      `SELECT s.Name FROM ROOM_SERVICE rs
       JOIN SERVICE s ON rs.ServiceID = s.ServiceID
       WHERE rs.RoomID = ?`,
      [roomId]
    );
    const servicesFromTable = services.map(s => s.Name);
    
    // Lấy services từ cột TEXT (nếu có)
    const servicesFromText = room.Service ? room.Service.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Gộp cả 2 nguồn và loại bỏ trùng lặp
    room.services = [...new Set([...servicesFromTable, ...servicesFromText])];
    
    // Lấy furniture từ bảng liên kết
    const [furniture] = await db.query(
      `SELECT f.Name FROM ROOM_FURNITURE rf
       JOIN FURNITURE f ON rf.FurnitureID = f.FurnitureID
       WHERE rf.RoomID = ?`,
      [roomId]
    );
    const furnitureFromTable = furniture.map(f => f.Name);
    
    // Lấy furniture từ cột TEXT (nếu có)
    const furnitureFromText = room.Furniture ? room.Furniture.split(',').map(f => f.trim()).filter(f => f) : [];
    
    // Gộp cả 2 nguồn và loại bỏ trùng lặp
    room.furniture = [...new Set([...furnitureFromTable, ...furnitureFromText])];
    
    // Lấy rules từ bảng liên kết
    const [rules] = await db.query(
      `SELECT r.Name FROM ROOM_RULE rr
       JOIN RULE r ON rr.RuleID = r.RuleID
       WHERE rr.RoomID = ?`,
      [roomId]
    );
    const rulesFromTable = rules.map(r => r.Name);
    
    // Lấy rules từ cột TEXT (nếu có)
    const rulesFromText = room.Rules ? room.Rules.split(',').map(r => r.trim()).filter(r => r) : [];
    
    // Gộp cả 2 nguồn và loại bỏ trùng lặp
    room.rules = [...new Set([...rulesFromTable, ...rulesFromText])];
    
    // Kiểm tra xem user hiện tại có lịch xem cho phòng này không
    let userScheduleStatus = null;
    if (currentUserId) {
      const [userSchedules] = await db.query(
        `SELECT vs.Status FROM VIEWING_SCHEDULE vs
         JOIN TENANT t ON vs.TenantID = t.TenantID
         WHERE vs.RoomID = ? AND t.AccountID = ? AND vs.Status IN ('Chờ duyệt', 'Đã duyệt')
         ORDER BY vs.CreatedAt DESC LIMIT 1`,
        [roomId, currentUserId]
      );
      if (userSchedules.length > 0) {
        userScheduleStatus = userSchedules[0].Status;
      }
    }
    
    // Nếu user có lịch xem, hiển thị trạng thái của lịch đó
    if (userScheduleStatus) {
      if (userScheduleStatus === 'Đã duyệt') {
        room.DisplayStatus = 'viewing'; // Đã đặt lịch
      } else if (userScheduleStatus === 'Chờ duyệt') {
        room.DisplayStatus = 'pending_viewing'; // Chờ duyệt
      }
    } else {
      // Nếu user chưa đặt lịch, chỉ hiển thị trạng thái thực của phòng
      if (room.Status === 'rented') {
        room.DisplayStatus = 'rented'; // Đã thuê
      } else {
        room.DisplayStatus = 'available'; // Còn trống
      }
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
      `SELECT ImageID, ImageURL, DisplayOrder
       FROM ROOM_IMAGE
       WHERE RoomID = ?
       ORDER BY DisplayOrder ASC`,
      [roomId]
    );
    
    return images;
  }

  async getAllRooms(limit = 20, offset = 0) {
    const [rooms] = await db.query(
      `SELECT r.*, 
              l.Name as LandlordName, 
              b.BuildingName, b.Address as BuildingAddress,
              loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
              loc.Latitude, loc.Longitude,
              (SELECT GROUP_CONCAT(ImageURL ORDER BY DisplayOrder ASC) FROM ROOM_IMAGE WHERE RoomID = r.RoomID) as ImageURLs
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       WHERE r.Status IN ('available', 'viewing') OR r.Status = 'rented'
       ORDER BY r.UpdatedAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Trả về danh sách phòng với DisplayStatus = Status thực
    return rooms.map(room => {
      // Parse images from ImageURLs
      const images = room.ImageURLs ? room.ImageURLs.split(',').map(url => ({ ImageURL: url })) : [];
      
      return {
        ...room,
        DisplayStatus: room.Status, // Hiển thị trạng thái thực của phòng
        images
      };
    });
  }
}

module.exports = new RoomService();
