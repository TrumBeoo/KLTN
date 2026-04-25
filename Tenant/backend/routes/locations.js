const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all districts
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query(
      'SELECT DISTINCT District FROM LOCATION WHERE IsActive = TRUE ORDER BY District'
    );
    res.json({ success: true, data: districts.map(d => d.District) });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách quận' });
  }
});

// Get districts with room count and images
router.get('/districts-with-stats', async (req, res) => {
  try {
    const [districts] = await db.query(`
      SELECT 
        loc.District,
        COUNT(DISTINCT r.RoomID) as RoomCount,
        (SELECT ri.ImageURL 
         FROM ROOM r2 
         INNER JOIN ROOM_IMAGE ri ON r2.RoomID = ri.RoomID 
         INNER JOIN LOCATION loc2 ON r2.LocationID = loc2.LocationID
         WHERE loc2.District = loc.District 
           AND r2.Status = 'available' 
           AND r2.DraftStatus = 'published'
         ORDER BY ri.DisplayOrder 
         LIMIT 1) as ImageURL
      FROM LOCATION loc
      LEFT JOIN ROOM r ON loc.LocationID = r.LocationID 
        AND r.Status = 'available' 
        AND r.DraftStatus = 'published'
      WHERE loc.IsActive = TRUE
      GROUP BY loc.District
      HAVING RoomCount > 0
      ORDER BY RoomCount DESC
      LIMIT 8
    `);
    res.json({ success: true, data: districts });
  } catch (error) {
    console.error('Get districts with stats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách quận' });
  }
});

// Get wards by district
router.get('/wards/:district', async (req, res) => {
  try {
    const [wards] = await db.query(
      'SELECT DISTINCT Ward FROM LOCATION WHERE District = ? AND IsActive = TRUE ORDER BY Ward',
      [req.params.district]
    );
    res.json({ success: true, data: wards.map(w => w.Ward) });
  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách phường' });
  }
});

// Search rooms by location
router.get('/search', async (req, res) => {
  try {
    const { district, ward, minPrice, maxPrice, minArea, maxArea } = req.query;
    
    let query = `
      SELECT r.*, 
             l.Name as LandlordName,
             loc.District, loc.Ward, loc.Street, loc.Address as LocationAddress,
             loc.Latitude, loc.Longitude,
             (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID ORDER BY DisplayOrder LIMIT 1) as PrimaryImage
      FROM ROOM r
      JOIN LANDLORD l ON r.LandlordID = l.LandlordID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      WHERE r.Status = 'available' AND r.DraftStatus = 'published'
    `;
    
    const params = [];
    
    if (district) {
      query += ' AND loc.District = ?';
      params.push(district);
    }
    
    if (ward) {
      query += ' AND loc.Ward = ?';
      params.push(ward);
    }
    
    if (minPrice) {
      query += ' AND r.Price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query += ' AND r.Price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    if (minArea) {
      query += ' AND r.Area >= ?';
      params.push(parseFloat(minArea));
    }
    
    if (maxArea) {
      query += ' AND r.Area <= ?';
      params.push(parseFloat(maxArea));
    }
    
    query += ' ORDER BY r.UpdatedAt DESC LIMIT 50';
    
    const [rooms] = await db.query(query, params);
    
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tìm kiếm phòng' });
  }
});

// Find rooms in radius (km)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, maxPrice } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Thiếu tọa độ' });
    }
    
    let query = `
      SELECT 
        r.RoomID, r.RoomCode, r.Price, r.Area, r.RoomType,
        loc.District, loc.Ward, loc.Address, loc.Latitude, loc.Longitude,
        (6371 * ACOS(
          COS(RADIANS(?)) * 
          COS(RADIANS(loc.Latitude)) * 
          COS(RADIANS(loc.Longitude) - RADIANS(?)) + 
          SIN(RADIANS(?)) * 
          SIN(RADIANS(loc.Latitude))
        )) AS Distance_KM,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID ORDER BY DisplayOrder LIMIT 1) as PrimaryImage
      FROM ROOM r
      INNER JOIN LOCATION loc ON r.LocationID = loc.LocationID
      WHERE loc.IsActive = TRUE
        AND r.Status = 'available'
        AND r.DraftStatus = 'published'
        AND loc.Latitude IS NOT NULL
        AND loc.Longitude IS NOT NULL
    `;
    
    const params = [latitude, longitude, latitude];
    
    if (maxPrice) {
      query += ' AND r.Price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    query += ' HAVING Distance_KM <= ? ORDER BY Distance_KM';
    params.push(parseFloat(radius));
    
    const [rooms] = await db.query(query, params);
    
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Find nearby rooms error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tìm phòng gần đây' });
  }
});

module.exports = router;
