"""
booking_service.py - Integration with Tenant backend for room viewing bookings
"""

import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from config import DB_CONFIG

try:
    import mysql.connector
    _MYSQL_OK = True
except ImportError:
    _MYSQL_OK = False


class BookingService:
    """Service to handle room viewing bookings via Tenant backend"""
    
    def __init__(self, backend_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
        self.connected = _MYSQL_OK
    
    def get_available_slots(self, room_id: str, date: str) -> List[str]:
        """Get available time slots for a room on a specific date
        
        Args:
            room_id: RoomID (not RoomCode)
            date: Date in YYYY-MM-DD format
        
        Returns:
            List of available time slots in HH:mm format
        """
        try:
            response = requests.get(
                f"{self.backend_url}/api/viewing-schedule/available-slots/{room_id}",
                params={"date": date},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return data.get("data", [])
            
            return []
        except Exception as e:
            print(f"[BookingService] Error getting available slots: {e}")
            return []
    
    def get_room_id_from_code(self, room_code: str) -> Optional[str]:
        """Get RoomID from RoomCode"""
        if not self.connected:
            return None
        
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT RoomID FROM ROOM WHERE RoomCode = %s", (room_code,))
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            return result["RoomID"] if result else None
        except Exception as e:
            print(f"[BookingService] Error getting RoomID: {e}")
            return None
    
    def create_booking(
        self, 
        tenant_id: str, 
        room_id: str, 
        date: str, 
        time: str,
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a viewing schedule booking
        
        Args:
            tenant_id: TenantID
            room_id: RoomID
            date: Date in YYYY-MM-DD format
            time: Time in HH:mm format
            auth_token: JWT token for authentication
        
        Returns:
            Response dict with success status and schedule_id
        """
        try:
            headers = {}
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
            response = requests.post(
                f"{self.backend_url}/api/viewing-schedule/schedule",
                json={
                    "roomId": room_id,
                    "date": date,
                    "time": time
                },
                headers=headers,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "success": data.get("success", False),
                    "schedule_id": data.get("scheduleId"),
                    "message": data.get("message", "Đặt lịch thành công")
                }
            else:
                return {
                    "success": False,
                    "message": response.json().get("message", "Không thể đặt lịch")
                }
        except Exception as e:
            print(f"[BookingService] Error creating booking: {e}")
            return {
                "success": False,
                "message": f"Lỗi kết nối: {str(e)}"
            }
    
    def get_user_schedules(self, tenant_id: str, room_id: Optional[str] = None) -> List[Dict]:
        """Get user's viewing schedules
        
        Args:
            tenant_id: TenantID
            room_id: Optional RoomID to filter by specific room
        
        Returns:
            List of schedule dicts
        """
        if not self.connected:
            return []
        
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            cur = conn.cursor(dictionary=True)
            
            if room_id:
                query = """
                    SELECT vs.ScheduleID, vs.RoomID, vs.ScheduledDate, vs.Status,
                           r.RoomCode, r.Title, r.Price
                    FROM ROOM_VIEWING_BOOKING vs
                    JOIN ROOM r ON vs.RoomID = r.RoomID
                    WHERE vs.TenantID = %s AND vs.RoomID = %s
                    ORDER BY vs.ScheduledDate DESC
                """
                cur.execute(query, (tenant_id, room_id))
            else:
                query = """
                    SELECT vs.ScheduleID, vs.RoomID, vs.ScheduledDate, vs.Status,
                           r.RoomCode, r.Title, r.Price
                    FROM ROOM_VIEWING_BOOKING vs
                    JOIN ROOM r ON vs.RoomID = r.RoomID
                    WHERE vs.TenantID = %s
                    ORDER BY vs.ScheduledDate DESC
                    LIMIT 10
                """
                cur.execute(query, (tenant_id,))
            
            results = cur.fetchall()
            cur.close()
            conn.close()
            
            return results
        except Exception as e:
            print(f"[BookingService] Error getting schedules: {e}")
            return []
    
    def cancel_schedule(self, schedule_id: str, tenant_id: str) -> bool:
        """Cancel a viewing schedule
        
        Args:
            schedule_id: ScheduleID
            tenant_id: TenantID (for verification)
        
        Returns:
            True if cancelled successfully
        """
        if not self.connected:
            return False
        
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            cur = conn.cursor()
            
            # Verify ownership and cancel
            query = """
                UPDATE ROOM_VIEWING_BOOKING
                SET Status = 'cancelled'
                WHERE ScheduleID = %s AND TenantID = %s AND Status != 'cancelled'
            """
            cur.execute(query, (schedule_id, tenant_id))
            conn.commit()
            
            affected = cur.rowcount
            cur.close()
            conn.close()
            
            return affected > 0
        except Exception as e:
            print(f"[BookingService] Error cancelling schedule: {e}")
            return False
    
    def suggest_time_slots(self, date: str = None) -> List[str]:
        """Suggest common time slots for viewing
        
        Args:
            date: Optional date to check availability
        
        Returns:
            List of suggested time slots
        """
        # Common viewing hours
        slots = [
            "09:00", "10:00", "11:00",  # Morning
            "14:00", "15:00", "16:00",  # Afternoon
            "17:00", "18:00", "19:00"   # Evening
        ]
        
        return slots
    
    def parse_natural_time(self, text: str) -> Dict[str, str]:
        """Parse natural language time expressions
        
        Args:
            text: Natural language text like "mai sáng", "thứ 7 chiều"
        
        Returns:
            Dict with 'date' and 'time' keys
        """
        from datetime import datetime, timedelta
        
        result = {}
        text = text.lower()
        today = datetime.now()
        
        # Parse date
        if any(k in text for k in ["hôm nay", "nay"]):
            result["date"] = today.strftime("%Y-%m-%d")
        elif any(k in text for k in ["ngày mai", "mai"]):
            result["date"] = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        elif any(k in text for k in ["thứ 2", "thứ hai"]):
            days_ahead = (0 - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            result["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        elif any(k in text for k in ["thứ 7", "cuối tuần"]):
            days_ahead = (5 - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            result["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        elif any(k in text for k in ["chủ nhật", "cn"]):
            days_ahead = (6 - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            result["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        
        # Parse time
        if any(k in text for k in ["sáng", "buổi sáng"]):
            result["time"] = "09:00"
        elif any(k in text for k in ["trưa", "buổi trưa"]):
            result["time"] = "12:00"
        elif any(k in text for k in ["chiều", "buổi chiều"]):
            result["time"] = "14:00"
        elif any(k in text for k in ["tối", "buổi tối"]):
            result["time"] = "18:00"
        
        # Try to extract specific time (HH:mm or HH giờ)
        import re
        time_match = re.search(r'(\d{1,2}):(\d{2})', text)
        if time_match:
            result["time"] = f"{time_match.group(1).zfill(2)}:{time_match.group(2)}"
        else:
            time_match = re.search(r'(\d{1,2})\s*(?:giờ|h)', text)
            if time_match:
                result["time"] = f"{time_match.group(1).zfill(2)}:00"
        
        return result
