const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get distinct room types
router.get('/room-types', async (req, res) => {
  try {
    const [roomTypes] = await db.query(
      `SELECT DISTINCT RoomType FROM ROOM WHERE RoomType IS NOT NULL AND RoomType != '' ORDER BY RoomType`
    );
    
    const types = [
      { id: 'all', label: 'Tất cả' },
      ...roomTypes.map(rt => ({ id: rt.RoomType, label: rt.RoomType }))
    ];
    
    res.json(types);
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách loại phòng' });
  }
});

// Get distinct districts
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query(
      `SELECT DISTINCT District FROM LOCATION WHERE District IS NOT NULL AND District != '' ORDER BY District`
    );
    
    res.json(districts.map(d => d.District));
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách quận' });
  }
});

module.exports = router;
