const db = require('../config/database');
const cacheService = require('./cacheService');

const normalizeSegment = (value) => (value || '').trim().toLowerCase();

const dedupeTrailingHyphenSegments = (value) => {
  if (!value || typeof value !== 'string') return value;

  const segments = value
    .split(' - ')
    .map((segment) => segment.trim())
    .filter(Boolean);

  while (
    segments.length >= 2 &&
    normalizeSegment(segments[segments.length - 1]) === normalizeSegment(segments[segments.length - 2])
  ) {
    segments.pop();
  }

  return segments.join(' - ');
};

class RoomService {
  async getRoomById(roomId, currentUserId = null) {
    // Single optimized query với JOINs thay vì nhiều queries riêng lẻ
    const [rooms] = await db.query(
      `SELECT r.*, 
              l.Name as LandlordName, l.Phone as LandlordPhone, l.Email as LandlordEmail,
              loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
              loc.Latitude, loc.Longitude,
              MAX(COALESCE(vs.PendingViewings, 0)) as PendingViewings,
              MAX(COALESCE(vs.ApprovedViewings, 0)) as ApprovedViewings,
              GROUP_CONCAT(DISTINCT CONCAT(s.Name) SEPARATOR '||') as ServicesFromTable,
              GROUP_CONCAT(DISTINCT CONCAT(f.Name) SEPARATOR '||') as FurnitureFromTable,
              GROUP_CONCAT(DISTINCT CONCAT(ru.Name) SEPARATOR '||') as RulesFromTable
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       LEFT JOIN (
         SELECT RoomID,
                SUM(CASE WHEN Status = 'Chờ duyệt' THEN 1 ELSE 0 END) as PendingViewings,
                SUM(CASE WHEN Status = 'Đã duyệt' THEN 1 ELSE 0 END) as ApprovedViewings
         FROM VIEWING_SCHEDULE
         GROUP BY RoomID
       ) vs ON vs.RoomID = r.RoomID
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
    
    // Display status should reflect any active viewing on the room, not only the current tenant.
    if (room.Status === 'rented') {
      room.DisplayStatus = 'rented';
    } else if (room.ApprovedViewings > 0 || userScheduleStatus === 'Đã duyệt') {
      room.DisplayStatus = 'viewing';
    } else if (room.PendingViewings > 0 || userScheduleStatus === 'Chờ duyệt') {
      room.DisplayStatus = 'pending_viewing';
    } else {
      room.DisplayStatus = 'available';
    }

    room.Title = dedupeTrailingHyphenSegments(room.Title);
    room.BuildingAddress = dedupeTrailingHyphenSegments(room.BuildingAddress);
    room.LocationAddress = dedupeTrailingHyphenSegments(room.LocationAddress);
    
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

  async getAllRooms(options = {}) {
    const {
      limit = 20,
      offset = 0,
      poiId = null,
      district = null,
      roomType = null,
      minPrice = null,
      maxPrice = null,
      minArea = null,
      maxArea = null,
      amenityId = null,
      sortBy = 'newest'
    } = options;

    const sortMap = {
      newest: 'r.UpdatedAt DESC',
      oldest: 'r.UpdatedAt ASC',
      'price-asc': 'r.Price ASC, r.UpdatedAt DESC',
      'price-desc': 'r.Price DESC, r.UpdatedAt DESC',
      'area-asc': 'r.Area ASC, r.UpdatedAt DESC',
      'area-desc': 'r.Area DESC, r.UpdatedAt DESC'
    };

    const orderBy = sortMap[sortBy] || sortMap.newest;

    // Create cache key
    const cacheKey = cacheService.roomsKey([
      limit,
      offset,
      poiId || 'all-poi',
      district || 'all-district',
      roomType || 'all-type',
      minPrice || 'min-price',
      maxPrice || 'max-price',
      minArea || 'min-area',
      maxArea || 'max-area',
      amenityId || 'all-amenity',
      sortBy
    ].join('_'));
    
    // Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const selectClause = `
      SELECT DISTINCT r.*,
             l.Name as LandlordName,
             b.BuildingName, b.Address as BuildingAddress, b.District as BuildingDistrict,
             loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
             loc.Latitude, loc.Longitude,
             lst.IsVisible as ListingVisible,
             COALESCE(vs.PendingViewings, 0) as PendingViewings,
             COALESCE(vs.ApprovedViewings, 0) as ApprovedViewings
    `;
    const countClause = 'SELECT COUNT(DISTINCT r.RoomID) as total';
    let fromClause = `
      FROM ROOM r
      JOIN LANDLORD l ON r.LandlordID = l.LandlordID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      LEFT JOIN LISTING lst ON r.RoomID = lst.RoomID
      LEFT JOIN (
        SELECT RoomID,
               SUM(CASE WHEN Status = 'Chờ duyệt' THEN 1 ELSE 0 END) as PendingViewings,
               SUM(CASE WHEN Status = 'Đã duyệt' THEN 1 ELSE 0 END) as ApprovedViewings
        FROM VIEWING_SCHEDULE
        GROUP BY RoomID
      ) vs ON vs.RoomID = r.RoomID
    `;
    
    const params = [];
    const conditions = [];
    
    if (poiId) {
      fromClause += ' INNER JOIN ROOM_POI rp ON r.RoomID = rp.RoomID';
      conditions.push('rp.POIID = ?');
      params.push(poiId);
    }

    if (amenityId) {
      fromClause += ' INNER JOIN ROOM_AMENITY ra_filter ON r.RoomID = ra_filter.RoomID';
      conditions.push('ra_filter.AmenityID = ?');
      params.push(amenityId);
    }
    
    conditions.push("(r.Status IN ('available', 'viewing') AND (lst.IsVisible IS NULL OR lst.IsVisible = 1))");
    
    // Ưu tiên district từ BUILDING trước, sau đó mới đến LOCATION
    if (district) {
      conditions.push('(b.District = ? OR (b.District IS NULL AND loc.District = ?))');
      params.push(district, district);
    }

    if (roomType) {
      conditions.push('r.RoomType = ?');
      params.push(roomType);
    }

    if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
      conditions.push('r.Price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
      conditions.push('r.Price <= ?');
      params.push(Number(maxPrice));
    }

    if (minArea !== null && minArea !== undefined && minArea !== '') {
      conditions.push('r.Area >= ?');
      params.push(Number(minArea));
    }

    if (maxArea !== null && maxArea !== undefined && maxArea !== '') {
      conditions.push('r.Area <= ?');
      params.push(Number(maxArea));
    }
    
    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    const [countRows] = await db.query(
      `${countClause} ${fromClause} ${whereClause}`,
      params
    );

    const [rooms] = await db.query(
      `${selectClause} ${fromClause} ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
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
    
    // Map rooms với images và tính trạng thái hiển thị theo lịch xem thực tế.
    const result = rooms.map(room => ({
      ...room,
      Title: dedupeTrailingHyphenSegments(room.Title),
      BuildingAddress: dedupeTrailingHyphenSegments(room.BuildingAddress),
      LocationAddress: dedupeTrailingHyphenSegments(room.LocationAddress),
      District: room.BuildingDistrict || room.District,
      Ward: room.Ward,
      Street: room.Street,
      Address: dedupeTrailingHyphenSegments(room.BuildingAddress || room.LocationAddress),
      DisplayStatus:
        room.Status === 'rented'
          ? 'rented'
          : room.ApprovedViewings > 0
            ? 'viewing'
            : room.PendingViewings > 0
              ? 'pending_viewing'
              : 'available',
      images: imagesByRoom[room.RoomID] || []
    }));
    
    // Store in cache
    const payload = {
      data: result,
      total: countRows[0]?.total || 0
    };

    await cacheService.set(cacheKey, payload, 300);
    
    return payload;
  }
}

const roomService = new RoomService();
roomService.cacheService = cacheService;

module.exports = roomService;
