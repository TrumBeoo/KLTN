# Giải pháp Bản đồ - OpenStreetMap (Leaflet)

## Đã chuyển sang OpenStreetMap

Ứng dụng hiện đã sử dụng **Leaflet** với **OpenStreetMap** thay vì Google Maps.

### Lý do chuyển đổi:
- ✅ **Hoàn toàn miễn phí** - không cần API key
- ✅ **Không cần billing account** - không yêu cầu thẻ tín dụng
- ✅ **Không giới hạn request** - sử dụng thoải mái
- ✅ **Open source** - cộng đồng hỗ trợ tốt
- ✅ **Hiệu suất tốt** - tải nhanh, mượt mà

### Đã cài đặt:
```bash
npm install leaflet react-leaflet@4.2.1 --legacy-peer-deps
```

### Tính năng:
- ✅ Hiển thị bản đồ với multiple markers
- ✅ Custom marker với giá phòng
- ✅ Popup thông tin khi click
- ✅ Auto fit bounds theo các phòng
- ✅ Hover effect trên marker
- ✅ Responsive design

### Component đã cập nhật:
- `src/components/RoomMap.jsx` - Sử dụng Leaflet thay vì Google Maps

### Cách sử dụng:
```jsx
import RoomMap from './components/RoomMap';

<RoomMap 
  rooms={[
    { 
      id: 1, 
      latitude: 21.028511, 
      longitude: 105.804817,
      price: 3000000,
      title: 'Phòng trọ 1'
    }
  ]}
  onMarkerClick={(room) => console.log(room)}
/>
```

### Data format yêu cầu:
```javascript
rooms: Array<{
  id: string | number,
  latitude: number,
  longitude: number,
  price: number | string,
  title?: string
}>
```

### Không cần config gì thêm
- Không cần API key
- Không cần Map ID
- Không cần cấu hình .env
- Chỉ cần chạy `npm run dev` là xong!

### So sánh Google Maps vs OpenStreetMap

| Tính năng | Google Maps | OpenStreetMap |
|-----------|-------------|---------------|
| Chi phí | $200 credit/tháng (cần billing) | Miễn phí 100% |
| API Key | Bắt buộc | Không cần |
| Billing Account | Bắt buộc | Không cần |
| Giới hạn request | 28,000/tháng (free tier) | Không giới hạn |
| Chất lượng map | Cao | Tốt |
| Custom style | Khó (cần Map ID) | Dễ (CSS) |
| Markers | Advanced API | Flexible |

### Nếu muốn quay lại Google Maps

Vẫn giữ file backup `RoomMap.backup.jsx` với code Google Maps cũ.

**Lưu ý:** Google Maps yêu cầu billing account từ 2018, ngay cả khi sử dụng free tier.
