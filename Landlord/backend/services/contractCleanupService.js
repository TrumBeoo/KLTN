const db = require('../config/database');

/**
 * Service tự động xóa hợp đồng đã chấm dứt sau 1 tháng
 */
class ContractCleanupService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Bắt đầu service kiểm tra định kỳ (mỗi ngày lúc 2h sáng)
   */
  start() {
    if (this.isRunning) {
      console.log('Contract cleanup service is already running');
      return;
    }

    this.isRunning = true;
    console.log('✅ Contract cleanup service started');

    // Chạy ngay lần đầu
    this.cleanupTerminatedContracts();

    // Chạy định kỳ mỗi 24 giờ
    this.interval = setInterval(() => {
      this.cleanupTerminatedContracts();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Dừng service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('❌ Contract cleanup service stopped');
    }
  }

  /**
   * Xóa các hợp đồng đã chấm dứt quá 1 tháng
   */
  async cleanupTerminatedContracts() {
    const connection = await db.getConnection();
    
    try {
      console.log('🧹 Cleaning up terminated contracts...');

      // Tìm các hợp đồng đã chấm dứt quá 1 tháng
      const [contracts] = await connection.query(`
        SELECT c.ContractID, c.RoomID, c.ContractFilePublicID,
               r.RoomCode, b.BuildingName
        FROM CONTRACT c
        LEFT JOIN ROOM r ON c.RoomID = r.RoomID
        LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
        WHERE c.Status = 'terminated' 
          AND c.TerminatedAt IS NOT NULL
          AND DATEDIFF(NOW(), c.TerminatedAt) >= 30
      `);

      if (contracts.length === 0) {
        console.log('✅ No contracts to cleanup');
        return;
      }

      await connection.beginTransaction();

      for (const contract of contracts) {
        // Xóa file hợp đồng trên Cloudinary nếu có
        if (contract.ContractFilePublicID) {
          try {
            const cloudinaryService = require('./cloudinaryService');
            await cloudinaryService.deleteFile(contract.ContractFilePublicID, 'raw');
            console.log(`🗑️  Deleted contract file: ${contract.ContractFilePublicID}`);
          } catch (error) {
            console.error(`Failed to delete contract file: ${contract.ContractFilePublicID}`, error);
          }
        }

        // Xóa hợp đồng khỏi database
        await connection.query(
          'DELETE FROM CONTRACT WHERE ContractID = ?',
          [contract.ContractID]
        );

        console.log(`🗑️  Deleted contract: ${contract.ContractID} (${contract.RoomCode} - ${contract.BuildingName})`);
      }

      await connection.commit();
      console.log(`✅ Cleaned up ${contracts.length} terminated contracts`);
    } catch (error) {
      await connection.rollback();
      console.error('❌ Error cleaning up terminated contracts:', error);
    } finally {
      connection.release();
    }
  }
}

// Export singleton instance
module.exports = new ContractCleanupService();
