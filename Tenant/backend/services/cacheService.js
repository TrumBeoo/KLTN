const NodeCache = require('node-cache');

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
const CACHE_PROVIDER = (process.env.CACHE_PROVIDER || 'memory').toLowerCase();
const REDIS_URL = process.env.REDIS_URL;

class CacheService {
  constructor() {
    this.localCache = new NodeCache({
      stdTTL: DEFAULT_TTL,
      checkperiod: 60,
      useClones: false
    });
    this.redisClient = null;
    this.redisReady = false;
    this.provider = 'memory';
    this.redisInitPromise = null;
  }

  async init() {
    if (this.redisInitPromise) {
      return this.redisInitPromise;
    }

    this.redisInitPromise = this.initializeRedis();
    return this.redisInitPromise;
  }

  async initializeRedis() {
    const shouldUseRedis = CACHE_PROVIDER === 'redis';
    if (!shouldUseRedis) {
      return;
    }

    try {
      const { createClient } = require('redis');
      const client = createClient({
        url: REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 200, 5000)
        }
      });

      client.on('error', (error) => {
        this.redisReady = false;
        this.provider = 'memory';
        console.error('Redis cache error:', error.message);
      });

      client.on('ready', () => {
        this.redisReady = true;
        this.provider = 'redis';
        console.log('Cache provider: redis');
      });

      client.on('end', () => {
        this.redisReady = false;
        this.provider = 'memory';
      });

      await client.connect();
      this.redisClient = client;
    } catch (error) {
      this.redisReady = false;
      this.provider = 'memory';
      console.warn('Redis unavailable, falling back to memory cache:', error.message);
    }
  }

  async get(key) {
    if (this.redisReady && this.redisClient) {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : undefined;
    }

    return this.localCache.get(key);
  }

  async set(key, value, ttl = DEFAULT_TTL) {
    if (this.redisReady && this.redisClient) {
      await this.redisClient.set(key, JSON.stringify(value), { EX: ttl });
      return true;
    }

    return this.localCache.set(key, value, ttl);
  }

  async del(key) {
    if (this.redisReady && this.redisClient) {
      return this.redisClient.del(key);
    }

    return this.localCache.del(key);
  }

  async delByPattern(pattern) {
    if (this.redisReady && this.redisClient) {
      let cursor = '0';
      const keys = [];

      do {
        const result = await this.redisClient.scan(cursor, {
          MATCH: `*${pattern}*`,
          COUNT: 100
        });
        cursor = result.cursor;
        keys.push(...result.keys);
      } while (cursor !== '0');

      if (keys.length > 0) {
        return this.redisClient.del(keys);
      }

      return 0;
    }

    const keys = this.localCache.keys().filter((key) => key.includes(pattern));
    return this.localCache.del(keys);
  }

  async flush() {
    if (this.redisReady && this.redisClient) {
      await this.redisClient.flushDb();
      return true;
    }

    this.localCache.flushAll();
    return true;
  }

  getStats() {
    return {
      provider: this.provider,
      redisReady: this.redisReady,
      local: this.localCache.getStats()
    };
  }

  roomsKey(resource) {
    return `rooms:${resource}`;
  }
}

module.exports = new CacheService();
