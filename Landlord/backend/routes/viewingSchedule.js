const express = require('express');
const router = express.Router();
const viewingScheduleService = require('../services/viewingScheduleService');
const authMiddleware = require('../middleware/auth');

// Get all viewing schedules for landlord
router.get('/', authMiddleware, async (req, res) => {
  try {
    const landlordId = await viewingScheduleService.getLandlordId(req.user.accountId);
    
    if (!landlordId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    const schedules = await viewingScheduleService.getSchedulesByLandlord(landlordId);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch xem'
    });
  }
});

// Approve viewing schedule
router.put('/:scheduleId/approve', authMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = await viewingScheduleService.getLandlordId(req.user.accountId);
    
    if (!landlordId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    await viewingScheduleService.approveSchedule(scheduleId, landlordId);

    res.json({
      success: true,
      message: 'Xác nhận lịch xem thành công'
    });
  } catch (error) {
    console.error('Approve schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xác nhận lịch xem'
    });
  }
});

// Reject viewing schedule
router.put('/:scheduleId/reject', authMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = await viewingScheduleService.getLandlordId(req.user.accountId);
    
    if (!landlordId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    await viewingScheduleService.rejectSchedule(scheduleId, landlordId);

    res.json({
      success: true,
      message: 'Từ chối lịch xem thành công'
    });
  } catch (error) {
    console.error('Reject schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi từ chối lịch xem'
    });
  }
});

// Cancel viewing schedule
router.delete('/:scheduleId', authMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = await viewingScheduleService.getLandlordId(req.user.accountId);
    
    if (!landlordId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin chủ nhà'
      });
    }

    await viewingScheduleService.cancelSchedule(scheduleId, landlordId);

    res.json({
      success: true,
      message: 'Hủy lịch xem thành công'
    });
  } catch (error) {
    console.error('Cancel schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi hủy lịch xem'
    });
  }
});

module.exports = router;
