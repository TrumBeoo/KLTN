const express = require('express');
const router = express.Router();
const MovingService = require('../services/movingService');
const authMiddleware = require('../middleware/auth');
const providerAuthMiddleware = require('../middleware/providerAuth');

// GET /api/moving/categories - Lấy danh sách danh mục
router.get('/categories', async (req, res) => {
  try {
    const categories = await MovingService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải danh mục' });
  }
});

// GET /api/moving/services - Lấy danh sách dịch vụ
router.get('/services', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const services = await MovingService.getServices(categoryId);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải dịch vụ' });
  }
});

// GET /api/moving/services/:id - Lấy chi tiết dịch vụ
router.get('/services/:id', async (req, res) => {
  try {
    const service = await MovingService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải dịch vụ' });
  }
});

// POST /api/moving/calculate-price - Tính giá dự kiến
router.post('/calculate-price', async (req, res) => {
  try {
    const { serviceId, distanceKm, floorFrom, floorTo, hasElevator } = req.body;
    
    const service = await MovingService.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    const price = MovingService.calculatePrice(
      service,
      parseFloat(distanceKm) || 0,
      parseInt(floorFrom) || 0,
      parseInt(floorTo) || 0,
      hasElevator === true || hasElevator === 'true'
    );

    res.json({ success: true, data: price });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tính giá' });
  }
});

// POST /api/moving/bookings - Tạo booking mới (cần auth)
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.userId; // Đây là AccountID
    
    // Lấy TenantID từ AccountID
    const db = require('../config/database');
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người thuê' 
      });
    }
    
    const tenantId = tenants[0].TenantID;
    const bookingData = {
      tenantId,
      ...req.body
    };

    // Validate required fields
    const required = ['serviceId', 'pickupAddress', 'destinationAddress', 'movingDate', 'movingTime'];
    for (const field of required) {
      if (!bookingData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `Thiếu trường bắt buộc: ${field}` 
        });
      }
    }

    const booking = await MovingService.createBooking(bookingData);
    res.status(201).json({ 
      success: true, 
      message: 'Đặt dịch vụ thành công',
      data: booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn đặt dịch vụ' });
  }
});

// GET /api/moving/bookings - Lấy lịch sử booking (cần auth)
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.userId; // Đây là AccountID
    
    // Lấy TenantID từ AccountID
    const db = require('../config/database');
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người thuê' 
      });
    }
    
    const tenantId = tenants[0].TenantID;
    const bookings = await MovingService.getBookingsByTenant(tenantId);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải lịch sử' });
  }
});

// GET /api/moving/bookings/:id - Lấy chi tiết booking (cần auth)
router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.userId; // Đây là AccountID
    
    // Lấy TenantID từ AccountID
    const db = require('../config/database');
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người thuê' 
      });
    }
    
    const tenantId = tenants[0].TenantID;
    const booking = await MovingService.getBookingById(req.params.id, tenantId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt dịch vụ' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải chi tiết đơn' });
  }
});

// PUT /api/moving/bookings/:id/cancel - Hủy booking (cần auth)
router.put('/bookings/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.userId; // Đây là AccountID
    
    // Lấy TenantID từ AccountID
    const db = require('../config/database');
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người thuê' 
      });
    }
    
    const tenantId = tenants[0].TenantID;
    const success = await MovingService.cancelBooking(req.params.id, tenantId);
    
    if (!success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể hủy đơn này (đã hoàn thành hoặc đã hủy)' 
      });
    }
    
    res.json({ success: true, message: 'Hủy đơn thành công' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi hủy đơn' });
  }
});

// ─── PROVIDER ROUTES ──────────────────────────────────────────────────────────

// GET /api/moving/provider/profile - Lấy thông tin Provider
router.get('/provider/profile', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    res.json({ success: true, data: provider });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải thông tin' });
  }
});

// GET /api/moving/provider/bookings - Lấy danh sách booking của Provider
router.get('/provider/bookings', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    const bookings = await MovingService.getBookingsByProvider(provider.ProviderID);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải đơn đặt dịch vụ' });
  }
});

// PUT /api/moving/provider/bookings/:id/confirm - Xác nhận booking
router.put('/provider/bookings/:id/confirm', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    const success = await MovingService.confirmBooking(req.params.id, provider.ProviderID);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Không thể xác nhận đơn này' });
    }
    res.json({ success: true, message: 'Xác nhận đơn thành công' });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xác nhận đơn' });
  }
});

// PUT /api/moving/provider/bookings/:id/reject - Từ chối booking
router.put('/provider/bookings/:id/reject', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    const { reason } = req.body;
    const success = await MovingService.rejectBooking(req.params.id, provider.ProviderID, reason);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Không thể từ chối đơn này' });
    }
    res.json({ success: true, message: 'Từ chối đơn thành công' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi từ chối đơn' });
  }
});

