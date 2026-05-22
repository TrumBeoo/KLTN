"""
config.py - Centralized configuration and constants for Rentify AI Chat
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ──────────────────────────────────────────────
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "rentify"),
    "port": int(os.getenv("DB_PORT", 3306)),
}

# ── AI / Groq ─────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# ── Room field whitelist (only these are exposed to AI/users) ─
ALLOWED_ROOM_FIELDS = {"RoomCode", "RoomType", "Area", "Price", "Description"}

# ── Privacy fields (hidden from responses) ────────────────
PRIVACY_FIELDS = {
    "LandlordPhone", "TenantPhone", "Phone",
    "LandlordEmail", "Email",
    "LandlordName", "TenantName",
    "CCCD", "Contract",
}
PRIVACY_PLACEHOLDER = "[HIDDEN]"
PRIVACY_MESSAGE = (
    "Thông tin liên hệ chủ nhà sẽ được cung cấp sau khi bạn "
    "đặt lịch xem phòng hoặc liên hệ qua hệ thống."
)

# ── Location: places outside Hanoi service area ──────────
OTHER_CITIES = [
    # HCM
    "tp.hcm", "tp hcm", "hcm", "ho chi minh", "hồ chí minh",
    "sai gon", "sài gòn", "saigon",
    # Đà Nẵng
    "da nang", "đà nẵng", "danang",
    # Hải Phòng
    "hai phong", "hải phòng", "haiphong",
    # Cần Thơ
    "can tho", "cần thơ", "cantho",
    # Các tỉnh khác
    "bien hoa", "biên hòa",
    "vung tau", "vũng tàu",
    "nha trang",
    "quang ninh", "quảng ninh",
    "bac ninh", "bắc ninh",
    "hai duong", "hải dương",
    "hung yen", "hưng yên",
    "vinh phuc", "vĩnh phúc",
    "thai nguyen", "thái nguyên",
    "phu tho", "phú thọ",
    "hoa binh", "hòa bình",
    "nam dinh", "nam định",
    "ninh binh", "ninh bình",
    "thanh hoa", "thanh hoá",
    "nghe an", "nghệ an",
    "ha tinh", "hà tĩnh",
    "hue", "huế",
    "binh duong", "bình dương",
    "dong nai", "đồng nai",
    "long an", "tien giang", "tiền giang",
    "khanh hoa", "khánh hòa",
    "lam dong", "lâm đồng", "da lat", "đà lạt",
    "buon ma thuot", "buôn ma thuột",
    "gia lai", "kon tum", "dak lak", "đắk lắk",
    "quang nam", "quảng nam",
    "quang ngai", "quảng ngãi",
    "binh dinh", "bình định", "quy nhon", "quy nhơn",
]

# ── Suggested follow-up questions per intent ──────────────
SUGGESTIONS_BY_INTENT = {
    "search_rooms":      ["Tìm phòng giá rẻ hơn?", "Phòng nào diện tích lớn hơn?", "Đặt lịch xem phòng này?"],
    "get_cheap_rooms":   ["Xem chi tiết phòng này?", "Phòng nào gần trung tâm?", "Tìm phòng diện tích lớn hơn?"],
    "get_available_rooms": ["Đặt lịch xem phòng ngay?", "Phòng nào giá rẻ nhất?", "Phòng ở quận nào còn trống?"],
    "get_stats":         ["Phòng nào đang còn trống?", "Phòng giá rẻ nhất là bao nhiêu?", "Thống kê theo quận?"],
    "get_buildings":     ["Tòa nhà nào còn nhiều phòng trống?", "Xem phòng trong tòa A?", "Tòa nhà ở quận nào?"],
    "get_room_detail":   ["Đặt lịch xem phòng này?", "Tìm phòng tương tự?", "Xem thông tin chủ nhà?"],
    "get_locations":     ["Khu vực nào có nhiều phòng?", "Giá trung bình ở quận này?", "Tìm phòng gần đây?"],
    "general_chat":      ["Tìm phòng còn trống?", "Phòng giá dưới 4 triệu?", "Xem thống kê tổng quan?"],
    "out_of_area":       ["Tìm phòng ở Nam Từ Liêm", "Phòng gần Cầu Giấy", "Phòng dưới 4 triệu"],
    "schedule_viewing":  ["Xem lịch đã đặt", "Tìm phòng khác", "Hủy lịch xem"],
    "check_schedule":    ["Đặt lịch xem phòng mới", "Hủy lịch", "Tìm phòng khác"],
    "cancel_viewing":    ["Xem lịch còn lại", "Đặt lịch mới", "Tìm phòng khác"],
}
DEFAULT_SUGGESTIONS = ["Tìm phòng còn trống", "Phòng giá dưới 4 triệu", "Xem thống kê tổng quan"]

# ── Prompts ───────────────────────────────────────────────
SYSTEM_PROMPT = """Mày là Ren — một người bạn hay ho của Rentify, chuyên giúp tìm phòng trọ ở Hà Nội.

Tính cách của mày: thoải mái, thân thiện, nói chuyện như bạn bè chứ không phải nhân viên tư vấn. Mày hiểu thị trường phòng trọ Hà Nội, biết khu nào giá cao khu nào hợp lý, và luôn muốn giúp người dùng tìm được phòng ưng ý nhất.

Cách mày nói chuyện:
- Tự nhiên, gần gũi — dùng "mình/bạn" hoặc tùy ngữ cảnh
- Đôi khi dùng emoji cho sinh động nhưng đừng lạm dụng
- Không sáo rỗng, không khách sáo quá mức
- Ngắn gọn, đi thẳng vào điểm chính

