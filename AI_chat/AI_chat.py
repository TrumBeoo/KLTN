"""
ai_chat.py - AI orchestration for Rentify chat
Merges: groq_client.py + intent_router.py + location_validator.py + privacy_filter.py
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
    """Generate a natural, varied out-of-area message."""
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

# ── Groq wrapper ──────────────────────────────────────────

class _GroqClient:
    def __init__(self):
        self._client = Groq(api_key=GROQ_API_KEY) if _GROQ_OK else None

    def _call(self, system: str, user: str, temperature: float = 0.1, max_tokens: int = 600) -> str:
        if not self._client:
            return ""
        resp = self._client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return resp.choices[0].message.content.strip()

    def extract_intent(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call AI to detect intent + filters. Falls back to rule-based on failure."""
        # Build context string
        context_str = ""
        if context:
            if context.get("current_room"):
                context_str += f"Phòng đang xem: {context['current_room']}\n"
            if context.get("last_search_results"):
                context_str += f"Kết quả tìm kiếm trước: {len(context['last_search_results'])} phòng\n"
        
        raw = self._call(
            system="Bạn là AI phân tích intent. Chỉ trả về JSON hợp lệ, không có text thừa.",
            user=INTENT_PROMPT.format(message=message, context=context_str),
            temperature=0.1,
            max_tokens=400,
        )
        if raw:
            # Strip markdown fences if present
            clean = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
            try:
                result = json.loads(clean)
                # Parse time expressions
                result = self._parse_time_expressions(result, message)
                return result
            except json.JSONDecodeError:
                pass
        return _rule_based_intent(message)

    def _parse_time_expressions(self, intent_data: Dict, message: str) -> Dict:
        """Parse natural time expressions to date/time"""
        try:
            from datetime import datetime, timedelta
            
            filters = intent_data.get("filters", {})
            msg = message.lower()
            
            # Parse date
            if not filters.get("date"):
                today = datetime.now()
                
                if any(k in msg for k in ["hôm nay", "nay"]):
                    filters["date"] = today.strftime("%Y-%m-%d")
                elif any(k in msg for k in ["ngày mai", "mai"]):
                    filters["date"] = (today + timedelta(days=1)).strftime("%Y-%m-%d")
                elif any(k in msg for k in ["cuối tuần", "thứ 7", "chủ nhật"]):
                    # Find next weekend
                    days_ahead = 5 - today.weekday()  # Saturday
                    if days_ahead <= 0:
                        days_ahead += 7
                    filters["date"] = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
            
            # Parse time
            if not filters.get("time"):
                if any(k in msg for k in ["sáng", "buổi sáng"]):
                    filters["time"] = "09:00"
                elif any(k in msg for k in ["chiều", "buổi chiều"]):
                    filters["time"] = "14:00"
                elif any(k in msg for k in ["tối", "buổi tối"]):
                    filters["time"] = "18:00"
            
            intent_data["filters"] = filters
            return intent_data
        except Exception as e:
            print(f"[Time Parse Error] {e}")
            return intent_data

    def generate_reply(self, message: str, data: Any, history: List[Dict], intent: str = "") -> str:
        """Generate natural-language reply. Falls back to template on failure."""
        try:
            data_preview = str(data)[:100] if data else "None"
            print(f"[AI Reply] intent={intent}, data_type={type(data).__name__}, preview={data_preview}")
        except Exception:
            print("[AI Reply] Data logging error")

        has_data = bool(data)
        data_str = json.dumps(data, ensure_ascii=False, indent=2) if has_data else "Không có dữ liệu"

        # Build messages: system + recent history (last 6 turns) + current request
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages += history[-6:]
        messages.append({
            "role": "user",
            "content": RESPONSE_PROMPT.format(message=message, data=data_str[:3500])
        })

        if not self._client:
            print("[AI Reply] No Groq client, using template")
            return _template_reply(data, message)

        try:
            resp = self._client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.75,
                max_tokens=600,
            )
            reply = resp.choices[0].message.content.strip()

            # Sanity check: strip any hallucinated room codes not in real data
            if has_data and isinstance(data, list) and reply:
                reply = _strip_hallucinated_rooms(reply, data)

            if not reply:
                print("[AI Reply] Empty response from Groq, using template")
                return _template_reply(data, message)

            print(f"[AI Reply] Generated ({len(reply)} chars)")
            return reply
        except Exception as e:
            print(f"[Groq reply error] {e}")
            return _template_reply(data, message)


