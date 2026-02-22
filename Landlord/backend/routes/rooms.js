const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all rooms for landlord
router.get('/', authMiddleware, async (req, res) => {
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

    const landlordId = landlords[0].LandlordID;
    const { building, status, type } = req.query;
    let query = `
      SELECT r.*, b.BuildingName,
             (SELECT COUNT(*) FROM VIEWING_SCHEDULE vs WHERE vs.RoomID = r.RoomID AND vs.Status = 'Chờ duyệt') as PendingViewings,
             (SELECT COUNT(*) FROM VIEWING_SCHEDULE vs WHERE vs.RoomID = r.RoomID AND vs.Status = 'Đã duyệt') as ApprovedViewings
      FROM ROOM r
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE r.LandlordID = ?
    `;
    const params = [landlordId];

    if (building) {
      query += ` AND r.BuildingID = ?`;
      params.push(building);
    }
    if (status) {
      query += ` AND r.Status = ?`;
      params.push(status);
    }
    if (type) {
      query += ` AND r.RoomType = ?`;
      params.push(type);
    }

    query += ` ORDER BY r.UpdatedAt DESC`;

    const [rooms] = await db.query(query, params);

    // Add DisplayStatus for each room
    const roomsWithStatus = rooms.map(room => {
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

    res.json({
      success: true,
      data: roomsWithStatus,
      total: roomsWithStatus.length
    });
  } catch (error) {
    console.error('Get rooms error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get room by ID
router.get('/:id', authMiddleware, async (req, res) => {
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

    const landlordId = landlords[0].LandlordID;

    const [rooms] = await db.query(
      `SELECT r.*, b.BuildingName 
       FROM ROOM r
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       WHERE r.RoomID = ? AND r.LandlordID = ?`,
      [req.params.id, landlordId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    res.json({
      success: true,
      data: rooms[0]
    });
  } catch (error) {
    console.error('Get room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Create room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      buildingId,
      roomCode,
      roomType,
      area,
      price,
      maxPeople,
      amenities,
      description
    } = req.body;

    if (!buildingId || !roomCode || !roomType || !area || !price || !maxPeople) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

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

    const landlordId = landlords[0].LandlordID;

    // Generate RoomID
    const [lastRoom] = await db.query(
      'SELECT RoomID FROM ROOM ORDER BY RoomID DESC LIMIT 1'
    );
    
    let roomId;
    if (lastRoom.length > 0) {
      const lastId = parseInt(lastRoom[0].RoomID.substring(3));
      roomId = 'ROM' + String(lastId + 1).padStart(7, '0');
    } else {
      roomId = 'ROM0000001';
    }

    const amenitiesJson = JSON.stringify(amenities || []);

    const [result] = await db.query(
      `INSERT INTO ROOM (
        RoomID, LandlordID, BuildingID, RoomCode, RoomType, Area, Price, 
        MaxPeople, Amenities, Description, Status, CreatedAt, UpdatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW(), NOW())`,
      [
        roomId,
        landlordId,
        buildingId,
        roomCode,
        roomType,
        area,
        price,
        maxPeople,
        amenitiesJson,
        description || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm phòng thành công',
      roomId: roomId
    });
  } catch (error) {
    console.error('Create room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Update room
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      buildingId,
      roomCode,
      roomType,
      area,
      price,
      maxPeople,
      amenities,
      description,
      status
    } = req.body;

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

    const landlordId = landlords[0].LandlordID;

    // Check if room belongs to landlord
    const [rooms] = await db.query(
      'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    const amenitiesJson = JSON.stringify(amenities || []);

    await db.query(
      `UPDATE ROOM SET
        BuildingID = ?,
        RoomCode = ?,
        RoomType = ?,
        Area = ?,
        Price = ?,
        MaxPeople = ?,
        Amenities = ?,
        Description = ?,
        Status = ?,
        UpdatedAt = NOW()
      WHERE RoomID = ?`,
      [
        buildingId,
        roomCode,
        roomType,
        area,
        price,
        maxPeople,
        amenitiesJson,
        description || null,
        status || 'available',
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: 'Cập nhật phòng thành công'
    });
  } catch (error) {
    console.error('Update room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Delete room
router.delete('/:id', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
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

    const landlordId = landlords[0].LandlordID;

    // Check if room belongs to landlord
    const [rooms] = await connection.query(
      'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Delete related data
    await connection.query('DELETE FROM ROOM_AMENITY WHERE RoomID = ?', [req.params.id]);
    await connection.query('DELETE FROM ROOM_IMAGE WHERE RoomID = ?', [req.params.id]);
    await connection.query('DELETE FROM VIEWING_SCHEDULE WHERE RoomID = ?', [req.params.id]);
    await connection.query('DELETE FROM AI_MATCHING WHERE RoomID = ?', [req.params.id]);
    await connection.query('DELETE FROM REVIEW WHERE RoomID = ?', [req.params.id]);
    await connection.query('DELETE FROM LISTING WHERE RoomID = ?', [req.params.id]);

    // Delete the room
    await connection.query('DELETE FROM ROOM WHERE RoomID = ?', [req.params.id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Xóa phòng thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Get buildings for landlord
router.get('/buildings/list', authMiddleware, async (req, res) => {
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

    const landlordId = landlords[0].LandlordID;

    const [buildings] = await db.query(
      'SELECT * FROM BUILDING WHERE LandlordID = ? ORDER BY BuildingName',
      [landlordId]
    );

    res.json({
      success: true,
      data: buildings
    });
  } catch (error) {
    console.error('Get buildings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
