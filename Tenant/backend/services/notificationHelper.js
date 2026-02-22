const notificationService = require('./notificationService');

class NotificationHelper {
  // Thông báo khi lịch xem được duyệt
  async notifyViewingApproved(tenantId, roomId, roomName, viewingDateTime) {
    const content = `Lịch xem phòng "${roomName}" vào lúc ${new Date(viewingDateTime).toLocaleString('vi-VN')} đã được chủ nhà duyệt.`;
    return await notificationService.createNotification(tenantId, content, 'Lịch xem');
  }

  // Thông báo khi lịch xem bị từ chối
  async notifyViewingRejected(tenantId, roomName, viewingDateTime) {
    const content = `Lịch xem phòng "${roomName}" vào lúc ${new Date(viewingDateTime).toLocaleString('vi-VN')} đã bị từ chối.`;
    return await notificationService.createNotification(tenantId, content, 'Lịch xem');
  }

  // Thông báo khi hợp đồng được tạo
  async notifyContractCreated(tenantId, roomName, startDate, endDate) {
    const content = `Hợp đồng thuê phòng "${roomName}" từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')} đã được tạo.`;
    return await notificationService.createNotification(tenantId, content, 'Hợp đồng');
  }

  // Thông báo khi phòng trở nên trống
  async notifyRoomAvailable(tenantId, roomName) {
    const content = `Phòng "${roomName}" mà bạn quan tâm hiện đã trở nên trống.`;
    return await notificationService.createNotification(tenantId, content, 'Phòng trống');
  }

  // Thông báo thanh toán
  async notifyPaymentDue(tenantId, roomName, dueDate, amount) {
    const content = `Thanh toán tiền thuê phòng "${roomName}" sẽ đến hạn vào ${new Date(dueDate).toLocaleDateString('vi-VN')} (${amount.toLocaleString('vi-VN')} VNĐ).`;
    return await notificationService.createNotification(tenantId, content, 'Hợp đồng');
  }
}

module.exports = new NotificationHelper();
