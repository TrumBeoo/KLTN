# Debug Frontend - Kiểm tra user object

## Bước 1: Xóa localStorage cũ và test lại
Mở DevTools (F12) → Console → chạy:

```javascript
localStorage.clear()
location.reload()
```

## Bước 2: Login lại và kiểm tra
1. Login bằng email: nva@gmail.com
2. Mở Console và chạy:

```javascript
console.log('Stored user:', JSON.parse(localStorage.getItem('user')))
```

## Bước 3: Kiểm tra Network
1. Mở Network tab
2. Tìm request `/auth/login`
3. Xem Response - phải có:
```json
{
  "user": {
    "account_id": "...",
    "username": "...",
    "name": "Nguyễn Văn A",
    "email": "nva@gmail.com",
    ...
  }
}
```

## Nếu response đúng nhưng không hiển thị
Restart backend server:
```bash
cd Tenant/backend
# Ctrl+C để stop
node server.js
```
