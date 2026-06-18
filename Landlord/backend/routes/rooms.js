const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');
const cacheService = require('../services/cacheService');

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
    }
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay thong tin chu nha'
      });
    }

    const landlordId = landlords[0].LandlordID;
    const { building, status, type } = req.query;

    let query = `
      SELECT r.*, b.BuildingName,
             COALESCE(vs.PendingViewings, 0) as PendingViewings,
             COALESCE(vs.ApprovedViewings, 0) as ApprovedViewings,
             img.Images,
             CASE
               WHEN r.Status = 'rented' THEN 'rented'
               WHEN COALESCE(vs.ApprovedViewings, 0) > 0 THEN 'viewing'
               WHEN COALESCE(vs.PendingViewings, 0) > 0 THEN 'pending_viewing'
               ELSE 'available'
             END as DisplayStatus
      FROM ROOM r
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN (
        SELECT RoomID,
               SUM(CASE WHEN Status = 'Chờ duyệt' THEN 1 ELSE 0 END) as PendingViewings,
               SUM(CASE WHEN Status = 'Đã duyệt' THEN 1 ELSE 0 END) as ApprovedViewings
        FROM VIEWING_SCHEDULE
        GROUP BY RoomID
      ) vs ON vs.RoomID = r.RoomID
      LEFT JOIN (
        SELECT RoomID, GROUP_CONCAT(ImageURL ORDER BY DisplayOrder) as Images
        FROM ROOM_IMAGE
        GROUP BY RoomID
      ) img ON img.RoomID = r.RoomID
      WHERE r.LandlordID = ?
    `;
    const params = [landlordId];

    if (building) {
      query += ' AND r.BuildingID = ?';
      params.push(building);
    }
    if (status) {
      if (status === 'pending_viewing') {
        query += ` AND r.Status = 'available' AND COALESCE(vs.PendingViewings, 0) > 0`;
      } else if (status === 'viewing') {
        query += ` AND r.Status = 'available' AND COALESCE(vs.ApprovedViewings, 0) > 0`;
      } else if (status === 'available') {
        query += ` AND r.Status = 'available' AND COALESCE(vs.PendingViewings, 0) = 0 AND COALESCE(vs.ApprovedViewings, 0) = 0`;
      } else {
        query += ' AND r.Status = ?';
        params.push(status);
      }
    }
    if (type) {
      query += ' AND r.RoomType = ?';
      params.push(type);
    }

    query += ' ORDER BY r.UpdatedAt DESC';

    const [rooms] = await db.query(query, params);

    return res.json({
      success: true,
      data: rooms,
      total: rooms.length
    });
  } catch (error) {
    return next(error);
  }
});

