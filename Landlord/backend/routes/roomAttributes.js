const express = require('express');
const router = express.Router();
const roomAttributeService = require('../services/roomAttributeService');

// Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await roomAttributeService.getAllServices();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách dịch vụ' });
  }
});

// Get all furniture
router.get('/furniture', async (req, res) => {
  try {
    const furniture = await roomAttributeService.getAllFurniture();
    res.json({ success: true, data: furniture });
  } catch (error) {
    console.error('Get furniture error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách nội thất' });
  }
});

// Get all rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await roomAttributeService.getAllRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách quy định' });
  }
});

// Get all room types
router.get('/room-types', async (req, res) => {
  try {
    const roomTypes = await roomAttributeService.getAllRoomTypes();
    res.json({ success: true, data: roomTypes });
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách loại phòng' });
  }
});

// Get all amenities
router.get('/amenities', async (req, res) => {
  try {
    const amenities = await roomAttributeService.getAllAmenities();
    res.json({ success: true, data: amenities });
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tiện nghi' });
  }
});

// Create new amenity
router.post('/amenities', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên tiện nghi' });
    }
    const amenityId = await roomAttributeService.createAmenity(name, description);
    res.json({ success: true, message: 'Thêm tiện nghi thành công', amenityId });
  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thêm tiện nghi' });
  }
});

module.exports = router;
