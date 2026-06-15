const db = require('../config/database');

async function checkDongDaRooms() {
  try {
    console.log('=== Kiểm tra phòng ở Quận Đống Đa ===\n');
    
    // Kiểm tra tất cả phòng có liên quan đến Đống Đa
    const [rooms] = await db.query(`
      SELECT 
        r.RoomID, r.Title, r.Status,
        b.BuildingID, b.BuildingName, b.District as BuildingDistrict,
        loc.LocationID, loc.District as LocationDistrict, loc.Ward, loc.Street,
        lst.IsVisible
      FROM ROOM r
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      LEFT JOIN LISTING lst ON r.RoomID = lst.RoomID
      WHERE b.District LIKE '%Đống Đa%' 
         OR b.District LIKE '%Dong Da%'
         OR loc.District LIKE '%Đống Đa%'
         OR loc.District LIKE '%Dong Da%'
    `);
    
    console.log(`Tìm thấy ${rooms.length} phòng liên quan đến Đống Đa:\n`);
    
    rooms.forEach((room, idx) => {
      console.log(`${idx + 1}. RoomID: ${room.RoomID} | Title: ${room.Title}`);
      console.log(`   Status: ${room.Status}`);
      console.log(`   BuildingID: ${room.BuildingID || 'NULL'}`);
      console.log(`   BuildingDistrict: ${room.BuildingDistrict || 'NULL'}`);
      console.log(`   LocationID: ${room.LocationID || 'NULL'}`);
      console.log(`   LocationDistrict: ${room.LocationDistrict || 'NULL'}`);
      console.log(`   Ward: ${room.Ward || 'NULL'}`);
      console.log(`   IsVisible: ${room.IsVisible === null ? 'NULL (mặc định hiển thị)' : room.IsVisible}`);
      
      // Kiểm tra điều kiện lọc
      const passStatusCheck = ['available', 'viewing'].includes(room.Status);
      const passVisibilityCheck = room.IsVisible === null || room.IsVisible === 1;
      const districtMatch = room.BuildingDistrict || room.LocationDistrict;
      
      console.log(`   ✓ Status OK: ${passStatusCheck ? 'YES' : 'NO'}`);
      console.log(`   ✓ Visible OK: ${passVisibilityCheck ? 'YES' : 'NO'}`);
      console.log(`   ✓ District: ${districtMatch}`);
      console.log(`   => Có hiển thị: ${passStatusCheck && passVisibilityCheck ? 'YES ✓' : 'NO ✗'}`);
      console.log('');
    });
    
    // Test query thực tế của getAllRooms
    console.log('\n=== Test query getAllRooms với district="Đống Đa" ===\n');
    
    const [testRooms] = await db.query(`
      SELECT r.RoomID, r.Title, r.Status,
             b.District as BuildingDistrict,
             loc.District as LocationDistrict,
             lst.IsVisible
      FROM ROOM r
      JOIN LANDLORD l ON r.LandlordID = l.LandlordID
      LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      LEFT JOIN LISTING lst ON r.RoomID = lst.RoomID
      WHERE (r.Status IN ('available', 'viewing') AND (lst.IsVisible IS NULL OR lst.IsVisible = 1))
        AND (b.District = ? OR (b.District IS NULL AND loc.District = ?))
    `, ['Đống Đa', 'Đống Đa']);
    
    console.log(`Kết quả: ${testRooms.length} phòng`);
    testRooms.forEach(room => {
      console.log(`- RoomID ${room.RoomID}: BuildingDistrict="${room.BuildingDistrict}", LocationDistrict="${room.LocationDistrict}"`);
    });
    
    // Kiểm tra các biến thể tên quận
    console.log('\n=== Kiểm tra các biến thể tên quận ===\n');
    const variants = ['Đống Đa', 'Dong Da', 'Dống Đa', 'đống đa'];
    
    for (const variant of variants) {
      const [count] = await db.query(`
        SELECT COUNT(*) as total FROM ROOM r
        LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
        LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
        WHERE b.District = ? OR loc.District = ?
      `, [variant, variant]);
      console.log(`"${variant}": ${count[0].total} phòng`);
    }
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

checkDongDaRooms();
