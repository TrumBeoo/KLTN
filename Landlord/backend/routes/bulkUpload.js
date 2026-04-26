const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Get draft batches (grouped by upload job)
router.get('/draft-batches', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    // Get all jobs with draft rooms
    const [jobs] = await connection.query(`
      SELECT 
        uj.UploadJobID,
        uj.FileName,
        uj.TotalRows,
        uj.CreatedAt,
        COUNT(DISTINCT r.RoomID) as TotalRooms,
        SUM(CASE WHEN r.DraftStatus = 'published' THEN 1 ELSE 0 END) as PublishedCount,
        SUM(CASE WHEN (SELECT COUNT(*) FROM ROOM_IMAGE WHERE RoomID = r.RoomID) > 0 THEN 1 ELSE 0 END) as RoomsWithImages
      FROM UPLOAD_JOB uj
      LEFT JOIN UPLOAD_DETAIL ud ON uj.UploadJobID = ud.UploadJobID
      LEFT JOIN ROOM r ON ud.RoomID = r.RoomID
      WHERE uj.LandlordID = ? AND uj.Status IN ('pending', 'processing')
      GROUP BY uj.UploadJobID
      ORDER BY uj.CreatedAt DESC
    `, [landlords[0].LandlordID]);

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Get draft batches error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách batch' });
  } finally {
    connection.release();
  }
});

// Get batch details
router.get('/batch/:jobId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    // Get job
    const [jobs] = await connection.query(
      'SELECT * FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlords[0].LandlordID]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy batch' });
    }

    // Get rooms from UPLOAD_DETAIL (may or may not have RoomID yet)
    const [rooms] = await connection.query(`
      SELECT 
        ud.UploadDetailID,
        ud.RoomCode,
        ud.Title,
        ud.RoomType,
        ud.Area,
        ud.Price,
        ud.MaxPeople,
        ud.Description,
        ud.RoomID,
        ud.ListingID,
        CASE 
          WHEN r.RoomID IS NOT NULL THEN r.DraftStatus
          ELSE NULL
        END as DraftStatus,
        COALESCE((SELECT COUNT(*) FROM ROOM_IMAGE WHERE RoomID = ud.RoomID), 0) as ImageCount
      FROM UPLOAD_DETAIL ud
      LEFT JOIN ROOM r ON ud.RoomID = r.RoomID
      WHERE ud.UploadJobID = ?
      ORDER BY ud.RowNumber
    `, [req.params.jobId]);

    res.json({
      success: true,
      data: {
        job: jobs[0],
        rooms
      }
    });
  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết batch' });
  } finally {
    connection.release();
  }
});

