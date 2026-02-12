# Rentify Landlord Frontend

Giao diện quản lý chủ nhà được xây dựng bằng React + Material-UI (MUI).

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Build

```bash
npm run build
```

## Cấu trúc dự án

```
src/
├── components/
│   └── LandlordLayout.jsx      # Layout chính với Sidebar + Navbar
├── pages/
│   ├── LandlordDashboard.jsx   # Trang Dashboard
│   ├── ManageRooms.jsx         # Trang Quản lý phòng
│   ├── LandlordProfile.jsx     # Trang Hồ sơ
│   ├── LoginPage.jsx           # Trang Đăng nhập
│   └── RegisterPage.jsx        # Trang Đăng ký
├── App.jsx                     # Router chính
├── main.jsx                    # Entry point
└── theme.js                    # MUI Theme configuration
```

## Tính năng

- ✅ Dashboard với KPI cards
- ✅ Quản lý phòng (CRUD)
- ✅ Hồ sơ chủ nhà
- ✅ Xác thực (Login/Register)
- ✅ Responsive design
- ✅ Material-UI components

## Công nghệ

- React 18
- React Router v6
- Material-UI v5
- Vite
- Axios

## Ghi chú

- Giao diện được chuyển đổi từ HTML thuần sang React
- Giữ nguyên design từ phiên bản HTML
- Sử dụng MUI components thay vì CSS thuần