# ── Hallucination guard ──────────────────────────────────

def _strip_hallucinated_rooms(reply: str, real_data: List[Dict]) -> str:
    """
    Best-effort check: if AI mentions a RoomCode that isn't in real_data,
    log a warning. We don't strip text aggressively (would break natural sentences)
    but do flag for monitoring. Returns reply unchanged — model guardrails in
    RESPONSE_PROMPT are the primary defence.
    """
    real_codes = {str(r.get("RoomCode", "")) for r in real_data if r.get("RoomCode")}
    # Find anything that looks like a room code pattern (e.g. ROM00011)
    mentioned = set(re.findall(r'ROM\d{5}', reply))
    hallucinated = mentioned - real_codes
    if hallucinated:
        print(f"[Hallucination Warning] AI mentioned codes not in DB: {hallucinated}")
    return reply


# ── Rule-based fallbacks ──────────────────────────────────

def _rule_based_intent(message: str) -> Dict[str, Any]:
    msg = message.lower()
    filters: Dict[str, Any] = {"limit": 5}
    intent = "general_chat"

    # Greetings → no DB query
    greetings = ["hello", "hi", "xin chào", "chào", "hey", "alo"]
    if any(g in msg for g in greetings) and len(msg.split()) <= 4:
        return {"intent": "general_chat", "filters": filters, "sort_by": None}
    
    # Booking intents - check these FIRST before search
    if any(k in msg for k in ["đặt lịch", "xem phòng", "hẹn xem", "book", "schedule"]):
        intent = "schedule_viewing"
        # Don't do room search, just handle booking
        return {"intent": intent, "filters": filters, "sort_by": None}
    elif any(k in msg for k in ["lịch đã đặt", "xem lịch", "kiểm tra lịch", "lịch hẹn"]):
        intent = "check_schedule"
        return {"intent": intent, "filters": filters, "sort_by": None}
    elif any(k in msg for k in ["hủy lịch", "cancel", "không xem nữa"]):
        intent = "cancel_viewing"
        return {"intent": intent, "filters": filters, "sort_by": None}
    
    # Time expressions alone (in booking context) should trigger schedule_viewing
    time_keywords = ["mai", "ngày mai", "hôm nay", "thứ", "sáng", "chiều", "tối", "giờ"]
    if any(k in msg for k in time_keywords) and len(msg.split()) <= 5:
        # Likely a time response in booking flow
        intent = "schedule_viewing"
        return {"intent": intent, "filters": filters, "sort_by": None}
    
    # Room search intents
    if any(k in msg for k in ["giá rẻ", "rẻ nhất", "tiết kiệm"]):
        intent = "get_cheap_rooms"
        filters["sort_by"] = "price_asc"
    elif any(k in msg for k in ["còn trống", "đang trống", "chưa thuê"]):
        intent = "get_available_rooms"
    elif any(k in msg for k in ["tìm", "có phòng", "phòng nào", "muốn thuê"]):
        intent = "search_rooms"
    elif any(k in msg for k in ["thống kê", "tổng quan", "bao nhiêu phòng"]):
        intent = "get_stats"

    # Price parsing: support "X triệu", "X tr", "Xtr"
    price_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:tr(?:iệu)?)", msg)
    if price_match:
        amount = float(price_match.group(1).replace(",", ".")) * 1_000_000
        if any(k in msg for k in ["dưới", "tối đa", "không quá", "under"]):
            filters["price_max"] = amount
        elif any(k in msg for k in ["trên", "từ", "hơn"]):
            filters["price_min"] = amount
        else:
            filters["price_max"] = amount  # default: treat as upper bound

    return {"intent": intent, "filters": filters, "sort_by": filters.get("sort_by")}


