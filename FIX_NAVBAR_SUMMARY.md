# FIX: Navbar không hiển thị tên user khi login bằng email

## TÓM TẮT VẤN ĐỀ
- Login bằng username: Hiển thị OK ✅
- Login bằng email: KHÔNG hiển thị tên ❌

## NGUYÊN NHÂN
User object trong localStorage thiếu field `name` và `email`

## GIẢI PHÁP - Làm theo thứ tự

### Bước 1: Restart Backend Server
```bash
cd d:\E\KLTN\Tenant\backend
# Nhấn Ctrl+C để stop server cũ
node server.js
```

### Bước 2: Clear localStorage ở Browser
Mở DevTools (F12) → Console → chạy:
```javascript
localStorage.clear()
location.reload()
```

### Bước 3: Test Login
1. Login bằng email: `nva@gmail.com` với password
2. Mở Console và kiểm tra logs:
   - "Login response data:" - phải có user.name
   - "User data to save:" - phải có name và email
   - "Loading from localStorage:" - phải có storedUser
   - "Parsed user:" - phải có name và email
   - "Current user in Navbar:" - phải có name và email

### Bước 4: Kiểm tra Network
1. Mở Network tab
2. Tìm request POST `/api/auth/login`
3. Xem Response phải có:
```json
{
  "success": true,
  "token": "...",
  "user": {
    "account_id": "ACC00002",
    "username": "A",
    "name": "Nguyễn Văn A",     ← QUAN TRỌNG
    "email": "nva@gmail.com",    ← QUAN TRỌNG
    "phone": "+8412345678",
    "role": "Tenant"
  }
}
```

### Bước 5: Kiểm tra localStorage
Trong Console chạy:
```javascript
JSON.parse(localStorage.getItem('user'))
```

Kết quả phải có `name` và `email`

### Bước 6: Kiểm tra Navbar
Sau khi login, click vào icon user ở navbar, dropdown phải hiển thị:
```
Nguyễn Văn A
nva@gmail.com
```

## NẾU VẪN KHÔNG WORK

### Debug Backend
Kiểm tra terminal backend, phải thấy logs:
```
Login query: SELECT a.AccountID, ...
Login params: [ 'nva@gmail.com', 'nva@gmail.com', 'nva@gmail.com' ]
Query result: [{ AccountID: 'ACC00002', Name: 'Nguyễn Văn A', ... }]
Login user data: { AccountID: 'ACC00002', Name: 'Nguyễn Văn A', ... }
Sending user data to frontend: { account_id: 'ACC00002', name: 'Nguyễn Văn A', ... }
```

### Debug Frontend
Console phải thấy:
```
Login response data: { success: true, user: { name: 'Nguyễn Văn A', ... } }
User data to save: { account_id: 'ACC00002', name: 'Nguyễn Văn A', ... }
Parsed user: { account_id: 'ACC00002', name: 'Nguyễn Văn A', ... }
Current user in Navbar: { account_id: 'ACC00002', name: 'Nguyễn Văn A', ... }
```

## FILES ĐÃ SỬA

### Backend
1. `Tenant/backend/routes/auth.js`
   - Route `/auth/me` đã sửa để fetch đầy đủ thông tin
   - Thêm logging

2. `Tenant/backend/services/userService.js`
   - Sửa query loginUser để xử lý email đúng cách
   - Thêm logging

### Frontend
1. `Tenant/frontend/src/hooks/useAuth.jsx`
   - Thêm logging ở login và useEffect
   
2. `Tenant/frontend/src/components/Navbar.jsx`
   - Thêm fallback hiển thị username nếu không có name
   - Thêm logging

## LƯU Ý QUAN TRỌNG
⚠️ PHẢI restart backend server sau khi sửa code
⚠️ PHẢI clear localStorage trước khi test
⚠️ Kiểm tra console logs để biết chính xác vấn đề ở đâu
