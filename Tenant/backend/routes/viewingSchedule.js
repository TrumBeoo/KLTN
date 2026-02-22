const express = require('express');
const router = express.Router();
const viewingScheduleService = require('../services/viewingScheduleService');
const authMiddleware = require('../middleware/auth');

// Get user's schedule for a room
router.get('/schedule/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const tenantInfo = await viewingScheduleService.getTenantInfo(req.user.accountId);
    if (!tenantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    const schedule = await viewingScheduleService.getUserScheduleForRoom(tenantInfo.TenantID, roomId);
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch xem'
    });
  }
});

// Cancel viewing schedule
router.delete('/schedule/:scheduleId', authMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const tenantInfo = await viewingScheduleService.getTenantInfo(req.user.accountId);
    if (!tenantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    const result = await viewingScheduleService.cancelSchedule(scheduleId, tenantInfo.TenantID);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch xem hoặc không có quyền hủy'
      });
    }

    res.json({
      success: true,
      message: 'Hủy lịch xem thành công'
    });
  } catch (error) {
    console.error('Cancel schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy lịch xem'
    });
  }
});

// Create viewing schedule
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const { roomId, date, time } = req.body;

    if (!roomId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    // Get tenant info
    const tenantInfo = await viewingScheduleService.getTenantInfo(req.user.accountId);
    if (!tenantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    // Get room info and check availability
    const roomInfo = await viewingScheduleService.getRoomInfo(roomId);
    if (!roomInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Check if room is available for viewing
    if (roomInfo.Status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Phòng này hiện không khả dụng để đặt lịch xem'
      });
    }

    // Check if user already has a pending/approved schedule for this room
    const existingSchedule = await viewingScheduleService.getUserScheduleForRoom(tenantInfo.TenantID, roomId);
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có lịch xem cho phòng này rồi'
      });
    }

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);

    // Create schedule
    const scheduleId = await viewingScheduleService.createSchedule(
      tenantInfo.TenantID,
      roomId,
      dateTime
    );

    res.status(201).json({
      success: true,
      message: 'Đặt lịch xem phòng thành công',
      scheduleId,
      roomInfo
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lịch xem phòng'
    });
  }
});

module.exports = router;
