const db = require('../config/database');

/**
 * Service tự động kiểm tra hợp đồng sắp hết hạn và gửi thông báo
 */
class ContractNotificationService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Bắt đầu service kiểm tra định kỳ (mỗi 6 giờ)
   */
  start() {
    if (this.isRunning) {
      console.log('Contract notification service is already running');
      return;
    }

    this.isRunning = true;
    console.log('✅ Contract notification service started');

    // Chạy ngay lần đầu
    this.checkExpiringContracts();

    // Chạy định kỳ mỗi 6 giờ
    this.interval = setInterval(() => {
      this.checkExpiringContracts();
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  /**
   * Dừng service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('❌ Contract notification service stopped');
    }
  }

  /**
   * Kiểm tra và gửi thông báo cho hợp đồng sắp hết hạn
   */
  async checkExpiringContracts() {
    try {
      console.log('🔍 Checking expiring contracts...');

      // Lấy tất cả hợp đồng đang active
      const [contracts] = await db.query(`
        SELECT c.*, 
               r.RoomCode, 
               b.BuildingName,
               DATEDIFF(c.EndDate, CURDATE()) as DaysRemaining
        FROM CONTRACT c
        LEFT JOIN ROOM r ON c.RoomID = r.RoomID
        LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
        WHERE c.Status = 'active' AND c.EndDate >= CURDATE()
      `);

      let notificationCount = 0;

      for (const contract of contracts) {
        const daysRemaining = contract.DaysRemaining;

        // Gửi thông báo 30 ngày trước
        if (daysRemaining <= 30 && daysRemaining > 14 && !contract.NotificationSent30Days) {
          await this.sendNotification(contract, 30);
          await this.markNotificationSent(contract.ContractID, '30');
          notificationCount++;
        }

        // Gửi thông báo 14 ngày trước
        if (daysRemaining <= 14 && daysRemaining > 7 && !contract.NotificationSent14Days) {
          await this.sendNotification(contract, 14);
          await this.markNotificationSent(contract.ContractID, '14');
          notificationCount++;
        }

        // Gửi thông báo 7 ngày trước
        if (daysRemaining <= 7 && daysRemaining > 0 && !contract.NotificationSent7Days) {
          await this.sendNotification(contract, 7);
          await this.markNotificationSent(contract.ContractID, '7');
          notificationCount++;
        }

        // Cập nhật status nếu sắp hết hạn
        if (daysRemaining <= 30 && contract.Status === 'active') {
          await db.query(
            `UPDATE CONTRACT SET Status = 'expiring_soon', UpdatedAt = NOW() WHERE ContractID = ?`,
            [contract.ContractID]
          );
        }

        // Cập nhật status nếu đã hết hạn
        if (daysRemaining <= 0 && contract.Status !== 'expired') {
          await db.query(
            `UPDATE CONTRACT SET Status = 'expired', UpdatedAt = NOW() WHERE ContractID = ?`,
            [contract.ContractID]
          );
          
          // Cập nhật room về available
          await db.query(
            `UPDATE ROOM SET Status = 'available', UpdatedAt = NOW() WHERE RoomID = ?`,
            [contract.RoomID]
          );
        }
      }

      console.log(`✅ Checked ${contracts.length} contracts, sent ${notificationCount} notifications`);
    } catch (error) {
      console.error('❌ Error checking expiring contracts:', error);
    }
  }

  /**
   * Gửi thông báo cho landlord
   */
  async sendNotification(contract, daysRemaining) {
    try {
      // Generate NotificationID
      const [lastNotif] = await db.query(
        'SELECT NotificationID FROM NOTIFICATION ORDER BY NotificationID DESC LIMIT 1'
      );
      
      let notificationId;
      if (lastNotif.length > 0) {
        const lastId = parseInt(lastNotif[0].NotificationID.substring(3));
        notificationId = 'NOT' + String(lastId + 1).padStart(7, '0');
      } else {
        notificationId = 'NOT0000001';
      }

      const content = `Hợp đồng phòng ${contract.RoomCode} (${contract.BuildingName}) sẽ hết hạn trong ${daysRemaining} ngày (${this.formatDate(contract.EndDate)}). ${contract.RenewalOption ? 'Vui lòng liên hệ người thuê để gia hạn hợp đồng.' : 'Hợp đồng không cho phép gia hạn.'}`;

      await db.query(
        `INSERT INTO NOTIFICATION (
          NotificationID, TargetID, Content, Type, Link, Status, CreatedAt
        ) VALUES (?, ?, ?, 'Hợp đồng', ?, 'Chưa đọc', NOW())`,
        [
          notificationId,
          contract.LandlordID,
          content,
          `/contracts/${contract.ContractID}`
        ]
      );

      console.log(`📧 Sent notification to landlord ${contract.LandlordID} for contract ${contract.ContractID} (${daysRemaining} days)`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Đánh dấu đã gửi thông báo
   */
  async markNotificationSent(contractId, days) {
    try {
      const field = `NotificationSent${days}Days`;
      await db.query(
        `UPDATE CONTRACT SET ${field} = TRUE, UpdatedAt = NOW() WHERE ContractID = ?`,
        [contractId]
      );
    } catch (error) {
      console.error('Error marking notification sent:', error);
    }
  }

  /**
   * Format date to Vietnamese format
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

// Export singleton instance
module.exports = new ContractNotificationService();
