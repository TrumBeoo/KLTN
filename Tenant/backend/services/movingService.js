const db = require('../config/database');

class MovingService {
  // Lấy tất cả danh mục dịch vụ
  static async getCategories() {
    const [rows] = await db.query(
      `SELECT * FROM SERVICE_CATEGORY 
       WHERE IsActive = TRUE 
       ORDER BY SortOrder ASC`
    );
    return rows;
  }

  // Lấy danh sách dịch vụ (có thể filter theo category)
  static async getServices(categoryId = null) {
    let query = `
      SELECT 
        ms.*,
        sc.Name as CategoryName,
        sc.Icon as CategoryIcon
      FROM MOVING_SERVICE ms
      LEFT JOIN SERVICE_CATEGORY sc ON ms.CategoryID = sc.CategoryID
      WHERE ms.IsActive = TRUE
    `;
    
    const params = [];
    if (categoryId && categoryId !== 'all') {
      query += ` AND ms.CategoryID = ?`;
      params.push(categoryId);
    }
    
    query += ` ORDER BY ms.IsPopular DESC, ms.SortOrder ASC`;
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  // Lấy chi tiết 1 dịch vụ
  static async getServiceById(serviceId) {
    const [rows] = await db.query(
      `SELECT 
        ms.*,
        sc.Name as CategoryName,
        sc.Icon as CategoryIcon
       FROM MOVING_SERVICE ms
       LEFT JOIN SERVICE_CATEGORY sc ON ms.CategoryID = sc.CategoryID
       WHERE ms.ServiceID = ? AND ms.IsActive = TRUE`,
      [serviceId]
    );
    return rows[0];
  }

  // Tạo booking mới
  static async createBooking(bookingData) {
    const {
      tenantId,
      serviceId,
      pickupAddress,
      destinationAddress,
      distanceKm,
      movingDate,
      movingTime,
      floorFrom,
      floorTo,
      hasElevator,
      note,
      basePriceSnapshot,
      distancePriceSnapshot,
      extraFeeSnapshot,
      finalPrice
    } = bookingData;

    // Generate BookingID
    const bookingId = await this.generateBookingId();

    const [result] = await db.query(
      `INSERT INTO MOVING_BOOKING (
        BookingID, TenantID, ServiceID,
        PickupAddress, DestinationAddress, DistanceKm,
        MovingDate, MovingTime,
        FloorFrom, FloorTo, HasElevator, Note,
        BasePriceSnapshot, DistancePriceSnapshot, ExtraFeeSnapshot, FinalPrice,
        Status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        bookingId, tenantId, serviceId,
        pickupAddress, destinationAddress, distanceKm,
        movingDate, movingTime,
        floorFrom, floorTo, hasElevator, note,
        basePriceSnapshot, distancePriceSnapshot, extraFeeSnapshot, finalPrice
      ]
    );

    return { bookingId, ...bookingData };
  }

  // Lấy lịch sử booking của tenant
  static async getBookingsByTenant(tenantId) {
    const [rows] = await db.query(
      `SELECT 
        mb.*,
        ms.Name as ServiceName,
        ms.VehicleType
       FROM MOVING_BOOKING mb
       LEFT JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       WHERE mb.TenantID = ?
       ORDER BY mb.CreatedAt DESC`,
      [tenantId]
    );
    return rows;
  }

  // Lấy chi tiết 1 booking
  static async getBookingById(bookingId, tenantId) {
    const [rows] = await db.query(
      `SELECT 
        mb.*,
        ms.Name as ServiceName,
        ms.VehicleType,
        ms.Features
       FROM MOVING_BOOKING mb
       LEFT JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       WHERE mb.BookingID = ? AND mb.TenantID = ?`,
      [bookingId, tenantId]
    );
    return rows[0];
  }

  // Hủy booking
  static async cancelBooking(bookingId, tenantId) {
    const [result] = await db.query(
      `UPDATE MOVING_BOOKING 
       SET Status = 'cancelled'
       WHERE BookingID = ? AND TenantID = ? AND Status IN ('pending', 'confirmed')`,
      [bookingId, tenantId]
    );
    return result.affectedRows > 0;
  }

  // Tạo review
  static async createReview(reviewData) {
    const { bookingId, tenantId, rating, comment } = reviewData;
    
    // Check if booking exists and belongs to tenant
    const booking = await this.getBookingById(bookingId, tenantId);
    if (!booking || booking.Status !== 'completed') {
      throw new Error('Chỉ có thể đánh giá đơn đã hoàn thành');
    }

    // Check if review already exists
    const [existing] = await db.query(
      'SELECT ReviewID FROM MOVING_REVIEW WHERE BookingID = ?',
      [bookingId]
    );
    if (existing.length > 0) {
      throw new Error('Đơn này đã được đánh giá');
    }

    const reviewId = await this.generateReviewId();

    await db.query(
      `INSERT INTO MOVING_REVIEW (ReviewID, BookingID, TenantID, Rating, Comment)
       VALUES (?, ?, ?, ?, ?)`,
      [reviewId, bookingId, tenantId, rating, comment]
    );

    return { reviewId, ...reviewData };
  }

  // Helper: Generate BookingID
  static async generateBookingId() {
    const [rows] = await db.query(
      `SELECT BookingID FROM MOVING_BOOKING ORDER BY BookingID DESC LIMIT 1`
    );
    if (rows.length === 0) return 'MB00000001';
    
    const lastId = rows[0].BookingID;
    const num = parseInt(lastId.substring(2)) + 1;
    return 'MB' + num.toString().padStart(8, '0');
  }

  // Helper: Generate ReviewID
  static async generateReviewId() {
    const [rows] = await db.query(
      `SELECT ReviewID FROM MOVING_REVIEW ORDER BY ReviewID DESC LIMIT 1`
    );
    if (rows.length === 0) return 'MR00000001';
    
    const lastId = rows[0].ReviewID;
    const num = parseInt(lastId.substring(2)) + 1;
    return 'MR' + num.toString().padStart(8, '0');
  }

  // ────── PROVIDER METHODS ──────────────────────────────────────────────────────

  // Lấy thông tin Provider
  static async getProviderByAccountId(accountId) {
    const [rows] = await db.query(
      `SELECT * FROM MOVING_PROVIDER WHERE AccountID = ?`,
      [accountId]
    );
    return rows[0];
  }

  // Lấy danh sách dịch vụ của Provider
  static async getServicesByProvider(providerId) {
    const [rows] = await db.query(
      `SELECT 
        ms.*,
        sc.Name as CategoryName,
        sc.Icon as CategoryIcon
       FROM MOVING_SERVICE ms
       LEFT JOIN SERVICE_CATEGORY sc ON ms.CategoryID = sc.CategoryID
       WHERE ms.ProviderID = ?
       ORDER BY ms.SortOrder ASC`,
      [providerId]
    );
    return rows;
  }

  // Lấy danh sách booking của Provider
  static async getBookingsByProvider(providerId) {
    const [rows] = await db.query(
      `SELECT 
        mb.*,
        ms.Name as ServiceName,
        ms.VehicleType,
        t.Name as TenantName,
        t.Phone as TenantPhone
       FROM MOVING_BOOKING mb
       LEFT JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       LEFT JOIN TENANT t ON mb.TenantID = t.TenantID
       WHERE ms.ProviderID = ?
       ORDER BY mb.CreatedAt DESC`,
      [providerId]
    );
    return rows;
  }

  // Xác nhận booking (Provider)
  static async confirmBooking(bookingId, providerId) {
    // Kiểm tra booking có thuộc về provider không
    const [check] = await db.query(
      `SELECT mb.BookingID 
       FROM MOVING_BOOKING mb
       JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       WHERE mb.BookingID = ? AND ms.ProviderID = ? AND mb.Status = 'pending'`,
      [bookingId, providerId]
    );
    
    if (check.length === 0) {
      throw new Error('Không tìm thấy đơn hoặc đơn không ở trạng thái chờ xác nhận');
    }

    const [result] = await db.query(
      `UPDATE MOVING_BOOKING 
       SET Status = 'confirmed'
       WHERE BookingID = ?`,
      [bookingId]
    );
    return result.affectedRows > 0;
  }

  // Từ chối booking (Provider)
  static async rejectBooking(bookingId, providerId, reason = null) {
    // Kiểm tra booking có thuộc về provider không
    const [check] = await db.query(
      `SELECT mb.BookingID 
       FROM MOVING_BOOKING mb
       JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       WHERE mb.BookingID = ? AND ms.ProviderID = ? AND mb.Status = 'pending'`,
      [bookingId, providerId]
    );
    
    if (check.length === 0) {
      throw new Error('Không tìm thấy đơn hoặc đơn không ở trạng thái chờ xác nhận');
    }

    const [result] = await db.query(
      `UPDATE MOVING_BOOKING 
       SET Status = 'cancelled', StaffNote = ?
       WHERE BookingID = ?`,
      [reason || 'Nhà cung cấp từ chối', bookingId]
    );
    return result.affectedRows > 0;
  }

  // Hoàn thành booking (Provider)
  static async completeBooking(bookingId, providerId) {
    // Kiểm tra booking có thuộc về provider không
    const [check] = await db.query(
      `SELECT mb.BookingID 
       FROM MOVING_BOOKING mb
       JOIN MOVING_SERVICE ms ON mb.ServiceID = ms.ServiceID
       WHERE mb.BookingID = ? AND ms.ProviderID = ? AND mb.Status IN ('confirmed', 'moving')`,
      [bookingId, providerId]
    );
    
    if (check.length === 0) {
      throw new Error('Không tìm thấy đơn hoặc đơn không thể hoàn thành');
    }

    const [result] = await db.query(
      `UPDATE MOVING_BOOKING 
       SET Status = 'completed', ActualEndTime = NOW()
       WHERE BookingID = ?`,
      [bookingId]
    );
    return result.affectedRows > 0;
  }

  // Tạo dịch vụ mới (Provider)
  static async createService(serviceData) {
    const {
      providerId,
      categoryId,
      name,
      description,
      basePrice,
      pricePerKm,
      freeDistanceKm,
      maxDistanceKm,
      extraFloorPrice,
      overtimePrice,
      vehicleType,
      estimatedDuration,
      maxItems,
      features,
      isPopular,
      sortOrder
    } = serviceData;

    const serviceId = await this.generateServiceId();

    const [result] = await db.query(
      `INSERT INTO MOVING_SERVICE (
        ServiceID, ProviderID, CategoryID, Name, Description,
        BasePrice, PricePerKm, FreeDistanceKm, MaxDistanceKm,
        ExtraFloorPrice, OvertimePrice, VehicleType, EstimatedDuration,
        MaxItems, Features, IsPopular, SortOrder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId, providerId, categoryId, name, description,
        basePrice, pricePerKm, freeDistanceKm, maxDistanceKm,
        extraFloorPrice, overtimePrice, vehicleType, estimatedDuration,
        maxItems, features, isPopular || false, sortOrder || 0
      ]
    );

    return { serviceId, ...serviceData };
  }

  // Cập nhật dịch vụ (Provider)
  static async updateService(serviceId, providerId, serviceData) {
    const [existing] = await db.query(
      `SELECT ProviderID FROM MOVING_SERVICE WHERE ServiceID = ?`,
      [serviceId]
    );
    
    if (!existing[0] || existing[0].ProviderID !== providerId) {
      throw new Error('Bạn không có quyền chỉnh sửa dịch vụ này');
    }

    const {
      categoryId,
      name,
      description,
      basePrice,
      pricePerKm,
      freeDistanceKm,
      maxDistanceKm,
      extraFloorPrice,
      overtimePrice,
      vehicleType,
      estimatedDuration,
      maxItems,
      features,
      isPopular,
      sortOrder
    } = serviceData;

    await db.query(
      `UPDATE MOVING_SERVICE SET
        CategoryID = ?, Name = ?, Description = ?,
        BasePrice = ?, PricePerKm = ?, FreeDistanceKm = ?, MaxDistanceKm = ?,
        ExtraFloorPrice = ?, OvertimePrice = ?, VehicleType = ?, EstimatedDuration = ?,
        MaxItems = ?, Features = ?, IsPopular = ?, SortOrder = ?
       WHERE ServiceID = ?`,
      [
        categoryId, name, description,
        basePrice, pricePerKm, freeDistanceKm, maxDistanceKm,
        extraFloorPrice, overtimePrice, vehicleType, estimatedDuration,
        maxItems, features, isPopular || false, sortOrder || 0,
        serviceId
      ]
    );

    return { serviceId, ...serviceData };
  }

  // Xóa dịch vụ (Provider)
  static async deleteService(serviceId, providerId) {
    const [existing] = await db.query(
      `SELECT ProviderID FROM MOVING_SERVICE WHERE ServiceID = ?`,
      [serviceId]
    );
    
    if (!existing[0] || existing[0].ProviderID !== providerId) {
      throw new Error('Bạn không có quyền xóa dịch vụ này');
    }

    const [result] = await db.query(
      `DELETE FROM MOVING_SERVICE WHERE ServiceID = ?`,
      [serviceId]
    );

    return result.affectedRows > 0;
  }

  // Helper: Generate ServiceID
  static async generateServiceId() {
    const [rows] = await db.query(
      `SELECT ServiceID FROM MOVING_SERVICE ORDER BY ServiceID DESC LIMIT 1`
    );
    if (rows.length === 0) return 'SVC0000001';
    
    const lastId = rows[0].ServiceID;
    const num = parseInt(lastId.substring(3)) + 1;
    return 'SVC' + num.toString().padStart(7, '0');
  }

  // Tính giá dự kiến (helper cho frontend)
  static calculatePrice(service, distanceKm, floorFrom, floorTo, hasElevator) {
    const base = parseFloat(service.BasePrice);
    const extraDist = Math.max(0, distanceKm - service.FreeDistanceKm);
    const distPrice = extraDist * parseFloat(service.PricePerKm);
    
    const floorDiff = Math.abs(floorTo - floorFrom);
    const floorFee = floorDiff > 0 && !hasElevator 
      ? floorDiff * parseFloat(service.ExtraFloorPrice) 
      : 0;
    
    return {
      base,
      distPrice,
      floorFee,
      total: base + distPrice + floorFee
    };
  }
}

module.exports = MovingService;
