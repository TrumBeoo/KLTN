// Script kiểm tra UPLOAD_JOB và UPLOAD_DETAIL trên production
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUploadJob() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== KIỂM TRA UPLOAD_JOB TRÊN PRODUCTION ===\n');

    // 1. Lấy tất cả UPLOAD_JOB gần đây
    console.log('1. Danh sách UPLOAD_JOB:');
    const [jobs] = await connection.query(`
      SELECT UploadJobID, LandlordID, BuildingID, Mode, FileName, TotalRows, 
             SuccessRows, FailedRows, Status, CreatedAt
      FROM UPLOAD_JOB
      ORDER BY CreatedAt DESC
      LIMIT 10
    `);
    
    if (jobs.length === 0) {
      console.log('  Không có UPLOAD_JOB nào');
      return;
    }

    jobs.forEach((job, idx) => {
      console.log(`  ${idx + 1}. JobID: ${job.UploadJobID}`);
      console.log(`     File: ${job.FileName}`);
      console.log(`     Building: ${job.BuildingID || 'NULL'}`);
      console.log(`     Status: ${job.Status}, Total: ${job.TotalRows}, Success: ${job.SuccessRows}, Failed: ${job.FailedRows}`);
      console.log(`     Created: ${job.CreatedAt}\n`);
    });

    // 2. Lấy job gần nhất
    const latestJob = jobs[0];
    console.log(`\n2. Chi tiết job gần nhất: ${latestJob.UploadJobID}`);

    // 3. Kiểm tra UPLOAD_DETAIL
    const [details] = await connection.query(`
      SELECT UploadDetailID, RowNumber, RoomCode, Price, Area, MaxPeople, 
             BuildingID, BuildingName, Status, ErrorMessage, RoomID
      FROM UPLOAD_DETAIL
      WHERE UploadJobID = ?
      ORDER BY RowNumber
    `, [latestJob.UploadJobID]);

    console.log(`   Tổng số detail: ${details.length}\n`);

    // Group by status
    const statusCount = details.reduce((acc, d) => {
      acc[d.Status] = (acc[d.Status] || 0) + 1;
      return acc;
    }, {});

    console.log('   Thống kê status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    // 4. Kiểm tra detail pending
    const pendingDetails = details.filter(d => d.Status === 'pending');
    if (pendingDetails.length > 0) {
      console.log(`\n3. Chi tiết ${pendingDetails.length} detail PENDING:`);
      pendingDetails.slice(0, 5).forEach(d => {
        console.log(`   - ${d.UploadDetailID}: ${d.RoomCode}`);
        console.log(`     Building: ${d.BuildingID} (${d.BuildingName || 'no name'})`);
        console.log(`     Price: ${d.Price}, Area: ${d.Area}, MaxPeople: ${d.MaxPeople}`);
      });

      // Kiểm tra BuildingID có tồn tại không
      const buildingIds = [...new Set(pendingDetails.map(d => d.BuildingID).filter(b => b))];
      if (buildingIds.length > 0) {
        console.log(`\n4. Kiểm tra BUILDING:`);
        for (const bid of buildingIds) {
          const [buildings] = await connection.query(`
            SELECT BuildingID, BuildingName, LocationID, LandlordID
            FROM BUILDING
            WHERE BuildingID = ?
          `, [bid]);

          if (buildings.length === 0) {
            console.log(`   ❌ ${bid}: KHÔNG TỒN TẠI trong BUILDING table!`);
          } else {
            const b = buildings[0];
            console.log(`   ✓ ${bid}: ${b.BuildingName}`);
            console.log(`     LocationID: ${b.LocationID || '❌ NULL'}`);
            console.log(`     LandlordID: ${b.LandlordID}`);
            
            if (!b.LocationID) {
              console.log(`     ⚠️ NGUYÊN NHÂN LỖI: Building thiếu LocationID!`);
            }
          }
        }
      }
    }

    // 5. Kiểm tra detail failed
    const failedDetails = details.filter(d => d.Status === 'failed');
    if (failedDetails.length > 0) {
      console.log(`\n5. Chi tiết ${failedDetails.length} detail FAILED:`);
      failedDetails.slice(0, 10).forEach(d => {
        console.log(`   - ${d.RoomCode}: ${d.ErrorMessage || 'No error message'}`);
      });
    }

    // 6. Kiểm tra dữ liệu không hợp lệ
    console.log('\n6. Kiểm tra dữ liệu không hợp lệ:');
    const invalidData = details.filter(d => 
      !d.RoomCode || 
      d.RoomCode.trim() === '' ||
      d.Price === null || 
      d.Price < 0 ||
      d.Area === null || 
      d.Area <= 0 ||
      d.MaxPeople === null || 
      d.MaxPeople <= 0 ||
      !d.BuildingID
    );

    if (invalidData.length > 0) {
      console.log(`   ❌ Tìm thấy ${invalidData.length} detail có dữ liệu không hợp lệ:`);
      invalidData.slice(0, 5).forEach(d => {
        const issues = [];
        if (!d.RoomCode || d.RoomCode.trim() === '') issues.push('RoomCode empty');
        if (d.Price === null || d.Price < 0) issues.push('Price invalid');
        if (d.Area === null || d.Area <= 0) issues.push('Area invalid');
        if (d.MaxPeople === null || d.MaxPeople <= 0) issues.push('MaxPeople invalid');
        if (!d.BuildingID) issues.push('BuildingID null');
        
        console.log(`     ${d.UploadDetailID} (${d.RoomCode}): ${issues.join(', ')}`);
      });
    } else {
      console.log('   ✓ Không có dữ liệu không hợp lệ');
    }

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

checkUploadJob();
