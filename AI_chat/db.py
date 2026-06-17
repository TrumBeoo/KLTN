"""
db.py - Database client for Rentify AI Chat
Merges: db_client.py + ai_query_limiter.py + privacy_filter logic
"""

import decimal
import datetime
from typing import Any, Dict, List, Optional

from config import ALLOWED_ROOM_FIELDS, PRIVACY_FIELDS, PRIVACY_PLACEHOLDER
from db_pool import pool_manager

try:
    import mysql.connector
    _MYSQL_OK = True
except ImportError:
    _MYSQL_OK = False
    print("[WARNING] mysql-connector-python not installed — demo mode active")

_SORT_MAP = {
    "price_asc":  "Price ASC",
    "price_desc": "Price DESC",
    "area_asc":   "Area ASC",
    "area_desc":  "Area DESC",
}

# ── Data sanitisation helpers ─────────────────────────────

def _convert_row(row: dict) -> dict:
    """Convert Decimal/date types to JSON-safe equivalents."""
    out = {}
    for k, v in row.items():
        if isinstance(v, decimal.Decimal):
            out[k] = float(v)
        elif isinstance(v, (datetime.date, datetime.datetime)):
            out[k] = v.isoformat()
        elif isinstance(v, bytes):
            out[k] = v.decode("utf-8", errors="ignore")
        else:
            out[k] = v
    return out


def filter_allowed_fields(data: Any) -> Any:
    """Keep only ALLOWED_ROOM_FIELDS on room dicts."""
    if isinstance(data, list):
        return [filter_allowed_fields(item) for item in data]
    if isinstance(data, dict):
        return {k: v for k, v in data.items() if k in ALLOWED_ROOM_FIELDS}
    return data


def filter_privacy(data: Any) -> Any:
    """Mask PRIVACY_FIELDS in any nested structure."""
    if isinstance(data, list):
        return [filter_privacy(item) for item in data]
    if isinstance(data, dict):
        return {
            k: (PRIVACY_PLACEHOLDER if k in PRIVACY_FIELDS else filter_privacy(v))
            for k, v in data.items()
        }
    return data


# ── Database client ───────────────────────────────────────

