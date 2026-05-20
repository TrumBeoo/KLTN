import apiCall from '../utils/api';

export const movingServiceAPI = {
  // Lấy danh sách danh mục
  getCategories: () => 
    apiCall('/moving/categories', { method: 'GET' }),

  // Lấy danh sách dịch vụ (có thể filter theo category)
  getServices: (categoryId = null) => {
    const query = categoryId && categoryId !== 'all' ? `?categoryId=${categoryId}` : '';
    return apiCall(`/moving/services${query}`, { method: 'GET' });
  },

  // Lấy chi tiết dịch vụ
  getServiceById: (serviceId) =>
    apiCall(`/moving/services/${serviceId}`, { method: 'GET' }),

  // Tính giá dự kiến
  calculatePrice: (serviceId, distanceKm, floorFrom, floorTo, hasElevator) =>
    apiCall('/moving/calculate-price', {
      method: 'POST',
      body: JSON.stringify({
        serviceId,
        distanceKm,
        floorFrom,
        floorTo,
        hasElevator
      })
    }),

  // Tạo booking mới (cần auth)
  createBooking: (bookingData) =>
    apiCall('/moving/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),

  // Lấy lịch sử booking (cần auth)
  getBookings: () =>
    apiCall('/moving/bookings', { method: 'GET' }),

  // Lấy chi tiết booking (cần auth)
  getBookingById: (bookingId) =>
    apiCall(`/moving/bookings/${bookingId}`, { method: 'GET' }),

  // Hủy booking (cần auth)
  cancelBooking: (bookingId) =>
    apiCall(`/moving/bookings/${bookingId}/cancel`, { method: 'PUT' }),

  // Tạo đánh giá (cần auth)
  createReview: (bookingId, rating, comment) =>
    apiCall('/moving/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookingId, rating, comment })
    }),

  // ─── PROVIDER APIs ───────────────────────────────────────────────────────────
  
  // Lấy danh sách dịch vụ của Provider (cần auth Provider)
  getProviderServices: () =>
    apiCall('/moving/provider/services', { method: 'GET' }),

  // Tạo dịch vụ mới (Provider)
  createProviderService: (serviceData) =>
    apiCall('/moving/provider/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    }),

  // Cập nhật dịch vụ (Provider)
  updateProviderService: (serviceId, serviceData) =>
    apiCall(`/moving/provider/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    }),

  // Xóa dịch vụ (Provider)
  deleteProviderService: (serviceId) =>
    apiCall(`/moving/provider/services/${serviceId}`, { method: 'DELETE' }),

  // Lấy danh sách booking của Provider
  getProviderBookings: () =>
    apiCall('/moving/provider/bookings', { method: 'GET' }),

  // Xác nhận booking (Provider)
  confirmBooking: (bookingId) =>
    apiCall(`/moving/provider/bookings/${bookingId}/confirm`, { method: 'PUT' }),

  // Từ chối booking (Provider)
  rejectBooking: (bookingId, reason) =>
    apiCall(`/moving/provider/bookings/${bookingId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  // Hoàn thành booking (Provider)
  completeBooking: (bookingId) =>
    apiCall(`/moving/provider/bookings/${bookingId}/complete`, { method: 'PUT' })
};
