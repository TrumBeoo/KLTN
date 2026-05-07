const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get public documents by room ID
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const [documents] = await pool.query(
      `SELECT d.*, r.RoomCode, b.BuildingName
       FROM DOCUMENT d
       LEFT JOIN ROOM r ON d.RoomID = r.RoomID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       WHERE (d.RoomID = ? OR d.IsAllRooms = 1) AND d.IsPrivate = 0
       ORDER BY d.CreatedAt DESC`,
      [roomId]
    );

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get room documents error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;
