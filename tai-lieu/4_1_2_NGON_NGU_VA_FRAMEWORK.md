# 4.1.2. NGÔN NGỮ VÀ FRAMEWORK LẬP TRÌNH

## I. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống Quản lý Chung cư mini sử dụng kiến trúc **Microservices** hiện đại, chia thành 4 module độc lập nhưng có thể giao tiếp với nhau qua REST API:

1. **Admin Module**: Quản lý toàn bộ hệ thống, người dùng, phòng trọ
2. **Landlord Module**: Chủ nhà quản lý phòng cho thuê
3. **Tenant Module**: Người thuê tìm kiếm, theo dõi phòng trọ
4. **AI Chat Service**: Trợ lý ảo hỗ trợ tư vấn và matching phòng

---

## II. DATABASE LAYER

### Hệ quản trị cơ sở dữ liệu: **MySQL 8.0+**

**Thư viện kết nối:**
- **Node.js**: `mysql2` v3.6.0
- **Python**: `mysql-connector-python` v9.1.0

**Tính năng nổi bật:**
- **Stored Procedures**: Hỗ trợ Google Maps API, tìm kiếm địa điểm gần nhất
- **Triggers**: Bảo vệ dữ liệu địa điểm (giới hạn Hà Nội)
- **Views thống kê**: Thống kê theo quận, phường, giá phòng
- **Functions**: Tự động tạo ID cho Favorite (FAV0000001, FAV0000002,...)
- **Công thức hàng không**: Tính khoảng cách Haversine giữa hai tọa độ GPS

**File cơ sở dữ liệu:**
- `db_main.sql` - Bảng chính (USER, ROOM, LOCATION, TENANT_PROFILE, LANDLORD_PROFILE)
- `db_room_detail.sql` - Chi tiết phòng (tòa nhà, hạng phòng, tiện nghi)
- `db_listing.sql` - Quản lý tin đăng
- `db_tenant_profile.sql` - Hồ sơ người thuê
- `db_upload.sql` - Quản lý upload ảnh/video
- `db_contact.sql` - Liên hệ, tư vấn
- `db_ai_chat.sql` - Lịch sử chat AI
- `db_matching.sql` - Thuật toán matching phòng
- `db_moving_service.sql` - Dịch vụ chuyển nhà
- `db_poi.sql` - Points of Interest (trường học, bệnh viện,...)
- `db_procedures.sql` - Stored Procedures và Functions

---

## III. BACKEND LAYER

### **3.1. Admin Backend**

**Tech Stack:**
- **Framework**: Express.js v4.18.2
- **Ngôn ngữ**: JavaScript (Node.js)
- **Server Runtime**: Node.js >= 16.x
- **Port**: Cấu hình trong `.env` (mặc định: 5000)

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| express | ^4.18.2 | Web framework, routing |
| mysql2 | ^3.6.0 | MySQL driver, connection pooling |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| dotenv | ^16.0.3 | Environment variables management |
| body-parser | ^1.20.2 | Parse request body (JSON/URL-encoded) |

**Development Tools:**
- `nodemon`: ^3.0.2 - Auto-restart server khi code thay đổi

**API Endpoints chính:**
- User management (GET, POST, PUT, DELETE users)
- Room management
- Statistics & reports

---

### **3.2. Landlord Backend**

**Tech Stack:**
- **Framework**: Express.js v4.18.2
- **Ngôn ngữ**: JavaScript (Node.js)
- **Authentication**: JWT + Google OAuth 2.0
- **File Upload**: Cloudinary (cloud storage)
- **Port**: Cấu hình trong `.env`

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mysql2 | ^3.6.0 | Database driver |
| jsonwebtoken | ^9.0.0 | JWT token generation/verification |
| bcryptjs | ^2.4.3 | Password hashing (bcrypt algorithm) |
| passport | ^0.7.0 | Authentication middleware |
| passport-google-oauth20 | ^2.0.0 | Google OAuth 2.0 strategy |
| multer | ^2.1.1 | File upload handling |
| cloudinary | ^2.9.0 | Cloud image/video storage |
| xlsx | ^0.18.5 | Excel file processing (bulk import) |
| axios | ^1.15.0 | HTTP client (inter-service calls) |
| express-session | ^1.19.0 | Session management |

