"""
ai_chat.py - AI orchestration for Rentify chat
Hybrid Chat + Agent: AI prepares booking payload, user confirms, backend executes.

Architecture (Human-in-the-loop):
  USER → AI AGENT (intent + collect info + build payload)
       → CONFIRMATION CARD (rendered in frontend)
       → USER CONFIRMS
       → BACKEND API (validate + transaction + notify)
       → DATABASE
"""

import json
import re
from typing import Any, Dict, List, Optional, Tuple

from config import (
    GROQ_API_KEY, GROQ_MODEL,
    SYSTEM_PROMPT, INTENT_PROMPT, RESPONSE_PROMPT,
    PRIVACY_MESSAGE, OTHER_CITIES,
    SUGGESTIONS_BY_INTENT, DEFAULT_SUGGESTIONS,
)
from db import DatabaseClient, filter_privacy
from chat_history import ChatHistoryManager

try:
    from groq import Groq
    _GROQ_OK = bool(GROQ_API_KEY)
except ImportError:
    _GROQ_OK = False
    print("[WARNING] groq package not installed — demo mode")


# ── Location guard ────────────────────────────────────────

def _is_out_of_area(message: str) -> bool:
    msg = message.lower()
    return any(city in msg for city in OTHER_CITIES)

def _out_of_area_reply(message: str) -> str:
    import random
    msg = message.lower()
    detected = next((city for city in OTHER_CITIES if city in msg), None)
    location_display = detected.title() if detected else "khu vực đó"

    variants = [
        f"Ôi tiếc quá, Rentify hiện chỉ có phòng ở Hà Nội thôi bạn ơi — chưa phủ {location_display} được 😅 "
        f"Nếu bạn cần tìm phòng ở Hà Nội thì mình giúp được ngay, bạn muốn ở khu nào?",

        f"Rentify tụi mình đang tập trung ở Hà Nội nên chưa có phòng ở {location_display} bạn nhé. "
        f"Bạn có đang tính chuyển ra Hà Nội không? Nếu có thì mình tìm cho liền 🏠",

        f"Chỗ {location_display} mình chưa có phòng nào bạn ơi, Rentify mới chỉ phủ Hà Nội thôi. "
        f"Khi nào mở rộng mình báo ngay! Còn bạn có cần tìm phòng ở Hà Nội không?",
    ]
    return random.choice(variants)

# ── Intents that must NOT query the DB ───────────────────
_NO_DB_INTENTS = {"general_chat", "schedule_viewing", "check_schedule", "cancel_viewing"}

# ── Booking flow states ───────────────────────────────────
BOOKING_STATE_INIT         = "awaiting_time"
BOOKING_STATE_SLOT_SELECT  = "awaiting_slot_selection"
BOOKING_STATE_READY        = "ready_to_confirm"
BOOKING_STATE_CONFIRMED    = "confirmed"
BOOKING_STATE_CANCELLED    = "cancelled"


# ── Groq wrapper ──────────────────────────────────────────

