const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get landlord profile with stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get landlord info
    const [landlords] = await db.query(`
      SELECT 
        l.LandlordID,
        l.Name,
        l.Phone,
        l.Email,
        a.Username,
        a.AvatarURL,
        a.Status,
        a.CreatedAt
      FROM LANDLORD l
      JOIN ACCOUNT a ON l.AccountID = a.AccountID
      WHERE l.AccountID = ?
    `, [req.user.accountId]);

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const landlord = landlords[0];
    const landlordId = landlord.LandlordID;

    // Get total buildings
    const [buildingStats] = await db.query(`
      SELECT COUNT(*) as totalBuildings
      FROM BUILDING
      WHERE LandlordID = ?
    `, [landlordId]);

    // Get room statistics
    const [roomStats] = await db.query(`
      SELECT 
        COUNT(*) as totalRooms,
        SUM(CASE WHEN Status = 'available' THEN 1 ELSE 0 END) as availableRooms,
        SUM(CASE WHEN Status = 'rented' THEN 1 ELSE 0 END) as rentedRooms
      FROM ROOM
      WHERE LandlordID = ?
    `, [landlordId]);

    // Calculate occupancy rate
    const stats = roomStats[0];
    const occupancyRate = stats.totalRooms > 0 ? 
      Math.round((stats.rentedRooms / stats.totalRooms) * 100) : 0;

    // Get active listings count
    const [listingStats] = await db.query(`
      SELECT COUNT(*) as activeListings
      FROM LISTING l
      JOIN ROOM r ON l.RoomID = r.RoomID
      WHERE l.LandlordID = ? 
      AND l.IsVisible = TRUE
      AND r.DraftStatus = 'published'
    `, [landlordId]);

    // Get average rating
    const [ratingStats] = await db.query(`
      SELECT 
        AVG(rv.Rating) as avgRating,
        COUNT(rv.ReviewID) as totalReviews
      FROM REVIEW rv
      JOIN ROOM r ON rv.RoomID = r.RoomID
      WHERE r.LandlordID = ?
    `, [landlordId]);

    res.json({
      success: true,
      data: {
        profile: {
          name: landlord.Name,
          phone: landlord.Phone,
          email: landlord.Email,
          username: landlord.Username,
          avatarURL: landlord.AvatarURL,
          status: landlord.Status,
          memberSince: landlord.CreatedAt
        },
        stats: {
          totalBuildings: buildingStats[0].totalBuildings,
          totalRooms: stats.totalRooms,
          availableRooms: stats.availableRooms,
          rentedRooms: stats.rentedRooms,
          occupancyRate: occupancyRate,
          activeListings: listingStats[0].activeListings,
          avgRating: ratingStats[0].avgRating ? parseFloat(ratingStats[0].avgRating).toFixed(1) : 0,
          totalReviews: ratingStats[0].totalReviews
        }
      }
    });
  } catch (error) {
    console.error('Get landlord profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get landlord buildings with room stats
router.get('/buildings', authMiddleware, async (req, res) => {
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

    const [buildings] = await db.query(`
      SELECT 
        b.BuildingID,
        b.BuildingName,
        b.Address,
        b.District,
        b.Ward,
        b.Floors,
        l.City,
        l.Street,
        COUNT(r.RoomID) as totalRooms,
        SUM(CASE WHEN r.Status = 'available' THEN 1 ELSE 0 END) as availableRooms,
        SUM(CASE WHEN r.Status = 'rented' THEN 1 ELSE 0 END) as rentedRooms,
        ROUND(
          CASE 
            WHEN COUNT(r.RoomID) > 0 
            THEN (SUM(CASE WHEN r.Status = 'rented' THEN 1 ELSE 0 END) / COUNT(r.RoomID)) * 100
            ELSE 0
          END
        ) as occupancyRate
      FROM BUILDING b
      LEFT JOIN LOCATION l ON b.LocationID = l.LocationID
      LEFT JOIN ROOM r ON b.BuildingID = r.BuildingID
      WHERE b.LandlordID = ?
      GROUP BY b.BuildingID
      ORDER BY b.CreatedAt DESC
    `, [landlordId]);

    res.json({
      success: true,
      data: buildings
    });
  } catch (error) {
    console.error('Get landlord buildings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get landlord active listings
router.get('/listings', authMiddleware, async (req, res) => {
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

    const [listings] = await db.query(`
      SELECT 
        l.ListingID,
        l.Title,
        l.Description,
        l.CreatedAt,
        r.RoomID,
        r.RoomCode,
        r.RoomType,
        r.Price,
        r.Area,
        r.Status,
        b.BuildingName,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID AND IsPrimary = TRUE LIMIT 1) as primaryImage,
        (SELECT COUNT(*) FROM VIEWING_SCHEDULE WHERE RoomID = r.RoomID) as viewCount
      FROM LISTING l
      JOIN ROOM r ON l.RoomID = r.RoomID
      JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE l.LandlordID = ?
      AND l.IsVisible = TRUE
      AND r.DraftStatus = 'published'
      ORDER BY l.CreatedAt DESC
      LIMIT 20
    `, [landlordId]);

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Get landlord listings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get landlord reviews
router.get('/reviews', authMiddleware, async (req, res) => {
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

    const [reviews] = await db.query(`
      SELECT 
        rv.ReviewID,
        rv.Rating,
        rv.Content,
        rv.ReviewDate,
        r.RoomCode,
        r.RoomType,
        b.BuildingName,
        t.Name as TenantName,
        a.AvatarURL as TenantAvatar
      FROM REVIEW rv
      JOIN ROOM r ON rv.RoomID = r.RoomID
      JOIN BUILDING b ON r.BuildingID = b.BuildingID
      JOIN TENANT t ON rv.TenantID = t.TenantID
      LEFT JOIN ACCOUNT a ON t.AccountID = a.AccountID
      WHERE r.LandlordID = ?
      ORDER BY rv.ReviewDate DESC
      LIMIT 10
    `, [landlordId]);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get landlord reviews error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
