// Script test tạo phòng để debug lỗi 500
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCreateRoom() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    await connection.beginTransaction();
    console.log('=== TEST TẠO PHÒNG ===\n');

    // Test data
    const testData = {
      landlordId: 'LL00000001',
      buildingId: 'BLD0000001',
      locationId: 'LOC0000001',
      roomCode: 'P101',
      roomType: 'Phòng trọ',
      area: 20,
      price: 3000000,
      maxPeople: 2,
      description: 'Test room',
      furniture: 'Giường, Tủ quần áo, Bàn học',
      amenities: 'Điều hòa, Wifi, Máy giặt',
      service: 'Điện, Nước, Internet',
      rules: 'Không hút thuốc, Không nuôi thú cưng',
      floorType: 'Gạch men'
    };

    // Check nếu các FK entities tồn tại
    console.log('1. Kiểm tra LANDLORD:');
    const [landlords] = await connection.query('SELECT LandlordID FROM LANDLORD LIMIT 1');
    if (landlords.length === 0) {
      console.log('  ❌ Không có Landlord. Tạo test landlord...');
      // Tạo account trước
      await connection.query(`
        INSERT INTO ACCOUNT (AccountID, Username, Password, Role)
        VALUES ('ACC0000001', 'testlandlord', 'hash123', 'Landlord')
      `);
      await connection.query(`
        INSERT INTO LANDLORD (LandlordID, AccountID, Name, Phone, Email)
        VALUES ('LL00000001', 'ACC0000001', 'Test Landlord', '0123456789', 'test@test.com')
      `);
      console.log('  ✓ Đã tạo test landlord');
    } else {
      testData.landlordId = landlords[0].LandlordID;
      console.log(`  ✓ Sử dụng landlord: ${testData.landlordId}`);
    }

    console.log('\n2. Kiểm tra LOCATION:');
    const [locations] = await connection.query('SELECT LocationID FROM LOCATION LIMIT 1');
    if (locations.length === 0) {
      console.log('  ❌ Không có Location. Tạo test location...');
      await connection.query(`
        INSERT INTO LOCATION (LocationID, City, District, Ward, Address)
        VALUES ('LOC0000001', 'Hà Nội', 'Quận 1', 'Phường 1', '123 Test Street')
      `);
      console.log('  ✓ Đã tạo test location');
    } else {
      testData.locationId = locations[0].LocationID;
      console.log(`  ✓ Sử dụng location: ${testData.locationId}`);
    }

    console.log('\n3. Kiểm tra BUILDING:');
    const [buildings] = await connection.query('SELECT BuildingID, LocationID FROM BUILDING LIMIT 1');
    if (buildings.length === 0) {
      console.log('  ❌ Không có Building. Tạo test building...');
      await connection.query(`
        INSERT INTO BUILDING (BuildingID, LandlordID, LocationID, BuildingName, Address, District, Ward, Floors, CreatedAt, UpdatedAt)
        VALUES ('BLD0000001', ?, ?, 'Test Building', '123 Test St', 'Quận 1', 'Phường 1', 5, NOW(), NOW())
      `, [testData.landlordId, testData.locationId]);
      console.log('  ✓ Đã tạo test building');
    } else {
      testData.buildingId = buildings[0].BuildingID;
      testData.locationId = buildings[0].LocationID;
      console.log(`  ✓ Sử dụng building: ${testData.buildingId}, location: ${testData.locationId}`);
      
      if (!buildings[0].LocationID) {
        console.log('  ⚠️ Building không có LocationID, cập nhật...');
        await connection.query(`
          UPDATE BUILDING SET LocationID = ? WHERE BuildingID = ?
        `, [testData.locationId, testData.buildingId]);
        console.log('  ✓ Đã cập nhật LocationID');
      }
    }

    // Bây giờ test tạo ROOM
    console.log('\n4. Thử tạo ROOM:');
    
    // Generate RoomID
    const [lastRoom] = await connection.query(
      'SELECT RoomID FROM ROOM ORDER BY RoomID DESC LIMIT 1'
    );
    
    let roomId;
    if (lastRoom.length > 0) {
      const lastId = parseInt(lastRoom[0].RoomID.substring(3));
      roomId = 'ROM' + String(lastId + 1).padStart(5, '0');
    } else {
      roomId = 'ROM00001';
    }
    
    console.log(`  Tạo RoomID: ${roomId}`);

    try {
      await connection.query(`
        INSERT INTO ROOM (
          RoomID, LandlordID, BuildingID, LocationID, RoomCode, RoomType, Area, Price, 
          MaxPeople, Description, Furniture, Amenities, Service, Rules, FloorType, 
          Status, DraftStatus, CreatedAt, UpdatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'draft', NOW(), NOW())
      `, [
        roomId, testData.landlordId, testData.buildingId, testData.locationId, 
        testData.roomCode, testData.roomType, testData.area, testData.price, 
        testData.maxPeople, testData.description, testData.furniture, testData.amenities, 
        testData.service, testData.rules, testData.floorType
      ]);
      console.log(`  ✓ Tạo room thành công: ${roomId}`);
    } catch (error) {
      console.log('  ❌ LỖI KHI TẠO ROOM:');
      console.log('    Message:', error.message);
      console.log('    SQL State:', error.sqlState);
      console.log('    SQL Message:', error.sqlMessage);
      throw error;
    }

    // Test tạo furniture
    console.log('\n5. Thử tạo FURNITURE:');
    const furnitureItems = testData.furniture.split(',').map(f => f.trim());
    for (const item of furnitureItems) {
      const furnitureName = item.length > 95 ? item.substring(0, 95).trim() : item;
      
      const [existing] = await connection.query(
        'SELECT FurnitureID FROM FURNITURE WHERE Name = ?', [furnitureName]
      );
      
      let furnitureId;
      if (existing.length > 0) {
        furnitureId = existing[0].FurnitureID;
      } else {
        const [last] = await connection.query(
          'SELECT FurnitureID FROM FURNITURE ORDER BY FurnitureID DESC LIMIT 1'
        );
        const lastId = last.length > 0 ? parseInt(last[0].FurnitureID.substring(3)) : 0;
        furnitureId = 'FUR' + String(lastId + 1).padStart(7, '0');
        
        await connection.query(
          'INSERT INTO FURNITURE (FurnitureID, Name, CreatedAt) VALUES (?, ?, NOW())',
          [furnitureId, furnitureName]
        );
      }
      
      await connection.query(
        'INSERT IGNORE INTO ROOM_FURNITURE (RoomID, FurnitureID) VALUES (?, ?)',
        [roomId, furnitureId]
      );
      console.log(`  ✓ ${furnitureName} -> ${furnitureId}`);
    }

    await connection.commit();
    console.log('\n✓ TEST THÀNH CÔNG!');

  } catch (error) {
    await connection.rollback();
    console.error('\n❌ TEST THẤT BẠI:', error.message);
  } finally {
    await connection.end();
  }
}

testCreateRoom();
