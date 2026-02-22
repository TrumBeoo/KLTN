const notificationService = require('./notificationService');

class NotificationHelper {
  // Thông báo khi có lịch xem mới chờ duyệt
  async notifyNewViewingRequest(landlordId, tenantName, roomName, viewingDateTime) {
    const content = `${tenantName} đã đặt lịch xem phòng "${roomName}" vào lúc ${new Date(viewingDateTime).toLocaleString('vi-VN')}. Vui lòng duyệt hoặc từ chối.`;
    return await notificationService.createNotification(landlordId, content, 'Lịch xem');
  }

  // Thông báo khi hợp đồng được tạo
  async notifyContractCreated(landlordId, tenantName, roomName, startDate, endDate) {
    const content = `Hợp đồng thuê phòng "${roomName}" với ${tenantName} từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')} đã được tạo.`;
    return await notificationService.createNotification(landlordId, content, 'Hợp đồng');
  }

  // Thông báo khi hợp đồng sắp hết hạn
  async notifyContractExpiring(landlordId, tenantName, roomName, endDate) {
    const content = `Hợp đồng thuê phòng "${roomName}" với ${tenantName} sắp hết hạn vào ${new Date(endDate).toLocaleDateString('vi-VN')}.`;
    return await notificationService.createNotification(landlordId, content, 'Hợp đồng');
  }

  // Thông báo thanh toán
  async notifyPaymentReceived(landlordId, tenantName, roomName, amount, paymentDate) {
    const content = `Đã nhận thanh toán từ ${tenantName} cho phòng "${roomName}" (${amount.toLocaleString('vi-VN')} VNĐ) vào ${new Date(paymentDate).toLocaleDateString('vi-VN')}.`;
    return await notificationService.createNotification(landlordId, content, 'Hợp đồng');
  }

  // Thông báo thanh toán chưa được thực hiện
  async notifyPaymentPending(landlordId, tenantName, roomName, dueDate, amount) {
    const content = `${tenantName} chưa thanh toán tiền thuê phòng "${roomName}" (${amount.toLocaleString('vi-VN')} VNĐ) đến hạn ${new Date(dueDate).toLocaleDateString('vi-VN')}.`;
    return await notificationService.createNotification(landlordId, content, 'Hợp đồng');
  }

  // Thông báo phòng được đặt lịch xem
  async notifyRoomScheduled(landlordId, roomName) {
    const content = `Phòng "${roomName}" đã được đặt lịch xem.`;
    return await notificationService.createNotification(landlordId, content, 'Phòng trống');
  }

  // Thông báo phòng được thuê
  async notifyRoomRented(landlordId, roomName, tenantName) {
    const content = `Phòng "${roomName}" đã được thuê bởi ${tenantName}.`;
    return await notificationService.createNotification(landlordId, content, 'Phòng trống');
  }
}

module.exports = new NotificationHelper();