**Advanced Features:**
- Excel bulk import/export
- JWT-based stateless authentication
- Google OAuth login
- Image/video management with Cloudinary
- Session tracking

---

### **3.3. Tenant Backend**

**Tech Stack:**
- **Framework**: Express.js v4.18.2
- **Ngôn ngữ**: JavaScript (Node.js)
- **Authentication**: JWT + Google OAuth 2.0
- **File Upload**: Cloudinary
- **Port**: Cấu hình trong `.env`

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mysql2 | ^3.6.0 | Database driver |
| jsonwebtoken | ^9.0.0 | JWT authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| passport | ^0.7.0 | Authentication |
| passport-google-oauth20 | ^2.0.0 | Google OAuth |
| multer | ^2.1.1 | File upload |
| cloudinary | ^2.9.0 | Cloud storage |
| axios | ^1.15.0 | HTTP client |
| express-session | ^1.19.0 | Session management |

**Special Scripts:**
```bash
npm run init-db  # Khởi tạo database schema
npm run dev      # Development mode with nodemon
npm start        # Production mode
```

**Main Features:**
- Room search & filtering
- Favorite management
- Profile management
- Booking management

---

### **3.4. AI Chat Service**

**Tech Stack:**
- **Framework**: FastAPI v0.115.0
- **Ngôn ngữ**: Python 3.x
- **Server**: Uvicorn v0.32.0 (ASGI server)
- **AI Engine**: Groq API v0.31.0
- **Port**: Cấu hình trong `.env` (mặc định: 8000)

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| fastapi | 0.115.0 | Modern async web framework |
| uvicorn[standard] | 0.32.0 | ASGI web server |
| groq | 0.31.0 | Groq AI API client |
| mysql-connector-python | 9.1.0 | MySQL database driver |
| pydantic | 2.9.2 | Data validation & serialization |
| pydantic-settings | 2.6.1 | Settings/config management |
| python-dotenv | 1.0.1 | Environment variables |
| httpx | 0.27.2 | Async HTTP client |
| requests | 2.32.3 | HTTP library |

**Core Files:**
- `main.py` - Application entry point
- `AI_chat.py` - Chatbot logic & NLP
- `booking_service.py` - Booking integration with tenant module
- `chat_history.py` - Persistent chat history management
- `db.py` - MySQL connection & queries
- `config.py` - Configuration settings

**Key Features:**
- Asynchronous request handling
- Auto-generated OpenAPI/Swagger documentation
- Type-safe request/response validation
- Persistent chat history in database
- Integration with Groq's LLM models
- Room matching algorithm

---

## IV. FRONTEND LAYER

### **4.1. Admin Frontend**

**Tech Stack:**
- **Framework**: React v19.2.4
- **Build Tool**: Vite v8.0.4
- **UI Library**: Material-UI (MUI) v5.14.20
- **Styling**: Emotion (@emotion/react, @emotion/styled)
- **Module Format**: ES6 Modules

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| react | ^19.2.4 | UI library (latest version) |
| react-dom | ^19.2.4 | React DOM rendering |
| react-router-dom | ^6.20.1 | Client-side routing |
| @mui/material | ^5.14.20 | Material Design components |
| @mui/icons-material | ^5.14.19 | Material Design icons |
| @emotion/react | ^11.11.1 | CSS-in-JS solution |
| @emotion/styled | ^11.11.0 | Styled components |

**Development Tools:**
- `vite`: ^8.0.4 - Lightning-fast build tool
- `eslint`: ^9.39.4 - Code quality linter
- `@vitejs/plugin-react`: ^6.0.1 - Vite React plugin

**Scripts:**
```bash
npm run dev      # Development server (Hot Module Replacement)
npm run build    # Production build
npm run lint     # ESLint code checking
npm run preview  # Preview production build
```

**Features:**
- User management dashboard
- Room management
- Statistics & analytics
- System configuration

---

### **4.2. Landlord Frontend**

