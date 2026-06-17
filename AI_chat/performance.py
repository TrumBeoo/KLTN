"""
performance.py - Performance optimizations for AI chat
"""

import asyncio
import time
from typing import Dict, Any, List
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL

# Thread pool for sync operations
from concurrent.futures import ThreadPoolExecutor
_executor = ThreadPoolExecutor(max_workers=4)


def run_in_thread(func, *args, **kwargs):
    """Run sync function in thread pool"""
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(_executor, lambda: func(*args, **kwargs))


async def parallel_groq_calls(client: Groq, calls: List[Dict[str, Any]]) -> List[str]:
    """Execute multiple Groq API calls in parallel
    
    Args:
        client: Groq client instance
        calls: List of call configs, each with:
            - system: System prompt
            - user: User prompt
            - temperature: Temperature (optional)
            - max_tokens: Max tokens (optional)
    
    Returns:
        List of response strings in same order as calls
    """
    async def _single_call(call_config: Dict[str, Any]) -> str:
        try:
            resp = await run_in_thread(
                client.chat.completions.create,
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": call_config["system"]},
                    {"role": "user", "content": call_config["user"]}
                ],
                temperature=call_config.get("temperature", 0.1),
                max_tokens=call_config.get("max_tokens", 600),
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Parallel Groq Error] {e}")
            return ""
    
    # Execute all calls concurrently
    results = await asyncio.gather(*[_single_call(call) for call in calls])
    return results


class BatchProcessor:
    """Batch multiple DB queries into one"""
    
    def __init__(self, db_client):
        self.db = db_client
        self._pending = []
        self._lock = asyncio.Lock()
    
    async def add_query(self, query_type: str, filters: Dict) -> Any:
        """Add query to batch (future use)"""
        # For now, just execute directly
        # TODO: Implement actual batching logic if needed
        return None


def reduce_history_size(history: List[Dict], max_messages: int = 6) -> List[Dict]:
    """Keep only recent messages to reduce prompt size
    
    Args:
        history: Full conversation history
        max_messages: Maximum messages to keep (default: 6)
    
    Returns:
        Truncated history
    """
    if len(history) <= max_messages:
        return history
    
    # Keep first message (usually greeting) + last N messages
    return [history[0]] + history[-(max_messages-1):]


def compress_room_data(rooms: List[Dict], max_rooms: int = 5) -> List[Dict]:
    """Limit room data to reduce payload size
    
    Args:
        rooms: List of room dicts
        max_rooms: Maximum rooms to include
    
    Returns:
        Compressed room list
    """
    return rooms[:max_rooms]


def lazy_load_features():
    """Lazy load heavy dependencies only when needed"""
    # Move heavy imports here if needed in future
    pass


class MetricsCollector:
    """Lightweight in-process metrics collector"""

    def __init__(self, max_samples: int = 500):
        self.max_samples = max_samples
        self.request_count = 0
        self.error_count = 0
        self.intent_counts: Dict[str, int] = {}
        self.latencies_ms: List[float] = []
        self.last_request_at = None

    def record_request(self, latency_ms: float, intent: str = "unknown", is_error: bool = False):
        self.request_count += 1
        self.last_request_at = time.time()
        self.intent_counts[intent] = self.intent_counts.get(intent, 0) + 1
        self.latencies_ms.append(latency_ms)
        if len(self.latencies_ms) > self.max_samples:
            self.latencies_ms = self.latencies_ms[-self.max_samples:]
        if is_error:
            self.error_count += 1

    def summary(self) -> Dict[str, Any]:
        samples = sorted(self.latencies_ms)
        avg = round(sum(samples) / len(samples), 2) if samples else 0.0
        p95_index = int(len(samples) * 0.95) - 1 if samples else -1
        p95 = round(samples[max(p95_index, 0)], 2) if samples else 0.0
        error_rate = round(self.error_count / self.request_count, 4) if self.request_count else 0.0
        return {
            "requests": self.request_count,
            "errors": self.error_count,
            "error_rate": error_rate,
            "avg_latency_ms": avg,
            "p95_latency_ms": p95,
            "recent_samples": len(samples),
            "intent_counts": self.intent_counts,
            "last_request_at": self.last_request_at,
        }


metrics = MetricsCollector()