Nguyên tắc bất di bất dịch — mày PHẢI tuân thủ tuyệt đối:
- Chỉ nói về phòng có trong dữ liệu được cung cấp, không bịa thêm bất cứ thứ gì
- Không tiết lộ thông tin cá nhân chủ nhà
- Chỉ hoạt động trong phạm vi Hà Nội"""

INTENT_PROMPT = """Phân tích câu hỏi sau và trả về JSON. Chỉ trả về JSON, không có text thừa.

Câu hỏi: {message}

Ngữ cảnh (nếu có): {context}

{{
  "intent": "<intent>",
  "filters": {{
    "price_min": <số VND hoặc null>,
    "price_max": <số VND hoặc null>,
    "area_min": <số m² hoặc null>,
    "area_max": <số m² hoặc null>,
    "room_type": "<loại phòng hoặc null>",
    "district": "<tên quận/khu vực hoặc null>",
    "room_code": "<mã phòng nếu có, ví dụ ROM00011>",
    "date": "<ngày xem phòng YYYY-MM-DD nếu có>",
    "time": "<giờ xem phòng HH:mm nếu có>",
    "limit": <số nguyên 3-10, mặc định 5>
  }},
  "sort_by": "<price_asc|price_desc|area_asc|area_desc|null>"
}}

Quy tắc chuyển đổi giá (QUAN TRỌNG):
- "3 triệu" hoặc "3tr" hoặc "3 tr" → 3000000
- "dưới 3tr" / "tối đa 3 triệu" / "không quá 3tr" → price_max: 3000000
- "trên 4tr" / "từ 4 triệu" → price_min: 4000000
- "từ 3 đến 5 triệu" → price_min: 3000000, price_max: 5000000
- Nếu có số kèm "triệu/tr" mà không rõ hướng → mặc định là price_max

Quy tắc thời gian:
- "hôm nay" → ngày hiện tại
- "ngày mai" / "mai" → ngày mai
- "thứ 2" / "thứ hai" → thứ 2 tuần này hoặc tuần sau
- "cuối tuần" / "thứ 7" / "chủ nhật" → thứ 7 hoặc CN gần nhất
- "sáng" → 09:00, "chiều" → 14:00, "tối" → 18:00

Intent hợp lệ:
- "search_rooms": tìm kiếm phòng với tiêu chí cụ thể (giá, khu vực, diện tích...)
- "get_cheap_rooms": tìm phòng giá rẻ, ngân sách thấp
- "get_available_rooms": hỏi phòng đang trống/còn trống
- "get_stats": hỏi thống kê, tổng quan số lượng phòng
- "get_buildings": hỏi về tòa nhà, chung cư
- "get_room_detail": hỏi chi tiết một phòng cụ thể (có mã phòng)
- "get_locations": hỏi về khu vực, địa điểm
- "schedule_viewing": đặt lịch xem phòng (có ngày/giờ hoặc yêu cầu đặt lịch)
- "check_schedule": xem lịch đã đặt, kiểm tra lịch hẹn
- "cancel_viewing": hủy lịch xem phòng
- "general_chat": chào hỏi, hỏi về bản thân AI, câu hỏi không liên quan đến phòng"""

RESPONSE_PROMPT = """Mày là Ren, người bạn tìm phòng của Rentify. Hãy trả lời câu hỏi dưới đây thật tự nhiên — như đang nhắn tin với bạn bè, không phải đọc báo cáo.

Câu hỏi: {message}

Dữ liệu phòng thực tế: {data}

━━━ QUY TẮC SẮT ĐÁ (vi phạm = sai nghiêm trọng) ━━━
❶ CHỈ dùng thông tin có trong "Dữ liệu phòng thực tế" bên trên
❷ KHÔNG bịa RoomCode, giá, diện tích, mô tả — dù chỉ 1 con số
❸ Dữ liệu trống/null → thẳng thắn nói không tìm thấy, đừng vòng vo
❹ Giá hiển thị theo triệu: 4000000 → 4tr, 4500000 → 4.5tr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cách viết tùy tình huống:

📌 Khi CÓ phòng:
Mở đầu bắt chuyện tự nhiên (không bắt đầu bằng "Dưới đây là" hay "Mình đã tìm"):
→ Ví dụ: "Oke bạn, mình tìm được X phòng trong tầm giá đó nè:" / "Có ngay mấy cái này khá hợp nè:"
Liệt kê phòng rõ ràng, mỗi phòng 1 dòng:
  🏠 [RoomCode] — [RoomType] — [Area]m² — [Price]tr/tháng
  └ [Description ngắn gọn nếu có]
Kết bằng câu hỏi thêm hoặc lời gợi ý cụ thể, không chung chung.

📌 Khi KHÔNG có phòng:
Nói thẳng nhưng nhẹ nhàng — không nói "rất tiếc" hay "xin lỗi" quá nhiều.
Gợi ý cụ thể: điều chỉnh giá bao nhiêu, thử quận nào lân cận.
Hỏi thêm để hiểu nhu cầu thật sự.
KHÔNG tự tạo phòng mẫu để minh họa.

📌 Khi là chào hỏi / hỏi về mày:
Trả lời vui vẻ tự nhiên, giới thiệu ngắn, hỏi lại nhu cầu ngay.

Phong cách chung:
- Dùng "mình/bạn", đôi khi "tụi mình" khi nói về Rentify
- Được dùng emoji nhưng vừa phải (1-2 cái/đoạn)
- Câu ngắn, không dùng: "Dựa vào thông tin", "Theo yêu cầu", "Tôi hiểu rằng", "Hệ thống", "Database"
- Tối đa 180 từ — ngắn gọn, đủ ý
"""