// Publish draft room
router.post('/publish-draft/:roomId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get room
    const [rooms] = await connection.query(
      'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = "draft"',
      [req.params.roomId, landlordId]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng draft' });
    }

    const room = rooms[0];

    // Check if listing already exists
    const [existingListings] = await connection.query(
      'SELECT ListingID FROM LISTING WHERE RoomID = ?',
      [room.RoomID]
    );

    if (existingListings.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Phòng đã có tin đăng' });
    }

    // Generate ListingID
    const [lastListing] = await connection.query(
      'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
    );
    
    let listingId;
    if (lastListing.length > 0) {
      const lastId = parseInt(lastListing[0].ListingID.substring(3));
      listingId = 'LST' + String(lastId + 1).padStart(5, '0');
    } else {
      listingId = 'LST00001';
    }

    const title = req.body.title || `${room.RoomType} ${room.Area}m² - ${room.RoomCode}`;
    const description = req.body.description || room.Description || `Phòng ${room.RoomCode} với diện tích ${room.Area}m², giá ${room.Price.toLocaleString('vi-VN')}đ/tháng`;

    await connection.query(`
      INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [listingId, room.RoomID, landlordId, title, description]);

    // Đồng bộ Title sang bảng ROOM
    await connection.query(`
      UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()
      WHERE RoomID = ?
    `, [title, room.RoomID]);

    await connection.commit();

    res.json({
      success: true,
      message: `Đã publish phòng ${room.RoomCode}`,
      data: { listingId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Publish draft error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi publish' });
  } finally {
    connection.release();
  }
});

// Delete draft room
router.delete('/draft/:roomId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    // Verify ownership and draft status
    const [rooms] = await connection.query(
      'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = "draft"',
      [req.params.roomId, landlords[0].LandlordID]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng draft' });
    }

    // Delete room images first
    await connection.query(
      'DELETE FROM ROOM_IMAGE WHERE RoomID = ?',
      [req.params.roomId]
    );

    // Delete room
    await connection.query(
      'DELETE FROM ROOM WHERE RoomID = ?',
      [req.params.roomId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã xóa phòng draft'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete draft error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa draft' });
  } finally {
    connection.release();
  }
});

// Get current pending job
router.get('/current-job', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    // Get latest pending/processing job
    const [jobs] = await connection.query(
      'SELECT * FROM UPLOAD_JOB WHERE LandlordID = ? AND Status IN ("pending", "processing") ORDER BY CreatedAt DESC LIMIT 1',
      [landlords[0].LandlordID]
    );

    if (jobs.length === 0) {
      return res.json({ success: true, data: null });
    }

    const job = jobs[0];

    // Get details
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? ORDER BY RowNumber',
      [job.UploadJobID]
    );

    // Count status
    const pendingCount = details.filter(d => d.Status === 'pending').length;
    const successCount = details.filter(d => d.Status === 'success').length;
    const hasRoomIds = details.some(d => d.RoomID);
    const hasListingIds = details.some(d => d.ListingID);

    res.json({
      success: true,
      data: {
        job,
        details,
        stats: {
          total: details.length,
          pending: pendingCount,
          success: successCount,
          failed: details.filter(d => d.Status === 'failed').length,
          hasRoomIds,
          hasListingIds
        }
      }
    });
  } catch (error) {
    console.error('Get current job error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin job' });
  } finally {
    connection.release();
  }
});

const validDistricts = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Phú Nhuận', 'Quận Bình Tân', 'Quận Gò Vấp', 'Quận Thủ Đức',
  'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
];

const validateRow = (row) => {
  const errors = [];
  if (!row.roomCode) errors.push('Thiếu mã phòng');
  
  // Optional validations
  if (row.price && (isNaN(row.price) || row.price <= 0)) errors.push('Giá không hợp lệ');
  if (row.area && (isNaN(row.area) || row.area <= 0)) errors.push('Diện tích không hợp lệ');
  if (row.maxPeople && (isNaN(row.maxPeople) || row.maxPeople <= 0)) errors.push('Số người tối đa không hợp lệ');
  if (row.district && !validDistricts.includes(row.district)) errors.push('Quận không hợp lệ');
  
  return errors;
};

// Preview Excel data and save to upload_job
router.post('/preview-excel', upload.single('file'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
    }

    const buildingId = req.body.buildingId;
    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tòa nhà' });
    }

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Verify building ownership and get building's district
    const [buildings] = await connection.query(
      'SELECT BuildingID, LocationID, District FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [buildingId, landlordId]
    );

    if (buildings.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Không tìm thấy tòa nhà hoặc bạn không có quyền truy cập' });
    }

    const buildingDistrict = buildings[0].District;
    console.log('Building district:', buildingDistrict);

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Generate UploadJobID
    const [lastJob] = await connection.query(
      'SELECT UploadJobID FROM UPLOAD_JOB ORDER BY UploadJobID DESC LIMIT 1'
    );
    
    let uploadJobId;
    if (lastJob.length > 0) {
      const lastId = parseInt(lastJob[0].UploadJobID.substring(2));
      uploadJobId = 'UJ' + String(lastId + 1).padStart(8, '0');
    } else {
      uploadJobId = 'UJ' + String(1).padStart(8, '0');
    }

    // Create upload job with BuildingID
    try {
      await connection.query(`
        INSERT INTO UPLOAD_JOB (UploadJobID, LandlordID, BuildingID, Mode, FileName, TotalRows, Status)
        VALUES (?, ?, ?, 'single_building', ?, ?, 'pending')
      `, [uploadJobId, landlordId, buildingId, req.file.originalname, data.length]);
      console.log('Created UPLOAD_JOB:', uploadJobId);
    } catch (error) {
      console.error('Error creating UPLOAD_JOB:', error);
      await connection.rollback();
      throw error;
    }

    // Save details with district filtering
    const preview = [];
    let filteredCount = 0;
    let rowCounter = 1;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      
      const parsed = {
        roomCode: row['room_code'] || row['Mã phòng'] || '',
        title: row['title'] || row['Tiêu đề'] || '',
        price: (row['price'] || row['Giá']) ? parseFloat(row['price'] || row['Giá']) : 0,
        area: (row['area'] || row['Diện tích']) ? parseFloat(row['area'] || row['Diện tích']) : 20,
        maxPeople: (row['max_people'] || row['Số người tối đa']) ? parseInt(row['max_people'] || row['Số người tối đa']) : 1,
        district: row['district'] || row['Quận'] || '',
        ward: row['ward'] || row['Phường'] || '',
        address: row['address'] || row['Địa chỉ'] || '',
        roomType: row['room_type'] || row['Loại phòng'] || 'Phòng trọ',
        floorType: row['floor_type'] || row['Loại sàn'] || '',
        description: row['description'] || row['Mô tả'] || '',
        furniture: row['furniture'] || row['Nội thất'] || '',
        amenities: row['amenities'] || row['Tiện nghi'] || '',
        service: row['service'] || row['Dịch vụ'] || '',
        rules: row['rules'] || row['Nội quy'] || ''
      };

      // Filter by building's district - normalize district name for comparison
      const rowDistrict = (parsed.district || '').trim();
      const normalizedBuildingDistrict = (buildingDistrict || '').trim();
      
      if (rowDistrict && normalizedBuildingDistrict && rowDistrict === normalizedBuildingDistrict) {
        // Generate UploadDetailID (CHAR(10) max)
        const uploadDetailId = 'UD' + String(rowCounter).padStart(8, '0');
        
        try {
          await connection.query(`
            INSERT INTO UPLOAD_DETAIL (
              UploadDetailID, UploadJobID, BuildingID, RowNumber, RoomCode, Title, Price, Area, MaxPeople,
              Address, RoomType, Description, Furniture, Amenities, Service, Rules, FloorType, Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `, [
            uploadDetailId, uploadJobId, buildingId, rowCounter, parsed.roomCode, parsed.title, parsed.price,
            parsed.area, parsed.maxPeople, parsed.address, parsed.roomType, parsed.description,
            parsed.furniture, parsed.amenities, parsed.service, parsed.rules, parsed.floorType
          ]);
          console.log('Created UPLOAD_DETAIL:', uploadDetailId, 'for district:', rowDistrict);
        } catch (error) {
          console.error('Error creating UPLOAD_DETAIL:', error, 'for row:', index + 1);
          await connection.rollback();
          throw error;
        }

        preview.push(parsed);
        rowCounter++;
      } else {
        filteredCount++;
        console.log('Filtered out row:', index + 1, 'district:', rowDistrict, 'building district:', normalizedBuildingDistrict);
      }
    }

    // Update UPLOAD_JOB with actual filtered rows count
    await connection.query(
      'UPDATE UPLOAD_JOB SET TotalRows = ? WHERE UploadJobID = ?',
      [preview.length, uploadJobId]
    );

    await connection.commit();
    console.log('Transaction committed successfully. Filtered:', filteredCount, 'rows, Kept:', preview.length, 'rows');

    res.json({
      success: true,
      data: { 
        uploadJobId, 
        preview,
        stats: {
          totalRows: data.length,
          filteredRows: filteredCount,
          importRows: preview.length,
          buildingDistrict: buildingDistrict
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Preview Excel error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý file' });
  } finally {
    connection.release();
  }
});

// Get building info for upload (with district)
router.get('/building-info/:buildingId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const [buildings] = await connection.query(
      'SELECT BuildingID, BuildingName, District, Ward, Address FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [req.params.buildingId, landlords[0].LandlordID]
    );

    if (buildings.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tòa nhà' });
    }

    res.json({
      success: true,
      data: buildings[0]
    });
  } catch (error) {
    console.error('Get building info error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin tòa nhà' });
  } finally {
    connection.release();
  }
});

// Get upload job details
router.get('/upload-job/:jobId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const [job] = await connection.query(
      'SELECT * FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlords[0].LandlordID]
    );

    if (job.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy job' });
    }

    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? ORDER BY RowNumber',
      [req.params.jobId]
    );

    res.json({
      success: true,
      data: { job: job[0], details }
    });
  } catch (error) {
    console.error('Get upload job error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin' });
  } finally {
    connection.release();
  }
});

// Create single room from upload detail
router.post('/create-single/:jobId/:detailId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get upload detail
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadDetailID = ? AND UploadJobID = ?',
      [req.params.detailId, req.params.jobId]
    );

    if (details.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phòng' });
    }

    const detail = details[0];

    // Check if already created
    if (detail.RoomID) {
      await connection.rollback();
      return res.json({ 
        success: true, 
        message: 'Phòng đã được tạo',
        data: { roomId: detail.RoomID, detailId: detail.UploadDetailID }
      });
    }

    // Get building from upload detail
    let buildingId = detail.BuildingID;
    let locationId = null;

    if (buildingId) {
      const [buildings] = await connection.query(
        'SELECT BuildingID, LocationID FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
        [buildingId, landlordId]
      );

      if (buildings.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Không tìm thấy tòa nhà' });
      }

      locationId = buildings[0].LocationID;
    } else {
      // Fallback to default building if not specified
      const [buildings] = await connection.query(
        'SELECT BuildingID, LocationID FROM BUILDING WHERE LandlordID = ? ORDER BY CreatedAt DESC LIMIT 1',
        [landlordId]
      );

      if (buildings.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Vui lòng tạo tòa nhà trước' });
      }

      buildingId = buildings[0].BuildingID;
      locationId = buildings[0].LocationID;
    }

    // Bỏ qua kiểm tra trùng mã phòng - cho phép tạo phòng mới ngay cả khi mã giống nhau

    // Generate RoomID
    const [lastRoom] = await connection.query(
      'SELECT RoomID FROM ROOM ORDER BY RoomID DESC LIMIT 1'
    );
    
    let roomId;
    if (lastRoom.length > 0) {
      const lastId = parseInt(lastRoom[0].RoomID.substring(3));
      roomId = 'ROM' + String(lastId + 1).padStart(5, '0');
    } else {
      roomId = 'ROM00001';
    }

    // Create room with LocationID
    await connection.query(`
      INSERT INTO ROOM (
        RoomID, LandlordID, BuildingID, LocationID, RoomCode, RoomType, Area, Price, 
        MaxPeople, Description, Furniture, Amenities, Service, Rules, FloorType, Status, DraftStatus, CreatedAt, UpdatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'draft', NOW(), NOW())
    `, [
      roomId, landlordId, buildingId, locationId, detail.RoomCode, 
      detail.RoomType || 'Phòng trọ',
      detail.Area || 20, 
      detail.Price || 0, 
      detail.MaxPeople || 1, 
      detail.Description || '',
      detail.Furniture || '',
      detail.Amenities || '',
      detail.Service || '',
      detail.Rules || '',
      detail.FloorType || ''
    ]);

    // Insert into relational tables
    // 1. Insert Furniture
    if (detail.Furniture) {
      const furnitureItems = detail.Furniture.split(',').map(f => f.trim()).filter(f => f);
      for (const item of furnitureItems) {
        // Giới hạn độ dài tối đa 100 ký tự cho Name
        const furnitureName = item.length > 100 ? item.substring(0, 97) + '...' : item;
        
        // Check if furniture exists
        const [existingFurniture] = await connection.query(
          'SELECT FurnitureID FROM FURNITURE WHERE Name = ?',
          [furnitureName]
        );
        
        let furnitureId;
        if (existingFurniture.length > 0) {
          furnitureId = existingFurniture[0].FurnitureID;
        } else {
          // Create new furniture
          const [lastFurniture] = await connection.query(
            'SELECT FurnitureID FROM FURNITURE ORDER BY FurnitureID DESC LIMIT 1'
          );
          const lastId = lastFurniture.length > 0 ? parseInt(lastFurniture[0].FurnitureID.substring(3)) : 0;
          furnitureId = 'FUR' + String(lastId + 1).padStart(7, '0');
          
          await connection.query(
            'INSERT INTO FURNITURE (FurnitureID, Name, CreatedAt) VALUES (?, ?, NOW())',
            [furnitureId, furnitureName]
          );
        }
        
        // Link to room
        await connection.query(
          'INSERT IGNORE INTO ROOM_FURNITURE (RoomID, FurnitureID) VALUES (?, ?)',
          [roomId, furnitureId]
        );
      }
    }

    // 2. Insert Service
    if (detail.Service) {
      const serviceItems = detail.Service.split(',').map(s => s.trim()).filter(s => s);
      for (const item of serviceItems) {
        // Giới hạn độ dài tối đa 100 ký tự cho Name
        const serviceName = item.length > 100 ? item.substring(0, 97) + '...' : item;
        
        const [existingService] = await connection.query(
          'SELECT ServiceID FROM SERVICE WHERE Name = ?',
          [serviceName]
        );
        
        let serviceId;
        if (existingService.length > 0) {
          serviceId = existingService[0].ServiceID;
        } else {
          const [lastService] = await connection.query(
            'SELECT ServiceID FROM SERVICE ORDER BY ServiceID DESC LIMIT 1'
          );
          const lastId = lastService.length > 0 ? parseInt(lastService[0].ServiceID.substring(3)) : 0;
          serviceId = 'SRV' + String(lastId + 1).padStart(7, '0');
          
          await connection.query(
            'INSERT INTO SERVICE (ServiceID, Name, CreatedAt) VALUES (?, ?, NOW())',
            [serviceId, serviceName]
          );
        }
        
        await connection.query(
          'INSERT IGNORE INTO ROOM_SERVICE (RoomID, ServiceID) VALUES (?, ?)',
          [roomId, serviceId]
        );
      }
    }

    // 3. Insert Rules
    if (detail.Rules) {
      const ruleItems = detail.Rules.split(',').map(r => r.trim()).filter(r => r);
      for (const item of ruleItems) {
        // Giới hạn độ dài tối đa 100 ký tự cho Name
        const ruleName = item.length > 100 ? item.substring(0, 97) + '...' : item;
        
        const [existingRule] = await connection.query(
          'SELECT RuleID FROM RULE WHERE Name = ?',
          [ruleName]
        );
        
        let ruleId;
        if (existingRule.length > 0) {
          ruleId = existingRule[0].RuleID;
        } else {
          const [lastRule] = await connection.query(
            'SELECT RuleID FROM RULE ORDER BY RuleID DESC LIMIT 1'
          );
          const lastId = lastRule.length > 0 ? parseInt(lastRule[0].RuleID.substring(3)) : 0;
          ruleId = 'RUL' + String(lastId + 1).padStart(7, '0');
          
          await connection.query(
            'INSERT INTO RULE (RuleID, Name, CreatedAt) VALUES (?, ?, NOW())',
            [ruleId, ruleName]
          );
        }
        
        await connection.query(
          'INSERT IGNORE INTO ROOM_RULE (RoomID, RuleID) VALUES (?, ?)',
          [roomId, ruleId]
        );
      }
    }

    // Update upload detail
    await connection.query(
      'UPDATE UPLOAD_DETAIL SET Status = "success", RoomID = ? WHERE UploadDetailID = ?',
      [roomId, detail.UploadDetailID]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Đã tạo phòng ${detail.RoomCode}`,
      data: { roomId, detailId: detail.UploadDetailID }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create single room error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo phòng: ' + error.message });
  } finally {
    connection.release();
  }
});