// PUT /api/moving/provider/bookings/:id/complete - Hoàn thành booking
router.put('/provider/bookings/:id/complete', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    const success = await MovingService.completeBooking(req.params.id, provider.ProviderID);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Không thể hoàn thành đơn này' });
    }
    res.json({ success: true, message: 'Đánh dấu hoàn thành thành công' });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi hoàn thành đơn' });
  }
});

// GET /api/moving/provider/services - Lấy danh sách dịch vụ của Provider
router.get('/provider/services', providerAuthMiddleware, async (req, res) => {
  try {
    console.log('=== GET /provider/services ===');
    console.log('req.user:', req.user);
    
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    console.log('provider found:', provider ? provider.ProviderID : 'null');
    
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }
    const services = await MovingService.getServicesByProvider(provider.ProviderID);
    console.log('services count:', services.length);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải dịch vụ' });
  }
});

// POST /api/moving/provider/services - Tạo dịch vụ mới (Provider)
router.post('/provider/services', providerAuthMiddleware, async (req, res) => {
  try {
    console.log('=== POST /provider/services ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    console.log('provider found:', provider ? provider.ProviderID : 'null');
    
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }

    const { categoryId, name, description, basePrice, pricePerKm, freeDistanceKm, maxDistanceKm, extraFloorPrice, overtimePrice, vehicleType, estimatedDuration, maxItems, features, isPopular, sortOrder } = req.body;

    // Validate required fields
    const required = ['categoryId', 'name', 'basePrice', 'pricePerKm', 'vehicleType', 'estimatedDuration'];
    for (const field of required) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        return res.status(400).json({ success: false, message: `Thiếu trường bắt buộc: ${field}` });
      }
    }

    const service = await MovingService.createService({
      providerId: provider.ProviderID,
      categoryId,
      name,
      description,
      basePrice: parseFloat(basePrice),
      pricePerKm: parseFloat(pricePerKm),
      freeDistanceKm: parseFloat(freeDistanceKm) || 0,
      maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : null,
      extraFloorPrice: parseFloat(extraFloorPrice) || 0,
      overtimePrice: parseFloat(overtimePrice) || 0,
      vehicleType,
      estimatedDuration: parseInt(estimatedDuration),
      maxItems: maxItems ? parseInt(maxItems) : null,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      isPopular: isPopular || false,
      sortOrder: sortOrder || 0
    });

    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công', data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo dịch vụ' });
  }
});

// PUT /api/moving/provider/services/:id - Cập nhật dịch vụ (Provider)
router.put('/provider/services/:id', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }

    const { categoryId, name, description, basePrice, pricePerKm, freeDistanceKm, maxDistanceKm, extraFloorPrice, overtimePrice, vehicleType, estimatedDuration, maxItems, features, isPopular, sortOrder } = req.body;

    const service = await MovingService.updateService(req.params.id, provider.ProviderID, {
      categoryId,
      name,
      description,
      basePrice: parseFloat(basePrice),
      pricePerKm: parseFloat(pricePerKm),
      freeDistanceKm: parseFloat(freeDistanceKm) || 0,
      maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : null,
      extraFloorPrice: parseFloat(extraFloorPrice) || 0,
      overtimePrice: parseFloat(overtimePrice) || 0,
      vehicleType,
      estimatedDuration: parseInt(estimatedDuration),
      maxItems: maxItems ? parseInt(maxItems) : null,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      isPopular: isPopular || false,
      sortOrder: sortOrder || 0
    });

    res.json({ success: true, message: 'Cập nhật dịch vụ thành công', data: service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi cập nhật dịch vụ' });
  }
});

// DELETE /api/moving/provider/services/:id - Xóa dịch vụ (Provider)
router.delete('/provider/services/:id', providerAuthMiddleware, async (req, res) => {
  try {
    const provider = await MovingService.getProviderByAccountId(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhà cung cấp' });
    }

    const success = await MovingService.deleteService(req.params.id, provider.ProviderID);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Không thể xóa dịch vụ này' });
    }

    res.json({ success: true, message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi khi xóa dịch vụ' });
  }
});

// ─── TENANT ROUTES ────────────────────────────────────────────────────────────
router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const accountId = req.user.userId; // Đây là AccountID
    
    // Lấy TenantID từ AccountID
    const db = require('../config/database');
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [accountId]);
    
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người thuê' 
      });
    }
    
    const tenantId = tenants[0].TenantID;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin đánh giá' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Đánh giá phải từ 1-5 sao' 
      });
    }

    const review = await MovingService.createReview({
      bookingId,
      tenantId,
      rating,
      comment
    });

    res.status(201).json({ 
      success: true, 
      message: 'Đánh giá thành công',
      data: review 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi khi tạo đánh giá' 
    });
  }
});

module.exports = router;
