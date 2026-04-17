const express = require('express')
const router = express.Router()
const multer = require('multer')
const xlsx = require('xlsx')
const db = require('../config/database')
const authMiddleware = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage() })

router.use(authMiddleware)

const validDistricts = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Phú Nhuận', 'Quận Bình Tân', 'Quận Gò Vấp', 'Quận Thủ Đức',
  'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
]

const validateRow = (row) => {
  const errors = []
  if (!row.roomCode) errors.push('Thiếu mã phòng')
  if (!row.title) errors.push('Thiếu tiêu đề')
  if (!row.price || isNaN(row.price) || row.price <= 0) errors.push('Giá không hợp lệ')
  if (!row.area || isNaN(row.area) || row.area <= 0) errors.push('Diện tích không hợp lệ')
  if (!row.district) errors.push('Thiếu quận')
  else if (!validDistricts.includes(row.district)) errors.push('Quận không hợp lệ')
  
  if (row.imageUrl && row.imageUrl.trim()) {
    try {
      new URL(row.imageUrl)
    } catch {
      errors.push('URL ảnh không hợp lệ')
    }
  }
  
  return errors
}

router.post('/preview-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' })
    }

    if (!req.file.originalname.match(/\.(xlsx|xls)$/)) {
      return res.status(400).json({ success: false, message: 'File phải có định dạng .xlsx hoặc .xls' })
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'File Excel không có dữ liệu' })
    }

    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' })
    }

    const landlordId = landlords[0].LandlordID

    const preview = await Promise.all(data.map(async (row, index) => {
      const parsed = {
        rowNumber: index + 2,
        roomCode: row['Mã phòng'] || row['RoomCode'],
        title: row['Tiêu đề'] || row['Title'],
        description: row['Mô tả'] || row['Description'] || '',
        price: parseFloat(row['Giá'] || row['Price']),
        area: parseFloat(row['Diện tích'] || row['Area']),
        district: row['Quận'] || row['District'],
        imageUrl: row['URL ảnh'] || row['ImageURL'] || ''
      }
      
      const errors = validateRow(parsed)
      
      if (parsed.roomCode && errors.length === 0) {
        try {
          const [rooms] = await db.query(
            'SELECT RoomID FROM ROOM WHERE RoomCode = ? AND LandlordID = ?',
            [parsed.roomCode, landlordId]
          )
          
          if (rooms.length === 0) {
            errors.push('Phòng không tồn tại hoặc không thuộc về bạn')
          } else {
            const [existingListings] = await db.query(
              'SELECT ListingID FROM LISTING WHERE RoomID = ?',
              [rooms[0].RoomID]
            )
            
            if (existingListings.length > 0) {
              errors.push('Phòng đã có tin đăng')
            }
          }
        } catch (error) {
          errors.push('Lỗi kiểm tra phòng')
        }
      }
      
      return { ...parsed, errors, isValid: errors.length === 0 }
    }))

    const validCount = preview.filter(r => r.isValid).length
    const invalidCount = preview.filter(r => !r.isValid).length

    res.json({
      success: true,
      data: preview,
      summary: {
        total: preview.length,
        valid: validCount,
        invalid: invalidCount
      }
    })
  } catch (error) {
    console.error('Preview Excel error:', error)
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý file Excel' })
  }
})