// Bulk create rooms from upload job
router.post('/bulk-create/:jobId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get upload job
    const [jobs] = await connection.query(
      'SELECT * FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlordId]
    );

    if (jobs.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy job' });
    }

    // Get building from upload job
    const [jobInfo] = await connection.query(
      'SELECT BuildingID FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlordId]
    );

    if (jobInfo.length === 0 || !jobInfo[0].BuildingID) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin tòa nhà' });
    }

    const buildingId = jobInfo[0].BuildingID;

    const [buildings] = await connection.query(
      'SELECT BuildingID, LocationID FROM BUILDING WHERE BuildingID = ? AND LandlordID = ?',
      [buildingId, landlordId]
    );

    if (buildings.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Không tìm thấy tòa nhà' });
    }

    const defaultLocationId = buildings[0].LocationID;

    // Get pending details
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND Status = "pending" ORDER BY RowNumber',
      [req.params.jobId]
    );

    let successCount = 0;
    let failedCount = 0;
    const rooms = [];

    await connection.query(
      'UPDATE UPLOAD_JOB SET Status = "processing" WHERE UploadJobID = ?',
      [req.params.jobId]
    );

    for (const detail of details) {
      try {
        if (!detail.RoomCode) {
          await connection.query(
            'UPDATE UPLOAD_DETAIL SET Status = "failed", ErrorMessage = ? WHERE UploadDetailID = ?',
            ['Thiếu mã phòng', detail.UploadDetailID]
          );
          failedCount++;
          continue;
        }

        // Bỏ qua kiểm tra trùng mã phòng - cho phép tạo phòng mới ngay cả khi mã giống nhau

        // Find or create location - use building's location
        let locationId = defaultLocationId;

        // Generate RoomID
        const [lastRoom] = await connection.query(
          'SELECT RoomID FROM ROOM ORDER BY RoomID DESC LIMIT 1'
        );
        
        let roomId;
        if (lastRoom.length > 0) {
          const lastId = parseInt(lastRoom[0].RoomID.substring(3));
          roomId = 'ROM' + String(lastId + 1).padStart(5, '0');
        } else {
          roomId = 'ROM00001';
        }

        await connection.query(`
          INSERT INTO ROOM (
            RoomID, LandlordID, BuildingID, LocationID, RoomCode, RoomType, Area, Price, 
            MaxPeople, Description, Furniture, Amenities, Service, Rules, FloorType, Status, DraftStatus, CreatedAt, UpdatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'draft', NOW(), NOW())
        `, [
          roomId, landlordId, buildingId, locationId, detail.RoomCode, detail.RoomType,
          detail.Area, detail.Price, detail.MaxPeople, detail.Description,
          detail.Furniture || '', detail.Amenities || '', detail.Service || '', detail.Rules || '', detail.FloorType || ''
        ]);

        // Insert into relational tables
        // 1. Furniture
        if (detail.Furniture) {
          const furnitureItems = detail.Furniture.split(',').map(f => f.trim()).filter(f => f);
          for (const item of furnitureItems) {
            const furnitureName = item.length > 100 ? item.substring(0, 97) + '...' : item;
            const [existingFurniture] = await connection.query(
              'SELECT FurnitureID FROM FURNITURE WHERE Name = ?', [furnitureName]
            );
            let furnitureId;
            if (existingFurniture.length > 0) {
              furnitureId = existingFurniture[0].FurnitureID;
            } else {
              const [lastFurniture] = await connection.query(
                'SELECT FurnitureID FROM FURNITURE ORDER BY FurnitureID DESC LIMIT 1'
              );
              const lastId = lastFurniture.length > 0 ? parseInt(lastFurniture[0].FurnitureID.substring(3)) : 0;
              furnitureId = 'FUR' + String(lastId + 1).padStart(7, '0');
              await connection.query(
                'INSERT INTO FURNITURE (FurnitureID, Name, CreatedAt) VALUES (?, ?, NOW())',
                [furnitureId, furnitureName]
              );
            }
            await connection.query(
              'INSERT IGNORE INTO ROOM_FURNITURE (RoomID, FurnitureID) VALUES (?, ?)',
              [roomId, furnitureId]
            );
          }
        }

        // 2. Service
        if (detail.Service) {
          const serviceItems = detail.Service.split(',').map(s => s.trim()).filter(s => s);
          for (const item of serviceItems) {
            const serviceName = item.length > 100 ? item.substring(0, 97) + '...' : item;
            const [existingService] = await connection.query(
              'SELECT ServiceID FROM SERVICE WHERE Name = ?', [serviceName]
            );
            let serviceId;
            if (existingService.length > 0) {
              serviceId = existingService[0].ServiceID;
            } else {
              const [lastService] = await connection.query(
                'SELECT ServiceID FROM SERVICE ORDER BY ServiceID DESC LIMIT 1'
              );
              const lastId = lastService.length > 0 ? parseInt(lastService[0].ServiceID.substring(3)) : 0;
              serviceId = 'SRV' + String(lastId + 1).padStart(7, '0');
              await connection.query(
                'INSERT INTO SERVICE (ServiceID, Name, CreatedAt) VALUES (?, ?, NOW())',
                [serviceId, serviceName]
              );
            }
            await connection.query(
              'INSERT IGNORE INTO ROOM_SERVICE (RoomID, ServiceID) VALUES (?, ?)',
              [roomId, serviceId]
            );
          }
        }

        // 3. Rules
        if (detail.Rules) {
          const ruleItems = detail.Rules.split(',').map(r => r.trim()).filter(r => r);
          for (const item of ruleItems) {
            const ruleName = item.length > 100 ? item.substring(0, 97) + '...' : item;
            const [existingRule] = await connection.query(
              'SELECT RuleID FROM RULE WHERE Name = ?', [ruleName]
            );
            let ruleId;
            if (existingRule.length > 0) {
              ruleId = existingRule[0].RuleID;
            } else {
              const [lastRule] = await connection.query(
                'SELECT RuleID FROM RULE ORDER BY RuleID DESC LIMIT 1'
              );
              const lastId = lastRule.length > 0 ? parseInt(lastRule[0].RuleID.substring(3)) : 0;
              ruleId = 'RUL' + String(lastId + 1).padStart(7, '0');
              await connection.query(
                'INSERT INTO RULE (RuleID, Name, CreatedAt) VALUES (?, ?, NOW())',
                [ruleId, ruleName]
              );
            }
            await connection.query(
              'INSERT IGNORE INTO ROOM_RULE (RoomID, RuleID) VALUES (?, ?)',
              [roomId, ruleId]
            );
          }
        }

        await connection.query(
          'UPDATE UPLOAD_DETAIL SET Status = "success", RoomID = ? WHERE UploadDetailID = ?',
          [roomId, detail.UploadDetailID]
        );

        rooms.push({ roomId, roomCode: detail.RoomCode });
        successCount++;
      } catch (error) {
        console.error('Create room error:', error);
        await connection.query(
          'UPDATE UPLOAD_DETAIL SET Status = "failed", ErrorMessage = ? WHERE UploadDetailID = ?',
          [error.message, detail.UploadDetailID]
        );
        failedCount++;
      }
    }

    await connection.query(
      'UPDATE UPLOAD_JOB SET Status = "processing", SuccessRows = ?, FailedRows = ? WHERE UploadJobID = ?',
      [successCount, failedCount, req.params.jobId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Hoàn thành: ${successCount} thành công, ${failedCount} thất bại`,
      data: { successCount, failedCount, rooms }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk create rooms error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo phòng' });
  } finally {
    connection.release();
  }
});

// Bulk publish listings from upload job
router.post('/bulk-publish/:jobId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get details with RoomID (both newly created and linked to existing)
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND RoomID IS NOT NULL AND ListingID IS NULL',
      [req.params.jobId]
    );

    if (details.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Không có phòng nào để publish' });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const detail of details) {
      try {
        // Verify room ownership
        const [roomCheck] = await connection.query(
          'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
          [detail.RoomID, landlordId]
        );

        if (roomCheck.length === 0) {
          failedCount++;
          continue;
        }

        // Check if listing already exists for this room
        const [existingListings] = await connection.query(
          'SELECT ListingID, LandlordID FROM LISTING WHERE RoomID = ?',
          [detail.RoomID]
        );

        // If listing exists but belongs to different landlord, create new listing
        if (existingListings.length > 0 && existingListings[0].LandlordID !== landlordId) {
          // Generate new ListingID
          const [lastListing] = await connection.query(
            'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
          );
          
          let listingId;
          if (lastListing.length > 0) {
            const lastId = parseInt(lastListing[0].ListingID.substring(3));
            listingId = 'LST' + String(lastId + 1).padStart(5, '0');
          } else {
            listingId = 'LST00001';
          }

          const title = detail.Title || `${detail.RoomType} ${detail.Area}m² - ${detail.RoomCode}`;
          const description = detail.Description || `Phòng ${detail.RoomCode} với diện tích ${detail.Area}m², giá ${detail.Price.toLocaleString('vi-VN')}đ/tháng`;

          await connection.query(`
            INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
          `, [listingId, detail.RoomID, landlordId, title, description]);

          // Đồng bộ Title sang bảng ROOM
          await connection.query(`
            UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()
            WHERE RoomID = ?
          `, [title, detail.RoomID]);

          await connection.query(
            'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
            [listingId, detail.UploadDetailID]
          );

          successCount++;
          continue;
        }

        // If listing exists and belongs to current landlord
        if (existingListings.length > 0 && existingListings[0].LandlordID === landlordId) {
          await connection.query(
            'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
            [existingListings[0].ListingID, detail.UploadDetailID]
          );
          await connection.query(
            'UPDATE ROOM SET DraftStatus = "published" WHERE RoomID = ?',
            [detail.RoomID]
          );
          successCount++;
          continue;
        }

        // Generate ListingID
        const [lastListing] = await connection.query(
          'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
        );
        
        let listingId;
        if (lastListing.length > 0) {
          const lastId = parseInt(lastListing[0].ListingID.substring(3));
          listingId = 'LST' + String(lastId + 1).padStart(5, '0');
        } else {
          listingId = 'LST00001';
        }

        const title = detail.Title || `${detail.RoomType} ${detail.Area}m² - ${detail.RoomCode}`;
        const description = detail.Description || `Phòng ${detail.RoomCode} với diện tích ${detail.Area}m², giá ${detail.Price.toLocaleString('vi-VN')}đ/tháng`;

        await connection.query(`
          INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, [listingId, detail.RoomID, landlordId, title, description]);

        // Đồng bộ Title sang bảng ROOM
        await connection.query(`
          UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()
          WHERE RoomID = ?
        `, [title, detail.RoomID]);

        await connection.query(
          'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
          [listingId, detail.UploadDetailID]
        );

        successCount++;
      } catch (error) {
        console.error('Publish listing error:', error);
        failedCount++;
      }
    }

    // Check if all details are completed
    const [allDetails] = await connection.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN ListingID IS NOT NULL THEN 1 ELSE 0 END) as published FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND RoomID IS NOT NULL',
      [req.params.jobId]
    );

    if (allDetails[0].total === allDetails[0].published) {
      await connection.query(
        'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',
        [req.params.jobId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Đã publish ${successCount} tin đăng`,
      data: { successCount, failedCount }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk publish error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi publish' });
  } finally {
    connection.release();
  }
});

// Publish single room
router.post('/publish-single/:jobId/:detailId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get detail
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadDetailID = ? AND UploadJobID = ? AND RoomID IS NOT NULL',
      [req.params.detailId, req.params.jobId]
    );

    if (details.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    }

    const detail = details[0];

    // Check if already published
    if (detail.ListingID) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Phòng đã được publish' });
    }

    // Verify room ownership
    const [roomCheck] = await connection.query(
      'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
      [detail.RoomID, landlordId]
    );

    if (roomCheck.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập phòng này' });
    }

    // Check if listing already exists
    const [existingListings] = await connection.query(
      'SELECT ListingID, LandlordID FROM LISTING WHERE RoomID = ?',
      [detail.RoomID]
    );

    // If listing exists but belongs to different landlord, create new listing
    if (existingListings.length > 0 && existingListings[0].LandlordID !== landlordId) {
      // Generate new ListingID
      const [lastListing] = await connection.query(
        'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
      );
      
      let listingId;
      if (lastListing.length > 0) {
        const lastId = parseInt(lastListing[0].ListingID.substring(3));
        listingId = 'LST' + String(lastId + 1).padStart(5, '0');
      } else {
        listingId = 'LST00001';
      }

      const title = detail.Title || `${detail.RoomType} ${detail.Area}m² - ${detail.RoomCode}`;
      const description = detail.Description || `Phòng ${detail.RoomCode} với diện tích ${detail.Area}m², giá ${detail.Price.toLocaleString('vi-VN')}đ/tháng`;

      await connection.query(`
        INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [listingId, detail.RoomID, landlordId, title, description]);

      // Đồng bộ Title sang bảng ROOM
      await connection.query(`
        UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()
        WHERE RoomID = ?
      `, [title, detail.RoomID]);

      await connection.query(
        'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
        [listingId, detail.UploadDetailID]
      );

      // Check if all details are completed
      const [allDetails] = await connection.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN ListingID IS NOT NULL THEN 1 ELSE 0 END) as published FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND RoomID IS NOT NULL',
        [req.params.jobId]
      );

      if (allDetails[0].total === allDetails[0].published) {
        await connection.query(
          'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',
          [req.params.jobId]
        );
      }

      await connection.commit();
      return res.json({ success: true, message: 'Đã tạo listing mới', data: { listingId } });
    }

    // If listing exists and belongs to current landlord
    if (existingListings.length > 0 && existingListings[0].LandlordID === landlordId) {
      await connection.query(
        'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
        [existingListings[0].ListingID, detail.UploadDetailID]
      );

      // Check if all details are completed
      const [allDetails] = await connection.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN ListingID IS NOT NULL THEN 1 ELSE 0 END) as published FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND RoomID IS NOT NULL',
        [req.params.jobId]
      );

      if (allDetails[0].total === allDetails[0].published) {
        await connection.query(
          'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',
          [req.params.jobId]
        );
      }

      await connection.commit();
      return res.json({ success: true, message: 'Phòng đã có tin đăng', data: { listingId: existingListings[0].ListingID } });
    }

    // Generate ListingID
    const [lastListing] = await connection.query(
      'SELECT ListingID FROM LISTING ORDER BY ListingID DESC LIMIT 1'
    );
    
    let listingId;
    if (lastListing.length > 0) {
      const lastId = parseInt(lastListing[0].ListingID.substring(3));
      listingId = 'LST' + String(lastId + 1).padStart(5, '0');
    } else {
      listingId = 'LST00001';
    }

    const title = detail.Title || `${detail.RoomType} ${detail.Area}m² - ${detail.RoomCode}`;
    const description = detail.Description || `Phòng ${detail.RoomCode} với diện tích ${detail.Area}m², giá ${detail.Price.toLocaleString('vi-VN')}đ/tháng`;

    await connection.query(`
      INSERT INTO LISTING (ListingID, RoomID, LandlordID, Title, Description, IsVisible, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [listingId, detail.RoomID, landlordId, title, description]);

    // Đồng bộ Title sang bảng ROOM
    await connection.query(`
      UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()
      WHERE RoomID = ?
    `, [title, detail.RoomID]);

    await connection.query(
      'UPDATE UPLOAD_DETAIL SET ListingID = ? WHERE UploadDetailID = ?',
      [listingId, detail.UploadDetailID]
    );

    // Check if all details are completed
    const [allDetails] = await connection.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN ListingID IS NOT NULL THEN 1 ELSE 0 END) as published FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND RoomID IS NOT NULL',
      [req.params.jobId]
    );

    if (allDetails[0].total === allDetails[0].published) {
      await connection.query(
        'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',
        [req.params.jobId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Đã publish phòng ${detail.RoomCode}`,
      data: { listingId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Publish single error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi publish' });
  } finally {
    connection.release();
  }
});

