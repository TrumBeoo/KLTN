"""
cache.py - In-memory cache for AI chat to reduce DB/API load
"""

from typing import Any, Optional
import time
import hashlib
import json

class SimpleCache:
    """Thread-safe in-memory cache with TTL"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def _make_key(self, prefix: str, data: Any) -> str:
        """Generate cache key from data"""
        json_str = json.dumps(data, sort_keys=True, default=str)
        hash_obj = hashlib.md5(json_str.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"
    
    def get(self, key: str, ttl: int = 300) -> Optional[Any]:
        """Get cached value if not expired
        
        Args:
            key: Cache key
            ttl: Time to live in seconds (default: 5 minutes)
        
        Returns:
            Cached value or None if expired/not found
        """
        if key not in self._cache:
            return None
        
        # Check expiration
        timestamp = self._timestamps.get(key, 0)
        if time.time() - timestamp > ttl:
            # Expired, clean up
            del self._cache[key]
            del self._timestamps[key]
            return None
        
        return self._cache[key]
    
    def set(self, key: str, value: Any):
        """Set cache value"""
        self._cache[key] = value
        self._timestamps[key] = time.time()
    
    def clear(self):
        """Clear all cache"""
        self._cache.clear()
        self._timestamps.clear()
    
    def clear_prefix(self, prefix: str):
        """Clear all keys with given prefix"""
        keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
        for key in keys_to_delete:
            del self._cache[key]
            if key in self._timestamps:
                del self._timestamps[key]


# Global cache instance
_cache = SimpleCache()


def cache_intent(message: str, context: dict = None) -> Optional[dict]:
    """Get cached intent result"""
    key = _cache._make_key("intent", {"msg": message, "ctx": context})
    return _cache.get(key, ttl=300)  # 5 minutes


def set_intent_cache(message: str, context: dict, result: dict):
    """Cache intent result"""
    key = _cache._make_key("intent", {"msg": message, "ctx": context})
    _cache.set(key, result)


def cache_db_query(query_type: str, filters: dict) -> Optional[Any]:
    """Get cached DB query result"""
    key = _cache._make_key(f"db:{query_type}", filters)
    return _cache.get(key, ttl=120)  # 2 minutes for room data


def set_db_cache(query_type: str, filters: dict, result: Any):
    """Cache DB query result"""
    key = _cache._make_key(f"db:{query_type}", filters)
    _cache.set(key, result)


def cache_room_detail(room_code: str) -> Optional[dict]:
    """Get cached room detail"""
    return _cache.get(f"room:{room_code}", ttl=300)


def set_room_detail_cache(room_code: str, room_data: dict):
    """Cache room detail"""
    _cache.set(f"room:{room_code}", room_data)


def clear_all():
    """Clear all caches"""
    _cache.clear()


def clear_db_cache():
    """Clear only DB caches (use when data is updated)"""
    _cache.clear_prefix("db:")
    _cache.clear_prefix("room:")
