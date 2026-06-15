# 🏠 RENTIFY - Nền tảng Cho Thuê Chung Cư Mini

## 📋 Mục Lục
1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Kiến Trúc Kỹ Thuật](#kiến-trúc-kỹ-thuật)
3. [Các Module Chính](#các-module-chính)
4. [Nghiệp Vụ Chi Tiết](#nghiệp-vụ-chi-tiết)
5. [Luồng Dữ Liệu](#luồng-dữ-liệu)
6. [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)

---

## 🎯 Tổng Quan Hệ Thống

Rentify là nền tảng số hóa cho thuê chung cư mini tại Hà Nội, kết nối chủ nhà và người thuê thông qua:
- **Tự động hóa quản lý phòng**: Upload hàng loạt, quản lý trạng thái
- **Thông minh tìm kiếm**: Lọc phòng theo giá, khu vực, tiện nghi
- **AI hỗ trợ**: Chat bot sử dụng Groq AI để gợi ý phòng phù hợp
- **Đặt lịch xem phòng**: Quản lý lịch trực tiếp trên nền tảng
- **Hỗ trợ ở ghép**: Gợi ý bạn ở ghép dựa trên tương thích

---

## 🏗️ Kiến Trúc Kỹ Thuật

### Stack Công Nghệ

| Component | Công Nghệ | Chức Năng |
|-----------|-----------|----------|
| **Backend Chủ Nhà** | Node.js + Express | Quản lý phòng, upload hàng loạt, hợp đồng |
| **Backend Người Thuê** | Node.js + Express | Tìm phòng, yêu thích, đặt lịch xem |
| **Admin Dashboard Backend** | Node.js + Express | Quản lý người dùng, duyệt tin, thống kê |
| **AI Chat** | Python + FastAPI + Groq | Xử lý câu hỏi tự nhiên, gợi ý phòng |
| **Frontend Chủ Nhà** | React + Material-UI | Giao diện quản lý phòng cho chủ nhà |
| **Frontend Người Thuê** | React + Material-UI | Giao diện tìm kiếm phòng cho người thuê |
| **Admin Frontend** | React 19 + MUI 5 | Dashboard quản lý nền tảng |
| **Database** | MySQL | KLTN (15 bảng chính) |
| **Storage** | Cloudinary | Lưu trữ ảnh phòng |

### Sơ Đồ Kiến Trúc Toàn Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    NGƯỜI DÙNG                              │
├─────────────────────────────────────────────────────────────┤
│  👨 Chủ Nhà │ 👤 Người Thuê │ 👨‍💼 Quản Trị Viên │ 🤖 AI Chat   │
└──────┬──────┴──────┬─────────┴──────┬──────────┴─────┬──────┘
       │             │                │               │
       ▼             ▼                ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────┐
│ Landlord BE  │ │ Tenant BE    │ │  Admin BE  │ │  AI Service │
│ (Node 5555)  │ │ (Node 5000)  │ │ (Node 5050)│ │  (Python)   │
└──────┬───────┘ └──────┬───────┘ └────┬───────┘ └──────┬──────┘
       │                 │              │                │
       └─────────────────┼──────────────┼────────────────┘
                         ▼
                  ┌──────────────┐
                  │   MySQL DB   │
                  │    (KLTN)    │
                  └──────┬───────┘
                         │
                    ┌────┴─────┐
                    ▼          ▼
                Cloudinary  Sessions
```

### Port & Endpoints

| Service | Port | Base URL | Chức Năng |
|---------|------|----------|----------|
| Landlord Backend | 5555 | `http://localhost:5555/api` | Quản lý phòng chủ nhà |
| Tenant Backend | 5000 | `http://localhost:5000/api` | Tìm phòng người thuê |
| Admin Backend | 5050 | `http://localhost:5050/api` | Quản lý nền tảng |
| AI Chat | 8000 | `http://localhost:8000` | Chat AI + booking |

---

## 🔧 Các Module Chính

### 1️⃣ LANDLORD MODULE (Chủ Nhà)
**Vị trí:** `/Landlord/backend`
**Chức năng:** Quản lý phòng cho thuê

#### Routes Chính:
```
POST   /api/auth/register                   - Đăng ký tài khoản chủ nhà
POST   /api/auth/login                      - Đăng nhập
GET    /api/dashboard                       - Thống kê phòng, doanh thu
GET    /api/rooms                           - Danh sách phòng
POST   /api/rooms                           - Thêm phòng mới
PUT    /api/rooms/:id                       - Chỉnh sửa phòng
DELETE /api/rooms/:id                       - Xóa phòng
POST   /api/rooms/:id/images                - Upload ảnh phòng
PUT    /api/rooms/:id/images                - Cập nhật danh sách ảnh
POST   /api/buildings                       - Thêm chung cư
GET    /api/listings                        - Quản lý tin đăng
POST   /api/bulk/upload                     - Upload hàng loạt phòng
GET    /api/contracts                       - Danh sách hợp đồng
GET    /api/schedule                        - Lịch xem phòng
POST   /api/notifications                   - Thông báo hệ thống
```

#### Services:
- **RoomService**: Lấy/tạo/cập nhật phòng
- **CloudinaryService**: Upload ảnh lên Cloudinary
- **NotificationService**: Gửi thông báo cho người thuê
- **ContractService**: Quản lý hợp đồng thuê

---

### 2️⃣ TENANT MODULE (Người Thuê)
**Vị trí:** `/Tenant/backend`
**Chức năng:** Tìm phòng và đặt lịch xem

#### Routes Chính:
```
POST   /api/auth/register                   - Đăng ký tài khoản
POST   /api/auth/login                      - Đăng nhập
GET    /api/rooms                           - Danh sách phòng
GET    /api/rooms/:id                       - Chi tiết phòng
GET    /api/rooms/search                    - Tìm kiếm phòng nâng cao
GET    /api/tenant/profile                  - Hồ sơ người thuê
GET    /api/tenant/favorites                - Danh sách yêu thích
POST   /api/tenant/favorites                - Thêm yêu thích
DELETE /api/tenant/favorites/:id            - Xóa yêu thích
POST   /api/viewing-schedule                - Đặt lịch xem phòng
GET    /api/viewing-schedule                - Danh sách lịch xem
DELETE /api/viewing-schedule/:id            - Hủy lịch xem
POST   /api/moving/find-roommate            - Tìm bạn ở ghép
```

#### Services:
- **RoomService**: Tìm và lấy thông tin phòng
- **FavoriteService**: Quản lý danh sách yêu thích
- **ViewingScheduleService**: Đặt/hủy lịch xem
- **MovingService**: Gợi ý bạn ở ghép dựa trên tương thích

---

### 3️⃣ ADMIN MODULE
**Vị trị:** `/Admin/backend`
**Chức năng:** Quản lý nền tảng

#### Routes Chính:
```
GET    /api/dashboard/stats                 - Thống kê nền tảng
GET    /api/dashboard/activities            - Hoạt động gần đây
GET    /api/users                           - Danh sách tất cả người dùng
GET    /api/users/:id                       - Chi tiết người dùng
PUT    /api/users/:id/status                - Cập nhật trạng thái user
POST   /api/users/:id/suspend               - Khóa tài khoản
POST   /api/users/:id/activate              - Mở khóa tài khoản
GET    /api/listings                        - Danh sách tin đăng
POST   /api/listings/:id/approve            - Duyệt tin đăng
POST   /api/listings/:id/reject             - Từ chối tin đăng
DELETE /api/listings/:id                    - Xóa tin đăng
GET    /api/reports                         - Báo cáo thống kê
GET    /api/settings                        - Cài đặt hệ thống
```

#### Dashboard Features:
- 📊 KPI Cards: Tổng người dùng, chủ nhà, tin đăng
- 📈 Thống kê hoạt động: Lịch sử xem phòng, đặt lịch
- 🔍 Quản lý user: Tìm kiếm, lọc, khóa/mở khóa
- ✅ Duyệt tin: Kiểm tra tin đăng trước khi public
- 📋 Báo cáo: Xuất thống kê, phân tích xu hướng

---

### 4️⃣ AI CHAT MODULE
**Vị trí:** `/AI_chat`
**Chức năng:** Tương tác thông minh với người dùng

#### API Endpoints:
```
POST   /chat                                 - Chat với AI
GET    /health                              - Kiểm tra kết nối
GET    /rooms/stats                         - Thống kê phòng
POST   /chat/feedback                       - Feedback về câu trả lời
GET    /analytics/intents                   - Phân tích intent
GET    /analytics/daily-stats               - Thống kê theo ngày
POST   /booking/create                      - Tạo lịch xem phòng
GET    /booking/schedules/:tenant_id        - Danh sách lịch xem
```

#### Intent Processing:
- 🔍 **search_rooms** → Tìm phòng theo tiêu chí
- 💰 **get_cheap_rooms** → Phòng giá rẻ
- ✅ **get_available_rooms** → Phòng còn trống
- 📅 **schedule_viewing** → Đặt lịch xem phòng
- 📋 **check_schedule** → Kiểm tra lịch đã đặt
- ❌ **cancel_viewing** → Hủy lịch xem
- 📊 **get_stats** → Thống kê phòng
- 💬 **general_chat** → Trò chuyện thông thường

---

## 📊 Nghiệp Vụ Chi Tiết

### Quy Trình 1: Quản Lý Phòng (Chủ Nhà)

```
┌─────────────────────────────────────────────────────────────┐
│ QUYTRÌNH QUẢN LÝ PHÒNG                                      │
└─────────────────────────────────────────────────────────────┘

BƯỚC 1: Chủ nhà đăng nhập
├─ POST /api/auth/login
├─ Xác thực tài khoản (AccountID)
└─ Lấy LandlordID từ AccountID

BƯỚC 2: Xem danh sách phòng
├─ GET /api/rooms
├─ Lọc theo: tòa nhà, trạng thái (available/rented/viewing), loại phòng
└─ Hiển thị: Mã phòng, diện tích, giá, ảnh, trạng thái

BƯỚC 3: Thêm phòng mới
├─ POST /api/rooms
├─ Input: buildingId, roomCode, roomType, area, price, maxPeople, amenities
├─ Tạo RoomID tự động (ROM00001...)
├─ Insert vào ROOM table + ROOM_AMENITY
└─ Status mặc định: 'available'

BƯỚC 4: Upload ảnh phòng
├─ POST /api/rooms/:id/images (multipart/form-data)
├─ Multer nhận file (max 5MB)
├─ CloudinaryService.uploadImage() → Cloudinary
├─ Lưu URL vào ROOM_IMAGE (DisplayOrder 1, 2, 3...)
└─ Return: { success, images[] }

BƯỚC 5: Upload hàng loạt phòng
├─ POST /api/bulk/upload (Excel/CSV)
├─ Parse dữ liệu: roomCode, area, price, amenities...
├─ Tạo records hàng loạt
├─ Batch insert vào ROOM + ROOM_AMENITY
└─ Tự động tạo tin đăng (LISTING)

BƯỚC 6: Quản lý hợp đồng
├─ Sau khi có người yêu cầu thuê
├─ Chủ nhà xác nhận hợp đồng
├─ System cập nhật ROOM.Status = 'rented'
├─ Insert vào CONTRACT table
└─ Tạo thông báo cho người thuê

BƯỚC 7: Lịch xem phòng
├─ GET /api/schedule
├─ Hiển thị pending schedules (Chờ duyệt)
├─ Chủ nhà xác nhận hoặc từ chối
├─ Cập nhật VIEWING_SCHEDULE.Status
└─ Thông báo người thuê
```

### Quy Trình 2: Tìm Phòng & Đặt Lịch (Người Thuê)

```
┌─────────────────────────────────────────────────────────────┐
│ QUYTRÌNH TÌM PHÒNG VÀ ĐẶT LỊCH XEM                         │
└─────────────────────────────────────────────────────────────┘

BƯỚC 1: Người thuê đăng nhập
├─ POST /api/auth/login (hoặc Google/Facebook OAuth)
├─ Xác thực tài khoản
└─ Lấy TenantID từ AccountID

BƯỚC 2: Tìm kiếm phòng
├─ GET /api/rooms?district=Hoàng+Mai&price_max=3000000
├─ Query filter theo:
│  ├─ Khu vực (district, ward)
│  ├─ Giá thuê (price_min, price_max)
│  ├─ Loại phòng (room_type)
│  ├─ Diện tích (area_min, area_max)
│  ├─ Tiện nghi (amenities[])
│  └─ POI gần (school, workplace)
├─ Return: { data: [], total, limit, offset }
└─ Hiển thị: Danh sách phòng với ảnh, giá, tiện nghi

BƯỚC 3: Xem chi tiết phòng
├─ GET /api/rooms/:id
├─ Lấy: Mô tả, tiện nghi, quy tắc, hình ảnh
├─ Hiển thị vị trí trên bản đồ
├─ Hiển thị đánh giá (nếu có)
└─ Option: Thêm vào yêu thích hoặc đặt lịch xem

BƯỚC 4: Thêm vào danh sách yêu thích
├─ POST /api/tenant/favorites
├─ Input: { roomId, rating?, note? }
├─ Insert vào FAVORITE table
└─ Có thể xem lại sau

BƯỚC 5A: Chat với AI để đặt lịch
├─ POST /chat (message: "Mình muốn xem phòng ROM00011")
├─ AI Intent Detection:
│  ├─ Extract: room_code, date, time
│  ├─ Nếu thiếu thông tin → hỏi thêm
│  ├─ Validate available slots từ backend
│  └─ Build booking_card (confirmation payload)
├─ Frontend render confirmation card
└─ User click [Xác nhận] → Call backend API

BƯỚC 5B: Đặt lịch xem thẳng
├─ POST /api/viewing-schedule
├─ Input: { roomId, tenantId, dateTime, status: 'Chờ duyệt' }
├─ Insert vào VIEWING_SCHEDULE
├─ Send notification cho chủ nhà
└─ Room status → 'viewing' (nếu đang available)

BƯỚC 6: Theo dõi lịch xem
├─ GET /api/viewing-schedule
├─ Hiển thị: Danh sách lịch xem, trạng thái
├─ Status:
│  ├─ Chờ duyệt: Chủ nhà chưa phản hồi
│  ├─ Đã duyệt: Xác nhận được, có thể đến xem
│  └─ Từ chối: Chủ nhà không chấp nhận
└─ Hủy lịch (DELETE /api/viewing-schedule/:id)

BƯỚC 7: Hỗ trợ ở ghép
├─ POST /api/moving/find-roommate
├─ Input: { profile, preferences }
├─ System call AI Matching Algorithm
├─ Return: { compatiblePartners[], score }
├─ Người thuê xem profile bạn ở ghép
└─ Chat để thỏa thuận điều kiện ở
```

### Quy Trình 3: AI Chat & Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│ QUYTRÌNH AI CHAT (HUMAN-IN-THE-LOOP)                       │
└─────────────────────────────────────────────────────────────┘

BƯỚC 1: User Chat Message
├─ Message: "Tìm phòng dưới 4 triệu ở Hoàng Mai"
└─ POST /chat

BƯỚC 2: AI Intent Detection
├─ System Prompt: Phân loại intent từ message
├─ Extract filters:
│  ├─ price_max: 4000000
│  ├─ district: "Hoàng Mai"
│  └─ intent: "search_rooms"
└─ Rule-based fallback (nếu Groq API fail)

BƯỚC 3: Database Query
├─ _query_db(intent="search_rooms", filters)
├─ SQL:
│  └─ SELECT * FROM ROOM
│     WHERE Status IN ('available', 'viewing')
│     AND Price <= 4000000
│     AND District = 'Hoàng Mai'
│     ORDER BY UpdatedAt DESC LIMIT 5
├─ Join với LANDLORD, LOCATION, ROOM_IMAGE
└─ Return: [room1, room2, room3, ...]

BƯỚC 4: Privacy Filter
├─ Remove sensitive data (phone, email)
├─ Keep: RoomCode, Price, Area, Description
└─ Pass safe_data to AI

BƯỚC 5: Generate Reply
├─ Groq AI generate natural response
├─ Format: "Có 5 phòng phù hợp:\n🏠 ROM00011 - 3.5tr/tháng..."
├─ Hallucination check: Verify room codes in data
└─ Add privacy note if needed

BƯỚC 6: Return to User
├─ response = {
│    "reply": "Có 5 phòng...",
│    "intent": "search_rooms",
│    "filters": { price_max, district },
│    "data": [safe_room_data],
│    "suggested_questions": ["Phòng giá rẻ hơn?", "Có máy lạnh?"]
│  }
└─ Frontend renders: Text reply + room cards

─────────────────────────────────────────────────────────────

BOOKING FLOW (HUMAN-IN-THE-LOOP):

BƯỚC 1: User request booking
├─ Message: "Đặt lịch xem ROM00011 ngày mai 7 tối"
└─ AI detects: intent="schedule_viewing", room_code, date, time

BƯỚC 2: AI Collects Info (Multi-turn)
├─ If room_code missing → Ask "Phòng nào?"
├─ If date missing → Ask "Ngày nào?"
├─ If time missing → Show available slots
└─ Validate time against available slots

BƯỚC 3: Build Booking Payload
├─ AI builds (NOT write to DB):
│  {
│    "room_code": "ROM00011",
│    "viewing_date": "2024-01-25",
│    "viewing_date_display": "Thứ Năm, 25/01/2024",
│    "viewing_time": "19:00",
│    "room_info": { title, type, area, price },
│    "api_endpoint": "/viewing-schedule/schedule",
│    "status": "ready_to_confirm"
│  }
└─ Return to frontend with booking_card

BƯỚC 4: Frontend Render Confirmation Card
├─ Show: Room info, date, time
├─ Buttons: [Xác nhận] [Hủy]
└─ User review & confirm

BƯỚC 5: User Click Confirm
├─ Frontend POST /api/viewing-schedule
├─ Input: { roomId, tenantId, dateTime }
├─ Backend validates & insert to DB
├─ VIEWING_SCHEDULE.Status = 'Chờ duyệt'
├─ Notify landlord
└─ Return success to frontend

BƯỚC 6: Close Loop
├─ AI sends confirmation: "Đặt lịch thành công! ✅"
├─ Show: "Chủ nhà sẽ xác nhận trong 24h"
└─ Session context cleared
```

---

## 🔄 Luồng Dữ Liệu

### Luồng 1: Tìm Phòng

```
User searches
    ↓
GET /api/rooms?filters
    ↓
RoomService.getAllRooms()
    ├─ Query ROOM JOIN LANDLORD JOIN LOCATION
    ├─ Filter by: Status, Price, District, Area, Amenities
    ├─ Get images from ROOM_IMAGE
    └─ Format response
    ↓
Frontend displays room list
    ├─ Show: Image, Price, Area, District
    ├─ Favorite button
    └─ View details link
```

### Luồng 2: Xem Chi Tiết Phòng

```
User clicks on room
    ↓
GET /api/rooms/:id
    ↓
RoomService.getRoomById()
    ├─ Query ROOM data
    ├─ Join LANDLORD info
    ├─ Get AMENITY from ROOM_AMENITY
    ├─ Get RULE from ROOM_RULE
    ├─ Get all ROOM_IMAGE
    ├─ Get user's viewing schedule (nếu login)
    └─ Calculate DisplayStatus
    ↓
Frontend displays:
    ├─ Full room details
    ├─ Image gallery
    ├─ Landlord contact (với privacy)
    ├─ Map location
    ├─ Rules & amenities
    ├─ Reviews
    └─ Schedule viewing button
```

### Luồng 3: Upload Hàng Loạt (Bulk Upload)

```
Landlord select Excel file
    ↓
POST /api/bulk/upload
    ↓
BulkUploadService.processBulkUpload()
    ├─ Parse Excel columns:
    │  ├─ roomCode, area, price, maxPeople
    │  ├─ roomType, description, amenities
    │  └─ (optional) images URLs
    ├─ Validation:
    │  ├─ Duplicate roomCode check
    │  ├─ Required fields check
    │  └─ Price/Area sanity check
    ├─ Batch insert to ROOM
    ├─ Batch insert to ROOM_AMENITY
    ├─ Batch insert to LISTING
    └─ Create job record (for tracking)
    ↓
Return results
    ├─ Success count
    ├─ Errors (if any)
    └─ Processing status
    ↓
[Optional] Download ảnh hàng loạt
    ├─ From URLs in Excel
    ├─ Upload to Cloudinary
    └─ Link vào ROOM_IMAGE
```

### Luồng 4: Đặt Lịch Xem Phòng

```
User request viewing
    ↓
AI Chat flow (multi-turn)
    ├─ Collect: room_code, date, time
    └─ Build booking payload
    ↓
Frontend shows confirmation card
    ↓
User clicks [Xác nhận]
    ↓
POST /api/viewing-schedule
    ├─ Validate: Room exists, User exists, DateTime valid
    ├─ Check available slots (no conflict)
    ├─ Insert to VIEWING_SCHEDULE (Status='Chờ duyệt')
    ├─ Update ROOM.Status if needed
    ├─ Send notification:
    │  ├─ To landlord: "Có người muốn xem phòng"
    │  └─ To tenant: "Yêu cầu đã được gửi"
    └─ Create activity log
    ↓
Landlord reviews request
    ├─ GET /api/schedule (pending)
    ├─ Accept → VIEWING_SCHEDULE.Status='Đã duyệt'
    └─ Reject → Status='Từ chối'
    ↓
Tenant notified of approval
```

---

## 💾 Cơ Sở Dữ Liệu

### Diagram ER (Entity-Relationship)

```
┌─────────────┐
│   ACCOUNT   │
├─────────────┤
│ AccountID(PK)
│ Username(U)
│ Password
│ Role       │ ←─────┐
│ Status     │       │
└─────────────┘       │
        │             │
        │        (1:1)│
        ↓             │
┌─────────────────────┴──────────┐
│    ┌─────────────┐             │
│    │   TENANT    │     ┌──────────────┐
│    ├─────────────┤     │   LANDLORD   │
│    │ TenantID(PK)      ├──────────────┤
│    │ AccountID(FK)     │ LandlordID(PK)
│    │ Name       │      │ AccountID(FK)
│    │ Age        │      │ Name         │
│    │ Budget     │      │ Phone        │
│    │ Preference │      │ Email        │
│    │ Habit      │      │ District     │
│    └─────────────┘      └──────────────┘
│         │                      │
│     (N:1)│                  (N:1)│
└─────────┼──────────────────────┼────┐
          │                      │    │
          ↓                      ↓    │
    ┌────────────────────┐  ┌────────────────┐
    │   VIEWING_SCHEDULE │  │    BUILDING    │
    ├────────────────────┤  ├────────────────┤
    │ ScheduleID(PK)     │  │ BuildingID(PK) │
    │ TenantID(FK)       │  │ LandlordID(FK) │
    │ RoomID(FK)         │  │ BuildingName   │
    │ DateTime           │  │ Address        │
    │ Status             │  │ LocationID(FK) │
    │ Notes              │  └────────────────┘
    └────────────────────┘         │
                                (N:1)│
    ┌──────────────────────────────┘
    │
    ↓
┌─────────────────────┐
│      LOCATION       │
├─────────────────────┤
│ LocationID(PK)
│ Address
│ Ward
│ District
│ City
│ Latitude
│ Longitude
└─────────────────────┘
    ↑
    │(N:1)
    │
┌──────────────┐
│     ROOM     │────────┐
├──────────────┤        │(N:1)
│ RoomID(PK)   │        │
│ LandlordID(FK)        │
│ BuildingID(FK)        │
│ LocationID(FK)        │
│ RoomCode(U)  │        │
│ RoomType     │        │
│ Area         │        │
│ Price        │        │
│ MaxPeople    │        │
│ Status       │        │
│ Description  │        │
└──────────────┘        │
    │                   │
    ├─(N:1)─┐           │
    │       │           ↓
    │   ┌────────────────────────┐
    │   │   ROOM_AMENITY (M:N)   │
    │   │ RoomID(FK, PK)         │
    │   │ AmenityID(FK, PK)  ────┼──→ AMENITY (AmenityID, Name)
    │   └────────────────────────┘
    │
    ├─(N:1)─┐
    │       │
    │   ┌─────────────────────┐
    │   │   ROOM_IMAGE        │
    │   │ ImageID(PK)         │
    │   │ RoomID(FK)          │
    │   │ ImageURL            │
    │   │ DisplayOrder        │
    │   │ IsPrimary           │
    │   └─────────────────────┘
    │
    ├─(N:1)─┐
    │       │
    │   ┌──────────────────────┐
    │   │   LISTING            │
    │   │ ListingID(PK)        │
    │   │ RoomID(FK)           │
    │   │ LandlordID(FK)       │
    │   │ Title                │
    │   │ Description          │
    │   │ IsVisible            │
    │   │ CreatedAt, UpdatedAt │
    │   └──────────────────────┘
    │
    └─(N:1)─┐
            │
        ┌──────────────┐
        │  CONTRACT    │
        ├──────────────┤
        │ ContractID(PK)
        │ TenantID(FK) │
        │ RoomID(FK)   │
        │ StartDate    │
        │ EndDate      │
        │ TotalPrice   │
        │ Deposit      │
        │ Status       │
        └──────────────┘
```

### 15 Bảng Chính

| # | Tên Bảng | Chức Năng | Bản Ghi Ước Tính |
|---|----------|----------|-----------------|
| 1 | **ACCOUNT** | Tài khoản đăng nhập | ~1,000 |
| 2 | **TENANT** | Thông tin người thuê | ~800 |
| 3 | **LANDLORD** | Thông tin chủ nhà | ~200 |
| 4 | **BUILDING** | Chung cư/tòa nhà | ~150 |
| 5 | **LOCATION** | Vị trí địa lý | ~300 |
| 6 | **ROOM** | Thông tin phòng cho thuê | ~2,500 |
| 7 | **ROOM_IMAGE** | Ảnh phòng | ~12,500 |
| 8 | **ROOM_AMENITY** | Tiện nghi phòng (M:N) | ~5,000 |
| 9 | **AMENITY** | Danh mục tiện nghi | ~50 |
| 10 | **LISTING** | Tin đăng công khai | ~2,500 |
| 11 | **VIEWING_SCHEDULE** | Lịch xem phòng | ~5,000 |
| 12 | **CONTRACT** | Hợp đồng thuê | ~1,200 |
| 13 | **FAVORITE** | Phòng yêu thích | ~3,000 |
| 14 | **NOTIFICATION** | Thông báo hệ thống | ~10,000 |
| 15 | **PAYMENT** | Ghi nhận thanh toán | ~1,500 |

### Indexes Quan Trọng

```sql
-- ROOM table (most critical)
CREATE INDEX idx_room_status ON ROOM(Status);
CREATE INDEX idx_room_landlord ON ROOM(LandlordID);
CREATE INDEX idx_room_location ON ROOM(LocationID);
CREATE INDEX idx_room_price ON ROOM(Price);
CREATE INDEX idx_room_updated ON ROOM(UpdatedAt DESC);
CREATE INDEX idx_room_status_updated ON ROOM(Status, UpdatedAt DESC);

-- ACCOUNT table (auth performance)
CREATE INDEX idx_account_role ON ACCOUNT(Role);
CREATE INDEX idx_account_status ON ACCOUNT(Status);

-- LISTING table (visibility & search)
CREATE INDEX idx_listing_visible ON LISTING(IsVisible);
CREATE INDEX idx_listing_room ON LISTING(RoomID);
CREATE INDEX idx_listing_created ON LISTING(CreatedAt DESC);

-- VIEWING_SCHEDULE table (booking)
CREATE INDEX idx_schedule_tenant ON VIEWING_SCHEDULE(TenantID);
CREATE INDEX idx_schedule_room ON VIEWING_SCHEDULE(RoomID);
CREATE INDEX idx_schedule_status ON VIEWING_SCHEDULE(Status);

-- TENANT table (search & matching)
CREATE INDEX idx_tenant_budget ON TENANT(BudgetMin, BudgetMax);
CREATE INDEX idx_tenant_district ON TENANT(PreferredDistrict);

-- FULLTEXT search (Vietnamese)
ALTER TABLE ROOM ADD FULLTEXT INDEX idx_room_search (Title, Description, Tags);
```

### Query Patterns (Optimization)

#### ❌ Slow Query (N+1 Problem)
```javascript
// Anti-pattern: Multiple separate queries
const room = await db.query('SELECT * FROM ROOM WHERE RoomID = ?');
const images = await db.query('SELECT * FROM ROOM_IMAGE WHERE RoomID = ?');
const amenities = await db.query('SELECT * FROM ROOM_AMENITY WHERE RoomID = ?');
const landlord = await db.query('SELECT * FROM LANDLORD WHERE LandlordID = ?');
// Total: 4 queries, 4 round-trips
```

#### ✅ Fast Query (Optimized)
```javascript
// Pattern: Single query with JOINs + Subqueries
const query = `
  SELECT r.*, 
         l.Name as LandlordName,
         (SELECT JSON_ARRAYAGG(ri.ImageURL ORDER BY ri.DisplayOrder)
          FROM ROOM_IMAGE ri WHERE ri.RoomID = r.RoomID) as Images,
         (SELECT JSON_ARRAYAGG(a.Name)
          FROM ROOM_AMENITY ra
          JOIN AMENITY a ON ra.AmenityID = a.AmenityID
          WHERE ra.RoomID = r.RoomID) as Amenities
  FROM ROOM r
  JOIN LANDLORD l ON r.LandlordID = l.LandlordID
  WHERE r.RoomID = ?
`;
// Total: 1 query with JSON aggregation
```

---

## 🔐 Bảo Mật & Xác Thực

### Authentication Flow
```
1. POST /api/auth/login
   ├─ Username + Password
   └─ Hash verify with bcrypt

2. Session Management
   ├─ Express-session + Passport.js
   ├─ Store: req.user = { accountId, role }
   └─ Middleware: authMiddleware checks req.user

3. OAuth (Optional)
   ├─ Google OAuth2
   └─ Facebook Login

4. JWT Tokens (Optional)
   ├─ For mobile apps
   └─ Bearer token in headers
```

### Authorization
- **Landlord routes**: Must be `role='landlord'`
- **Tenant routes**: Must be `role='tenant'`
- **Admin routes**: Must be `role='admin'`
- **Resource access**: Verify ownership (LandlordID/TenantID)

### Privacy & Sensitive Data
- **Phone/Email**: Remove from public responses
- **Contract details**: Only visible to owner
- **Personal preferences**: Never exposed to other users
- **Password**: Never transmitted, always hashed

---

## 📈 Hiệu Suất & Tối Ưu Hóa

### Performance Metrics
| Metric | Target | Hiện Tại | Cải Thiện |
|--------|--------|---------|----------|
| Load danh sách phòng (20 items) | <200ms | ~2-3s | ✅ 90-95% |
| Chi tiết phòng | <100ms | ~500-800ms | ✅ 90% |
| Tìm kiếm | <300ms | ~3-5s | ✅ 94% |
| Login | <50ms | ~300-500ms | ✅ 92% |

### Caching Strategy
```javascript
// Cache room list (5 mins)
const cacheKey = `rooms_${limit}_${offset}_${filters}`;
if (cache.has(cacheKey)) return cache.get(cacheKey);
const result = await db.query(...);
cache.set(cacheKey, result, 300);
```

### Database Optimization
- ✅ Proper indexing on search columns
- ✅ Connection pooling (20 connections)
- ✅ Stored procedures for complex queries
- ✅ Query optimization with EXPLAIN
- ✅ Regular ANALYZE TABLE

---

## 🚀 Deployment

### Production Stack
```
Frontend:       Vercel / Netlify
Backend:        Render / Heroku / AWS
Database:       MySQL (AWS RDS / Digital Ocean)
Storage:        Cloudinary CDN
Chat Server:    Python FastAPI on Render
```

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=KLTN

# API Keys
GROQ_API_KEY=...
CLOUDINARY_URL=...
SESSION_SECRET=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Ports
LANDLORD_PORT=5555
TENANT_PORT=5000
ADMIN_PORT=5050
AI_CHAT_PORT=8000
```

---

## 📚 Tài Liệu Tham Khảo

- Database Schema: `/DB/main/`
- API Documentation: Postman Collection (TBD)
- Architecture Diagrams: `/tai-lieu/`
- Performance Analysis: `/DB/PERFORMANCE_ANALYSIS.md`

---


