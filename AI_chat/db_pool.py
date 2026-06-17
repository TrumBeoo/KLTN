"""
db_pool.py - Shared MySQL connection pool for AI chat services
"""

from config import DB_CONFIG, DB_POOL_CONFIG

try:
    import mysql.connector
    from mysql.connector import pooling
    _MYSQL_OK = True
except ImportError:
    _MYSQL_OK = False
    mysql = None
    pooling = None


class MySQLPoolManager:
    def __init__(self):
        self._pool = None
        self._ready = False

    def init(self):
        if not _MYSQL_OK or self._pool is not None:
            return self._pool

        try:
            self._pool = pooling.MySQLConnectionPool(**DB_POOL_CONFIG)
            self._ready = True
        except Exception as error:
            self._pool = None
            self._ready = False
            print(f"[WARNING] MySQL pool unavailable: {error}")

        return self._pool

    def is_ready(self) -> bool:
        return self._ready and self._pool is not None

    def get_connection(self):
        if self._pool is None:
            self.init()

        if self._pool is not None:
            return self._pool.get_connection()

        return mysql.connector.connect(**DB_CONFIG)

    def health(self):
        return {
            "mysql_connector_available": _MYSQL_OK,
            "pool_ready": self.is_ready(),
            "pool_name": DB_POOL_CONFIG.get("pool_name"),
            "pool_size": DB_POOL_CONFIG.get("pool_size"),
        }


pool_manager = MySQLPoolManager()
