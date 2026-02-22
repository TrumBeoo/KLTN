const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
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

    // Get room statistics
    const [roomStats] = await db.query(`
      SELECT 
        COUNT(*) as totalRooms,
        SUM(CASE WHEN Status = 'available' THEN 1 ELSE 0 END) as availableRooms,
        SUM(CASE WHEN Status = 'rented' THEN 1 ELSE 0 END) as rentedRooms,
        SUM(CASE WHEN Status = 'viewing' THEN 1 ELSE 0 END) as viewingRooms
      FROM ROOM 
      WHERE LandlordID = ?
    `, [landlordId]);

    // Get rooms with pending viewing schedules (chờ duyệt)
    const [roomsWithPendingViewings] = await db.query(`
      SELECT COUNT(DISTINCT r.RoomID) as pendingViewingRooms
      FROM ROOM r
      JOIN VIEWING_SCHEDULE vs ON r.RoomID = vs.RoomID
      WHERE r.LandlordID = ? 
      AND vs.Status = 'Chờ duyệt'
      AND r.Status = 'available'
    `, [landlordId]);

    // Get rooms with approved viewing schedules (đã đặt lịch)
    const [roomsWithApprovedViewings] = await db.query(`
      SELECT COUNT(DISTINCT r.RoomID) as approvedViewingRooms
      FROM ROOM r
      JOIN VIEWING_SCHEDULE vs ON r.RoomID = vs.RoomID
      WHERE r.LandlordID = ? 
      AND vs.Status = 'Đã duyệt'
      AND r.Status = 'available'
    `, [landlordId]);

    // Get pending viewing schedules count
    const [pendingViewings] = await db.query(`
      SELECT COUNT(*) as pendingCount
      FROM VIEWING_SCHEDULE vs
      JOIN ROOM r ON vs.RoomID = r.RoomID
      WHERE r.LandlordID = ? AND vs.Status = 'Chờ duyệt'
    `, [landlordId]);

    // Get contracts expiring soon (within 30 days)
    const [expiringContracts] = await db.query(`
      SELECT COUNT(*) as expiringCount
      FROM CONTRACT c
      JOIN ROOM r ON c.RoomID = r.RoomID
      WHERE r.LandlordID = ? 
      AND c.Status = 'Đang thuê'
      AND c.EndDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
    `, [landlordId]);

    // Calculate occupancy rate
    const stats = roomStats[0];
    const occupancyRate = stats.totalRooms > 0 ? 
      Math.round((stats.rentedRooms / stats.totalRooms) * 100) : 0;

    // Get monthly revenue (current month)
    const [revenue] = await db.query(`
      SELECT COALESCE(SUM(p.Amount), 0) as currentMonthRevenue
      FROM PAYMENT p
      JOIN CONTRACT c ON p.ContractID = c.ContractID
      JOIN ROOM r ON c.RoomID = r.RoomID
      WHERE r.LandlordID = ?
      AND p.Status = 'Đã TT'
      AND MONTH(p.PaymentDate) = MONTH(NOW())
      AND YEAR(p.PaymentDate) = YEAR(NOW())
    `, [landlordId]);

    // Get previous month revenue for comparison
    const [prevRevenue] = await db.query(`
      SELECT COALESCE(SUM(p.Amount), 0) as prevMonthRevenue
      FROM PAYMENT p
      JOIN CONTRACT c ON p.ContractID = c.ContractID
      JOIN ROOM r ON c.RoomID = r.RoomID
      WHERE r.LandlordID = ?
      AND p.Status = 'Đã TT'
      AND MONTH(p.PaymentDate) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      AND YEAR(p.PaymentDate) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    `, [landlordId]);

    const currentRevenue = revenue[0].currentMonthRevenue;
    const previousRevenue = prevRevenue[0].prevMonthRevenue;
    const revenueChange = previousRevenue > 0 ? 
      ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalRooms: stats.totalRooms,
        availableRooms: stats.availableRooms - roomsWithPendingViewings[0].pendingViewingRooms - roomsWithApprovedViewings[0].approvedViewingRooms,
        rentedRooms: stats.rentedRooms,
        pendingViewingRooms: roomsWithPendingViewings[0].pendingViewingRooms,
        viewingRooms: roomsWithApprovedViewings[0].approvedViewingRooms,
        occupancyRate: occupancyRate,
        pendingViewings: pendingViewings[0].pendingCount,
        expiringContracts: expiringContracts[0].expiringCount,
        currentMonthRevenue: currentRevenue,
        revenueChange: revenueChange,
        revenueChangePositive: parseFloat(revenueChange) >= 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get pending viewing schedules for dashboard
router.get('/pending-viewings', authMiddleware, async (req, res) => {
  try {
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

    const [viewings] = await db.query(`
      SELECT 
        vs.ScheduleID,
        vs.DateTime,
        vs.Status,
        r.RoomCode,
        r.RoomType,
        b.BuildingName,
        t.Name as TenantName,
        t.Phone as TenantPhone,
        t.Email as TenantEmail
      FROM VIEWING_SCHEDULE vs
      JOIN ROOM r ON vs.RoomID = r.RoomID
      JOIN BUILDING b ON r.BuildingID = b.BuildingID
      JOIN TENANT t ON vs.TenantID = t.TenantID
      WHERE r.LandlordID = ? 
      AND vs.Status = 'Chờ duyệt'
      ORDER BY vs.DateTime ASC
      LIMIT 10
    `, [landlordId]);

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Get pending viewings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get available rooms for dashboard
router.get('/available-rooms', authMiddleware, async (req, res) => {
  try {
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

    const [rooms] = await db.query(`
      SELECT 
        r.RoomID,
        r.RoomCode,
        r.RoomType,
        r.Area,
        r.Price,
        r.Status,
        r.UpdatedAt,
        b.BuildingName,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM VIEWING_SCHEDULE vs 
            WHERE vs.RoomID = r.RoomID 
            AND vs.Status = 'Chờ duyệt'
          ) THEN 'pending_viewing'
          WHEN EXISTS (
            SELECT 1 FROM VIEWING_SCHEDULE vs 
            WHERE vs.RoomID = r.RoomID 
            AND vs.Status = 'Đã duyệt'
          ) THEN 'viewing'
          ELSE r.Status
        END as DisplayStatus
      FROM ROOM r
      JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE r.LandlordID = ? 
      AND r.Status = 'available'
      ORDER BY r.UpdatedAt DESC
      LIMIT 10
    `, [landlordId]);

    // Map rooms with correct display status
    const roomsWithStatus = rooms.map(room => ({
      ...room,
      Status: room.DisplayStatus // Use the calculated display status
    }));

    res.json({
      success: true,
      data: roomsWithStatus
    });
  } catch (error) {
    console.error('Get available rooms error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;