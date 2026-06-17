const roomService = require('../services/roomService');

(async () => {
  await roomService.cacheService?.flush();

  console.log('Cache da duoc xoa!');
  console.log('Bay gio hay test lai API: http://localhost:5000/api/locations/districts-with-stats');
  process.exit(0);
})().catch((error) => {
  console.error('Khong the xoa cache:', error.message);
  process.exit(1);
});
