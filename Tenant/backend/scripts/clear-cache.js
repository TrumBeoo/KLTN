const roomService = require('../services/roomService');

// Clear cache để test lại
roomService.roomCache?.flushAll();

console.log('✅ Cache đã được xóa!');
console.log('Bây giờ hãy test lại API: http://localhost:5000/api/locations/districts-with-stats');
process.exit(0);
