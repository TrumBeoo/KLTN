const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get distinct room types
router.get('/room-types', async (req, res) => {
  try {
    // Lấy các loại phòng phổ biến nhất từ bảng ROOM_TYPE
    const [roomTypes] = await db.query(
      `SELECT rt.RoomTypeID, rt.Name, rt.Description, COUNT(r.RoomID) as RoomCount
       FROM ROOM_TYPE rt
       LEFT JOIN ROOM r ON r.RoomType = rt.Name
       GROUP BY rt.RoomTypeID, rt.Name, rt.Description
       HAVING RoomCount > 0
       ORDER BY RoomCount DESC
       LIMIT 10`
    );
    
    const types = roomTypes.map(rt => ({
      value: rt.Name,  // Dùng Name vì ROOM.RoomType lưu tên
      label: rt.Name,
      description: rt.Description,
      count: rt.RoomCount
    }));
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách loại phòng' 
    });
  }
});

// Get distinct amenities
router.get('/amenities', async (req, res) => {
  try {
    const [amenities] = await db.query(
      `SELECT AmenityID, Name, Icon FROM AMENITY ORDER BY Name`
    );
    
    const amenitiesList = amenities.map(amenity => ({
      value: amenity.AmenityID.toString(),
      label: amenity.Name,
      icon: amenity.Icon
    }));
    
    res.json({
      success: true,
      data: amenitiesList
    });
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách tiện nghi' 
    });
  }
});

// Get distinct districts
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query(
      `SELECT DISTINCT District FROM LOCATION WHERE District IS NOT NULL AND District != '' ORDER BY District`
    );
    
    res.json({
      success: true,
      data: districts.map(d => d.District)
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách quận' 
    });
  }
});

module.exports = router;
