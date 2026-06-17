"""
cache.py - Redis-ready cache abstraction for AI chat
"""

from typing import Any, Optional
import time
import hashlib
import json
import os


DEFAULT_CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))
CACHE_PROVIDER = (os.getenv("CACHE_PROVIDER", "memory") or "memory").lower()
REDIS_URL = os.getenv("REDIS_URL", "")


class CacheStats:
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.sets = 0
        self.deletes = 0

    def record_hit(self):
        self.hits += 1

    def record_miss(self):
        self.misses += 1

    def record_set(self):
        self.sets += 1

    def record_delete(self, count: int = 1):
        self.deletes += count

    def to_dict(self):
        total_reads = self.hits + self.misses
        hit_rate = (self.hits / total_reads) if total_reads > 0 else 0.0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "sets": self.sets,
            "deletes": self.deletes,
            "hit_rate": round(hit_rate, 4),
        }


class MemoryCacheBackend:
    def __init__(self):
        self._cache = {}
        self._timestamps = {}

    def get(self, key: str, ttl: int = DEFAULT_CACHE_TTL) -> Optional[Any]:
        if key not in self._cache:
            return None

        timestamp = self._timestamps.get(key, 0)
        if time.time() - timestamp > ttl:
            self.delete(key)
            return None

        return self._cache[key]

    def set(self, key: str, value: Any):
        self._cache[key] = value
        self._timestamps[key] = time.time()

    def delete(self, key: str) -> int:
        existed = 0
        if key in self._cache:
            del self._cache[key]
            existed += 1
        if key in self._timestamps:
            del self._timestamps[key]
        return existed

    def clear(self):
        self._cache.clear()
        self._timestamps.clear()

    def clear_prefix(self, prefix: str) -> int:
        keys_to_delete = [key for key in list(self._cache.keys()) if key.startswith(prefix)]
        for key in keys_to_delete:
            self.delete(key)
        return len(keys_to_delete)

    def size(self) -> int:
        return len(self._cache)


class RedisCacheBackend:
    def __init__(self, url: str):
        self.client = None
        self.ready = False
        try:
            from redis import Redis
            self.client = Redis.from_url(url, decode_responses=True)
            self.client.ping()
            self.ready = True
        except Exception as error:
            self.client = None
            self.ready = False
            print(f"[WARNING] Redis unavailable, fallback to memory cache: {error}")

    def get(self, key: str, ttl: int = DEFAULT_CACHE_TTL) -> Optional[Any]:
        if not self.ready or not self.client:
            return None
        raw = self.client.get(key)
        return json.loads(raw) if raw else None

    def set(self, key: str, value: Any, ttl: int = DEFAULT_CACHE_TTL):
        if self.ready and self.client:
            self.client.set(key, json.dumps(value, ensure_ascii=False, default=str), ex=ttl)

    def delete(self, key: str) -> int:
        if not self.ready or not self.client:
            return 0
        return int(self.client.delete(key))

    def clear(self):
        if self.ready and self.client:
            self.client.flushdb()

    def clear_prefix(self, prefix: str) -> int:
        if not self.ready or not self.client:
            return 0
        matched = self.client.keys(f"{prefix}*")
        if not matched:
            return 0
        return int(self.client.delete(*matched))

    def size(self) -> int:
        if not self.ready or not self.client:
            return 0
        return int(self.client.dbsize())


class CacheManager:
    def __init__(self):
        self.stats = CacheStats()
        self.memory = MemoryCacheBackend()
        use_redis = CACHE_PROVIDER == "redis"
        self.redis = RedisCacheBackend(REDIS_URL) if use_redis else None
        self.provider = "redis" if self.redis and self.redis.ready else "memory"

    def _make_key(self, prefix: str, data: Any) -> str:
        json_str = json.dumps(data, sort_keys=True, default=str)
        hash_obj = hashlib.md5(json_str.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"

    def get(self, key: str, ttl: int = DEFAULT_CACHE_TTL) -> Optional[Any]:
        if self.provider == "redis" and self.redis:
            value = self.redis.get(key, ttl)
            if value is not None:
                self.stats.record_hit()
                return value

        value = self.memory.get(key, ttl)
        if value is not None:
            self.stats.record_hit()
            return value

        self.stats.record_miss()
        return None

    def set(self, key: str, value: Any, ttl: int = DEFAULT_CACHE_TTL):
        self.memory.set(key, value)
        if self.provider == "redis" and self.redis:
            self.redis.set(key, value, ttl)
        self.stats.record_set()

    def clear(self):
        self.memory.clear()
        if self.provider == "redis" and self.redis:
            self.redis.clear()

    def clear_prefix(self, prefix: str):
        deleted = self.memory.clear_prefix(prefix)
        if self.provider == "redis" and self.redis:
            deleted += self.redis.clear_prefix(prefix)
        self.stats.record_delete(deleted)

    def health(self):
        return {
            "provider": self.provider,
            "default_ttl": DEFAULT_CACHE_TTL,
            "redis_enabled": self.provider == "redis",
            "memory_entries": self.memory.size(),
            "redis_entries": self.redis.size() if self.redis and self.redis.ready else 0,
            "stats": self.stats.to_dict(),
        }


_cache = CacheManager()


def cache_intent(message: str, context: dict = None) -> Optional[dict]:
    key = _cache._make_key("intent", {"msg": message, "ctx": context})
    return _cache.get(key, ttl=300)


def set_intent_cache(message: str, context: dict, result: dict):
    key = _cache._make_key("intent", {"msg": message, "ctx": context})
    _cache.set(key, result, ttl=300)


def cache_db_query(query_type: str, filters: dict) -> Optional[Any]:
    key = _cache._make_key(f"db:{query_type}", filters)
    return _cache.get(key, ttl=120)


def set_db_cache(query_type: str, filters: dict, result: Any):
    key = _cache._make_key(f"db:{query_type}", filters)
    _cache.set(key, result, ttl=120)


def cache_room_detail(room_code: str) -> Optional[dict]:
    return _cache.get(f"room:{room_code}", ttl=300)


def set_room_detail_cache(room_code: str, room_data: dict):
    _cache.set(f"room:{room_code}", room_data, ttl=300)


def clear_all():
    _cache.clear()


def clear_db_cache():
    _cache.clear_prefix("db:")
    _cache.clear_prefix("room:")


def get_cache_health():
    return _cache.health()
