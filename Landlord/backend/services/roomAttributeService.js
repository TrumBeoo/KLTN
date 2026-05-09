const db = require('../config/database');

class RoomAttributeService {
  /**
   * Lấy tất cả services
   */
  async getAllServices() {
    const [services] = await db.query('SELECT * FROM SERVICE ORDER BY Name');
    return services;
  }

  /**
   * Lấy tất cả furniture
   */
  async getAllFurniture() {
    const [furniture] = await db.query('SELECT * FROM FURNITURE ORDER BY Name');
    return furniture;
  }

  /**
   * Lấy tất cả rules
   */
  async getAllRules() {
    const [rules] = await db.query('SELECT * FROM RULE ORDER BY Name');
    return rules;
  }

  /**
   * Lấy tất cả room types
   */
  async getAllRoomTypes() {
    const [roomTypes] = await db.query('SELECT * FROM ROOM_TYPE ORDER BY Name');
    return roomTypes;
  }

  /**
   * Lấy tất cả amenities
   */
  async getAllAmenities() {
    const [amenities] = await db.query('SELECT * FROM AMENITY ORDER BY Name');
    return amenities;
  }

  /**
   * Tạo amenity mới
   */
  async createAmenity(name, description = '') {
    // Kiểm tra trùng lặp
    const [existing] = await db.query('SELECT AmenityID FROM AMENITY WHERE Name = ?', [name]);
    if (existing.length > 0) {
      return existing[0].AmenityID;
    }

    // Tạo ID mới
    const [lastAmenity] = await db.query('SELECT AmenityID FROM AMENITY ORDER BY AmenityID DESC LIMIT 1');
    let amenityId;
    if (lastAmenity.length > 0) {
      const lastId = parseInt(lastAmenity[0].AmenityID.substring(2));
      amenityId = 'AM' + String(lastId + 1).padStart(3, '0');
    } else {
      amenityId = 'AM001';
    }

    await db.query(
      'INSERT INTO AMENITY (AmenityID, Name, Description) VALUES (?, ?, ?)',
      [amenityId, name, description]
    );
    return amenityId;
  }

  /**
   * Thêm services cho phòng
   * @param {string} roomId 
   * @param {string[]} serviceIds - Mảng ServiceID
   * @param {object} connection - Database connection (optional, for transaction)
   */
  async addRoomServices(roomId, serviceIds, connection = null) {
    const conn = connection || db;
    if (!serviceIds || serviceIds.length === 0) return;

    const values = serviceIds.map(sid => [roomId, sid]);
    await conn.query(
      'INSERT INTO ROOM_SERVICE (RoomID, ServiceID) VALUES ?',
      [values]
    );
  }

  /**
   * Thêm furniture cho phòng
   */
  async addRoomFurniture(roomId, furnitureIds, connection = null) {
    const conn = connection || db;
    if (!furnitureIds || furnitureIds.length === 0) return;

    const values = furnitureIds.map(fid => [roomId, fid]);
    await conn.query(
      'INSERT INTO ROOM_FURNITURE (RoomID, FurnitureID) VALUES ?',
      [values]
    );
  }

  /**
   * Thêm rules cho phòng
   */
  async addRoomRules(roomId, ruleIds, connection = null) {
    const conn = connection || db;
    if (!ruleIds || ruleIds.length === 0) return;

    const values = ruleIds.map(rid => [roomId, rid]);
    await conn.query(
      'INSERT INTO ROOM_RULE (RoomID, RuleID) VALUES ?',
      [values]
    );
  }

  /**
   * Xóa tất cả services của phòng
   */
  async removeRoomServices(roomId, connection = null) {
    const conn = connection || db;
    await conn.query('DELETE FROM ROOM_SERVICE WHERE RoomID = ?', [roomId]);
  }

  /**
   * Xóa tất cả furniture của phòng
   */
  async removeRoomFurniture(roomId, connection = null) {
    const conn = connection || db;
    await conn.query('DELETE FROM ROOM_FURNITURE WHERE RoomID = ?', [roomId]);
  }

  /**
   * Xóa tất cả rules của phòng
   */
  async removeRoomRules(roomId, connection = null) {
    const conn = connection || db;
    await conn.query('DELETE FROM ROOM_RULE WHERE RoomID = ?', [roomId]);
  }

  /**
   * Cập nhật services cho phòng (xóa cũ, thêm mới)
   */
  async updateRoomServices(roomId, serviceIds, connection = null) {
    await this.removeRoomServices(roomId, connection);
    await this.addRoomServices(roomId, serviceIds, connection);
  }

  /**
   * Cập nhật furniture cho phòng
   */
  async updateRoomFurniture(roomId, furnitureIds, connection = null) {
    await this.removeRoomFurniture(roomId, connection);
    await this.addRoomFurniture(roomId, furnitureIds, connection);
  }

  /**
   * Cập nhật rules cho phòng
   */
  async updateRoomRules(roomId, ruleIds, connection = null) {
    await this.removeRoomRules(roomId, connection);
    await this.addRoomRules(roomId, ruleIds, connection);
  }
}

module.exports = new RoomAttributeService();
