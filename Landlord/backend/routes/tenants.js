const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all tenants for landlord (người thuê hiện tại, đã booking, đã ký hợp đồng)
router.get('/', authMiddleware, async (req, res) => {
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
    const { filter } = req.query; // 'current', 'booking', 'contracted', 'all'

    let query = `
      SELECT DISTINCT
        t.TenantID,
        t.Name,
        t.Phone,
        t.Email,
        t.Gender,
        t.Birthday,
        t.AvatarURL,
        t.University,
        t.Job,
        t.Bio,
        c.ContractID,
        c.StartDate,
        c.EndDate,
        c.Status as ContractStatus,
        DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining,
        r.RoomCode,
        r.RoomType,
        b.BuildingName,
        b.Address
      FROM TENANT t
      LEFT JOIN CONTRACT c ON t.TenantID = c.TenantID
      LEFT JOIN ROOM r ON c.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE c.LandlordID = ?
    `;

    const params = [landlordId];

    if (filter === 'current') {
      query += ` AND c.Status = 'active' AND c.EndDate >= CURDATE()`;
    } else if (filter === 'contracted') {
      query += ` AND c.Status IN ('active', 'expired', 'terminated')`;
    }

    query += ` ORDER BY t.Name ASC`;

    const [tenants] = await db.query(query, params);

    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get tenant detail by ID (không có lifestyle, habits, compatibility)
router.get('/:id', authMiddleware, async (req, res) => {
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

    // Verify tenant belongs to landlord's properties
    const [verification] = await db.query(
      `SELECT COUNT(*) as count 
       FROM CONTRACT 
       WHERE TenantID = ? AND LandlordID = ?`,
      [req.params.id, landlordId]
    );

    if (verification[0].count === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem thông tin người thuê này'
      });
    }

    // Get tenant basic info (không có lifestyle, habits)
    const [tenants] = await db.query(
      `SELECT 
        t.TenantID,
        t.Name,
        t.Phone,
        t.Email,
        t.Gender,
        t.Birthday,
        t.AvatarURL,
        t.University,
        t.Job,
        t.Bio,
        t.BudgetMin,
        t.BudgetMax,
        t.PreferredDistrict,
        t.CreatedAt
      FROM TENANT t
      WHERE t.TenantID = ?`,
      [req.params.id]
    );

    if (tenants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người thuê'
      });
    }

    // Get tenant's contracts with this landlord
    const [contracts] = await db.query(
      `SELECT 
        c.ContractID,
        c.StartDate,
        c.EndDate,
        c.MonthlyRent,
        c.DepositAmount,
        c.Status,
        DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining,
        r.RoomCode,
        r.RoomType,
        r.Area,
        b.BuildingName,
        b.Address,
        b.District,
        b.Ward
      FROM CONTRACT c
      LEFT JOIN ROOM r ON c.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE c.TenantID = ? AND c.LandlordID = ?
      ORDER BY c.StartDate DESC`,
      [req.params.id, landlordId]
    );

    res.json({
      success: true,
      data: {
        ...tenants[0],
        contracts
      }
    });
  } catch (error) {
    console.error('Get tenant detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get contracts expiring soon (nhắc hết hạn hợp đồng)
router.get('/expiring/notifications', authMiddleware, async (req, res) => {
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
    const { days = 30 } = req.query; // Số ngày trước khi hết hạn

    const [expiringContracts] = await db.query(
      `SELECT 
        c.ContractID,
        c.EndDate,
        DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining,
        t.TenantID,
        t.Name as TenantName,
        t.Phone as TenantPhone,
        t.Email as TenantEmail,
        r.RoomCode,
        r.RoomType,
        b.BuildingName,
        b.Address
      FROM CONTRACT c
      LEFT JOIN TENANT t ON c.TenantID = t.TenantID
      LEFT JOIN ROOM r ON c.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE c.LandlordID = ? 
        AND c.Status = 'active'
        AND DATEDIFF(c.EndDate, CURDATE()) BETWEEN 0 AND ?
      ORDER BY c.EndDate ASC`,
      [landlordId, days]
    );

    res.json({
      success: true,
      data: expiringContracts
    });
  } catch (error) {
    console.error('Get expiring contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
