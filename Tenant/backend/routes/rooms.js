const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Get room by ID
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Lấy accountId từ token nếu có
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.accountId;
      } catch (err) {
        // Token không hợp lệ, bỏ qua
      }
    }

    const room = await roomService.getRoomById(roomId, currentUserId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    const amenities = await roomService.getRoomAmenities(roomId);
    const images = await roomService.getRoomImages(roomId);

    res.json({
      success: true,
      data: {
        ...room,
        amenities,
        images
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phòng'
    });
  }
});

// Get all available rooms
router.get('/rooms', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      poi,
      district,
      roomType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenity,
      sortBy
    } = req.query;

    const rooms = await roomService.getAllRooms({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      poiId: poi,
      district,
      roomType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenityId: amenity,
      sortBy
    });

    res.json({
      success: true,
      data: rooms.data,
      total: rooms.total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phòng'
    });
  }
});

module.exports = router;