class _GroqClient:
    def __init__(self):
        self._client = Groq(api_key=GROQ_API_KEY) if _GROQ_OK else None

    def _call(self, system: str, user: str, temperature: float = 0.1, max_tokens: int = 600) -> str:
        if not self._client:
            return ""
        
        try:
            resp = self._client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Groq API Error] {e}")
            # Return empty string to trigger fallback to rule-based intent
            return ""

    def extract_intent(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        context_str = ""
        if context:
            if context.get("current_room"):
                context_str += f"Phòng đang xem: {context['current_room']}\n"
            if context.get("booking_state"):
                context_str += f"Trạng thái đặt lịch: {context['booking_state']}\n"
            if context.get("last_search_results"):
                context_str += f"Kết quả tìm kiếm trước: {len(context['last_search_results'])} phòng\n"

        raw = self._call(
            system="Bạn là AI phân tích intent. Chỉ trả về JSON hợp lệ, không có text thừa.",
            user=INTENT_PROMPT.format(message=message, context=context_str),
            temperature=0.1,
            max_tokens=400,
        )
        if raw:
            clean = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
            try:
                result = json.loads(clean)
                result = self._parse_time_expressions(result, message)
                return result
            except json.JSONDecodeError:
                pass
        return _rule_based_intent(message)

    def _parse_time_expressions(self, intent_data: Dict, message: str) -> Dict:
        try:
            from datetime import datetime, timedelta
            filters = intent_data.get("filters", {})
            msg = message.lower()

            if not filters.get("date"):
                today = datetime.now()
                if any(k in msg for k in ["hôm nay", "nay"]):
                    filters["date"] = today.strftime("%Y-%m-%d")
                elif any(k in msg for k in ["ngày mai", "mai"]):
                    filters["date"] = (today + timedelta(days=1)).strftime("%Y-%m-%d")
                elif any(k in msg for k in ["cuối tuần", "thứ 7", "chủ nhật"]):
                    # Tìm thứ 7 tiếp theo
                    days_ahead = (5 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                elif "thứ 2" in msg or "thứ hai" in msg:
                    days_ahead = (0 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                elif "thứ 3" in msg or "thứ ba" in msg:
                    days_ahead = (1 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                elif "thứ 4" in msg or "thứ tư" in msg:
                    days_ahead = (2 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                elif "thứ 5" in msg or "thứ năm" in msg:
                    days_ahead = (3 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                elif "thứ 6" in msg or "thứ sáu" in msg:
                    days_ahead = (4 - today.weekday()) % 7
                    if days_ahead == 0:
                        days_ahead = 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

            if not filters.get("time"):
                # Try specific time first: "7h", "19:00", "7 giờ"
                time_match = re.search(r'(\d{1,2}):(\d{2})', msg)
                if time_match:
                    filters["time"] = f"{time_match.group(1).zfill(2)}:{time_match.group(2)}"
                else:
                    time_match = re.search(r'(\d{1,2})\s*(?:giờ|h\b)', msg)
                    if time_match:
                        filters["time"] = f"{time_match.group(1).zfill(2)}:00"
                    elif any(k in msg for k in ["sáng", "buổi sáng"]):
                        filters["time"] = "09:00"
                    elif any(k in msg for k in ["trưa", "buổi trưa"]):
                        filters["time"] = "12:00"
                    elif any(k in msg for k in ["chiều", "buổi chiều"]):
                        filters["time"] = "14:00"
                    elif any(k in msg for k in ["tối", "buổi tối"]):
                        filters["time"] = "19:00"

            intent_data["filters"] = filters
            return intent_data
        except Exception as e:
            print(f"[Time Parse Error] {e}")
            return intent_data

    def generate_reply(self, message: str, data: Any, history: List[Dict], intent: str = "") -> str:
        has_data = bool(data)
        data_str = json.dumps(data, ensure_ascii=False, indent=2) if has_data else "Không có dữ liệu"

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages += history[-6:]
        messages.append({
            "role": "user",
            "content": RESPONSE_PROMPT.format(message=message, data=data_str[:3500])
        })

        if not self._client:
            return _template_reply(data, message)

        try:
            resp = self._client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.75,
                max_tokens=600,
            )
            reply = resp.choices[0].message.content.strip()
            if has_data and isinstance(data, list) and reply:
                reply = _strip_hallucinated_rooms(reply, data)
            return reply or _template_reply(data, message)
        except Exception as e:
            print(f"[Groq reply error] {e}")
            return _template_reply(data, message)


# ── Hallucination guard ──────────────────────────────────

def _strip_hallucinated_rooms(reply: str, real_data: List[Dict]) -> str:
    real_codes = {str(r.get("RoomCode", "")) for r in real_data if r.get("RoomCode")}
    mentioned = set(re.findall(r'ROM\d{5}', reply))
    hallucinated = mentioned - real_codes
    if hallucinated:
        print(f"[Hallucination Warning] AI mentioned codes not in DB: {hallucinated}")
    return reply


# ── Rule-based fallbacks ──────────────────────────────────

def _rule_based_intent(message: str) -> Dict[str, Any]:
    msg = message.lower()
    filters: Dict[str, Any] = {"limit": 5}
    intent = "general_chat"

    greetings = ["hello", "hi", "xin chào", "chào", "hey", "alo"]
    if any(g in msg for g in greetings) and len(msg.split()) <= 4:
        return {"intent": "general_chat", "filters": filters, "sort_by": None}

    # Booking intents — check FIRST
    booking_keywords = ["đặt lịch", "xem phòng", "hẹn xem", "book", "schedule",
                        "muốn xem", "cho xem", "tôi xem", "mình xem"]
    if any(k in msg for k in booking_keywords):
        intent = "schedule_viewing"
        # Extract room code if present
        room_match = re.search(r'(ROM\d{5,})', msg.upper())
        if room_match:
            filters["room_code"] = room_match.group(1)
        return {"intent": intent, "filters": filters, "sort_by": None}

    if any(k in msg for k in ["lịch đã đặt", "xem lịch", "kiểm tra lịch", "lịch hẹn", "lịch xem của"]):
        return {"intent": "check_schedule", "filters": filters, "sort_by": None}

    if any(k in msg for k in ["hủy lịch", "cancel", "không xem nữa", "dời lịch", "đổi lịch"]):
        return {"intent": "cancel_viewing", "filters": filters, "sort_by": None}

    # Time expressions in booking context
    time_keywords = ["sáng", "chiều", "tối", "giờ", "7h", "8h", "9h", "10h", "11h", "12h"]
    if any(k in msg for k in time_keywords) and len(msg.split()) <= 6:
        return {"intent": "schedule_viewing", "filters": filters, "sort_by": None}

    # Room search
    if any(k in msg for k in ["giá rẻ", "rẻ nhất", "tiết kiệm"]):
        intent = "get_cheap_rooms"
        filters["sort_by"] = "price_asc"
    elif any(k in msg for k in ["còn trống", "đang trống", "chưa thuê"]):
        intent = "get_available_rooms"
    elif any(k in msg for k in ["tìm", "có phòng", "phòng nào", "muốn thuê"]):
        intent = "search_rooms"
    elif any(k in msg for k in ["thống kê", "tổng quan", "bao nhiêu phòng"]):
        intent = "get_stats"

    # Price parsing
    price_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:tr(?:iệu)?)", msg)
    if price_match:
        amount = float(price_match.group(1).replace(",", ".")) * 1_000_000
        if any(k in msg for k in ["dưới", "tối đa", "không quá", "under"]):
            filters["price_max"] = amount
        elif any(k in msg for k in ["trên", "từ", "hơn"]):
            filters["price_min"] = amount
        else:
            filters["price_max"] = amount

    return {"intent": intent, "filters": filters, "sort_by": filters.get("sort_by")}


def _template_reply(data: Any, message: str = "") -> str:
    import random
    msg = message.lower()

    if not data:
        if any(k in msg for k in ["triệu", "tr", "giá"]):
            variants = [
                "Hmm, mình tìm không thấy phòng nào trong mức giá đó 🙁 Bạn thử nới thêm một chút xem sao?",
                "Tầm giá đó hiện chưa có phòng phù hợp rồi bạn ơi. Thử nâng lên chút hoặc đổi quận xem — mình tìm lại cho!",
            ]
        else:
            variants = [
                "Mình tìm không thấy phòng nào khớp với yêu cầu của bạn. Thử điều chỉnh giá hoặc khu vực xem sao nhé!",
                "Chưa có phòng nào phù hợp lắm bạn ơi. Bạn có thể cho mình biết thêm nhu cầu cụ thể không?",
            ]
        return random.choice(variants)

    rooms = data if isinstance(data, list) else [data]
    count = len(rooms)

    intros = [
        f"Có {count} phòng khá ổn nè bạn:",
        f"Mình tìm được {count} phòng phù hợp:",
    ] if count > 1 else ["Mình tìm được 1 phòng phù hợp:"]
    lines = [random.choice(intros)]

    for r in rooms[:5]:
        price_val = r.get("Price", 0)
        price_m = price_val / 1_000_000
        price_str = (f"{price_m:.0f}tr" if price_m == int(price_m) else f"{price_m:.1f}tr") + "/tháng" if price_val else "liên hệ"
        area  = r.get("Area", "?")
        rtype = r.get("RoomType", "Phòng trọ")
        code  = r.get("RoomCode", "")
        desc  = r.get("Description", "")
        if desc:
            desc = desc.split("\n")[0][:70].strip()
            lines.append(f"🏠 {code} — {rtype} — {area}m² — {price_str}")
            lines.append(f"   └ {desc}")
        else:
            lines.append(f"🏠 {code} — {rtype} — {area}m² — {price_str}")

    lines.append("\nBạn muốn đặt lịch xem phòng nào không?")
    return "\n".join(lines)


# ── Privacy helpers ───────────────────────────────────────

_CONTACT_KEYWORDS = ["liên hệ", "chủ nhà", "số điện thoại", "email", "gọi", "nhắn tin"]

def _add_privacy_note(text: str) -> str:
    if any(k in text.lower() for k in _CONTACT_KEYWORDS):
        if PRIVACY_MESSAGE not in text:
            text += f"\n\n🔒 {PRIVACY_MESSAGE}"
    return text


# ── Booking helpers ───────────────────────────────────────

def _format_date_vn(date_str: str) -> str:
    """Format YYYY-MM-DD → dd/mm/yyyy"""
    try:
        from datetime import datetime
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d/%m/%Y")
    except Exception:
        return date_str

def _format_weekday_vn(date_str: str) -> str:
    """Return Vietnamese weekday name"""
    try:
        from datetime import datetime
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
        return days[dt.weekday()]
    except Exception:
        return ""

def _build_booking_payload(room_code: str, room_info: Dict, date: str, time: str) -> Dict:
    """
    Build the structured booking payload that the frontend will use
    to render the confirmation card and then call the backend API.
    
    This payload is NEVER written directly to DB — it's handed to the user
    for explicit confirmation first.
    """
    # Validate and format date
    if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
        from datetime import datetime, timedelta
        date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        print(f"[Booking Payload] Invalid date, using tomorrow: {date}")
    
    # Validate and format time
    if not time or not re.match(r'^\d{1,2}:\d{2}$', time):
        time = "09:00"
        print(f"[Booking Payload] Invalid time, using default: {time}")
    
    date_vn = _format_date_vn(date)
    weekday = _format_weekday_vn(date)
    
    return {
        "action": "booking_confirmation_required",
        "room_code": room_code,
        "room_info": {
            "title": room_info.get("Title") or f"{room_info.get('RoomType', 'Phòng')} - {room_code}",
            "room_type": room_info.get("RoomType", "Phòng trọ"),
            "area": room_info.get("Area"),
            "price": room_info.get("Price"),
            "description": room_info.get("Description", ""),
        },
        "viewing_date": date,
        "viewing_date_display": f"{weekday}, {date_vn}",
        "viewing_time": time,
        "status": BOOKING_STATE_READY,
        # Backend endpoint info for frontend to call after user confirms
        "api_endpoint": "/viewing-schedule/schedule",
        "api_method": "POST",
    }


# ── Main orchestrator ─────────────────────────────────────

class ChatOrchestrator:
    """
    Single entry-point for the chat pipeline.
    
    Booking flow (human-in-the-loop):
    1. AI detects intent → collects room_code, date, time
    2. AI fetches available slots from backend
    3. AI returns booking_card payload (NOT written to DB)
    4. Frontend renders confirmation card with [Xác nhận đặt lịch] button
    5. User clicks confirm → Frontend calls /api/viewing-schedule/schedule
    6. Backend validates + creates booking + sends notifications
    """

    def __init__(self):
        self._ai = _GroqClient()
        self._db = DatabaseClient()
        self._history = ChatHistoryManager()
        self._session_context = {}

    async def process(
        self,
        message: str,
        history: List[Dict[str, str]] = [],
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        
        try:
            # ── 0. Session management ─────────────────────────────────────────
            try:
                if not session_id:
                    session_id = self._history.get_or_create_session(user_id)
                    if not session_id:
                        import uuid
                        session_id = f"TEMP_{uuid.uuid4().hex[:8]}"
            except Exception as e:
                import uuid
                session_id = f"TEMP_{uuid.uuid4().hex[:8]}"
                print(f"[ChatOrchestrator] Using temporary session: {session_id}")

            is_temp = session_id.startswith("TEMP_")
            
            try:
                if not is_temp:
                    self._history.save_message(session_id=session_id, role="user", content=message)
            except Exception as e:
                print(f"[ChatOrchestrator] Failed to save user message: {e}")

            # ── 1. Location guard ─────────────────────────────────────────────
            if _is_out_of_area(message):
                reply = _out_of_area_reply(message)
                try:
                    if not is_temp:
                        self._history.save_message(session_id=session_id, role="assistant",
                                                    content=reply, intent="out_of_area")
                except Exception as e:
                    print(f"[ChatOrchestrator] Failed to save assistant message: {e}")
                    
                return {
                    "reply": reply,
                    "intent": "out_of_area",
                    "filters": {},
                    "data": None,
                    "suggested_questions": SUGGESTIONS_BY_INTENT.get("out_of_area", DEFAULT_SUGGESTIONS),
                    "session_id": session_id,
                }

            # ── 2. Intent extraction ──────────────────────────────────────────
            context = self._session_context.get(session_id, {})

            # If we're in a booking flow, force the intent
            if context.get("booking_state") in [BOOKING_STATE_INIT, BOOKING_STATE_SLOT_SELECT]:
                intent_data = self._ai.extract_intent(message, context)
                # Override intent to continue booking flow
                if intent_data.get("intent") != "cancel_viewing":
                    intent_data["intent"] = "schedule_viewing"
            else:
                intent_data = self._ai.extract_intent(message, context)

            intent  = intent_data.get("intent", "general_chat")
            filters = intent_data.get("filters", {})
            if intent_data.get("sort_by"):
                filters["sort_by"] = intent_data["sort_by"]

            # ── 3. Handle booking intents ─────────────────────────────────────
            if intent == "schedule_viewing":
                result = await self._handle_schedule_viewing(message, filters, user_id, session_id, context)
                try:
                    if not is_temp:
                        self._history.save_message(
                            session_id=session_id, role="assistant",
                            content=result.get("reply", ""), intent=intent)
                except Exception as e:
                    print(f"[ChatOrchestrator] Failed to save assistant message: {e}")
                return result

            elif intent == "check_schedule":
                result = await self._handle_check_schedule(user_id, session_id)
                try:
                    if not is_temp:
                        self._history.save_message(
                            session_id=session_id, role="assistant",
                            content=result.get("reply", ""), intent=intent)
                except Exception as e:
                    print(f"[ChatOrchestrator] Failed to save assistant message: {e}")
                return result

            elif intent == "cancel_viewing":
                result = await self._handle_cancel_viewing(message, user_id, session_id)
                try:
                    if not is_temp:
                        self._history.save_message(
                            session_id=session_id, role="assistant",
                            content=result.get("reply", ""), intent=intent)
                except Exception as e:
                    print(f"[ChatOrchestrator] Failed to save assistant message: {e}")
                return result

            # ── 4. Database query ─────────────────────────────────────────────
            db_data: Any = None
            if intent not in _NO_DB_INTENTS:
                try:
                    db_data = self._query_db(intent, filters)
                    if not db_data and not self._db.is_connected():
                        db_data = self._db.demo_rooms()
                except Exception as e:
                    print(f"[ChatOrchestrator] DB query error: {e}")
                    db_data = self._db.demo_rooms()

            safe_data = filter_privacy(db_data) if db_data else db_data

            # ── 5. AI reply ───────────────────────────────────────────────────
            try:
                reply = self._ai.generate_reply(message=message, data=safe_data, history=history, intent=intent)
                if not reply:
                    reply = "Xin lỗi, mình đang gặp chút vấn đề kỹ thuật. Bạn có thể thử hỏi lại được không?"
                reply = _add_privacy_note(reply)
            except Exception as e:
                print(f"[ChatOrchestrator] AI reply error: {e}")
                reply = _template_reply(safe_data, message)

            # ── 6. Update context ─────────────────────────────────────────────
            if db_data and isinstance(db_data, list) and len(db_data) > 0:
                self._session_context[session_id] = {
                    **context,
                    "last_search_results": db_data,
                    "current_room": db_data[0].get("RoomCode") if db_data else None,
                }

            suggestions = SUGGESTIONS_BY_INTENT.get(intent, DEFAULT_SUGGESTIONS)

            try:
                if not is_temp:
                    self._history.save_message(
                        session_id=session_id, role="assistant",
                        content=reply, intent=intent, filters=filters, response_data=safe_data)
                    if user_id and db_data and isinstance(db_data, list):
                        for room in db_data[:3]:
                            room_code = room.get("RoomCode")
                            if room_code:
                                try:
                                    self._history.track_room_interaction(
                                        session_id=session_id, tenant_id=user_id,
                                        room_id=room_code, action_type="viewed", context=message[:200])
                                except Exception as e:
                                    print(f"[Track room error] {e}")
            except Exception as e:
                print(f"[ChatOrchestrator] Failed to save history: {e}")

            return {
                "reply": reply,
                "intent": intent,
                "filters": filters,
                "data": safe_data,
                "suggested_questions": suggestions[:3],
                "session_id": session_id,
            }
            
        except Exception as e:
            # Catch-all error handler
            import traceback
            print(f"[ChatOrchestrator] Critical error: {traceback.format_exc()}")
            
            # Return safe fallback response
            return {
                "reply": "Xin lỗi, mình đang gặp chút vấn đề kỹ thuật. Bạn có thể thử hỏi lại được không? 🙏",
                "intent": "error",
                "filters": {},
                "data": None,
                "suggested_questions": ["Tìm phòng giá rẻ", "Phòng còn trống", "Thống kê phòng"],
                "session_id": session_id if 'session_id' in locals() else "unknown",
            }

    # ── Booking handlers ────────────────────────────────────────────────────

    async def _handle_schedule_viewing(
        self, message: str, filters: Dict, user_id: str, session_id: str, context: Dict
    ) -> Dict[str, Any]:
        """
        Human-in-the-loop booking flow:
        AI collects info → builds payload → frontend shows confirmation card
        → user clicks confirm → frontend calls backend API directly.

        AI NEVER writes to DB.
        """
        try:
            # ── Step 1: Resolve room_code ──────────────────────────────
            room_code = (
                filters.get("room_code")
                or context.get("current_room")
            )

            # Also check if message mentions a room code
            room_match = re.search(r'(ROM\d{5,})', message.upper())
            if room_match and not room_code:
                room_code = room_match.group(1)

            if not room_code:
                # Ask for room code / suggest from recent search
                recent_rooms = context.get("last_search_results", [])
                if recent_rooms:
                    room_list = "\n".join(
                        f"• **{r.get('RoomCode')}** — {r.get('RoomType')} — {r.get('Area')}m²"
                        for r in recent_rooms[:3]
                    )
                    reply = (
                        f"Bạn muốn đặt lịch xem phòng nào? Từ kết quả tìm kiếm gần đây:\n\n"
                        f"{room_list}\n\n"
                        f"Cho mình biết mã phòng hoặc nói thêm để mình giúp nhé!"
                    )
                else:
                    reply = (
                        "Bạn muốn đặt lịch xem phòng nào? "
                        "Mình cần biết mã phòng (ví dụ: ROM00011) để đặt lịch cho bạn nhé.\n\n"
                        "Hoặc bạn có thể tìm phòng trước: **'Tìm phòng gần NEU'**, **'Phòng dưới 4 triệu'**..."
                    )
                return self._build_response(reply, "schedule_viewing", filters, None, session_id,
                                             booking_state="awaiting_room_code")

            # ── Step 2: Resolve date + time ────────────────────────────
            date = filters.get("date")
            time = filters.get("time")

            # Try parsing from message if not extracted
            if not date or not time:
                try:
                    from booking_service import BookingService
                    bs = BookingService()
                    parsed = bs.parse_natural_time(message)
                    if not date and parsed.get("date"):
                        date = parsed["date"]
                    if not time and parsed.get("time"):
                        time = parsed["time"]
                except Exception as e:
                    print(f"[Time Parse Error] {e}")

            # ── Step 3: Get room details ────────────────────────────────
            room_info = {}
            try:
                room_info = self._db.get_room_detail(room_code) or {}
            except Exception as e:
                print(f"[Room Detail Error] {e}")

            if not room_info and self._db.is_connected():
                reply = (
                    f"Mình không tìm thấy phòng **{room_code}**. "
                    "Bạn kiểm tra lại mã phòng nhé, hoặc tìm phòng khác."
                )
                return self._build_response(reply, "schedule_viewing", filters, None, session_id)

            # ── Step 4: Get available slots ─────────────────────────────
            available_slots = []
            room_id = None
            if date:
                try:
                    from booking_service import BookingService
                    bs = BookingService()
                    room_id = bs.get_room_id_from_code(room_code)
                    if room_id:
                        available_slots = bs.get_available_slots(room_id, date)
                    else:
                        # Fallback: suggest common times
                        available_slots = ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
                except Exception as e:
                    print(f"[Slots Error] {e}")
                    available_slots = ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

            # ── Step 5: Ask for date/time if missing ────────────────────
            if not date:
                # Store room in context and ask for preferred time
                self._session_context[session_id] = {
                    **context,
                    "current_room": room_code,
                    "booking_state": BOOKING_STATE_INIT,
                    "pending_room_code": room_code,
                    "pending_room_info": room_info,
                }
                room_title = room_info.get("Title") or f"{room_info.get('RoomType', 'Phòng')} {room_code}"
                reply = (
                    f"Bạn muốn xem phòng **{room_title}** vào lúc nào? 📅\n\n"
                    f"Ví dụ bạn có thể nói:\n"
                    f"• *\"Ngày mai lúc 7 giờ tối\"*\n"
                    f"• *\"Thứ 7 sáng\"*\n"
                    f"• *\"Hôm nay 14:00\"*"
                )
                return {
                    "reply": reply,
                    "intent": "schedule_viewing",
                    "filters": {"room_code": room_code},
                    "data": {"room_code": room_code},
                    "suggested_questions": ["Ngày mai 19:00", "Thứ 7 sáng", "Cuối tuần chiều"],
                    "session_id": session_id,
                    "booking_state": BOOKING_STATE_INIT,
                }

            # ── Step 6: Validate chosen time against available slots ────
            if time and available_slots and time[:5] not in available_slots:
                # Time not available, show alternatives
                slots_display = "  ".join(f"`{s}`" for s in available_slots[:8])
                self._session_context[session_id] = {
                    **context,
                    "current_room": room_code,
                    "booking_state": BOOKING_STATE_SLOT_SELECT,
                    "pending_room_code": room_code,
                    "pending_room_info": room_info,
                    "pending_date": date,
                }
                date_display = f"{_format_weekday_vn(date)}, {_format_date_vn(date)}"
                reply = (
                    f"Khung giờ **{time}** ngày {date_display} đã có người đặt rồi 😕\n\n"
                    f"Các giờ còn trống:\n{slots_display}\n\n"
                    f"Bạn chọn giờ nào?"
                )
                return {
                    "reply": reply,
                    "intent": "schedule_viewing",
                    "filters": {"room_code": room_code, "date": date},
                    "data": {
                        "room_code": room_code,
                        "date": date,
                        "available_slots": available_slots,
                    },
                    "suggested_questions": available_slots[:4],
                    "session_id": session_id,
                    "booking_state": BOOKING_STATE_SLOT_SELECT,
                    "available_slots": available_slots,
                }

            # ── Step 7: If date present but no time, ask for time ───────
            if not time:
                if available_slots:
                    slots_display = "  ".join(f"`{s}`" for s in available_slots[:8])
                    date_display = f"{_format_weekday_vn(date)}, {_format_date_vn(date)}"
                    self._session_context[session_id] = {
                        **context,
                        "current_room": room_code,
                        "booking_state": BOOKING_STATE_SLOT_SELECT,
                        "pending_room_code": room_code,
                        "pending_room_info": room_info,
                        "pending_date": date,
                    }
                    reply = (
                        f"Ngày **{date_display}** còn các khung giờ sau:\n\n"
                        f"{slots_display}\n\n"
                        f"Bạn muốn xem lúc mấy giờ?"
                    )
                    return {
                        "reply": reply,
                        "intent": "schedule_viewing",
                        "filters": {"room_code": room_code, "date": date},
                        "data": {
                            "room_code": room_code,
                            "date": date,
                            "available_slots": available_slots,
                        },
                        "suggested_questions": available_slots[:4],
                        "session_id": session_id,
                        "booking_state": BOOKING_STATE_SLOT_SELECT,
                        "available_slots": available_slots,
                    }
                else:
                    time = "09:00"  # sensible default

            # ── Step 8: ALL INFO COLLECTED → Build booking card payload ──
            # This is the key step: AI builds payload, does NOT write to DB.
            # Frontend will render a confirmation card, then call backend on confirm.
            
            # Debug logging
            print(f"[Booking] room_code={room_code}, date={date}, time={time}")
            
            # Validate time format - must be HH:mm
            if time and not re.match(r'^\d{1,2}:\d{2}$', time):
                print(f"[Booking] Invalid time format: {time}, converting...")
                # Try to convert text time to HH:mm
                time_map = {
                    "sáng": "09:00",
                    "buổi sáng": "09:00",
                    "trưa": "12:00",
                    "buổi trưa": "12:00",
                    "chiều": "14:00",
                    "buổi chiều": "14:00",
                    "tối": "19:00",
                    "buổi tối": "19:00",
                }
                time = time_map.get(time.lower(), "09:00")
                print(f"[Booking] Converted time to: {time}")
            
            booking_payload = _build_booking_payload(room_code, room_info, date, time)

            # Clear booking flow from context
            self._session_context[session_id] = {
                **context,
                "current_room": room_code,
                "booking_state": BOOKING_STATE_READY,
                "last_booking_payload": booking_payload,
            }

            room_title = booking_payload["room_info"]["title"]
            date_display = booking_payload["viewing_date_display"]
            
            reply = (
                f"Mình đã chuẩn bị thông tin đặt lịch xem phòng cho bạn. "
                f"Kiểm tra và xác nhận nhé! 👇"
            )

            return {
                "reply": reply,
                "intent": "schedule_viewing",
                "filters": {"room_code": room_code, "date": date, "time": time},
                "data": None,
                "suggested_questions": SUGGESTIONS_BY_INTENT["schedule_viewing"],
                "session_id": session_id,
                "booking_state": BOOKING_STATE_READY,
                # ↓ This is the structured card data the frontend renders
                "booking_card": booking_payload,
                "available_slots": available_slots,
            }

        except Exception as e:
            print(f"[Schedule Viewing Error] {e}")
            import traceback; traceback.print_exc()
            reply = "Có lỗi khi xử lý đặt lịch. Bạn thử lại sau nhé."
            return self._build_response(reply, "schedule_viewing", filters, None, session_id)

    async def _handle_check_schedule(self, user_id: str, session_id: str) -> Dict[str, Any]:
        if not user_id:
            reply = "Bạn cần đăng nhập để xem lịch đã đặt nhé. 🔐"
            return self._build_response(reply, "check_schedule", {}, None, session_id)
        reply = "Bạn có thể xem lịch đã đặt trong trang [Hồ sơ của tôi](/profile) → Lịch xem phòng."
        return self._build_response(reply, "check_schedule", {}, None, session_id)

    async def _handle_cancel_viewing(self, message: str, user_id: str, session_id: str) -> Dict[str, Any]:
        if not user_id:
            reply = "Bạn cần đăng nhập để hủy lịch xem phòng nhé. 🔐"
            return self._build_response(reply, "cancel_viewing", {}, None, session_id)
        reply = "Bạn có thể hủy lịch trong trang [Hồ sơ của tôi](/profile) → Lịch xem phòng → Chọn lịch cần hủy."
        return self._build_response(reply, "cancel_viewing", {}, None, session_id)

    def _build_response(
        self, reply: str, intent: str, filters: Dict, data: Any, session_id: str,
        booking_state: str = None, **extra
    ) -> Dict[str, Any]:
        response = {
            "reply": reply,
            "intent": intent,
            "filters": filters,
            "data": data,
            "suggested_questions": SUGGESTIONS_BY_INTENT.get(intent, DEFAULT_SUGGESTIONS),
            "session_id": session_id,
        }
        if booking_state:
            response["booking_state"] = booking_state
        response.update(extra)
        return response

    # ── DB routing ────────────────────────────────────────

    def _query_db(self, intent: str, filters: Dict[str, Any]) -> Any:
        try:
            if intent == "get_stats":
                return self._db.get_room_stats()
            elif intent == "get_cheap_rooms":
                return self._db.get_cheap_rooms(max_price=filters.get("price_max"), limit=filters.get("limit", 5))
            elif intent in ("get_available_rooms", "search_rooms", "recommend_rooms"):
                return self._db.search_rooms(filters)
            elif intent == "get_buildings":
                return self._db.get_buildings(filters)
            elif intent == "get_room_detail":
                code = filters.get("room_code", "")
                return self._db.get_room_detail(code)
            elif intent == "get_locations":
                return self._db.get_locations(filters)
            else:
                return None
        except Exception as e:
            print(f"[DB routing error] {e}")
            return None