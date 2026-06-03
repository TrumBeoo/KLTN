// Script test upload Excel và bulk create để tìm lỗi
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testBulkCreate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    await connection.beginTransaction();
    console.log('=== TEST BULK CREATE ===\n');

    // 1. Lấy landlord
    const [landlords] = await connection.query('SELECT LandlordID FROM LANDLORD LIMIT 1');
    if (landlords.length === 0) {
      console.log('❌ Không có landlord');
      return;
    }
    const landlordId = landlords[0].LandlordID;
    console.log(`1. LandlordID: ${landlordId}`);

    // 2. Lấy building
    const [buildings] = await connection.query(`
      SELECT BuildingID, BuildingName, LocationID, District
      FROM BUILDING
      WHERE LandlordID = ?
      LIMIT 1
    `, [landlordId]);

    if (buildings.length === 0) {
      console.log('❌ Không có building');
      return;
    }

    const building = buildings[0];
    console.log(`2. BuildingID: ${building.BuildingID}`);
    console.log(`   Name: ${building.BuildingName}`);
    console.log(`   LocationID: ${building.LocationID || '❌ NULL'}`);
    console.log(`   District: ${building.District}`);

    if (!building.LocationID) {
      console.log('\n❌ NGUYÊN NHÂN LỖI: Building không có LocationID!');
      console.log('   → Tạo LocationID cho building...\n');

      // Generate LocationID
      const [lastLocation] = await connection.query(
        'SELECT LocationID FROM LOCATION ORDER BY LocationID DESC LIMIT 1'
      );
      
      let locationId;
      if (lastLocation.length > 0) {
        const lastId = parseInt(lastLocation[0].LocationID.substring(3));
        locationId = 'LOC' + String(lastId + 1).padStart(7, '0');
      } else {
        locationId = 'LOC0000001';
      }

      // Tạo LOCATION
      await connection.query(`
        INSERT INTO LOCATION (LocationID, City, District, Ward, Address, CreatedAt, UpdatedAt)
        VALUES (?, 'Hà Nội', ?, '', '', NOW(), NOW())
      `, [locationId, building.District || 'Quận 1']);

      console.log(`   ✓ Đã tạo Location: ${locationId}`);

      // Update BUILDING
      await connection.query(`
        UPDATE BUILDING SET LocationID = ? WHERE BuildingID = ?
      `, [locationId, building.BuildingID]);

      console.log(`   ✓ Đã cập nhật Building với LocationID\n`);
      building.LocationID = locationId;
    }

    // 3. Tạo UPLOAD_JOB giả lập
    const [lastJob] = await connection.query(
      'SELECT UploadJobID FROM UPLOAD_JOB ORDER BY UploadJobID DESC LIMIT 1'
    );
    
    let uploadJobId;
    if (lastJob.length > 0) {
      const lastId = parseInt(lastJob[0].UploadJobID.substring(2));
      uploadJobId = 'UJ' + String(lastId + 1).padStart(5, '0');
    } else {
      uploadJobId = 'UJ00001';
    }

    await connection.query(`
      INSERT INTO UPLOAD_JOB (UploadJobID, LandlordID, BuildingID, Mode, FileName, TotalRows, Status)
      VALUES (?, ?, ?, 'single_building', 'test.xlsx', 2, 'pending')
    `, [uploadJobId, landlordId, building.BuildingID]);

    console.log(`3. Tạo UPLOAD_JOB: ${uploadJobId}`);

    // 4. Tạo UPLOAD_DETAIL giả lập
    const testDetails = [
      {
        roomCode: 'P101',
        title: 'Phòng trọ 101',
        price: 3000000,
        area: 20,
        maxPeople: 2,
        roomType: 'Phòng trọ',
        description: 'Test room 1',
        furniture: 'Giường, Tủ quần áo, Bàn học',
        amenities: 'Điều hòa, Wifi',
        service: 'Điện, Nước',
        rules: 'Không hút thuốc',
        floorType: 'Gạch men'
      },
      {
        roomCode: 'P102',
        title: 'Phòng trọ 102',
        price: 3500000,
        area: 25,
        maxPeople: 2,
        roomType: 'Phòng trọ',
        description: 'Test room 2',
        furniture: 'Giường, Tủ lạnh',
        amenities: 'Máy giặt',
        service: 'Internet',
        rules: 'Không nuôi thú cưng',
        floorType: 'Gỗ'
      }
    ];

    console.log(`4. Tạo ${testDetails.length} UPLOAD_DETAIL:\n`);

    for (let i = 0; i < testDetails.length; i++) {
      const detail = testDetails[i];
      const detailId = 'UD' + String(i + 1).padStart(5, '0');

      await connection.query(`
        INSERT INTO UPLOAD_DETAIL (
          UploadDetailID, UploadJobID, BuildingID, BuildingName, RowNumber, RoomCode, Title, Price, Area, MaxPeople,
          Address, RoomType, Description, Furniture, Amenities, Service, Rules, FloorType, Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        detailId, uploadJobId, building.BuildingID, building.BuildingName, i + 1, 
        detail.roomCode, detail.title, detail.price, detail.area, detail.maxPeople,
        detail.roomType, detail.description, detail.furniture, detail.amenities, 
        detail.service, detail.rules, detail.floorType
      ]);

      console.log(`   ${detailId}: ${detail.roomCode}`);
    }

    // 5. Test bulk create logic
    console.log('\n5. Test BULK CREATE logic:\n');

    const [details] = await connection.query(`
      SELECT * FROM UPLOAD_DETAIL 
      WHERE UploadJobID = ? AND Status = 'pending' 
      ORDER BY RowNumber
    `, [uploadJobId]);

    let successCount = 0;
    let failedCount = 0;

    for (const detail of details) {
      try {
        console.log(`   Processing: ${detail.RoomCode}`);

        // Validate
        if (!detail.RoomCode || detail.RoomCode.trim() === '') {
          throw new Error('Thiếu mã phòng');
        }

        const price = detail.Price || 0;
        const area = detail.Area || 20;
        const maxPeople = detail.MaxPeople || 1;

        if (price < 0) throw new Error('Giá không hợp lệ');
        if (area <= 0) throw new Error('Diện tích không hợp lệ');
        if (maxPeople <= 0) throw new Error('Số người không hợp lệ');

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

        // Insert ROOM
        await connection.query(`
          INSERT INTO ROOM (
            RoomID, LandlordID, BuildingID, LocationID, RoomCode, RoomType, Area, Price, 
            MaxPeople, Description, Furniture, Amenities, Service, Rules, FloorType, 
            Status, DraftStatus, CreatedAt, UpdatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'draft', NOW(), NOW())
        `, [
          roomId, landlordId, building.BuildingID, building.LocationID, 
          detail.RoomCode, detail.RoomType || 'Phòng trọ',
          area, price, maxPeople, detail.Description || '',
          detail.Furniture || '', detail.Amenities || '', detail.Service || '', 
          detail.Rules || '', detail.FloorType || ''
        ]);

        console.log(`     ✓ Created room: ${roomId}`);

        // Test insert furniture
        if (detail.Furniture) {
          const furnitureItems = detail.Furniture.split(',').map(f => f.trim()).filter(f => f);
          for (const item of furnitureItems) {
            const furnitureName = item.length > 95 ? item.substring(0, 95).trim() : item;
            
            const [existingFurniture] = await connection.query(
              'SELECT FurnitureID FROM FURNITURE WHERE Name = ?', [furnitureName]
            );
            
            let furnitureId;
            if (existingFurniture.length > 0) {
              furnitureId = existingFurniture[0].FurnitureID;
            } else {
              const [lastFurniture] = await connection.query(
                'SELECT FurnitureID FROM FURNITURE ORDER BY FurnitureID DESC LIMIT 1'
              );
              const lastId = lastFurniture.length > 0 ? parseInt(lastFurniture[0].FurnitureID.substring(3)) : 0;
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
          }
          console.log(`     ✓ Added furniture`);
        }

        // Update UPLOAD_DETAIL
        await connection.query(
          'UPDATE UPLOAD_DETAIL SET Status = ?, RoomID = ? WHERE UploadDetailID = ?',
          ['success', roomId, detail.UploadDetailID]
        );

        successCount++;
        console.log(`     ✓ Success\n`);

      } catch (error) {
        console.log(`     ❌ FAILED: ${error.message}`);
        console.log(`     SQL State: ${error.sqlState}`);
        console.log(`     SQL Message: ${error.sqlMessage}\n`);
        
        await connection.query(
          'UPDATE UPLOAD_DETAIL SET Status = ?, ErrorMessage = ? WHERE UploadDetailID = ?',
          ['failed', error.message, detail.UploadDetailID]
        );
        
        failedCount++;
      }
    }

    await connection.query(
      'UPDATE UPLOAD_JOB SET Status = ?, SuccessRows = ?, FailedRows = ? WHERE UploadJobID = ?',
      ['processing', successCount, failedCount, uploadJobId]
    );

    await connection.commit();

    console.log(`\n✓ TEST HOÀN THÀNH:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failedCount}`);
    console.log(`  JobID: ${uploadJobId}`);

  } catch (error) {
    await connection.rollback();
    console.error('\n❌ TEST THẤT BẠI:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

testBulkCreate();