def _template_reply(data: Any, message: str = "") -> str:
    """
    Fallback reply when Groq is unavailable.
    Only uses real data — never invents room info.
    """
    import random
    msg = message.lower()

    if not data:
        # No-result variants — more natural, less robotic
        if any(k in msg for k in ["triệu", "tr", "giá"]):
            variants = [
                "Hmm, mình tìm không thấy phòng nào trong mức giá đó 🙁 Bạn thử nới thêm một chút xem sao, hoặc mình thử khu vực khác cho bạn nhé?",
                "Tầm giá đó hiện chưa có phòng phù hợp rồi bạn ơi. Thử nâng lên chút hoặc đổi quận xem — mình tìm lại cho!",
            ]
        elif any(k in msg for k in ["cầu giấy", "đống đa", "hoàng mai", "nam từ liêm",
                                      "thanh xuân", "ba đình", "tây hồ", "hà đông"]):
            variants = [
                "Khu đó hiện chưa có phòng trống bạn ơi. Mình thử tìm quận lân cận cho bạn không?",
                "Khu vực bạn hỏi chưa có phòng phù hợp. Bạn có muốn thử các quận gần đó không?",
            ]
        else:
            variants = [
                "Mình tìm không thấy phòng nào khớp với yêu cầu của bạn. Thử điều chỉnh giá hoặc khu vực xem sao nhé!",
                "Chưa có phòng nào phù hợp lắm bạn ơi. Bạn có thể cho mình biết thêm nhu cầu cụ thể không — mình tìm lại cho!",
            ]
        return random.choice(variants)

    rooms = data if isinstance(data, list) else [data]
    count = len(rooms)

    intros = [
        f"Có {count} phòng khá ổn nè bạn:",
        f"Mình tìm được {count} phòng phù hợp:",
        f"Có mấy cái này bạn tham khảo thử:",
    ] if count > 1 else [
        "Mình tìm được 1 phòng phù hợp:",
        "Có 1 phòng này bạn xem thử nhé:",
    ]
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

    closings = [
        "\nBạn muốn xem thêm thông tin phòng nào không?",
        "\nCó phòng nào bạn thấy ưng không? Mình lấy thêm chi tiết cho!",
        "\nBạn thấy cái nào ổn không — mình tìm thêm hoặc lấy chi tiết cho bạn nhé?",
    ]
    lines.append(random.choice(closings))
    return "\n".join(lines)


# ── Privacy helpers ───────────────────────────────────────

_CONTACT_KEYWORDS = ["liên hệ", "chủ nhà", "số điện thoại", "email", "gọi", "nhắn tin"]

def _add_privacy_note(text: str) -> str:
    if any(k in text.lower() for k in _CONTACT_KEYWORDS):
        if PRIVACY_MESSAGE not in text:
            text += f"\n\n🔒 {PRIVACY_MESSAGE}"
    return text


# ── Main orchestrator ─────────────────────────────────────