class DatabaseClient:
    def __init__(self):
        self.connected = False
        if _MYSQL_OK:
            self._check_connection()

    def _check_connection(self):
        try:
            conn = pool_manager.get_connection()
            conn.close()
            self.connected = True
            print("[OK] DB connected")
        except Exception as e:
            print(f"[WARNING] DB unavailable: {e} — demo mode")

    def is_connected(self) -> bool:
        return self.connected

    # ── Internal executor ─────────────────────────────────

    def _run(self, query: str, params: tuple = ()) -> List[Dict]:
        if not self.connected:
            return []
        try:
            conn = pool_manager.get_connection()
            cur = conn.cursor(dictionary=True)
            cur.execute(query, params)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return [_convert_row(r) for r in rows]
        except Exception as e:
            print(f"[DB Error] {e}")
            return []

    # ── Room queries ──────────────────────────────────────

    def search_rooms(self, filters: Dict[str, Any]) -> List[Dict]:
        """
        Dynamic room search.
        Applies price/area/type/district filters strictly, returns only allowed fields.
        Note: RoomID is kept internally for tracking but filtered out before returning to AI.
        """
        conditions: List[str] = []
        params: List[Any] = []

        price_min = filters.get("price_min")
        price_max = filters.get("price_max")
        area_min  = filters.get("area_min")
        area_max  = filters.get("area_max")
        room_type = filters.get("room_type")
        district  = filters.get("district")
        ward      = filters.get("ward")

        # Validate and coerce numeric filters
        if price_min is not None:
            try:
                conditions.append("r.Price >= %s")
                params.append(float(price_min))
            except (TypeError, ValueError):
                pass

        if price_max is not None:
            try:
                conditions.append("r.Price <= %s")
                params.append(float(price_max))
            except (TypeError, ValueError):
                pass

        if area_min is not None:
            try:
                conditions.append("r.Area >= %s")
                params.append(float(area_min))
            except (TypeError, ValueError):
                pass

        if area_max is not None:
            try:
                conditions.append("r.Area <= %s")
                params.append(float(area_max))
            except (TypeError, ValueError):
                pass

        if room_type:
            conditions.append("r.RoomType LIKE %s")
            params.append(f"%{room_type}%")

        if district:
            conditions.append("l.District = %s")
            params.append(district)

        if ward:
            conditions.append("l.Ward = %s")
            params.append(ward)

        where = " AND ".join(conditions) if conditions else "1=1"
        order = _SORT_MAP.get(filters.get("sort_by", ""), "Price ASC, RoomCode ASC")
        limit = min(int(filters.get("limit", 5)), 20)

        # Optimized: Only SELECT fields we need, avoid LEFT JOIN if district not needed
        if district or ward:
            query = f"""
                SELECT r.RoomCode, r.RoomType, r.Area, r.Price, r.Description
                FROM ROOM r
                LEFT JOIN LOCATION l ON r.LocationID = l.LocationID
                WHERE {where}
                ORDER BY {order}
                LIMIT %s
            """
        else:
            query = f"""
                SELECT r.RoomCode, r.RoomType, r.Area, r.Price, r.Description
                FROM ROOM r
                WHERE {where}
                ORDER BY {order}
                LIMIT %s
            """
        params.append(limit)
        results = self._run(query, tuple(params))
        return filter_allowed_fields(results)

    def get_cheap_rooms(self, max_price: Optional[float] = None, limit: int = 5) -> List[Dict]:
        return self.search_rooms({"price_max": max_price, "limit": limit, "sort_by": "price_asc"})

    def get_available_rooms(self, limit: int = 5) -> List[Dict]:
        # Note: ALLOWED_ROOM_FIELDS doesn't include Status so we just search without status filter
        return self.search_rooms({"limit": limit, "sort_by": "price_asc"})

    def get_room_stats(self) -> List[Dict]:
        return self._run("""
            SELECT
                COUNT(*)                                                   AS total_rooms,
                SUM(CASE WHEN Status='available' THEN 1 ELSE 0 END)       AS available_rooms,
                SUM(CASE WHEN Status='rented'    THEN 1 ELSE 0 END)       AS rented_rooms,
                ROUND(AVG(Price), 0)                                       AS avg_price,
                MIN(Price)                                                 AS min_price,
                MAX(Price)                                                 AS max_price,
                ROUND(AVG(Area), 1)                                        AS avg_area,
                COUNT(DISTINCT LandlordID)                                 AS total_landlords
            FROM ROOM
        """)

    def get_buildings(self, filters: Dict = {}) -> List[Dict]:
        conditions: List[str] = []
        params: List[Any] = []
        if filters.get("building_name"):
            conditions.append("b.BuildingName LIKE %s")
            params.append(f"%{filters['building_name']}%")
        if filters.get("district"):
            conditions.append("b.District LIKE %s")
            params.append(f"%{filters['district']}%")
        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
        limit = min(int(filters.get("limit", 10)), 20)
        params.append(limit)
        return self._run(f"""
            SELECT b.BuildingName, b.District, b.Ward,
                   COUNT(r.RoomID)                                              AS total_rooms,
                   SUM(CASE WHEN r.Status='available' THEN 1 ELSE 0 END)       AS available_rooms,
                   MIN(r.Price) AS min_price, MAX(r.Price) AS max_price
            FROM BUILDING b
            LEFT JOIN ROOM r ON r.BuildingID = b.BuildingID
            {where}
            GROUP BY b.BuildingID
            ORDER BY total_rooms DESC
            LIMIT %s
        """, tuple(params))

    def get_room_detail(self, room_code: str) -> Dict:
        results = self._run("""
            SELECT RoomCode, RoomType, Area, Price, Description
            FROM ROOM WHERE RoomCode = %s LIMIT 1
        """, (room_code,))
        return results[0] if results else {}

    def get_locations(self, filters: Dict = {}) -> List[Dict]:
        conditions: List[str] = []
        params: List[Any] = []
        if filters.get("district"):
            conditions.append("b.District LIKE %s")
            params.append(f"%{filters['district']}%")
        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
        limit = min(int(filters.get("limit", 10)), 20)
        params.append(limit)
        return self._run(f"""
            SELECT b.District,
                   COUNT(r.RoomID)                                        AS total_rooms,
                   SUM(CASE WHEN r.Status='available' THEN 1 ELSE 0 END) AS available_rooms,
                   ROUND(AVG(r.Price), 0)                                 AS avg_price,
                   MIN(r.Price) AS min_price, MAX(r.Price) AS max_price
            FROM ROOM r
            JOIN BUILDING b ON r.BuildingID = b.BuildingID
            {where}
            GROUP BY b.District
            HAVING total_rooms > 0
            ORDER BY total_rooms DESC
            LIMIT %s
        """, tuple(params))

    # ── Demo data (no DB) ─────────────────────────────────

    def demo_rooms(self) -> List[Dict]:
        return [
            {"RoomCode": "ROM00011", "RoomType": "Phòng trọ đơn", "Area": 20, "Price": 4000000, "Description": "Tòa A - Ba Đình, thang máy"},
            {"RoomCode": "ROM00010", "RoomType": "Phòng trọ đơn", "Area": 20, "Price": 4200000, "Description": "Tòa A - Ba Đình, thang máy"},
            {"RoomCode": "ROM00009", "RoomType": "Phòng trọ",     "Area": 20, "Price": 4000000, "Description": "Tòa A - Ba Đình, thang máy"},
            {"RoomCode": "ROM00008", "RoomType": "Phòng trọ đơn", "Area": 20, "Price": 4000000, "Description": "Tòa A - Ba Đình, thang bộ"},
        ]
