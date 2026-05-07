const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all POIs with room count
router.get('/', async (req, res) => {
  try {
    const { typeCode, district } = req.query;
    
    let query = `
      SELECT 
        p.*,
        COUNT(DISTINCT rp.RoomID) as RoomCount
      FROM POI p
      LEFT JOIN ROOM_POI rp ON p.POIID = rp.POIID
      LEFT JOIN ROOM r ON rp.RoomID = r.RoomID AND r.Status = 'available'
      WHERE 1=1
    `;
    const params = [];

    if (typeCode) {
      query += ` AND p.TypeCode = ?`;
      params.push(typeCode);
    }

    if (district) {
      query += ` AND p.District = ?`;
      params.push(district);
    }

    query += ` GROUP BY p.POIID ORDER BY p.Name`;

    const [pois] = await db.query(query, params);

    res.json({
      success: true,
      data: pois
    });
  } catch (error) {
    console.error('Get POIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách POI'
    });
  }
});

// Get POI by ID
router.get('/:id', async (req, res) => {
  try {
    const [pois] = await db.query(
      `SELECT 
        p.*,
        COUNT(DISTINCT rp.RoomID) as RoomCount
      FROM POI p
      LEFT JOIN ROOM_POI rp ON p.POIID = rp.POIID
      LEFT JOIN ROOM r ON rp.RoomID = r.RoomID AND r.Status = 'available'
      WHERE p.POIID = ?
      GROUP BY p.POIID`,
      [req.params.id]
    );

    if (pois.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy POI'
      });
    }

    res.json({
      success: true,
      data: pois[0]
    });
  } catch (error) {
    console.error('Get POI error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin POI'
    });
  }
});

// Get rooms by POI
router.get('/:id/rooms', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [rooms] = await db.query(
      `SELECT 
        r.*,
        b.BuildingName,
        b.Address as BuildingAddress,
        l.District,
        l.Ward,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID ORDER BY DisplayOrder LIMIT 1) as PrimaryImage,
        (SELECT COUNT(*) FROM ROOM_IMAGE WHERE RoomID = r.RoomID) as ImageCount
      FROM ROOM_POI rp
      JOIN ROOM r ON rp.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN LOCATION l ON r.LocationID = l.LocationID
      WHERE rp.POIID = ? AND r.Status = 'available'
      ORDER BY r.UpdatedAt DESC
      LIMIT ? OFFSET ?`,
      [req.params.id, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM ROOM_POI rp
       JOIN ROOM r ON rp.RoomID = r.RoomID
       WHERE rp.POIID = ? AND r.Status = 'available'`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: rooms,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('Get rooms by POI error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phòng'
    });
  }
});

// Get POI statistics by type
router.get('/stats/by-type', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        p.TypeCode,
        COUNT(DISTINCT p.POIID) as POICount,
        COUNT(DISTINCT rp.RoomID) as RoomCount
      FROM POI p
      LEFT JOIN ROOM_POI rp ON p.POIID = rp.POIID
      LEFT JOIN ROOM r ON rp.RoomID = r.RoomID AND r.Status = 'available'
      GROUP BY p.TypeCode
      ORDER BY RoomCount DESC
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get POI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê POI'
    });
  }
});

module.exports = router;