**Tech Stack:**
- **Framework**: React v18.2.0
- **Build Tool**: Vite v5.0.0
- **UI Library**: Material-UI v5.14.0
- **Charts**: Recharts v3.8.1 (data visualization)
- **HTTP Client**: Axios v1.6.0
- **Module Format**: ES6 Modules

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.20.0 | Routing |
| @mui/material | ^5.14.0 | UI components |
| @mui/icons-material | ^5.14.0 | Icons |
| recharts | ^3.8.1 | Interactive charts & graphs |
| axios | ^1.6.0 | Promise-based HTTP client |
| @emotion/react | ^11.11.0 | Styling |
| @emotion/styled | ^11.11.0 | Styled components |

**Development Tools:**
- `vite`: ^5.0.0
- `@vitejs/plugin-react`: ^4.2.0

**Scripts:**
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production
```

**Features:**
- Room listing management
- Revenue analytics & charts
- Booking management
- Profile management
- Document upload

---

### **4.3. Tenant Frontend**

**Tech Stack:**
- **Framework**: React v18.2.0
- **Build Tool**: Vite v5.0.0
- **UI Library**: Material-UI v5.14.0
- **Animations**: Framer Motion v12.38.0 (smooth animations)
- **HTTP Client**: Axios v1.6.0
- **Module Format**: ES6 Modules

**Dependencies chính:**
| Package | Phiên bản | Mục đích |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.20.0 | Client-side routing |
| @mui/material | ^5.14.0 | Material Design components |
| @mui/icons-material | ^5.14.0 | Icon library |
| framer-motion | ^12.38.0 | Animation library |
| axios | ^1.6.0 | HTTP client |
| @emotion/react | ^11.11.0 | CSS-in-JS |
| @emotion/styled | ^11.11.0 | Styled components |

**Development Tools:**
- `vite`: ^5.0.0
- `@vitejs/plugin-react`: ^4.2.0

**Scripts:**
```bash
npm run dev      # Development with HMR
npm run build    # Optimized build
npm run preview  # Preview build
```

**Features:**
- Advanced room search with filters
- Google Maps integration
- Favorite room management
- Booking history
- Profile management
- Smooth animations & transitions
- Chat with landlord

---

## V. EXTERNAL SERVICES & INTEGRATIONS

### **5.1. Google Services**
- **Google Maps API**: Bản đồ, tìm kiếm địa điểm gần nhất
- **Google OAuth 2.0**: Đăng nhập nhanh
- **Setup Guide**: `Tenant/frontend/GOOGLE_MAPS_SETUP.txt`

### **5.2. Cloudinary (Cloud Storage)**
- Upload, optimize, transform hình ảnh/video
- CDN distribution
- Tích hợp: Landlord & Tenant backend

### **5.3. Groq AI**
- Large Language Model API
- Chatbot conversational AI
- Room matching algorithm
- File: `AI_chat/AI_chat.py`

### **5.4. Payment Gateway** (Design only)
- **Stripe integration**: `**/frontend/STRIPE_DESIGN.md`
- **Features**: Payment processing, subscription management

---

## VI. DEVELOPMENT & DEPLOYMENT

### **Version Control:**
- **Git**: Source code management
- **Files**: `.gitignore` configuration in each module

### **Environment Configuration:**
- **dotenv**: Secure environment variables
- **Files**: `.env` in backend/frontend directories
- **Key configs**: Database URL, API keys, OAuth credentials, Cloudinary API, Groq API key

### **Containerization & Deployment:**

#### **Docker Support:**
- `AI_chat/Dockerfile` - Python FastAPI containerization
- `AI_chat/.dockerignore` - Exclude unnecessary files

#### **Deployment Platforms:**
- **Render**: `AI_chat/render.yaml` (Python app deployment)
- **Vercel**: 
  - `Landlord/frontend/vercel.json`
  - `Tenant/frontend/vercel.json`
  - (Frontend static site hosting)

#### **Python Version Management:**
- `.python-version` - Specify Python version (pyenv)
- `runtime.txt` - Runtime specification for deployment

### **Package Managers:**

| Module | Manager | Lock File |
|--------|---------|-----------|
| All Node.js modules | npm | package-lock.json |
| AI Chat Service | pip | requirements.txt |

---

## VII. ARCHITECTURE PATTERNS & BEST PRACTICES

### **Backend Architecture:**
- **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Middleware Pattern**: Authentication, validation, error handling
- **Connection Pooling**: MySQL2 for efficient database connections
- **Async Programming**: Python FastAPI async/await patterns

### **Frontend Architecture:**
- **Component-Based**: Reusable React components
- **Routing**: Client-side routing with React Router
- **State Management**: React hooks & local state
- **Responsive Design**: Material-UI breakpoints

### **Security:**
- **JWT Tokens**: Stateless authentication
- **bcrypt Hashing**: Password security (10 rounds)
- **CORS Protection**: Cross-origin request validation
- **OAuth 2.0**: Third-party authentication
- **Environment Variables**: Sensitive data protection

### **Database:**
- **ACID Transactions**: Data integrity
- **Stored Procedures**: Encapsulated business logic
- **Triggers**: Data validation & consistency
- **Indexes**: Query optimization
- **Views**: Simplified complex queries

---

## VIII. PROJECT STRUCTURE

```
KLTN/
├── Admin/
│   ├── backend/          (Node.js + Express)
│   │   ├── config/
│   │   ├── routes/
│   │   ├── package.json
│   │   └── server.js
│   └── frontend/         (React 19 + Vite)
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.js
│
├── Landlord/
│   ├── backend/          (Node.js + Express + JWT)
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── package.json
│   │   └── server.js
│   └── frontend/         (React 18 + Vite)
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
├── Tenant/
│   ├── backend/          (Node.js + Express + JWT)
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── package.json
│   │   └── server.js
│   └── frontend/         (React 18 + Vite + Animations)
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
├── AI_chat/              (Python + FastAPI)
│   ├── main.py
│   ├── AI_chat.py
│   ├── db.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── config.py
│
├── DB/
│   ├── main/             (SQL scripts)
│   │   ├── db_main.sql
│   │   ├── db_procedures.sql
│   │   └── ... (other schema files)
│   ├── migrations/       (Data initialization)
│   └── optimization/     (Performance tuning)
│
└── tai-lieu/             (Documentation)
    ├── ERD/              (Entity Relationship Diagrams)
    ├── DFD/              (Data Flow Diagrams)
    ├── flowchart/        (Process Flowcharts)
    └── Documents/