router.post('/upload-excel', upload.single('file'), async (req, res) => {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' })
    }

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' })
    }

    const landlordId = landlords[0].LandlordID

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(sheet)

    const [lastJob] = await connection.query(
      'SELECT UploadJobID FROM UPLOAD_JOB ORDER BY UploadJobID DESC LIMIT 1'
    )
    
    let uploadJobId
    if (lastJob.length > 0) {
      const lastId = parseInt(lastJob[0].UploadJobID.substring(2))
      uploadJobId = 'UJ' + String(lastId + 1).padStart(6, '0')
    } else {
      uploadJobId = 'UJ000001'
    }

    await connection.query(`
      INSERT INTO UPLOAD_JOB (UploadJobID, LandlordID, FileName, TotalRows, Status)
      VALUES (?, ?, ?, ?, 'processing')
    `, [uploadJobId, landlordId, req.file.originalname, data.length])

    let successCount = 0
    let failedCount = 0
    const results = []

    for (let index = 0; index < data.length; index++) {
      const row = data[index]
      const rowNumber = index + 2
      
      const parsed = {
        roomCode: row['Mã phòng'] || row['RoomCode'],
        title: row['Tiêu đề'] || row['Title'],
        description: row['Mô tả'] || row['Description'] || '',
        price: parseFloat(row['Giá'] || row['Price']),
        area: parseFloat(row['Diện tích'] || row['Area']),
        district: row['Quận'] || row['District'],
        imageUrl: row['URL ảnh'] || row['ImageURL'] || ''
      }

      const validationErrors = validateRow(parsed)
      
      if (validationErrors.length > 0) {
        await connection.query(`
          INSERT INTO UPLOAD_DETAIL (UploadJobID, RowNumber, RoomCode, Title, Status, ErrorMessage)
          VALUES (?, ?, ?, ?, 'failed', ?)
        `, [uploadJobId, rowNumber, parsed.roomCode, parsed.title, validationErrors.join(', ')])
        
        failedCount++
        results.push({ rowNumber, roomCode: parsed.roomCode, status: 'failed', errors: validationErrors })
        continue
      }

      try {
        const [rooms] = await connection.query(
          'SELECT RoomID FROM ROOM WHERE RoomCode = ? AND LandlordID = ?',
          [parsed.roomCode, landlordId]
        )

        if (rooms.length === 0) {
          throw new Error('Không tìm thấy phòng')
        }

        const roomId = rooms[0].RoomID
        
        const [existingListings] = await connection.query(
          'SELECT ListingID FROM LISTING WHERE RoomID = ?',
          [roomId]
        )

        if (existingListings.length > 0) {
          throw new Error('Phòng đã có tin đăng')
        }

        const [lastListing] = await connection.query(
          'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
        )
        
        let listingId
        if (lastListing.length > 0) {
          const lastId = parseInt(lastListing[0].ListingID.substring(3))
          listingId = 'LST' + String(lastId + 1 + successCount).padStart(5, '0')
        } else {
          listingId = 'LST' + String(1 + successCount).padStart(5, '0')
        }

        await connection.query(`
          INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, [listingId, roomId, landlordId, parsed.title, parsed.description])

        await connection.query(`
          INSERT INTO UPLOAD_DETAIL (UploadJobID, RowNumber, RoomCode, Title, Status, ListingID)
          VALUES (?, ?, ?, ?, 'success', ?)
        `, [uploadJobId, rowNumber, parsed.roomCode, parsed.title, listingId])

        successCount++
        results.push({ rowNumber, roomCode: parsed.roomCode, status: 'success', listingId })
      } catch (error) {
        await connection.query(`
          INSERT INTO UPLOAD_DETAIL (UploadJobID, RowNumber, RoomCode, Title, Status, ErrorMessage)
          VALUES (?, ?, ?, ?, 'failed', ?)
        `, [uploadJobId, rowNumber, parsed.roomCode, parsed.title, error.message])
        
        failedCount++
        results.push({ rowNumber, roomCode: parsed.roomCode, status: 'failed', errors: [error.message] })
      }
    }

    await connection.query(`
      UPDATE UPLOAD_JOB 
      SET SuccessRows = ?, FailedRows = ?, Status = 'completed', CompletedAt = NOW()
      WHERE UploadJobID = ?
    `, [successCount, failedCount, uploadJobId])

    await connection.commit()

    res.json({
      success: true,
      message: `Hoàn thành: ${successCount} thành công, ${failedCount} thất bại`,
      data: {
        uploadJobId,
        successCount,
        failedCount,
        results
      }
    })
  } catch (error) {
    await connection.rollback()
    console.error('Upload Excel error:', error)
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý file Excel' })
  } finally {
    connection.release()
  }
})

router.get('/upload-history', async (req, res) => {
  try {
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' })
    }

    const [jobs] = await db.query(`
      SELECT 
        UploadJobID,
        FileName,
        TotalRows,
        SuccessRows,
        FailedRows,
        Status,
        CreatedAt,
        CompletedAt
      FROM UPLOAD_JOB
      WHERE LandlordID = ?
      ORDER BY CreatedAt DESC
      LIMIT 50
    `, [landlords[0].LandlordID])

    res.json({ success: true, data: jobs })
  } catch (error) {
    console.error('Get upload history error:', error)
    res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử upload' })
  }
})

router.get('/upload-details/:jobId', async (req, res) => {
  try {
    const [landlords] = await db.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    )

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' })
    }

    const [jobs] = await db.query(
      'SELECT * FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlords[0].LandlordID]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy upload job' })
    }

    const [details] = await db.query(`
      SELECT 
        RowNumber,
        RoomCode,
        Title,
        Status,
        ErrorMessage,
        ListingID,
        CreatedAt
      FROM UPLOAD_DETAIL
      WHERE UploadJobID = ?
      ORDER BY RowNumber
    `, [req.params.jobId])

    res.json({
      success: true,
      data: {
        job: jobs[0],
        details
      }
    })
  } catch (error) {
    console.error('Get upload details error:', error)
    res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết upload' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { status, visibility } = req.query
    
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

router.post('/', async (req, res) => {
  try {
    const { roomId, title, description, isVisible = true } = req.body
    
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

router.put('/:id', async (req, res) => {
  try {
    const listingId = req.params.id
    const { title, description, isVisible } = req.body
    
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

router.put('/:id/visibility', async (req, res) => {
  try {
    const listingId = req.params.id
    const { isVisible } = req.body
    
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

    if (isVisible && listings[0].RoomStatus === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hiển thị tin đăng của phòng đã được thuê'
      })
    }

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
