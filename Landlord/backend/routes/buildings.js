const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all buildings for landlord
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

    const [buildings] = await db.query(
      'SELECT * FROM BUILDING WHERE LandlordID = ? ORDER BY BuildingName',
      [landlordId]
    );

    res.json({
      success: true,
      data: buildings,
      total: buildings.length
    });
  } catch (error) {
    console.error('Get buildings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get building by ID
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

    const [buildings] = await db.query(
      'SELECT * FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (buildings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tòa nhà'
      });
    }

    res.json({
      success: true,
      data: buildings[0]
    });
  } catch (error) {
    console.error('Get building error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Create building
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { buildingName, address, district, ward, floors } = req.body;

    if (!buildingName || !address) {
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

    // Generate BuildingID
    const [lastBuilding] = await db.query(
      'SELECT BuildingID FROM BUILDING ORDER BY BuildingID DESC LIMIT 1'
    );
    
    let buildingId;
    if (lastBuilding.length > 0) {
      const lastId = parseInt(lastBuilding[0].BuildingID.substring(3));
      buildingId = 'BLD' + String(lastId + 1).padStart(5, '0');
    } else {
      buildingId = 'BLD00001';
    }

    const [result] = await db.query(
      `INSERT INTO BUILDING (BuildingID, LandlordID, BuildingName, Address, District, Ward, Floors, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [buildingId, landlordId, buildingName, address, district || null, ward || null, floors || null]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm tòa nhà thành công',
      buildingId: buildingId
    });
  } catch (error) {
    console.error('Create building error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Update building
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { buildingName, address, district, ward, floors } = req.body;

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

    // Check if building belongs to landlord
    const [buildings] = await db.query(
      'SELECT * FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (buildings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tòa nhà'
      });
    }

    await db.query(
      `UPDATE BUILDING SET
        BuildingName = ?,
        Address = ?,
        District = ?,
        Ward = ?,
        Floors = ?,
        UpdatedAt = NOW()
      WHERE BuildingID = ?`,
      [buildingName, address, district || null, ward || null, floors || null, req.params.id]
    );

    res.json({
      success: true,
      message: 'Cập nhật tòa nhà thành công'
    });
  } catch (error) {
    console.error('Update building error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Delete building
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

    // Check if building belongs to landlord
    const [buildings] = await connection.query(
      'SELECT * FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (buildings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tòa nhà'
      });
    }

    // Get all rooms in this building
    const [rooms] = await connection.query(
      'SELECT RoomID FROM ROOM WHERE BuildingID = ?',
      [req.params.id]
    );

    // Delete related data for each room
    for (const room of rooms) {
      const roomId = room.RoomID;
      
      // Delete room amenities
      await connection.query('DELETE FROM ROOM_AMENITY WHERE RoomID = ?', [roomId]);
      
      // Delete room images
      await connection.query('DELETE FROM ROOM_IMAGE WHERE RoomID = ?', [roomId]);
      
      // Delete viewing schedules
      await connection.query('DELETE FROM VIEWING_SCHEDULE WHERE RoomID = ?', [roomId]);
      
      // Delete AI matching
      await connection.query('DELETE FROM AI_MATCHING WHERE RoomID = ?', [roomId]);
      
      // Delete reviews
      await connection.query('DELETE FROM REVIEW WHERE RoomID = ?', [roomId]);
      
      // Delete listings
      await connection.query('DELETE FROM LISTING WHERE RoomID = ?', [roomId]);
    }

    // Delete all rooms in building
    await connection.query('DELETE FROM ROOM WHERE BuildingID = ?', [req.params.id]);

    // Finally delete the building
    await connection.query('DELETE FROM BUILDING WHERE BuildingID = ?', [req.params.id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Xóa tòa nhà thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete building error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
