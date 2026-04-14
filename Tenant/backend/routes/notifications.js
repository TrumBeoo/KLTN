const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middleware/auth');

// Lấy số lượng thông báo chưa đọc (PHẢI ĐẶT TRƯỚC route /:notificationId)
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.accountId);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số thông báo chưa đọc'
    });
  }
});

// Lấy danh sách thông báo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const notifications = await notificationService.getNotifications(
      req.user.accountId,
      parseInt(limit),
      parseInt(offset)
    );

    const unreadCount = await notificationService.getUnreadCount(req.user.accountId);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông báo'
    });
  }
});

// Tạo thông báo (internal API - không cần auth)
router.post('/create', async (req, res) => {
  try {
    console.log('=== Received notification create request ===');
    console.log('Body:', req.body);
    
    const { targetId, content, type, link } = req.body;

    if (!targetId || !content || !type) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const notificationId = await notificationService.createNotification(targetId, content, type, link || null);
    
    console.log('Notification created successfully:', notificationId);

    res.json({
      success: true,
      notificationId,
      message: 'Tạo thông báo thành công'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thông báo',
      error: error.message
    });
  }
});

// Đánh dấu tất cả thông báo là đã đọc
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.accountId);

    res.json({
      success: true,
      message: `Đánh dấu ${count} thông báo là đã đọc`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo'
    });
  }
});

// Đánh dấu thông báo là đã đọc
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await notificationService.markAsRead(notificationId, req.user.accountId);

    if (result) {
      res.json({
        success: true,
        message: 'Đánh dấu thông báo là đã đọc'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo'
    });
  }
});

// Xóa tất cả thông báo
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const count = await notificationService.deleteAllNotifications(req.user.accountId);

    res.json({
      success: true,
      message: `Xóa ${count} thông báo thành công`
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo'
    });
  }
});

// Xóa thông báo
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await notificationService.deleteNotification(notificationId, req.user.accountId);

    if (result) {
      res.json({
        success: true,
        message: 'Xóa thông báo thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo'
    });
  }
});

module.exports = router;