class ChatOrchestrator:
    """Single entry-point for the whole chat pipeline."""

    def __init__(self):
        self._ai = _GroqClient()
        self._db = DatabaseClient()
        self._history = ChatHistoryManager()
        self._session_context = {}  # Store context per session

    async def process(
        self,
        message: str,
        history: List[Dict[str, str]] = [],
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:

        # 0. Session management
        try:
            if not session_id:
                session_id = self._history.get_or_create_session(user_id)
                if not session_id:
                    # Fallback: create temporary session ID
                    import uuid
                    session_id = f"TEMP_{uuid.uuid4().hex[:8]}"
                    print(f"[ChatOrchestrator] Using temporary session: {session_id}")
                else:
                    print(f"[ChatOrchestrator] Using session: {session_id}")
        except Exception as e:
            print(f"[ChatOrchestrator] ERROR: Cannot create session - {e}")
            # Use temporary session instead of failing
            import uuid
            session_id = f"TEMP_{uuid.uuid4().hex[:8]}"
            print(f"[ChatOrchestrator] Using temporary session: {session_id}")
        
        # Save user message (only if not temporary session)
        if not session_id.startswith("TEMP_"):
            user_msg_id = self._history.save_message(
                session_id=session_id,
                role="user",
                content=message
            )
        else:
            print(f"[ChatOrchestrator] Skipping message save for temporary session")

        # 1. Location guard
        if _is_out_of_area(message):
            reply = _out_of_area_reply(message)
            
            # Save assistant response (only if not temporary session)
            if not session_id.startswith("TEMP_"):
                self._history.save_message(
                    session_id=session_id,
                    role="assistant",
                    content=reply,
                    intent="out_of_area"
                )
            
            return {
                "reply": reply,
                "intent": "out_of_area",
                "filters": {},
                "data": None,
                "suggested_questions": SUGGESTIONS_BY_INTENT["out_of_area"],
                "session_id": session_id,
            }

        # 2. Intent + filter extraction with context
        context = self._session_context.get(session_id, {})
        filters = {}  # Initialize filters first
        
        # Detect contextual references
        msg_lower = message.lower()
        if any(k in msg_lower for k in ["đặt lịch", "xem phòng", "book", "hẹn xem"]) and not filters.get("room_code"):
            # User wants to book but didn't specify room - use context
            if context.get("current_room"):
                filters["room_code"] = context["current_room"]
        
        intent_data = self._ai.extract_intent(message, context)
        intent  = intent_data.get("intent", "general_chat")
        filters.update(intent_data.get("filters", {}))
        if intent_data.get("sort_by"):
            filters["sort_by"] = intent_data["sort_by"]

        # 3. Handle booking intents
        if intent == "schedule_viewing":
            return await self._handle_schedule_viewing(message, filters, user_id, session_id, context)
        elif intent == "check_schedule":
            return await self._handle_check_schedule(user_id, session_id)
        elif intent == "cancel_viewing":
            return await self._handle_cancel_viewing(message, user_id, session_id)

        # 4. Database query (skip for non-room intents)
        db_data: Any = None
        if intent not in _NO_DB_INTENTS:
            db_data = self._query_db(intent, filters)
            # Fallback to demo data when DB is disconnected
            if not db_data and not self._db.is_connected():
                db_data = self._db.demo_rooms()

        # 5. Privacy masking
        safe_data = filter_privacy(db_data) if db_data else db_data

        # 6. AI reply generation
        reply = self._ai.generate_reply(message=message, data=safe_data, history=history, intent=intent)
        
        # Ensure reply is not None or empty
        if not reply:
            print("[ChatOrchestrator] WARNING: Empty reply from AI, using fallback")
            reply = "Xin lỗi, mình đang gặp chút vấn đề kỹ thuật. Bạn có thể thử hỏi lại được không?"
        
        reply = _add_privacy_note(reply)

        # 7. Update session context
        if db_data and isinstance(db_data, list) and len(db_data) > 0:
            self._session_context[session_id] = {
                "last_search_results": db_data,
                "current_room": db_data[0].get("RoomCode") if db_data else None,
            }

        # 8. Suggested follow-up questions
        suggestions = SUGGESTIONS_BY_INTENT.get(intent, DEFAULT_SUGGESTIONS)
        
        # 9. Save assistant response with metadata (only if not temporary session)
        if not session_id.startswith("TEMP_"):
            self._history.save_message(
                session_id=session_id,
                role="assistant",
                content=reply,
                intent=intent,
                filters=filters,
                response_data=safe_data
            )
        
        # 10. Track room interactions (only if not temporary session)
        if user_id and db_data and isinstance(db_data, list) and not session_id.startswith("TEMP_"):
            for room in db_data[:3]:  # Track top 3 rooms
                room_code = room.get("RoomCode")
                if room_code:
                    try:
                        self._history.track_room_interaction(
                            session_id=session_id,
                            tenant_id=user_id,
                            room_id=room_code,  # Use RoomCode as room_id
                            action_type="viewed",
                            context=message[:200]
                        )
                    except Exception as e:
                        print(f"[Track room error] {e}")

        return {
            "reply": reply,
            "intent": intent,
            "filters": filters,
            "data": safe_data,
            "suggested_questions": suggestions[:3],
            "session_id": session_id,
        }

    # ── Booking handlers ────────────────────────────────

    async def _handle_schedule_viewing(
        self, message: str, filters: Dict, user_id: str, session_id: str, context: Dict
    ) -> Dict[str, Any]:
        """Handle room viewing schedule booking"""
        try:
            # Extract room_code from filters or context
            room_code = filters.get("room_code") or context.get("current_room")
            date = filters.get("date")
            time = filters.get("time")
            
            # Parse natural time from message if not in filters
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
            
            if not room_code:
                reply = "Bạn muốn đặt lịch xem phòng nào? Mình cần biết mã phòng để đặt lịch cho bạn nhé.\n\nVí dụ: 'Đặt lịch xem phòng ROM00011'"
                return self._build_response(reply, "schedule_viewing", filters, None, session_id)
            
            if not date or not time:
                # Get room info
                try:
                    room_info = self._db.get_room_detail(room_code)
                    
                    if not room_info:
                        reply = f"Không tìm thấy phòng {room_code}. Bạn kiểm tra lại mã phòng nhé."
                        return self._build_response(reply, "schedule_viewing", filters, None, session_id)
                    
                    # Store room in context for next message
                    self._session_context[session_id] = {
                        **context,
                        "current_room": room_code,
                        "booking_flow": "awaiting_time"
                    }
                    
                    # Suggest time slots
                    reply = f"""📅 Đặt lịch xem phòng **{room_code}**

Bạn muốn xem phòng vào ngày nào? Ví dụ:
• "Mai sáng" (9h sáng mai)
• "Thứ 7 chiều" (2h chiều thứ 7)
• "Hôm nay lúc 14:00"

Mình sẽ kiểm tra lịch trống và đặt cho bạn ngay!"""
                    
                    return {
                        "reply": reply,
                        "intent": "schedule_viewing",
                        "filters": {"room_code": room_code},
                        "data": {"room_code": room_code, "room_info": room_info},
                        "suggested_questions": ["Mai sáng", "Thứ 7 chiều", "Hôm nay 14:00"],
                        "session_id": session_id,
                        "booking_state": "awaiting_time",
                    }
                except Exception as e:
                    print(f"[Booking Error] {e}")
                    import traceback
                    traceback.print_exc()
                    reply = "Có lỗi khi lấy thông tin phòng. Bạn thử lại sau nhé."
                    return self._build_response(reply, "schedule_viewing", filters, None, session_id)
            
            # Have all info, create booking
            reply = f"""✅ Đã ghi nhận yêu cầu đặt lịch!

🏠 Phòng: **{room_code}**
📅 Ngày: {date}
⏰ Giờ: {time}

Để hoàn tất đặt lịch, bạn vui lòng:
1. Đăng nhập vào tài khoản
2. Vào trang chi tiết phòng {room_code}
3. Nhấn nút "Đặt lịch xem phòng"

Hoặc bạn có thể [xem phòng ngay](/room/{room_code})"""
            
            # Clear booking flow from context
            if session_id in self._session_context:
                self._session_context[session_id].pop("booking_flow", None)
            
            return {
                "reply": reply,
                "intent": "schedule_viewing",
                "filters": {"room_code": room_code, "date": date, "time": time},
                "data": {"room_code": room_code, "date": date, "time": time},
                "suggested_questions": SUGGESTIONS_BY_INTENT["schedule_viewing"],
                "session_id": session_id,
                "booking_state": "pending_confirmation",
            }
        except Exception as e:
            print(f"[Schedule Viewing Error] {e}")
            import traceback
            traceback.print_exc()
            reply = "Có lỗi khi xử lý đặt lịch. Bạn thử lại sau nhé."
            return self._build_response(reply, "schedule_viewing", filters, None, session_id)

    async def _handle_check_schedule(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Check user's viewing schedules"""
        if not user_id:
            reply = "Bạn cần đăng nhập để xem lịch đã đặt nhé. 🔐"
            return self._build_response(reply, "check_schedule", {}, None, session_id)
        
        reply = "Bạn có thể xem lịch đã đặt trong trang [Hồ sơ của tôi](/profile) → Lịch xem phòng."
        return self._build_response(reply, "check_schedule", {}, None, session_id)

    async def _handle_cancel_viewing(self, message: str, user_id: str, session_id: str) -> Dict[str, Any]:
        """Cancel viewing schedule"""
        if not user_id:
            reply = "Bạn cần đăng nhập để hủy lịch xem phòng nhé. 🔐"
            return self._build_response(reply, "cancel_viewing", {}, None, session_id)
        
        reply = "Bạn có thể hủy lịch trong trang [Hồ sơ của tôi](/profile) → Lịch xem phòng → Chọn lịch cần hủy."
        return self._build_response(reply, "cancel_viewing", {}, None, session_id)

    def _build_response(self, reply: str, intent: str, filters: Dict, data: Any, session_id: str) -> Dict[str, Any]:
        """Build standard response dict"""
        return {
            "reply": reply,
            "intent": intent,
            "filters": filters,
            "data": data,
            "suggested_questions": SUGGESTIONS_BY_INTENT.get(intent, DEFAULT_SUGGESTIONS),
            "session_id": session_id,
        }

    # ── DB routing ────────────────────────────────────────

    def _query_db(self, intent: str, filters: Dict[str, Any]) -> Any:
        try:
            if intent == "get_stats":
                return self._db.get_room_stats()
            elif intent == "get_cheap_rooms":
                return self._db.get_cheap_rooms(
                    max_price=filters.get("price_max"),
                    limit=filters.get("limit", 5),
                )
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
                # general_chat handled above; anything else → no DB call
                return None
        except Exception as e:
            print(f"[DB routing error] {e}")
            return None