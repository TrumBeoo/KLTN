const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
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

    const [roomStats] = await db.query(
      `SELECT
         COUNT(DISTINCT r.RoomID) as totalRooms,
         SUM(CASE WHEN r.Status = 'available' THEN 1 ELSE 0 END) as availableRooms,
         SUM(CASE WHEN r.Status = 'rented' THEN 1 ELSE 0 END) as rentedRooms,
         SUM(CASE WHEN r.Status = 'viewing' THEN 1 ELSE 0 END) as viewingRooms,
         COUNT(DISTINCT CASE WHEN vs.Status = 'Chờ duyệt' AND r.Status = 'available' THEN r.RoomID END) as pendingViewingRooms,
         COUNT(DISTINCT CASE WHEN vs.Status = 'Đã duyệt' AND r.Status = 'available' THEN r.RoomID END) as approvedViewingRooms
       FROM ROOM r
       LEFT JOIN VIEWING_SCHEDULE vs ON r.RoomID = vs.RoomID
       WHERE r.LandlordID = ?`,
      [landlordId]
    );

    const [pendingViewings] = await db.query(
      `SELECT COUNT(*) as pendingCount
       FROM VIEWING_SCHEDULE vs
       JOIN ROOM r ON vs.RoomID = r.RoomID
       WHERE r.LandlordID = ? AND vs.Status = 'Chờ duyệt'`,
      [landlordId]
    );

    const [expiringContracts] = await db.query(
      `SELECT COUNT(*) as expiringCount
       FROM CONTRACT c
       JOIN ROOM r ON c.RoomID = r.RoomID
       WHERE r.LandlordID = ?
       AND c.Status = 'Đang thuê'
       AND c.EndDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)`,
      [landlordId]
    );

    const stats = roomStats[0];
    const occupancyRate = stats.totalRooms > 0
      ? Math.round((stats.rentedRooms / stats.totalRooms) * 100)
      : 0;

    const [revenueData] = await db.query(
      `SELECT
         COALESCE(SUM(CASE
           WHEN MONTH(p.PaymentDate) = MONTH(NOW()) AND YEAR(p.PaymentDate) = YEAR(NOW())
           THEN p.Amount ELSE 0
         END), 0) as currentMonthRevenue,
         COALESCE(SUM(CASE
           WHEN MONTH(p.PaymentDate) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
           AND YEAR(p.PaymentDate) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
           THEN p.Amount ELSE 0
         END), 0) as prevMonthRevenue
       FROM PAYMENT p
       JOIN CONTRACT c ON p.ContractID = c.ContractID
       JOIN ROOM r ON c.RoomID = r.RoomID
       WHERE r.LandlordID = ? AND p.Status = 'Đã TT'
       AND p.PaymentDate >= DATE_SUB(NOW(), INTERVAL 2 MONTH)`,
      [landlordId]
    );

    const currentRevenue = revenueData[0].currentMonthRevenue || 0;
    const previousRevenue = revenueData[0].prevMonthRevenue || 0;
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalRooms: stats.totalRooms,
        availableRooms: stats.availableRooms - stats.pendingViewingRooms - stats.approvedViewingRooms,
        rentedRooms: stats.rentedRooms,
        pendingViewingRooms: stats.pendingViewingRooms,
        viewingRooms: stats.approvedViewingRooms,
        occupancyRate,
        pendingViewings: pendingViewings[0].pendingCount,
        expiringContracts: expiringContracts[0].expiringCount,
        currentMonthRevenue: currentRevenue,
        revenueChange,
        revenueChangePositive: parseFloat(revenueChange) >= 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Loi server: ' + error.message
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
        message: 'Khong tim thay thong tin chu nha'
      });
    }

    const landlordId = landlords[0].LandlordID;

    const [viewings] = await db.query(
      `SELECT
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
       LIMIT 10`,
      [landlordId]
    );

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Get pending viewings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Loi server: ' + error.message
    });
  }
});

// Get rooms with active viewing-related statuses for dashboard
router.get('/available-rooms', authMiddleware, async (req, res) => {
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

    const [rooms] = await db.query(
      `SELECT
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
       LIMIT 10`,
      [landlordId]
    );

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get available rooms error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Loi server: ' + error.message
    });
  }
});

module.exports = router;
