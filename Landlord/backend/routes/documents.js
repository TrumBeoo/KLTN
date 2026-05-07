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
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file' });
    }

    const { type, title, roomId, isPrivate } = req.body;
    const accountId = req.user.accountId;

    if (!type || !title) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Chỉ chấp nhận file PDF, DOCX, JPG, PNG' });
    }

    const fileType = req.file.mimetype.split('/')[1];
    const isImage = ['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(fileType);
    const resourceType = isImage ? 'image' : 'raw';

    const uploadResult = await cloudinaryService.uploadDocument(req.file.buffer, type, { resource_type: resourceType });

    const [lastDoc] = await connection.query('SELECT DocumentID FROM DOCUMENT ORDER BY DocumentID DESC LIMIT 1');
    let documentId = 'DOC00001';
    if (lastDoc.length > 0) {
      const lastId = parseInt(lastDoc[0].DocumentID.substring(3));
      documentId = 'DOC' + String(lastId + 1).padStart(5, '0');
    }

    await connection.beginTransaction();

    const isAllRooms = roomId === 'all' ? 1 : 0;
    const finalRoomId = (roomId === 'all' || !roomId) ? null : roomId;
    const isPrivateVal = isPrivate === 'true' || isPrivate === true ? 1 : 0;

    await connection.query(
      `INSERT INTO DOCUMENT (DocumentID, RoomID, Type, Title, FileURL, PublicID, FileType, FileSize, ResourceType, UploadedBy, IsPrivate, IsAllRooms, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [documentId, finalRoomId, type, title, uploadResult.secure_url, uploadResult.public_id,
       fileType, req.file.size, resourceType, accountId, isPrivateVal, isAllRooms]
    );

    await connection.commit();

    const [verifyDoc] = await connection.query('SELECT * FROM DOCUMENT WHERE DocumentID = ?', [documentId]);
    res.json({ success: true, message: 'Upload tài liệu thành công', documentId, data: verifyDoc[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  } finally {
    connection.release();
  }
});

// Get documents by room ID (for tenants) - includes IsAllRooms docs
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

// Update document
router.put('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, type, roomId, isPrivate } = req.body;
    const accountId = req.user.accountId;

    const [doc] = await pool.query(
      'SELECT * FROM DOCUMENT WHERE DocumentID = ? AND UploadedBy = ?',
      [documentId, accountId]
    );
    if (!doc.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' });
    }

    const isAllRooms = roomId === 'all' ? 1 : 0;
    const finalRoomId = (roomId === 'all' || !roomId) ? null : roomId;

    await pool.query(
      'UPDATE DOCUMENT SET Title=?, Type=?, RoomID=?, IsPrivate=?, IsAllRooms=?, UpdatedAt=NOW() WHERE DocumentID=?',
      [title, type, finalRoomId, isPrivate ? 1 : 0, isAllRooms, documentId]
    );

    res.json({ success: true, message: 'Cập nhật tài liệu thành công' });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Delete document
router.delete('/:documentId', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { documentId } = req.params;
    const accountId = req.user.accountId;

    const [document] = await connection.query(
      'SELECT * FROM DOCUMENT WHERE DocumentID = ? AND UploadedBy = ?',
      [documentId, accountId]
    );

    if (!document.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' });
    }

    await connection.beginTransaction();
    await connection.query('DELETE FROM DOCUMENT WHERE DocumentID = ?', [documentId]);
    await connection.commit();

    if (document[0].PublicID) {
      try {
        await cloudinaryService.deleteFile(document[0].PublicID, document[0].ResourceType || 'raw');
      } catch (cloudError) {
        console.error('Cloudinary delete error (non-critical):', cloudError);
      }
    }

    res.json({ success: true, message: 'Xóa tài liệu thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  } finally {
    connection.release();
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
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' });
    }

    res.json({ success: true, data: document[0] });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;
