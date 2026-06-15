const NodeCache = require('node-cache');

// Cache với TTL mặc định 5 phút
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance, không clone objects
});

class CacheService {
  // Get cached data
  get(key) {
    return cache.get(key);
  }

  // Set cache with optional TTL
  set(key, value, ttl = 300) {
    return cache.set(key, value, ttl);
  }

  // Delete specific key
  del(key) {
    return cache.del(key);
  }

  // Delete multiple keys by pattern
  delByPattern(pattern) {
    const keys = cache.keys().filter(key => key.includes(pattern));
    return cache.del(keys);
  }

  // Clear all cache
  flush() {
    return cache.flushAll();
  }

  // Get cache stats
  getStats() {
    return cache.getStats();
  }

  // Generate cache key for landlord data
  landlordKey(accountId, resource) {
    return `landlord:${accountId}:${resource}`;
  }

  // Generate cache key for room data
  roomKey(roomId) {
    return `room:${roomId}`;
  }

  // Generate cache key for building data
  buildingKey(buildingId) {
    return `building:${buildingId}`;
  }

  // Generate cache key for dashboard stats
  dashboardKey(landlordId) {
    return `dashboard:${landlordId}`;
  }

  // Clear landlord related cache
  clearLandlordCache(accountId) {
    this.delByPattern(`landlord:${accountId}`);
  }

  // Clear room related cache
  clearRoomCache(roomId) {
    this.del(this.roomKey(roomId));
  }
}

module.exports = new CacheService();
