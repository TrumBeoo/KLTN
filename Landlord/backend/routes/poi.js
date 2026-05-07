const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all POIs
router.get('/', async (req, res) => {
  try {
    const { typeCode, district } = req.query;
    
    let query = 'SELECT * FROM POI WHERE 1=1';
    const params = [];

    if (typeCode) {
      query += ' AND TypeCode = ?';
      params.push(typeCode);
    }

    if (district) {
      query += ' AND District = ?';
      params.push(district);
    }

    query += ' ORDER BY Name';

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

// Get POI types
router.get('/types', async (req, res) => {
  try {
    const [types] = await db.query(`
      SELECT DISTINCT TypeCode, COUNT(*) as Count
      FROM POI
      GROUP BY TypeCode
      ORDER BY TypeCode
    `);

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get POI types error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách loại POI'
    });
  }
});

// Link POI to room
router.post('/link-room', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { roomId, poiIds } = req.body;

    if (!roomId || !Array.isArray(poiIds) || poiIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp RoomID và danh sách POI'
      });
    }

    await connection.beginTransaction();

    // Get LandlordID from AccountID
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    // Verify room ownership and get room location
    const [rooms] = await connection.query(
      `SELECT r.RoomID, l.Latitude, l.Longitude 
       FROM ROOM r
       LEFT JOIN LOCATION l ON r.LocationID = l.LocationID
       WHERE r.RoomID = ? AND r.LandlordID = ?`,
      [roomId, landlords[0].LandlordID]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    const room = rooms[0];

    // Delete existing links
    await connection.query(
      'DELETE FROM ROOM_POI WHERE RoomID = ?',
      [roomId]
    );

    // Insert new links with calculated distance
    for (const poiId of poiIds) {
      // Get POI coordinates
      const [pois] = await connection.query(
        'SELECT Latitude, Longitude FROM POI WHERE POIID = ?',
        [poiId]
      );

      if (pois.length === 0) continue;

      const poi = pois[0];
      let distance = 0;

      // Calculate distance if both room and POI have coordinates
      if (room.Latitude && room.Longitude && poi.Latitude && poi.Longitude) {
        // Haversine formula to calculate distance in km
        const R = 6371; // Earth radius in km
        const dLat = (poi.Latitude - room.Latitude) * Math.PI / 180;
        const dLon = (poi.Longitude - room.Longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(room.Latitude * Math.PI / 180) * Math.cos(poi.Latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }

      await connection.query(
        'INSERT INTO ROOM_POI (RoomID, POIID, Distance) VALUES (?, ?, ?)',
        [roomId, poiId, distance]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Đã liên kết ${poiIds.length} POI với phòng`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Link POI to room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi liên kết POI'
    });
  } finally {
    connection.release();
  }
});

// Get POIs linked to a room
router.get('/room/:roomId', async (req, res) => {
  try {
    // Get LandlordID from AccountID
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    // Verify room ownership
    const [rooms] = await db.query(
      'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
      [req.params.roomId, landlords[0].LandlordID]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    const [pois] = await db.query(`
      SELECT p.*
      FROM ROOM_POI rp
      JOIN POI p ON rp.POIID = p.POIID
      WHERE rp.RoomID = ?
      ORDER BY p.Name
    `, [req.params.roomId]);

    res.json({
      success: true,
      data: pois
    });
  } catch (error) {
    console.error('Get room POIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách POI của phòng'
    });
  }
});

module.exports = router;