// Unpublish single room
router.post('/unpublish-single/:jobId/:detailId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlords[0].LandlordID;

    // Get detail
    const [details] = await connection.query(
      'SELECT * FROM UPLOAD_DETAIL WHERE UploadDetailID = ? AND UploadJobID = ?',
      [req.params.detailId, req.params.jobId]
    );

    if (details.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    }

    const detail = details[0];

    if (!detail.ListingID) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Phòng chưa được publish' });
    }

    // Verify ownership
    const [listings] = await connection.query(
      'SELECT ListingID FROM LISTING WHERE ListingID = ? AND LandlordID = ?',
      [detail.ListingID, landlordId]
    );

    if (listings.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    // Delete listing
    await connection.query(
      'DELETE FROM LISTING WHERE ListingID = ?',
      [detail.ListingID]
    );

    // Xóa Title trong ROOM và update back to draft
    await connection.query(
      'UPDATE ROOM SET Title = NULL, DraftStatus = "draft", UpdatedAt = NOW() WHERE RoomID = ?',
      [detail.RoomID]
    );

    // Clear ListingID from upload detail
    await connection.query(
      'UPDATE UPLOAD_DETAIL SET ListingID = NULL WHERE UploadDetailID = ?',
      [detail.UploadDetailID]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Đã hủy publish phòng ${detail.RoomCode}`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Unpublish single error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi hủy publish' });
  } finally {
    connection.release();
  }
});

// Delete/Cancel job
router.delete('/job/:jobId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    // Verify ownership
    const [jobs] = await connection.query(
      'SELECT * FROM UPLOAD_JOB WHERE UploadJobID = ? AND LandlordID = ?',
      [req.params.jobId, landlords[0].LandlordID]
    );

    if (jobs.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy job' });
    }

    // Delete details first
    await connection.query(
      'DELETE FROM UPLOAD_DETAIL WHERE UploadJobID = ?',
      [req.params.jobId]
    );

    // Delete job
    await connection.query(
      'DELETE FROM UPLOAD_JOB WHERE UploadJobID = ?',
      [req.params.jobId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã xóa job thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa job' });
  } finally {
    connection.release();
  }
});

module.exports = router;