```

---

## IX. STARTUP & EXECUTION

### **Backend Startup (Node.js):**
```bash
# Admin
cd Admin/backend
npm install
npm run dev          # Development with nodemon
npm start            # Production

# Landlord
cd Landlord/backend
npm install
npm run dev

# Tenant
cd Tenant/backend
npm install
npm run init-db      # Initialize database
npm run dev
```

### **Frontend Startup (React + Vite):**
```bash
# Any frontend (Admin/Landlord/Tenant)
cd */frontend
npm install
npm run dev          # Development server (Hot reload)
npm run build        # Production build
npm run preview      # Preview production build
```

### **AI Chat Service Startup (Python):**
```bash
cd AI_chat
pip install -r requirements.txt
python main.py                          # Local development
# Or:
uvicorn main:app --reload --port 8000   # Production with Uvicorn
```

---

## X. KEY TECHNOLOGIES SUMMARY

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Database** | MySQL | 8.0+ | Relational database |
| **Backend - Admin** | Express.js | 4.18.2 | REST API |
| **Backend - Landlord** | Express.js + JWT | 4.18.2 | REST API + Auth |
| **Backend - Tenant** | Express.js + JWT | 4.18.2 | REST API + Auth |
| **Backend - AI** | FastAPI | 0.115.0 | Async API + AI |
| **Frontend - All** | React | 18/19 | UI Framework |
| **Build Tool - All** | Vite | 5/8 | Fast bundler |
| **UI Components** | Material-UI | 5.14.x | Design system |
| **HTTP Client** | Axios | 1.6.0+ | API calls |
| **Authentication** | JWT + OAuth 2.0 | - | Security |
| **Storage** | Cloudinary | - | Cloud storage |
| **AI** | Groq | 0.31.0 | LLM API |

---

**Ghi chú:**
- Tất cả module backend có thể chạy độc lập trên các port khác nhau
- Frontend sử dụng Vite cho tốc độ build cực nhanh (lightning-fast)
- Database shared giữa tất cả các module
- API communication giữa các module qua REST (không có message queue)
- Environment variables cấu hình riêng cho từng môi trường (dev/prod)