// Optimized room list for landlord
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'KhĂ´ng tĂ¬m tháº¥y thĂ´ng tin chá»§ nhĂ '
      });
    }

    const landlordId = landlords[0].LandlordID;
    const { building, status, type } = req.query;
    const cacheKey = cacheService.landlordKey(
      req.user.accountId,
      `rooms-optimized:${building || 'all'}:${status || 'all'}:${type || 'all'}`
    );

    const cachedRooms = await cacheService.get(cacheKey);
    if (cachedRooms) {
      return res.json({
        success: true,
        data: cachedRooms,
        total: cachedRooms.length,
        cached: true
      });
    }

    let query = `
      SELECT r.*, b.BuildingName,
             COALESCE(vs.PendingViewings, 0) as PendingViewings,
             COALESCE(vs.ApprovedViewings, 0) as ApprovedViewings,
             img.Images
      FROM ROOM r
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN (
        SELECT RoomID,
               SUM(CASE WHEN Status = 'Chá» duyá»‡t' THEN 1 ELSE 0 END) as PendingViewings,
               SUM(CASE WHEN Status = 'ÄĂ£ duyá»‡t' THEN 1 ELSE 0 END) as ApprovedViewings
        FROM VIEWING_SCHEDULE
        GROUP BY RoomID
      ) vs ON vs.RoomID = r.RoomID
      LEFT JOIN (
        SELECT RoomID, GROUP_CONCAT(ImageURL ORDER BY DisplayOrder) as Images
        FROM ROOM_IMAGE
        GROUP BY RoomID
      ) img ON img.RoomID = r.RoomID
      WHERE r.LandlordID = ?
    `;
    const params = [landlordId];

    if (building) {
      query += ' AND r.BuildingID = ?';
      params.push(building);
    }
    if (status) {
      query += ' AND r.Status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND r.RoomType = ?';
      params.push(type);
    }

    query += ' ORDER BY r.UpdatedAt DESC';

    const [rooms] = await db.query(query, params);
    const roomsWithStatus = rooms.map((room) => {
      let displayStatus = room.Status;
      if (room.Status === 'available') {
        if (room.ApprovedViewings > 0) {
          displayStatus = 'viewing';
        } else if (room.PendingViewings > 0) {
          displayStatus = 'pending_viewing';
        }
      }

      return {
        ...room,
        DisplayStatus: displayStatus
      };
    });

    await cacheService.set(cacheKey, roomsWithStatus, 120);

    return res.json({
      success: true,
      data: roomsWithStatus,
      total: roomsWithStatus.length
    });
  } catch (error) {
    return next(error);
  }
});

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
             (SELECT COUNT(*) FROM VIEWING_SCHEDULE vs WHERE vs.RoomID = r.RoomID AND vs.Status = 'Đã duyệt') as ApprovedViewings,
             (SELECT GROUP_CONCAT(ImageURL ORDER BY DisplayOrder) FROM ROOM_IMAGE WHERE RoomID = r.RoomID) as Images
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
  const connection = await db.getConnection();
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
      locationId
    } = req.body;

    if (!buildingId || !roomCode || !roomType || !area || !price || !maxPeople) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
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

    const landlordId = landlords[0].LandlordID;

    // Get LocationID and District from Building to ensure consistency
    let finalLocationId = locationId;
    let buildingDistrict = null;
    
    const [buildings] = await connection.query(
      'SELECT LocationID, District FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [buildingId, landlordId]
    );
    
    if (buildings.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy tòa nhà'
      });
    }
    
    finalLocationId = buildings[0].LocationID;
    buildingDistrict = buildings[0].District;
    
    // Validate district consistency if locationId is provided separately
    if (locationId && locationId !== finalLocationId) {
      const [providedLocation] = await connection.query(
        'SELECT District FROM LOCATION WHERE LocationID = ?',
        [locationId]
      );
      
      if (providedLocation.length > 0 && providedLocation[0].District !== buildingDistrict) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Quận của địa điểm (${providedLocation[0].District}) không khớp với quận của tòa nhà (${buildingDistrict})`
        });
      }
    }

    // Generate RoomID
    const [lastRoom] = await connection.query(
      'SELECT RoomID FROM ROOM ORDER BY RoomID DESC LIMIT 1'
    );
    
    let roomId;
    if (lastRoom.length > 0) {
      const lastId = parseInt(lastRoom[0].RoomID.substring(3));
      roomId = 'ROM' + String(lastId + 1).padStart(5, '0');
    } else {
      roomId = 'ROM00001';
    }

    const amenitiesJson = JSON.stringify(amenities || []);

    await connection.query(
      `INSERT INTO ROOM (
        RoomID, LandlordID, BuildingID, LocationID, RoomCode, RoomType, Area, Price, 
        MaxPeople, Amenities, Description, Status, CreatedAt, UpdatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW(), NOW())`,
      [
        roomId,
        landlordId,
        buildingId,
        finalLocationId,
        roomCode,
        roomType,
        area,
        price,
        maxPeople,
        amenitiesJson,
        description || null
      ]
    );

    // Insert amenities into ROOM_AMENITY table
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      const amenityValues = amenities.map(amenityId => [roomId, amenityId]);
      await connection.query(
        'INSERT INTO ROOM_AMENITY (RoomID, AmenityID) VALUES ?',
        [amenityValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Thêm phòng thành công',
      roomId: roomId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Update room
router.put('/:id', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
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
      status,
      locationId
    } = req.body;

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

    // Get LocationID and District from Building to ensure consistency
    let finalLocationId = locationId;
    let buildingDistrict = null;
    
    const [buildings] = await connection.query(
      'SELECT LocationID, District FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [buildingId, landlordId]
    );
    
    if (buildings.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy tòa nhà'
      });
    }
    
    finalLocationId = buildings[0].LocationID;
    buildingDistrict = buildings[0].District;
    
    // Validate district consistency if locationId is provided separately
    if (locationId && locationId !== finalLocationId) {
      const [providedLocation] = await connection.query(
        'SELECT District FROM LOCATION WHERE LocationID = ?',
        [locationId]
      );
      
      if (providedLocation.length > 0 && providedLocation[0].District !== buildingDistrict) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Quận của địa điểm (${providedLocation[0].District}) không khớp với quận của tòa nhà (${buildingDistrict})`
        });
      }
    }

    const amenitiesJson = JSON.stringify(amenities || []);

    await connection.query(
      `UPDATE ROOM SET
        BuildingID = ?,
        LocationID = ?,
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
        finalLocationId,
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

    // Update amenities in ROOM_AMENITY table
    await connection.query('DELETE FROM ROOM_AMENITY WHERE RoomID = ?', [req.params.id]);
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      const amenityValues = amenities.map(amenityId => [req.params.id, amenityId]);
      await connection.query(
        'INSERT INTO ROOM_AMENITY (RoomID, AmenityID) VALUES ?',
        [amenityValues]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Cập nhật phòng thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update room error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
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

// Bulk delete rooms
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { roomIds } = req.body;

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 phòng'
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

    const landlordId = landlords[0].LandlordID;

    // Verify all rooms belong to landlord
    const placeholders = roomIds.map(() => '?').join(',');
    const [rooms] = await connection.query(
      `SELECT RoomID FROM ROOM WHERE RoomID IN (${placeholders}) AND LandlordID = ?`,
      [...roomIds, landlordId]
    );

    if (rooms.length !== roomIds.length) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Một số phòng không thuộc về bạn'
      });
    }

    // Delete related data for all rooms
    await connection.query(`DELETE FROM ROOM_AMENITY WHERE RoomID IN (${placeholders})`, roomIds);
    await connection.query(`DELETE FROM ROOM_IMAGE WHERE RoomID IN (${placeholders})`, roomIds);
    await connection.query(`DELETE FROM VIEWING_SCHEDULE WHERE RoomID IN (${placeholders})`, roomIds);
    await connection.query(`DELETE FROM AI_MATCHING WHERE RoomID IN (${placeholders})`, roomIds);
    await connection.query(`DELETE FROM REVIEW WHERE RoomID IN (${placeholders})`, roomIds);
    await connection.query(`DELETE FROM LISTING WHERE RoomID IN (${placeholders})`, roomIds);

    // Delete all rooms
    await connection.query(`DELETE FROM ROOM WHERE RoomID IN (${placeholders})`, roomIds);

    await connection.commit();

    res.json({
      success: true,
      message: `Đã xóa ${roomIds.length} phòng thành công`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk delete rooms error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Upload room images
router.post('/:id/images', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const roomId = req.params.id;
    
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
      [roomId, landlordId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 ảnh'
      });
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        const result = await cloudinaryService.uploadImage(
          file.buffer,
          `rooms/${roomId}`,
          { folder: `rooms/${roomId}` }
        );

        // Get current max DisplayOrder
        const [maxOrder] = await db.query(
          'SELECT MAX(DisplayOrder) as maxOrder FROM ROOM_IMAGE WHERE RoomID = ?',
          [roomId]
        );
        const nextOrder = (maxOrder[0].maxOrder || 0) + 1;

        // Insert into database
        await db.query(
          'INSERT INTO ROOM_IMAGE (RoomID, ImageURL, PublicID, DisplayOrder, IsPrimary) VALUES (?, ?, ?, ?, ?)',
          [roomId, result.secure_url, result.public_id, nextOrder, i === 0]
        );

        uploadedImages.push({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          displayOrder: nextOrder
        });
      } catch (uploadError) {
        console.error(`Failed to upload image ${i + 1}:`, uploadError.message);
        return res.status(500).json({
          success: false,
          message: `Lỗi tải lên ảnh ${i + 1}: ${uploadError.message}`
        });
      }
    }

    res.json({
      success: true,
      message: `Đã tải lên ${uploadedImages.length} ảnh lên Cloudinary`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload images error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Update room images (replace image list)
router.put('/:id/images', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const roomId = req.params.id;
    const { images } = req.body; // Comma-separated URLs or empty string
    
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
      [roomId, landlordId]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Get current images from database
    const [currentImages] = await connection.query(
      'SELECT ImageURL, PublicID FROM ROOM_IMAGE WHERE RoomID = ?',
      [roomId]
    );

    // Parse new image URLs
    const newImageUrls = images ? images.split(',').map(url => url.trim()).filter(url => url) : [];
    const currentImageUrls = currentImages.map(img => img.ImageURL);

    // Find images to delete (in DB but not in new list)
    const imagesToDelete = currentImages.filter(img => !newImageUrls.includes(img.ImageURL));

    // Delete removed images from Cloudinary and database
    for (const image of imagesToDelete) {
      if (image.PublicID) {
        try {
          await cloudinaryService.deleteFile(image.PublicID, 'image');
        } catch (cloudinaryError) {
          console.error('Failed to delete from Cloudinary:', cloudinaryError.message);
        }
      }
      await connection.query(
        'DELETE FROM ROOM_IMAGE WHERE RoomID = ? AND ImageURL = ?',
        [roomId, image.ImageURL]
      );
    }

    // Update display order for remaining images
    for (let i = 0; i < newImageUrls.length; i++) {
      const url = newImageUrls[i];
      await connection.query(
        'UPDATE ROOM_IMAGE SET DisplayOrder = ?, IsPrimary = ? WHERE RoomID = ? AND ImageURL = ?',
        [i + 1, i === 0, roomId, url]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã cập nhật danh sách ảnh phòng'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update images error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Delete room image
router.delete('/:id/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const { id: roomId, imageId } = req.params;
    
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
      [roomId, landlordId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Get image info
    const [images] = await db.query(
      'SELECT * FROM ROOM_IMAGE WHERE ImageID = ? AND RoomID = ?',
      [imageId, roomId]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ảnh'
      });
    }

    const image = images[0];

    // Delete from Cloudinary if PublicID exists
    if (image.PublicID) {
      try {
        await cloudinaryService.deleteFile(image.PublicID, 'image');
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError.message);
        // Continue with DB deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await db.query('DELETE FROM ROOM_IMAGE WHERE ImageID = ?', [imageId]);

    res.json({
      success: true,
      message: 'Đã xóa ảnh'
    });
  } catch (error) {
    console.error('Delete image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
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

// Get room amenities
router.get('/:id/amenities', authMiddleware, async (req, res) => {
  try {
    const [amenities] = await db.query(
      `SELECT a.* FROM AMENITY a
       INNER JOIN ROOM_AMENITY ra ON a.AmenityID = ra.AmenityID
       WHERE ra.RoomID = ?
       ORDER BY a.Name`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: amenities
    });
  } catch (error) {
    console.error('Get room amenities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Confirm room rental (mark as rented)
router.put('/:id/confirm-rental', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { contractData } = req.body;

    if (!contractData) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp thông tin hợp đồng'
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

    // Return contract form data requirement
    res.json({
      success: true,
      requireContract: true,
      roomId: req.params.id,
      message: 'Vui lòng điền thông tin hợp đồng'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Confirm rental error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Mark room as available again
router.put('/:id/mark-available', authMiddleware, async (req, res) => {
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

    // Update room status to available
    await connection.query(
      `UPDATE ROOM SET Status = 'available', UpdatedAt = NOW() WHERE RoomID = ?`,
      [req.params.id]
    );

    // Show listing if exists
    await connection.query(
      `UPDATE LISTING SET IsVisible = 1, UpdatedAt = NOW() WHERE RoomID = ?`,
      [req.params.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã cập nhật phòng về trạng thái còn trống'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Mark available error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
