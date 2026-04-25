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

// Find or create location
router.post('/find-or-create', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { district, ward, street, address, latitude, longitude } = req.body;

    if (!district || !ward) {
      return res.status(400).json({ success: false, message: 'Thiếu quận hoặc phường' });
    }

    await connection.beginTransaction();

    // Try to find existing location
    const [existing] = await connection.query(
      'SELECT LocationID FROM LOCATION WHERE District = ? AND Ward = ? AND Street = ? AND Address = ? AND IsActive = TRUE',
      [district, ward, street || '', address || '']
    );

    if (existing.length > 0) {
      await connection.commit();
      return res.json({ success: true, data: { locationId: existing[0].LocationID } });
    }

    // Create new location
    const [lastLocation] = await connection.query(
      'SELECT LocationID FROM LOCATION ORDER BY LocationID DESC LIMIT 1'
    );
    
    let locationId;
    if (lastLocation.length > 0) {
      const lastId = parseInt(lastLocation[0].LocationID.substring(3));
      locationId = 'LOC' + String(lastId + 1).padStart(3, '0');
    } else {
      locationId = 'LOC001';
    }

    await connection.query(
      `INSERT INTO LOCATION (LocationID, City, District, Ward, Street, Address, Latitude, Longitude, IsActive)
       VALUES (?, 'Hà Nội', ?, ?, ?, ?, ?, ?, TRUE)`,
      [locationId, district, ward, street || '', address || '', latitude || null, longitude || null]
    );

    await connection.commit();
    res.json({ success: true, data: { locationId } });
  } catch (error) {
    await connection.rollback();
    console.error('Find or create location error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo địa điểm' });
  } finally {
    connection.release();
  }
});

module.exports = router;
