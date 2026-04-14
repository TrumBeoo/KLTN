const express = require('express')
const router = express.Router()
const db = require('../config/database')
const authMiddleware = require('../middleware/auth')

// Apply auth middleware
router.use(authMiddleware)

// GET /api/listings - Lấy danh sách tin đăng
router.get('/', async (req, res) => {
  try {
    const { status, visibility } = req.query
    
    // Get LandlordID from AccountID
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      })
    }

    const landlordId = landlords[0].LandlordID

    let query = `
      SELECT 
        l.ListingID,
        l.RoomID,
        l.Title,
        l.Description,
        COALESCE(l.IsVisible, 1) as IsVisible,
        l.CreatedAt,
        l.UpdatedAt,
        r.RoomCode,
        r.Price,
        r.Status as RoomStatus,
        b.BuildingName
      FROM LISTING l
      JOIN ROOM r ON l.RoomID = r.RoomID
      JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE l.LandlordID = ?
    `
    const params = [landlordId]

    if (status) {
      query += ' AND r.Status = ?'
      params.push(status)
    }

    if (visibility === 'visible') {
      query += ' AND COALESCE(l.IsVisible, 1) = 1'
    } else if (visibility === 'hidden') {
      query += ' AND COALESCE(l.IsVisible, 1) = 0'
    }

    query += ' ORDER BY l.UpdatedAt DESC'

    const [listings] = await db.query(query, params)

    res.json({
      success: true,
      data: listings
    })
  } catch (error) {
    console.error('Get listings error:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tin đăng'
    })
  }
})

// POST /api/listings - Tạo tin đăng mới
router.post('/', async (req, res) => {
  try {
    const { roomId, title, description, isVisible = true } = req.body
    
    // Get LandlordID from AccountID
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      })
    }

    const landlordId = landlords[0].LandlordID

    // Kiểm tra phòng có thuộc về landlord này không
    const [rooms] = await db.query(`
      SELECT r.RoomID FROM ROOM r
      WHERE r.RoomID = ? AND r.LandlordID = ?
    `, [roomId, landlordId])

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng hoặc bạn không có quyền truy cập'
      })
    }

    // Kiểm tra xem phòng đã có tin đăng chưa
    const [existingListings] = await db.query(
      'SELECT ListingID FROM LISTING WHERE RoomID = ?',
      [roomId]
    )

    if (existingListings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phòng này đã có tin đăng'
      })
    }

    // Generate ListingID
    const [lastListing] = await db.query(
      'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
    )
    
    let listingId
    if (lastListing.length > 0) {
      const lastId = parseInt(lastListing[0].ListingID.substring(3))
      listingId = 'LST' + String(lastId + 1).padStart(5, '0')
    } else {
      listingId = 'LST00001'
    }

    // Tạo tin đăng mới
    await db.query(`
      INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [listingId, roomId, landlordId, title, description, isVisible])

    res.json({
      success: true,
      message: 'Tạo tin đăng thành công',
      data: { listingId }
    })
  } catch (error) {
    console.error('Create listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo tin đăng'
    })
  }
})

// PUT /api/listings/:id - Cập nhật tin đăng
router.put('/:id', async (req, res) => {
  try {
    const listingId = req.params.id
    const { title, description, isVisible } = req.body
    
    // Get LandlordID from AccountID
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      })
    }

    const landlordId = landlords[0].LandlordID

    // Kiểm tra tin đăng có thuộc về landlord này không
    const [listings] = await db.query(`
      SELECT l.ListingID FROM LISTING l
      WHERE l.ListingID = ? AND l.LandlordID = ?
    `, [listingId, landlordId])

    if (listings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng hoặc bạn không có quyền truy cập'
      })
    }

    // Cập nhật tin đăng
    await db.query(`
      UPDATE LISTING 
      SET Title = ?, Description = ?, IsVisible = ?, UpdatedAt = NOW()
      WHERE ListingID = ?
    `, [title, description, isVisible, listingId])

    res.json({
      success: true,
      message: 'Cập nhật tin đăng thành công'
    })
  } catch (error) {
    console.error('Update listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tin đăng'
    })
  }
})

// PUT /api/listings/:id/visibility - Bật/tắt hiển thị tin đăng
router.put('/:id/visibility', async (req, res) => {
  try {
    const listingId = req.params.id
    const { isVisible } = req.body
    
    // Get LandlordID from AccountID
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      })
    }

    const landlordId = landlords[0].LandlordID

    // Kiểm tra tin đăng có thuộc về landlord này không
    const [listings] = await db.query(`
      SELECT l.ListingID, r.Status as RoomStatus FROM LISTING l
      JOIN ROOM r ON l.RoomID = r.RoomID
      WHERE l.ListingID = ? AND l.LandlordID = ?
    `, [listingId, landlordId])

    if (listings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng hoặc bạn không có quyền truy cập'
      })
    }

    // Kiểm tra ràng buộc: nếu phòng đã thuê thì không thể hiển thị tin đăng
    if (isVisible && listings[0].RoomStatus === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hiển thị tin đăng của phòng đã được thuê'
      })
    }

    // Cập nhật trạng thái hiển thị
    await db.query(`
      UPDATE LISTING 
      SET IsVisible = ?, UpdatedAt = NOW()
      WHERE ListingID = ?
    `, [isVisible, listingId])

    res.json({
      success: true,
      message: isVisible ? 'Đã bật hiển thị tin đăng' : 'Đã ẩn tin đăng'
    })
  } catch (error) {
    console.error('Toggle visibility error:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thay đổi trạng thái hiển thị'
    })
  }
})

module.exports = router