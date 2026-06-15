const db = require('../config/database');
const NodeCache = require('node-cache');

// Cache with 5 minutes TTL
const roomCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class RoomService {
  async getRoomById(roomId, currentUserId = null) {
    // Single optimized query với JOINs thay vì nhiều queries riêng lẻ
    const [rooms] = await db.query(
      `SELECT r.*, 
              l.Name as LandlordName, l.Phone as LandlordPhone, l.Email as LandlordEmail,
              loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
              loc.Latitude, loc.Longitude,
              GROUP_CONCAT(DISTINCT CONCAT(s.Name) SEPARATOR '||') as ServicesFromTable,
              GROUP_CONCAT(DISTINCT CONCAT(f.Name) SEPARATOR '||') as FurnitureFromTable,
              GROUP_CONCAT(DISTINCT CONCAT(ru.Name) SEPARATOR '||') as RulesFromTable
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       LEFT JOIN ROOM_SERVICE rs ON r.RoomID = rs.RoomID
       LEFT JOIN SERVICE s ON rs.ServiceID = s.ServiceID
       LEFT JOIN ROOM_FURNITURE rf ON r.RoomID = rf.RoomID
       LEFT JOIN FURNITURE f ON rf.FurnitureID = f.FurnitureID
       LEFT JOIN ROOM_RULE rr ON r.RoomID = rr.RoomID
       LEFT JOIN RULE ru ON rr.RuleID = ru.RuleID
       WHERE r.RoomID = ?
       GROUP BY r.RoomID`,
      [roomId]
    );
    
    if (rooms.length === 0) return null;
    
    const room = rooms[0];
    
    // Parse services
    const servicesFromTable = room.ServicesFromTable ? room.ServicesFromTable.split('||').filter(s => s) : [];
    const servicesFromText = room.Service ? room.Service.split(',').map(s => s.trim()).filter(s => s) : [];
    room.services = [...new Set([...servicesFromTable, ...servicesFromText])];
    
    // Parse furniture
    const furnitureFromTable = room.FurnitureFromTable ? room.FurnitureFromTable.split('||').filter(f => f) : [];
    const furnitureFromText = room.Furniture ? room.Furniture.split(',').map(f => f.trim()).filter(f => f) : [];
    room.furniture = [...new Set([...furnitureFromTable, ...furnitureFromText])];
    
    // Parse rules
    const rulesFromTable = room.RulesFromTable ? room.RulesFromTable.split('||').filter(r => r) : [];
    const rulesFromText = room.Rules ? room.Rules.split(',').map(r => r.trim()).filter(r => r) : [];
    room.rules = [...new Set([...rulesFromTable, ...rulesFromText])];
    
    // Clean up temporary fields
    delete room.ServicesFromTable;
    delete room.FurnitureFromTable;
    delete room.RulesFromTable;
    
    // Check user viewing schedule status - Single query thay vì nested
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
    
    // Set display status
    if (userScheduleStatus) {
      room.DisplayStatus = userScheduleStatus === 'Đã duyệt' ? 'viewing' : 'pending_viewing';
    } else {
      room.DisplayStatus = room.Status === 'rented' ? 'rented' : 'available';
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

  async getAllRooms(limit = 20, offset = 0, poiId = null, district = null) {
    // Create cache key
    const cacheKey = `rooms_${limit}_${offset}_${poiId || 'all'}_${district || 'all'}`;
    
    // Check cache first
    const cached = roomCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    let query = `
      SELECT r.*, 
              l.Name as LandlordName, 
              b.BuildingName, b.Address as BuildingAddress, b.District as BuildingDistrict,
              loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
              loc.Latitude, loc.Longitude,
              lst.IsVisible as ListingVisible
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       LEFT JOIN LISTING lst ON r.RoomID = lst.RoomID`;
    
    const params = [];
    const conditions = [];
    
    if (poiId) {
      query += `
       INNER JOIN ROOM_POI rp ON r.RoomID = rp.RoomID`;
      conditions.push('rp.POIID = ?');
      params.push(poiId);
    }
    
    conditions.push("(r.Status IN ('available', 'viewing') AND (lst.IsVisible IS NULL OR lst.IsVisible = 1))");
    
    // Ưu tiên district từ BUILDING trước, sau đó mới đến LOCATION
    if (district) {
      conditions.push('(b.District = ? OR (b.District IS NULL AND loc.District = ?))');
      params.push(district, district);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
       ORDER BY r.UpdatedAt DESC
       LIMIT ? OFFSET ?`;
    
    params.push(limit, offset);
    
    const [rooms] = await db.query(query, params);
    
    // Fetch images in single query instead of GROUP_CONCAT
    const roomIds = rooms.map(r => r.RoomID);
    const [images] = roomIds.length > 0 
      ? await db.query(
          `SELECT RoomID, ImageURL, DisplayOrder 
           FROM ROOM_IMAGE 
           WHERE RoomID IN (?) 
           ORDER BY RoomID, DisplayOrder ASC`,
          [roomIds]
        )
      : [[], null];
    
    // Group images by RoomID
    const imagesByRoom = {};
    images.forEach(img => {
      if (!imagesByRoom[img.RoomID]) imagesByRoom[img.RoomID] = [];
      imagesByRoom[img.RoomID].push({ ImageURL: img.ImageURL });
    });
    
    // Map rooms với images và đồng bộ district từ BUILDING hoặc LOCATION
    const result = rooms.map(room => ({
      ...room,
      District: room.BuildingDistrict || room.District,
      Ward: room.Ward,
      Street: room.Street,
      Address: room.BuildingAddress || room.LocationAddress,
      DisplayStatus: room.Status,
      images: imagesByRoom[room.RoomID] || []
    }));
    
    // Store in cache
    roomCache.set(cacheKey, result);
    
    return result;
  }
}

module.exports = new RoomService();
