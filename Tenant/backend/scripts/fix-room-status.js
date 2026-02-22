const mysql = require('mysql2/promise');
require('dotenv').config();

const fixRoomStatus = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    console.log('✓ Kết nối database thành công');

    // Check current status of ROM0000002
    const [rooms] = await connection.query(
      'SELECT RoomID, Status FROM ROOM WHERE RoomID = ?',
      ['ROM0000002']
    );

    if (rooms.length > 0) {
      console.log(`Trạng thái hiện tại của ROM0000002: ${rooms[0].Status}`);
      
      // Update status to 'available' if it's not already
      if (rooms[0].Status !== 'available') {
        await connection.query(
          'UPDATE ROOM SET Status = ?, UpdatedAt = NOW() WHERE RoomID = ?',
          ['available', 'ROM0000002']
        );
        console.log('✓ Đã cập nhật trạng thái ROM0000002 thành "available"');
      } else {
        console.log('✓ ROM0000002 đã có trạng thái "available"');
      }
    } else {
      console.log('❌ Không tìm thấy phòng ROM0000002');
    }

    // Show all rooms and their status
    const [allRooms] = await connection.query(
      'SELECT RoomID, Status, Price, Description FROM ROOM ORDER BY RoomID'
    );
    
    console.log('\nDanh sách tất cả phòng:');
    allRooms.forEach(room => {
      console.log(`- ${room.RoomID}: ${room.Status} - ${room.Description} (${room.Price}đ)`);
    });

    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

fixRoomStatus();