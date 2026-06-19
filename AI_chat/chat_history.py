"""
chat_history.py - Chat history management for Rentify AI
"""

import json
from typing import Any, Dict, List, Optional
from datetime import datetime
from db_pool import pool_manager

try:
    import mysql.connector
    _MYSQL_OK = True
except ImportError:
    _MYSQL_OK = False


class ChatHistoryManager:
    """Quản lý lịch sử chat AI trong database"""
    
    def __init__(self):
        self.connected = _MYSQL_OK
        if self.connected:
            self._check_connection()
    
    def _check_connection(self):
        try:
            conn = pool_manager.get_connection()
            conn.close()
            print("[OK] ChatHistory DB connected")
        except Exception as e:
            print(f"[WARNING] ChatHistory DB unavailable: {e}")
            self.connected = False
    
    def _execute(self, query: str, params: tuple = (), fetch: bool = False) -> Any:
        """Execute query với error handling"""
        if not self.connected:
            print("[ChatHistory] DB not connected - skipping query")
            return None
        
        try:
            conn = pool_manager.get_connection()
            cur = conn.cursor(dictionary=True)
            cur.execute(query, params)
            
            if fetch:
                result = cur.fetchall()
            else:
                conn.commit()
                result = cur.lastrowid
            
            cur.close()
            conn.close()
            return result
        except Exception as e:
            print(f"[ChatHistory Error] Query: {query[:100]}...")
            print(f"[ChatHistory Error] Params: {params}")
            print(f"[ChatHistory Error] Exception: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _generate_id(self, prefix: str) -> str:
        """Generate ID theo format: PREFIX + 5 số"""
        import random
        # Format: PREFIX (3 chars) + 5 số random
        random_num = random.randint(10000, 99999)
        return f"{prefix[:3]}{random_num}"
    
    # ── Session Management ────────────────────────────────
    
    def create_session(self, tenant_id: Optional[str] = None) -> Optional[str]:
        """Tạo phiên chat mới với retry logic"""
        max_retries = 5
        
        for attempt in range(max_retries):
            session_id = self._generate_id("SES")
            
            try:
                print(f"[ChatHistory] Creating session (attempt {attempt+1}/{max_retries}): {session_id}, tenant: {tenant_id}")
            except:
                print(f"[ChatHistory] Creating session (attempt {attempt+1}/{max_retries})")
            
            query = """
                INSERT INTO AI_CHAT_SESSION (SessionID, TenantID, StartedAt, LastMessageAt, Status, MessageCount)
                VALUES (%s, %s, NOW(), NOW(), 'active', 0)
            """
            
            result = self._execute(query, (session_id, tenant_id))
            
            if result is not None:
                try:
                    print(f"[ChatHistory] Session created: {session_id} with TenantID: {tenant_id}")
                except:
                    print(f"[ChatHistory] Session created: {session_id}")
                return session_id
            else:
                try:
                    print(f"[ChatHistory] Failed attempt {attempt+1}")
                except:
                    print(f"[ChatHistory] Failed attempt")
        
        print(f"[ChatHistory] ERROR: Failed to create session after {max_retries} attempts")
        return None
    
    def _get_tenant_id_from_account(self, account_id: str) -> Optional[str]:
        """Lấy TenantID từ AccountID"""
        query = "SELECT TenantID FROM TENANT WHERE AccountID = %s"
        result = self._execute(query, (account_id,), fetch=True)
        
        if result and len(result) > 0:
            tenant_id = result[0]['TenantID']
            print(f"[ChatHistory] Found TenantID: {tenant_id} for AccountID: {account_id}")
            return tenant_id
        return None
    
    def get_or_create_session(
        self,
        user_id: Optional[str] = None,
        reuse_anonymous: bool = False,
        force_new: bool = False
    ) -> str:
        """Lấy session active hoặc tạo mới
        
        Args:
            user_id: AccountID hoặc TenantID (tự động phát hiện)
            reuse_anonymous: Nếu True, sẽ tìm session anonymous gần nhất để reuse
        """
        tenant_id = None
        
        if user_id:
            # Kiểm tra xem user_id là AccountID hay TenantID
            if user_id.startswith('ACC'):
                # Nếu là AccountID, lấy TenantID
                tenant_id = self._get_tenant_id_from_account(user_id)
                if not tenant_id:
                    print(f"[ChatHistory] WARNING: No TenantID found for AccountID: {user_id}")
            elif user_id.startswith('TEN'):
                # Nếu đã là TenantID thì dùng luôn
                tenant_id = user_id
            else:
                print(f"[ChatHistory] WARNING: Invalid user_id format: {user_id}")
        
        if force_new:
            session_id = self.create_session(tenant_id)
            if not session_id:
                print("[ChatHistory] WARNING: Failed to force create new session, returning None")
                return None
            print(f"[ChatHistory] ✓ Created forced new session: {session_id}")
            return session_id

        if tenant_id:
            # Tìm session active gần nhất của tenant
            query = """
                SELECT SessionID FROM AI_CHAT_SESSION
                WHERE TenantID = %s AND Status = 'active'
                ORDER BY LastMessageAt DESC
                LIMIT 1
            """
            result = self._execute(query, (tenant_id,), fetch=True)
            
            if result and len(result) > 0:
                session_id = result[0]['SessionID']
                print(f"[ChatHistory] ✓ Reusing active session: {session_id}")
                return session_id
        elif reuse_anonymous:
            # Tìm session anonymous gần nhất (trong vòng 1 giờ)
            query = """
                SELECT SessionID FROM AI_CHAT_SESSION
                WHERE TenantID IS NULL 
                  AND Status = 'active'
                  AND LastMessageAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                ORDER BY LastMessageAt DESC
                LIMIT 1
            """
            result = self._execute(query, (), fetch=True)
            
            if result and len(result) > 0:
                session_id = result[0]['SessionID']
                print(f"[ChatHistory] ✓ Reusing anonymous session: {session_id}")
                return session_id
        
        # Tạo session mới với TenantID đã được xác định
        session_id = self.create_session(tenant_id)
        if not session_id:
            # Return None instead of raising exception - let caller handle it
            print("[ChatHistory] WARNING: Failed to create session, returning None")
            return None
        return session_id
    
    def close_session(self, session_id: str):
        """Đóng phiên chat"""
        query = """
            UPDATE AI_CHAT_SESSION
            SET Status = 'closed'
            WHERE SessionID = %s
        """
        self._execute(query, (session_id,))
    
    # ── Message Management ────────────────────────────────
    
    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        filters: Optional[Dict] = None,
        response_data: Optional[Any] = None,
        tokens_used: int = 0
    ) -> Optional[str]:
        """Lưu tin nhắn vào database"""
        
        message_id = self._generate_id("MSG")
        
        print(f"[ChatHistory] Saving message: {message_id}, session: {session_id}, role: {role}")
        
        # Convert dict/list to JSON string
        filters_json = json.dumps(filters, ensure_ascii=False) if filters else None
        data_json = json.dumps(response_data, ensure_ascii=False) if response_data else None
        
        query = """
            INSERT INTO AI_CHAT_MESSAGE 
            (MessageID, SessionID, Role, Content, Intent, Filters, ResponseData, TokensUsed, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        result = self._execute(query, (
            message_id, session_id, role, content,
            intent, filters_json, data_json, tokens_used
        ))
        
        if result is not None:
            print(f"[ChatHistory] Message saved successfully: {message_id}")
        else:
            print(f"[ChatHistory] Failed to save message: {message_id}")
        
        return message_id if result is not None else None
    
    def get_session_messages(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Lấy tất cả tin nhắn trong session"""
        query = """
            SELECT MessageID, Role, Content, Intent, Filters, ResponseData, CreatedAt
            FROM AI_CHAT_MESSAGE
            WHERE SessionID = %s
            ORDER BY CreatedAt ASC
            LIMIT %s
        """
        
        result = self._execute(query, (session_id, limit), fetch=True)
        return result or []
    
    def get_recent_context(self, session_id: str, limit: int = 6) -> List[Dict[str, str]]:
        """Lấy context gần nhất cho AI (format: role + content)"""
        query = """
            SELECT Role, Content
            FROM AI_CHAT_MESSAGE
            WHERE SessionID = %s
            ORDER BY CreatedAt DESC
            LIMIT %s
        """
        
        result = self._execute(query, (session_id, limit), fetch=True)
        
        if not result:
            return []
        
        # Reverse để có thứ tự đúng (cũ -> mới)
        return [{"role": msg["Role"], "content": msg["Content"]} for msg in reversed(result)]
    
    # ── Room Interaction Tracking ─────────────────────────
    
    def track_room_interaction(
        self,
        session_id: str,
        tenant_id: str,
        room_id: str,
        action_type: str,
        context: Optional[str] = None
    ):
        """Theo dõi tương tác với phòng"""
        
        interaction_id = self._generate_id("INT")
        
        query = """
            INSERT INTO AI_CHAT_ROOM_INTERACTION
            (InteractionID, SessionID, TenantID, RoomID, ActionType, Context, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        
        self._execute(query, (
            interaction_id, session_id, tenant_id, room_id, action_type, context
        ))
    
    # ── Feedback ──────────────────────────────────────────
    
    def save_feedback(
        self,
        message_id: str,
        tenant_id: str,
        rating: str,
        reason: Optional[str] = None
    ):
        """Lưu feedback của user về câu trả lời AI"""
        
        feedback_id = self._generate_id("FDB")
        
        query = """
            INSERT INTO AI_CHAT_FEEDBACK
            (FeedbackID, MessageID, TenantID, Rating, Reason, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        
        self._execute(query, (feedback_id, message_id, tenant_id, rating, reason))
    
    # ── Analytics ─────────────────────────────────────────
    
    def get_user_chat_history(self, tenant_id: str, limit: int = 10) -> List[Dict]:
        """Lấy lịch sử chat của user"""
        query = """
            CALL sp_get_chat_history(%s, %s)
        """
        
        result = self._execute(query, (tenant_id, limit), fetch=True)
        return result or []
    
    def get_popular_intents(self, days: int = 7) -> List[Dict]:
        """Phân tích intent phổ biến"""
        query = """
            CALL sp_analyze_popular_intents(%s)
        """
        
        result = self._execute(query, (days,), fetch=True)
        return result or []
    
    def get_daily_stats(self, days: int = 7) -> List[Dict]:
        """Thống kê chat theo ngày"""
        query = """
            SELECT * FROM vw_daily_chat_stats
            ORDER BY ChatDate DESC
            LIMIT %s
        """
        
        result = self._execute(query, (days,), fetch=True)
        return result or []
    
    def get_top_rooms(self, limit: int = 10) -> List[Dict]:
        """Top phòng được hỏi nhiều nhất"""
        query = """
            SELECT * FROM vw_top_inquired_rooms
            LIMIT %s
        """
        
        result = self._execute(query, (limit,), fetch=True)
        return result or []
