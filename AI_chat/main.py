"""
main.py - Rentify AI Chat API (FastAPI entry point)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import asyncio
import json
import time

from AI_chat import ChatOrchestrator
from booking_service import BookingService
import cache
from db_pool import pool_manager
from performance import metrics

app = FastAPI(title="Rentify AI Chat", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ChatOrchestrator()
booking_service = BookingService()


@app.on_event("startup")
async def startup_warmup():
    """Warm critical dependencies in the background to reduce first-turn latency."""
    async def _run_warmup():
        try:
            await asyncio.to_thread(orchestrator.warmup)
        except Exception as e:
            print(f"[Startup warmup] {e}")

    asyncio.create_task(_run_warmup())


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    force_new_session: Optional[bool] = False


@app.get("/health")
async def health():
    db_connected = orchestrator._db.is_connected()
    booking_health = booking_service.health()
    cache_health = cache.get_cache_health()
    metrics_health = metrics.summary()

    return {
        "status": "ok" if db_connected else "degraded",
        "ai_provider": {
            "groq_available": bool(getattr(orchestrator._ai, "_client", None)),
        },
        "database": {
            "connected": db_connected,
            "pool": pool_manager.health(),
        },
        "cache": cache_health,
        "booking_service": booking_health,
        "metrics": metrics_health,
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    started_at = time.perf_counter()
    try:
        print(f"[Chat Request] message={req.message[:50]}..., user_id={req.user_id}")
        
        result = await orchestrator.process(
            message=req.message,
            history=req.conversation_history or [],
            user_id=req.user_id,
            session_id=req.session_id,
            force_new_session=bool(req.force_new_session),
        )
        
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        metrics.record_request(latency_ms, result.get("intent", "unknown"), is_error=False)
        print(f"[Chat Response] intent={result.get('intent')}, reply_length={len(result.get('reply', ''))}")
        return JSONResponse(content=result)
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        metrics.record_request(latency_ms, "error", is_error=True)
        print(f"[Chat Error] {error_detail}")
        
        # Return user-friendly error
        return JSONResponse(
            status_code=500,
            content={
                "reply": "Xin lỗi, mình đang gặp chút vấn đề kỹ thuật. Bạn thử lại sau nhé! 🙏",
                "intent": "error",
                "filters": {},
                "data": None,
                "suggested_questions": ["Tìm phòng giá rẻ", "Phòng còn trống", "Thống kê phòng"],
                "error": str(e),
                "session_id": req.session_id or "unknown"
            }
        )


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def event_generator():
        try:
            async for event in orchestrator.process_stream(
                message=req.message,
                history=req.conversation_history or [],
                user_id=req.user_id,
                session_id=req.session_id,
                force_new_session=bool(req.force_new_session),
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            payload = {
                "type": "error",
                "reply": "Xin lá»—i, mĂ¬nh Ä‘ang gáº·p chĂºt váº¥n Ä‘á» ká»¹ thuáº­t. Báº¡n thá»­ láº¡i sau nhĂ©! đŸ™",
                "intent": "error",
                "filters": {},
                "data": None,
                "suggested_questions": ["TĂ¬m phĂ²ng giĂ¡ ráº»", "PhĂ²ng cĂ²n trá»‘ng", "Thá»‘ng kĂª phĂ²ng"],
                "session_id": req.session_id or "unknown",
                "error": str(e),
            }
            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Encoding": "identity",
        },
    )


@app.get("/metrics")
async def get_metrics():
    return {
        "success": True,
        "data": {
            "metrics": metrics.summary(),
            "cache": cache.get_cache_health(),
            "db_pool": pool_manager.health(),
            "booking_service": booking_service.health(),
        }
    }


@app.get("/rooms/stats")
async def room_stats():
    data = orchestrator._db.get_room_stats()
    return {"success": True, "data": data}


@app.get("/chat/history/{tenant_id}")
async def get_chat_history(tenant_id: str, limit: int = 10):
    """Lấy lịch sử chat của tenant"""
    history = orchestrator._history.get_user_chat_history(tenant_id, limit)
    return {"success": True, "data": history}


@app.get("/chat/session/{session_id}")
async def get_session_messages(session_id: str):
    """Lấy tất cả tin nhắn trong session"""
    messages = orchestrator._history.get_session_messages(session_id)
    return {"success": True, "data": messages}


@app.post("/chat/feedback")
async def submit_feedback(data: Dict[str, Any]):
    """Gửi feedback về câu trả lời AI"""
    orchestrator._history.save_feedback(
        message_id=data.get("message_id"),
        tenant_id=data.get("tenant_id"),
        rating=data.get("rating"),
        reason=data.get("reason")
    )
    return {"success": True}


@app.get("/analytics/intents")
async def get_popular_intents(days: int = 7):
    """Phân tích intent phổ biến"""
    data = orchestrator._history.get_popular_intents(days)
    return {"success": True, "data": data}


@app.get("/analytics/daily-stats")
async def get_daily_stats(days: int = 7):
    """Thống kê chat theo ngày"""
    data = orchestrator._history.get_daily_stats(days)
    return {"success": True, "data": data}


@app.get("/analytics/top-rooms")
async def get_top_rooms(limit: int = 10):
    """Top phòng được hỏi nhiều nhất"""
    data = orchestrator._history.get_top_rooms(limit)
    return {"success": True, "data": data}


@app.get("/booking/available-slots/{room_code}")
async def get_available_slots(room_code: str, date: str):
    """Lấy khung giờ trống cho phòng"""
    room_id = booking_service.get_room_id_from_code(room_code)
    if not room_id:
        return {"success": False, "message": "Không tìm thấy phòng"}
    
    slots = booking_service.get_available_slots(room_id, date)
    return {"success": True, "data": slots}


@app.post("/booking/create")
async def create_booking(data: Dict[str, Any]):
    """Tạo lịch xem phòng"""
    room_code = data.get("room_code")
    date = data.get("date")
    time = data.get("time")
    tenant_id = data.get("tenant_id")
    auth_token = data.get("auth_token")
    
    if not all([room_code, date, time, tenant_id]):
        return {"success": False, "message": "Thiếu thông tin"}
    
    room_id = booking_service.get_room_id_from_code(room_code)
    if not room_id:
        return {"success": False, "message": "Không tìm thấy phòng"}
    
    result = booking_service.create_booking(tenant_id, room_id, date, time, auth_token)
    return result


@app.get("/booking/schedules/{tenant_id}")
async def get_user_schedules(tenant_id: str, room_code: Optional[str] = None):
    """Lấy lịch xem phòng của user"""
    room_id = None
    if room_code:
        room_id = booking_service.get_room_id_from_code(room_code)
    
    schedules = booking_service.get_user_schedules(tenant_id, room_id)
    return {"success": True, "data": schedules}


@app.delete("/booking/cancel/{schedule_id}")
async def cancel_booking(schedule_id: str, tenant_id: str):
    """Hủy lịch xem phòng"""
    success = booking_service.cancel_schedule(schedule_id, tenant_id)
    if success:
        return {"success": True, "message": "Đã hủy lịch"}
    return {"success": False, "message": "Không thể hủy lịch"}


@app.post("/cache/clear")
async def clear_cache(cache_type: str = "all"):
    """Clear cache - admin only"""
    if cache_type == "all":
        cache.clear_all()
    elif cache_type == "db":
        cache.clear_db_cache()
    return {"success": True, "message": f"Cleared {cache_type} cache"}


# ── Optional: simple Tkinter GUI for local testing ───────

if __name__ == "__main__":
    import asyncio
    import threading
    import tkinter as tk
    from tkinter import scrolledtext

    class ChatGUI:
        GREETING = (
            "Xin chào! 👋 Tôi là trợ lý AI của Rentify.\n\n"
            "Tôi có thể giúp bạn:\n"
            "• Tìm phòng theo giá, diện tích, khu vực\n"
            "• So sánh các lựa chọn phòng tại Hà Nội\n\n"
            "Bạn đang muốn tìm phòng ở khu vực nào?"
        )

        def __init__(self, root: tk.Tk):
            self.root = root
            root.title("Rentify AI Chat")
            root.geometry("820x620")
            root.configure(bg="#f5f6fa")

            self.display = scrolledtext.ScrolledText(
                root, wrap=tk.WORD, state=tk.DISABLED,
                bg="#ffffff", font=("Arial", 10), relief=tk.FLAT,
            )
            self.display.pack(padx=12, pady=12, fill=tk.BOTH, expand=True)

            frame = tk.Frame(root, bg="#f5f6fa")
            frame.pack(fill=tk.X, padx=12, pady=(0, 12))

            self.entry = tk.Entry(frame, font=("Arial", 11), relief=tk.FLAT, bg="#eef0f5")
            self.entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=6, padx=(0, 8))
            self.entry.bind("<Return>", lambda _: self.send())

            tk.Button(
                frame, text="Gửi", command=self.send,
                bg="#2d6cdf", fg="white", font=("Arial", 10, "bold"),
                relief=tk.FLAT, padx=16, pady=6,
            ).pack(side=tk.RIGHT)

            self._append(self.GREETING, "bot")

        def send(self):
            msg = self.entry.get().strip()
            if not msg:
                return
            self._append(f"👤 {msg}", "user")
            self.entry.delete(0, tk.END)
            threading.Thread(target=self._process, args=(msg,), daemon=True).start()

        def _process(self, msg: str):
            try:
                result = asyncio.run(orchestrator.process(message=msg, history=[]))
                self._append(f"🤖 {result['reply']}", "bot")
            except Exception as e:
                self._append(f"❌ Lỗi: {e}", "error")

        def _append(self, text: str, _: str):
            self.display.config(state=tk.NORMAL)
            self.display.insert(tk.END, text + "\n\n")
            self.display.config(state=tk.DISABLED)
            self.display.see(tk.END)

    root = tk.Tk()
    ChatGUI(root)
    root.mainloop()
