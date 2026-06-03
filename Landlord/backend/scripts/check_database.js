// Script để kiểm tra database trước khi tạo phòng
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== KIỂM TRA DATABASE ===\n');

    // 1. Kiểm tra UPLOAD_JOB gần nhất
    console.log('1. UPLOAD_JOB gần nhất:');
    const [jobs] = await connection.query(`
      SELECT UploadJobID, LandlordID, BuildingID, Status, TotalRows, FileName
      FROM UPLOAD_JOB
      ORDER BY CreatedAt DESC
      LIMIT 3
    `);
    jobs.forEach(job => {
      console.log(`  JobID: ${job.UploadJobID}, Building: ${job.BuildingID}, Status: ${job.Status}`);
    });

    if (jobs.length > 0) {
      const jobId = jobs[0].UploadJobID;
      
      // 2. Kiểm tra UPLOAD_DETAIL
      console.log(`\n2. UPLOAD_DETAIL của job ${jobId}:`);
      const [details] = await connection.query(`
        SELECT UploadDetailID, RoomCode, Price, Area, MaxPeople, BuildingID, Status
        FROM UPLOAD_DETAIL
        WHERE UploadJobID = ?
        LIMIT 5
      `, [jobId]);
      
      details.forEach(d => {
        console.log(`  ID: ${d.UploadDetailID}, Code: ${d.RoomCode}, Building: ${d.BuildingID}, Status: ${d.Status}`);
      });

      // 3. Kiểm tra BUILDING
      if (details.length > 0 && details[0].BuildingID) {
        console.log(`\n3. BUILDING ${details[0].BuildingID}:`);
        const [buildings] = await connection.query(`
          SELECT BuildingID, BuildingName, LocationID, LandlordID
          FROM BUILDING
          WHERE BuildingID = ?
        `, [details[0].BuildingID]);
        
        if (buildings.length === 0) {
          console.log('  ❌ BUILDING KHÔNG TỒN TẠI!');
        } else {
          const building = buildings[0];
          console.log(`  Name: ${building.BuildingName}`);
          console.log(`  LocationID: ${building.LocationID || '❌ NULL'}`);
          
          if (!building.LocationID) {
            console.log('\n  ❌ NGUYÊN NHÂN LỖI: Building không có LocationID!');
            console.log('  → ROOM bắt buộc phải có LocationID (FK constraint)');
          }
        }
      }

      // 4. Kiểm tra dữ liệu không hợp lệ
      console.log('\n4. Dữ liệu không hợp lệ:');
      const [invalidData] = await connection.query(`
        SELECT UploadDetailID, RoomCode,
          CASE WHEN Price IS NULL OR Price < 0 THEN 'BAD' ELSE 'OK' END as Price,
          CASE WHEN Area IS NULL OR Area <= 0 THEN 'BAD' ELSE 'OK' END as Area,
          CASE WHEN MaxPeople IS NULL OR MaxPeople <= 0 THEN 'BAD' ELSE 'OK' END as MaxPeople,
          CASE WHEN BuildingID IS NULL THEN 'BAD' ELSE 'OK' END as Building,
          CASE WHEN RoomCode IS NULL OR RoomCode = '' THEN 'BAD' ELSE 'OK' END as RoomCode
        FROM UPLOAD_DETAIL
        WHERE UploadJobID = ?
      `, [jobId]);

      const invalid = invalidData.filter(d => 
        d.Price === 'BAD' || d.Area === 'BAD' || d.MaxPeople === 'BAD' || 
        d.Building === 'BAD' || d.RoomCode === 'BAD'
      );

      if (invalid.length > 0) {
        console.log('  ❌ Tìm thấy dữ liệu lỗi:');
        invalid.forEach(d => {
          console.log(`    ${d.UploadDetailID}: Price=${d.Price}, Area=${d.Area}, MaxPeople=${d.MaxPeople}, Building=${d.Building}, RoomCode=${d.RoomCode}`);
        });
      } else {
        console.log('  ✓ OK');
      }
    }

    // 5. Kiểm tra FK constraints
    console.log('\n5. Foreign Key của ROOM:');
    const [fks] = await connection.query(`
      SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ROOM' AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);
    fks.forEach(fk => {
      console.log(`  ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
    });

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error('SQL State:', error.sqlState);
  } finally {
    await connection.end();
  }
}

checkDatabase();
