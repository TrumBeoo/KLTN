const db = require('../config/database');

async function testDistrictsQuery() {
  try {
    console.log('=== Test query districts-with-stats ===\n');
    
    const [districts] = await db.query(`
      SELECT 
        District,
        RoomCount,
        (SELECT ri.ImageURL 
         FROM ROOM r3
         LEFT JOIN BUILDING b3 ON r3.BuildingID = b3.BuildingID
         LEFT JOIN LOCATION loc3 ON r3.LocationID = loc3.LocationID
         INNER JOIN ROOM_IMAGE ri ON r3.RoomID = ri.RoomID 
         WHERE COALESCE(b3.District, loc3.District) = district_data.District
           AND r3.Status IN ('available', 'viewing')
         ORDER BY ri.DisplayOrder 
         LIMIT 1) as ImageURL
      FROM (
        SELECT 
          COALESCE(b.District, loc.District) as District,
          COUNT(DISTINCT r.RoomID) as RoomCount
        FROM ROOM r
        LEFT JOIN BUILDING b ON r.BuildingID = b.BuildingID
        LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID 
        LEFT JOIN LISTING lst ON r.RoomID = lst.RoomID
        WHERE r.Status IN ('available', 'viewing')
          AND (lst.IsVisible IS NULL OR lst.IsVisible = 1)
          AND (b.District IS NOT NULL OR loc.District IS NOT NULL)
        GROUP BY COALESCE(b.District, loc.District)
      ) as district_data
      WHERE RoomCount > 0
      ORDER BY RoomCount DESC
      LIMIT 8
    `);
    
    console.log(`Tìm thấy ${districts.length} quận:\n`);
    districts.forEach((d, idx) => {
      console.log(`${idx + 1}. ${d.District}: ${d.RoomCount} phòng`);
      console.log(`   ImageURL: ${d.ImageURL ? 'Có' : 'Không'}`);
    });
    
    // Check Đống Đa
    const dongDa = districts.find(d => d.District === 'Đống Đa');
    if (dongDa) {
      console.log('\n✅ Đống Đa đã xuất hiện trong danh sách!');
    } else {
      console.log('\n❌ Đống Đa KHÔNG có trong danh sách');
    }
    
  } catch (error) {
    console.error('Lỗi:', error.message);
    console.error('SQL:', error.sql);
  } finally {
    process.exit(0);
  }
}

testDistrictsQuery();
