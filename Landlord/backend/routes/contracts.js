const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX'));
    }
  }
});

// Create contract after landlord confirms rental
router.post('/', authMiddleware, upload.single('contractFile'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      roomId,
      tenantId,
      startDate,
      endDate,
      depositAmount,
      monthlyRent,
      paymentCycle,
      renewalOption
    } = req.body;

    if (!roomId || !startDate || !endDate || !depositAmount || !monthlyRent) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin hợp đồng'
      });
    }

    await connection.beginTransaction();

    // Get LandlordID
    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const landlordId = landlords[0].LandlordID;

    // Verify room belongs to landlord
    const [rooms] = await connection.query(
      'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ?',
      [roomId, landlordId]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Generate ContractID
    const [lastContract] = await connection.query(
      'SELECT ContractID FROM CONTRACT ORDER BY ContractID DESC LIMIT 1'
    );
    
    let contractId;
    if (lastContract.length > 0) {
      const lastId = parseInt(lastContract[0].ContractID.substring(3));
      contractId = 'CTR' + String(lastId + 1).padStart(5, '0');
    } else {
      contractId = 'CTR00001';
    }

    // Upload contract file if provided
    let contractFileURL = null;
    let contractFilePublicID = null;
    
    if (req.file) {
      try {
        console.log('Uploading contract file:', req.file.originalname, `(${(req.file.size / 1024).toFixed(2)} KB)`);
        const result = await cloudinaryService.uploadDocument(
          req.file.buffer,
          `contracts/${contractId}`,
          { resource_type: 'raw' }
        );
        contractFileURL = result.secure_url;
        contractFilePublicID = result.public_id;
        console.log('Contract file uploaded successfully');
      } catch (uploadError) {
        console.error('Failed to upload contract file:', uploadError.message);
        // Tiếp tục tạo hợp đồng mà không có file
        // Không rollback transaction
      }
    }

    // Create contract
    await connection.query(
      `INSERT INTO CONTRACT (
        ContractID, RoomID, LandlordID, TenantID, StartDate, EndDate,
        DepositAmount, MonthlyRent, PaymentCycle, ContractFileURL, 
        ContractFilePublicID, RenewalOption, Status, CreatedAt, UpdatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [
        contractId, roomId, landlordId, tenantId || null, startDate, endDate,
        depositAmount, monthlyRent, paymentCycle || 'monthly',
        contractFileURL, contractFilePublicID, renewalOption !== 'false'
      ]
    );

    // Update room status to rented
    await connection.query(
      `UPDATE ROOM SET Status = 'rented', UpdatedAt = NOW() WHERE RoomID = ?`,
      [roomId]
    );

    // Hide listing
    await connection.query(
      `UPDATE LISTING SET IsVisible = 0, UpdatedAt = NOW() WHERE RoomID = ?`,
      [roomId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Tạo hợp đồng thành công',
      contractId: contractId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Get all contracts for landlord
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
    const { status } = req.query;

    let query = `
      SELECT c.*, 
             r.RoomCode, r.RoomType, r.Price,
             b.BuildingName,
             t.Name as TenantName, t.Phone as TenantPhone, t.Email as TenantEmail,
             DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining
      FROM CONTRACT c
      LEFT JOIN ROOM r ON c.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN TENANT t ON c.TenantID = t.TenantID
      WHERE c.LandlordID = ?
    `;
    const params = [landlordId];

    if (status) {
      query += ` AND c.Status = ?`;
      params.push(status);
    }

    query += ` ORDER BY c.EndDate ASC`;

    const [contracts] = await db.query(query, params);

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get contract by ID
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

    const [contracts] = await db.query(
      `SELECT c.*, 
             r.RoomCode, r.RoomType, r.Price, r.Area,
             b.BuildingName, b.Address,
             t.Name as TenantName, t.Phone as TenantPhone, t.Email as TenantEmail,
             DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining
       FROM CONTRACT c
       LEFT JOIN ROOM r ON c.RoomID = r.RoomID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       LEFT JOIN TENANT t ON c.TenantID = t.TenantID
       WHERE c.ContractID = ? AND c.LandlordID = ?`,
      [req.params.id, landlordId]
    );

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    res.json({
      success: true,
      data: contracts[0]
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Update contract
router.put('/:id', authMiddleware, upload.single('contractFile'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      startDate,
      endDate,
      depositAmount,
      monthlyRent,
      paymentCycle,
      renewalOption,
      status
    } = req.body;

    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const landlordId = landlords[0].LandlordID;

    // Check contract ownership
    const [contracts] = await connection.query(
      'SELECT * FROM CONTRACT WHERE ContractID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (contracts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    const contract = contracts[0];

    // Upload new contract file if provided
    let contractFileURL = contract.ContractFileURL;
    let contractFilePublicID = contract.ContractFilePublicID;
    
    if (req.file) {
      try {
        // Delete old file
        if (contract.ContractFilePublicID) {
          try {
            await cloudinaryService.deleteFile(contract.ContractFilePublicID, 'raw');
          } catch (deleteError) {
            console.error('Failed to delete old contract file:', deleteError.message);
          }
        }
        
        console.log('Uploading new contract file:', req.file.originalname, `(${(req.file.size / 1024).toFixed(2)} KB)`);
        const result = await cloudinaryService.uploadDocument(
          req.file.buffer,
          `contracts/${req.params.id}`,
          { resource_type: 'raw' }
        );
        contractFileURL = result.secure_url;
        contractFilePublicID = result.public_id;
        console.log('New contract file uploaded successfully');
      } catch (uploadError) {
        console.error('Failed to upload new contract file:', uploadError.message);
        // Giữ nguyên file cũ nếu upload thất bại
      }
    }

    // Update contract
    await connection.query(
      `UPDATE CONTRACT SET
        StartDate = ?,
        EndDate = ?,
        DepositAmount = ?,
        MonthlyRent = ?,
        PaymentCycle = ?,
        ContractFileURL = ?,
        ContractFilePublicID = ?,
        RenewalOption = ?,
        Status = ?,
        UpdatedAt = NOW()
      WHERE ContractID = ?`,
      [
        startDate || contract.StartDate,
        endDate || contract.EndDate,
        depositAmount || contract.DepositAmount,
        monthlyRent || contract.MonthlyRent,
        paymentCycle || contract.PaymentCycle,
        contractFileURL,
        contractFilePublicID,
        renewalOption !== undefined ? renewalOption : contract.RenewalOption,
        status || contract.Status,
        req.params.id
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Cập nhật hợp đồng thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Terminate contract
router.put('/:id/terminate', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const landlordId = landlords[0].LandlordID;

    const [contracts] = await connection.query(
      'SELECT * FROM CONTRACT WHERE ContractID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (contracts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    const contract = contracts[0];

    // Update contract status và lưu thời điểm chấm dứt
    await connection.query(
      `UPDATE CONTRACT SET Status = 'terminated', TerminatedAt = NOW(), UpdatedAt = NOW() WHERE ContractID = ?`,
      [req.params.id]
    );

    // Update room status to available
    await connection.query(
      `UPDATE ROOM SET Status = 'available', UpdatedAt = NOW() WHERE RoomID = ?`,
      [contract.RoomID]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã chấm dứt hợp đồng'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Terminate contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

// Delete contract immediately (only for terminated contracts)
router.delete('/:id', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [landlords] = await connection.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [req.user.accountId]
    );

    if (landlords.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const landlordId = landlords[0].LandlordID;

    const [contracts] = await connection.query(
      'SELECT * FROM CONTRACT WHERE ContractID = ? AND LandlordID = ?',
      [req.params.id, landlordId]
    );

    if (contracts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    const contract = contracts[0];

    // Chỉ cho phép xóa hợp đồng đã chấm dứt
    if (contract.Status !== 'terminated') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xóa hợp đồng đã chấm dứt'
      });
    }

    // Xóa file hợp đồng trên Cloudinary nếu có
    if (contract.ContractFilePublicID) {
      try {
        await cloudinaryService.deleteFile(contract.ContractFilePublicID, 'raw');
      } catch (error) {
        console.error('Failed to delete contract file:', error);
      }
    }

    // Xóa hợp đồng
    await connection.query(
      'DELETE FROM CONTRACT WHERE ContractID = ?',
      [req.params.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đã xóa hợp đồng'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
