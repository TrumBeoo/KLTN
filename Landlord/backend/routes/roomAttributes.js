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

module.exports = router;
