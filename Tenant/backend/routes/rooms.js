const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

// Get room by ID
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId);
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
    const { limit = 20, offset = 0 } = req.query;

    const rooms = await roomService.getAllRooms(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: rooms
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
