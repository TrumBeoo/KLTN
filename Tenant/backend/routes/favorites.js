const express = require('express');
const router = express.Router();
const favoriteService = require('../services/favoriteService');
const authMiddleware = require('../middleware/auth');

// Check if room is favorited
router.get('/check/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const accountId = req.user.accountId;
    
    // Get tenantId from accountId
    const db = require('../config/database');
    const [tenant] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenant || tenant.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }
    
    const tenantId = tenant[0].TenantID;
    const isFavorite = await favoriteService.checkFavorite(tenantId, roomId);
    
    res.json({
      success: true,
      isFavorite
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra yêu thích'
    });
  }
});

// Add to favorites
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.body;
    const accountId = req.user.accountId;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin phòng'
      });
    }
    
    // Get tenantId from accountId
    const db = require('../config/database');
    const [tenant] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenant || tenant.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }
    
    const tenantId = tenant[0].TenantID;
    const result = await favoriteService.addFavorite(tenantId, roomId);
    
    res.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: result
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thêm yêu thích'
    });
  }
});

// Remove from favorites
router.delete('/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const accountId = req.user.accountId;
    
    // Get tenantId from accountId
    const db = require('../config/database');
    const [tenant] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenant || tenant.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }
    
    const tenantId = tenant[0].TenantID;
    await favoriteService.removeFavorite(tenantId, roomId);
    
    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa yêu thích'
    });
  }
});

// Get all favorites
router.get('/', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.accountId;
    
    // Get tenantId from accountId
    const db = require('../config/database');
    const [tenant] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenant || tenant.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }
    
    const tenantId = tenant[0].TenantID;
    const favorites = await favoriteService.getFavorites(tenantId);
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu thích'
    });
  }
});

module.exports = router;
