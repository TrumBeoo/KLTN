const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const cloudinaryService = require('../services/cloudinaryService');
const pool = require('../config/database');

const upload = multer({ storage: multer.memoryStorage() });

// Get all documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, roomId } = req.query;
    const accountId = req.user.accountId;

    // Get landlord ID
    const [landlord] = await pool.query(
      'SELECT LandlordID FROM LANDLORD WHERE AccountID = ?',
      [accountId]
    );

    if (!landlord.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin chủ nhà' });
    }

    const landlordId = landlord[0].LandlordID;

    let query = `
      SELECT d.*, r.RoomCode, r.BuildingID, b.BuildingName
      FROM DOCUMENT d
      LEFT JOIN ROOM r ON d.RoomID = r.RoomID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      WHERE d.UploadedBy = ?
    `;
    const params = [accountId];

    if (type) {
      query += ' AND d.Type = ?';
      params.push(type);
    }

    if (roomId) {
      query += ' AND d.RoomID = ?';
      params.push(roomId);
    }

    query += ' ORDER BY d.CreatedAt DESC';

    const [documents] = await pool.query(query, params);

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file'
      });
    }

    const { type, title, roomId, isPrivate } = req.body;
    const accountId = req.user.accountId;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận file PDF, DOCX, JPG, PNG'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadDocument(
      req.file.buffer,
      type
    );

    // Generate document ID
    const [lastDoc] = await pool.query(
      'SELECT DocumentID FROM DOCUMENT ORDER BY DocumentID DESC LIMIT 1'
    );
    let documentId = 'DOC00001';
    if (lastDoc.length > 0) {
      const lastId = parseInt(lastDoc[0].DocumentID.substring(3));
      documentId = 'DOC' + String(lastId + 1).padStart(5, '0');
    }

    // Get file extension and resource type
    const fileType = req.file.mimetype.split('/')[1];
    const resourceType = ['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(fileType) ? 'image' : 'raw';

    // Insert to database
    await pool.query(
      `INSERT INTO DOCUMENT 
      (DocumentID, RoomID, Type, Title, FileURL, PublicID, FileType, FileSize, ResourceType, UploadedBy, IsPrivate, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        documentId,
        roomId || null,
        type,
        title,
        uploadResult.secure_url,
        uploadResult.public_id,
        fileType,
        req.file.size,
        resourceType,
        accountId,
        isPrivate === 'true' || isPrivate === true ? 1 : 0
      ]
    );

    res.json({
      success: true,
      message: 'Upload tài liệu thành công',
      documentId
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Delete document
router.delete('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const accountId = req.user.accountId;

    // Get document info
    const [document] = await pool.query(
      'SELECT * FROM DOCUMENT WHERE DocumentID = ? AND UploadedBy = ?',
      [documentId, accountId]
    );

    if (!document.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    // Delete from Cloudinary
    if (document[0].PublicID) {
      const resourceType = document[0].ResourceType || 'raw';
      await cloudinaryService.deleteFile(document[0].PublicID, resourceType);
    }

    // Delete from database
    await pool.query('DELETE FROM DOCUMENT WHERE DocumentID = ?', [documentId]);

    res.json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get document by ID
router.get('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const accountId = req.user.accountId;

    const [document] = await pool.query(
      `SELECT d.*, r.RoomCode, b.BuildingName
       FROM DOCUMENT d
       LEFT JOIN ROOM r ON d.RoomID = r.RoomID
       LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
       WHERE d.DocumentID = ? AND d.UploadedBy = ?`,
      [documentId, accountId]
    );

    if (!document.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    res.json({
      success: true,
      data: document[0]
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
