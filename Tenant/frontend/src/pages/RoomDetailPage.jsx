import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box, Container, Grid, Typography, Button, Stack, Chip, IconButton,
  Dialog, TextField, Alert, CircularProgress, Divider,
} from '@mui/material'
import {
  LocationOn as LocationIcon, Phone as PhoneIcon, Message as MessageIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon, Star as StarIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon, Check as CheckIcon, Close as CloseIcon,
  Straighten as RulerIcon, Group as GroupIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const NavButton = styled(IconButton)({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: '#ffffff',
  border: '1px solid #e8e8e8',
  color: '#222222',
  width: 36,
  height: 36,
  boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
  '&:hover': {
    backgroundColor: '#f7f7f7',
    transform: 'translateY(-50%) scale(1.05)',
  },
  zIndex: 10,
  transition: 'all 150ms ease',
})

const AmenityChip = ({ label }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.5, px: 0, borderBottom: '1px solid #f2f2f2' }}>
    <CheckIcon sx={{ fontSize: '1rem', color: '#222222' }} />
    <Typography sx={{ fontSize: '0.9375rem', color: '#222222' }}>{label}</Typography>
  </Stack>
)

export default function RoomDetailPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { id: roomId } = useParams()
  const auth = useAuth()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [userSchedule, setUserSchedule] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', name: '', phone: '' })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const { notification, showSuccess, showError, hideNotification } = useNotification()

  useEffect(() => { if (roomId) { fetchRoomData(); fetchUserSchedule() } }, [roomId])
  useEffect(() => { if (roomId) fetchUserSchedule() }, [auth.user])

  const fetchRoomData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rooms/${roomId}`, { headers })
      const data = await r.json()
      if (data.success) setRoom(data.data)
    } catch {}
    finally { setLoading(false) }
  }

  const fetchUserSchedule = async () => {
    const token = localStorage.getItem('token')
    if (!token) { setUserSchedule(null); return }
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule/${roomId}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json()
      setUserSchedule(data.success && data.data ? data.data : null)
    } catch { setUserSchedule(null) }
  }

  const fetchAvailableSlots = async (date) => {
    if (!date) return
    setLoadingSlots(true)
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/available-slots/${roomId}?date=${date}`)
      const data = await r.json()
      if (data.success) {
        setAvailableSlots(data.data)
      }
    } catch {
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const images = room?.images?.length > 0
    ? room.images.map(img => {
        // If URL is already a full URL (http/https), use it directly
        if (img.ImageURL.startsWith('http://') || img.ImageURL.startsWith('https://')) {
          return img.ImageURL
        }
        // Otherwise, treat as local path
        const url = img.ImageURL.startsWith('/') ? img.ImageURL : `/${img.ImageURL}`
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`
      })
    : []

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) { setOpenLoginModal(true); return }
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.RoomID, date: scheduleData.date, time: scheduleData.time }),
      })
      const data = await r.json()
      if (data.success) {
        setOpenSchedule(false)
        setScheduleData({ date: '', time: '', name: '', phone: '' })
        showSuccess('Thành công!', 'Đặt lịch xem phòng thành công! Chủ nhà sẽ xác nhận trong vòng 24 giờ.')
        fetchUserSchedule()
        fetchRoomData() // Refresh room data để cập nhật DisplayStatus
      } else {
        showError('Lỗi!', data.message || 'Đặt lịch thất bại')
      }
    } catch { showError('Lỗi!', 'Lỗi khi đặt lịch xem phòng') }
  }

  const handleCancelSchedule = async () => {
    if (!userSchedule) return
    setCancelLoading(true)
    try {
      const token = localStorage.getItem('token')
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule/${userSchedule.ScheduleID}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await r.json()
      if (data.success) { 
        setUserSchedule(null); 
        setOpenCancelModal(false); 
        showSuccess('Thành công!', 'Hủy lịch xem thành công!')
        fetchRoomData() // Refresh room data để cập nhật DisplayStatus
      }
      else showError('Lỗi!', data.message || 'Hủy lịch thất bại')
    } catch { showError('Lỗi!', 'Lỗi khi hủy lịch') }
    finally { setCancelLoading(false) }
  }

  const displayStatus = room?.DisplayStatus || room?.Status
  const isAvailable = displayStatus === 'available'
  const canSchedule = displayStatus !== 'rented'
  
  // Xác định màu sắc và text dựa trên DisplayStatus
  let statusColor = '#5CB85C' // Mặc định xanh lá (Còn trống)
  let statusText = 'Còn trống'
  
  if (displayStatus === 'rented') {
    statusColor = '#c13515' // Đỏ (Đã thuê)
    statusText = 'Đã thuê'
  } else if (displayStatus === 'pending_viewing') {
    statusColor = '#F0AD4E' // Vàng (Chờ duyệt)
    statusText = 'Chờ duyệt'
  } else if (displayStatus === 'viewing') {
    statusColor = '#5BC0DE' // Xanh dương (Đã đặt lịch)
    statusText = 'Đã đặt lịch'
  }

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ color: '#4A90E2' }} />
    </Box>
  )

  if (!room) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ color: '#6a6a6a' }}>Không tìm thấy phòng này</Typography>
      <Button onClick={() => navigate('/')} sx={{ color: '#4A90E2', fontWeight: 600 }}>Quay lại trang chủ</Button>
    </Box>
  )

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => { window.scrollTo(0, 0); navigate('/') }}
          sx={{ color: '#222222', fontWeight: 500, mb: 3, p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
        >
          Quay lại
        </Button>

        {/* Title */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#222222', mb: 0.5 }}>
                {room.Description || room.RoomType}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarIcon sx={{ fontSize: '0.875rem', color: '#222222' }} />
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>4.8</Typography>
                </Stack>
                <Typography sx={{ color: '#6a6a6a', fontSize: '0.875rem' }}>·</Typography>
                <Typography sx={{ color: '#6a6a6a', fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer' }}>
                  {room.BuildingName}
                </Typography>
                <Typography sx={{ color: '#6a6a6a', fontSize: '0.875rem' }}>·</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor }} />
                  <Typography sx={{ fontSize: '0.875rem', color: statusColor, fontWeight: 500 }}>{statusText}</Typography>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<ShareIcon sx={{ fontSize: '1rem' }} />}
                sx={{ color: '#222222', fontSize: '0.875rem', fontWeight: 500, px: 1.5, py: 0.75, borderRadius: '8px', '&:hover': { backgroundColor: '#f7f7f7', textDecoration: 'underline' } }}
              >
                Chia sẻ
              </Button>
              <Button
                startIcon={isFavorite ? <FavoriteIcon sx={{ color: '#4A90E2', fontSize: '1rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setIsFavorite(!isFavorite)}
                sx={{ color: '#222222', fontSize: '0.875rem', fontWeight: 500, px: 1.5, py: 0.75, borderRadius: '8px', '&:hover': { backgroundColor: '#f7f7f7', textDecoration: 'underline' } }}
              >
                {isFavorite ? 'Đã lưu' : 'Lưu'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Image Gallery */}
        <Box sx={{ mb: 6 }}>
          {images.length > 0 ? (
            <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: { xs: 280, md: 440 }, backgroundColor: '#f2f2f2' }}>
              <Box component="img" src={images[currentImageIndex]} alt={`Room ${currentImageIndex + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 300ms ease' }} />
              {images.length > 1 && (
                <>
                  <NavButton onClick={() => setCurrentImageIndex(p => p === 0 ? images.length - 1 : p - 1)} sx={{ left: 16 }}>
                    <ChevronLeftIcon />
                  </NavButton>
                  <NavButton onClick={() => setCurrentImageIndex(p => p === images.length - 1 ? 0 : p + 1)} sx={{ right: 16 }}>
                    <ChevronRightIcon />
                  </NavButton>
                  <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.75 }}>
                    {images.map((_, i) => (
                      <Box key={i} onClick={() => setCurrentImageIndex(i)}
                        sx={{ width: i === currentImageIndex ? 20 : 8, height: 8, borderRadius: '4px', backgroundColor: i === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 200ms ease' }} />
                    ))}
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', px: 1.5, py: 0.5, borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500 }}>
                    {currentImageIndex + 1} / {images.length}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ height: 380, borderRadius: '12px', backgroundColor: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, border: '1px solid #e8e8e8' }}>
              <Typography sx={{ color: '#6a6a6a', fontWeight: 500 }}>Chưa có hình ảnh</Typography>
              <Typography variant="body2" sx={{ color: '#929292' }}>Chủ nhà chưa tải lên hình ảnh</Typography>
            </Box>
          )}
        </Box>

        <Grid container spacing={8}>
          {/* Left: Details */}
          <Grid item xs={12} md={7}>
            {/* Room Info */}
            <Box sx={{ pb: 4, borderBottom: '1px solid #e8e8e8', mb: 4 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#222222', mb: 1.5 }}>
                Phòng tại {room.BuildingName}
              </Typography>
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <RulerIcon sx={{ fontSize: '1rem', color: '#6a6a6a' }} />
                  <Typography sx={{ color: '#6a6a6a', fontSize: '0.9375rem' }}>{room.Area}m²</Typography>
                </Stack>
                {room.MaxPeople && (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <GroupIcon sx={{ fontSize: '1rem', color: '#6a6a6a' }} />
                    <Typography sx={{ color: '#6a6a6a', fontSize: '0.9375rem' }}>Tối đa {room.MaxPeople} người</Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <LocationIcon sx={{ fontSize: '1rem', color: '#6a6a6a' }} />
                  <Typography sx={{ color: '#6a6a6a', fontSize: '0.9375rem' }}>{room.BuildingAddress}</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Amenities */}
            <Box sx={{ pb: 4, borderBottom: '1px solid #e8e8e8', mb: 4 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#222222', mb: 2 }}>
                Tiện nghi phòng
              </Typography>
              {room.amenities && room.amenities.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                  {room.amenities.map(a => (
                    <AmenityChip key={a.AmenityID} label={a.Name} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#6a6a6a' }}>Chưa có thông tin tiện nghi</Typography>
              )}
            </Box>

            {/* Landlord */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#222222', mb: 3 }}>
                Thông tin chủ nhà
              </Typography>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box component="img" src="https://i.pravatar.cc/150?img=12" alt={room.LandlordName}
                  sx={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8e8e8' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222', mb: 0.25 }}>{room.LandlordName}</Typography>
                  <Typography variant="body2" sx={{ color: '#6a6a6a' }}>Chủ nhà · Thành viên từ 2023</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Right: Booking Card */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 96 }}>
              <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '16px', p: 3.5, boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.10) 0px 4px 8px' }}>
                {/* Price */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#222222' }}>
                      {Math.floor(parseFloat(room.Price)).toLocaleString('vi-VN')}đ
                    </Typography>
                    <Typography component="span" sx={{ color: '#6a6a6a', ml: 0.5, fontSize: '0.9375rem' }}>/tháng</Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <StarIcon sx={{ fontSize: '0.875rem', color: '#222222' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222' }}>4.8</Typography>
                  </Stack>
                </Stack>

                {/* Schedule Section */}
                {userSchedule ? (
                  <>
                    <Box sx={{ backgroundColor: '#f7f7f7', borderRadius: '12px', p: 2.5, mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#222222', mb: 1 }}>
                        {userSchedule.Status === 'Chờ duyệt' ? '⏳ Lịch xem đang chờ duyệt' : '✅ Lịch xem đã được duyệt'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 0.5 }}>
                        🕐 {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                        Trạng thái: <Box component="span" sx={{ color: '#222222', fontWeight: 600 }}>{userSchedule.Status}</Box>
                      </Typography>
                    </Box>
                    {userSchedule.Status === 'Chờ duyệt' && (
                      <Button
                        fullWidth variant="outlined"
                        onClick={() => setOpenCancelModal(true)}
                        sx={{ borderColor: '#c13515', color: '#c13515', borderRadius: '8px', py: 1.5, fontWeight: 600, '&:hover': { backgroundColor: '#fce8e6', borderColor: '#c13515' } }}
                      >
                        Hủy lịch xem
                      </Button>
                    )}
                  </>
                ) : canSchedule ? (
                  <Button
                    fullWidth variant="contained"
                    onClick={() => auth.user ? setOpenSchedule(true) : setOpenLoginModal(true)}
                    sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '8px', py: 1.75, fontWeight: 600, fontSize: '1rem', mb: 2 }}
                  >
                    Đặt lịch xem phòng
                  </Button>
                ) : (
                  <Box sx={{ backgroundColor: '#fce8e6', borderRadius: '12px', p: 2, mb: 2 }}>
                    <Typography sx={{ color: '#c13515', fontWeight: 600, fontSize: '0.9375rem', mb: 0.5 }}>Không thể đặt lịch</Typography>
                    <Typography variant="body2" sx={{ color: '#6a6a6a' }}>Phòng này đã được thuê</Typography>
                  </Box>
                )}

                <Button
                  fullWidth variant="outlined"
                  sx={{ borderColor: '#c1c1c1', color: '#222222', borderRadius: '8px', py: 1.5, fontWeight: 600, mb: 3, '&:hover': { borderColor: '#222222', backgroundColor: '#f7f7f7' } }}
                >
                  Xem trên bản đồ
                </Button>

                {/* Contact */}
                <Divider sx={{ mb: 3 }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#222222', mb: 2 }}>Liên hệ trực tiếp</Typography>
                <Stack spacing={1.5}>
                  <Button
                    fullWidth variant="contained"
                    startIcon={<PhoneIcon />}
                    onClick={() => window.location.href = `tel:${room.LandlordPhone}`}
                    sx={{ backgroundColor: '#222222', '&:hover': { backgroundColor: '#3f3f3f' }, borderRadius: '8px', py: 1.25, fontWeight: 600 }}
                  >
                    Gọi điện ngay
                  </Button>
                  <Button
                    fullWidth variant="outlined"
                    startIcon={<MessageIcon />}
                    sx={{ borderColor: '#222222', color: '#222222', borderRadius: '8px', py: 1.25, fontWeight: 600, '&:hover': { backgroundColor: '#f7f7f7' } }}
                  >
                    Nhắn tin
                  </Button>
                </Stack>

                {!userSchedule && (
                  <Typography variant="caption" sx={{ color: '#6a6a6a', display: 'block', textAlign: 'center', mt: 2.5 }}>
                    Chủ nhà sẽ xác nhận trong vòng 24 giờ
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Login Modal */}
      <Dialog open={openLoginModal} onClose={() => setOpenLoginModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#fff1f3', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Typography sx={{ fontSize: '1.5rem' }}>🔐</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#222222', mb: 1 }}>Yêu cầu đăng nhập</Typography>
          <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 3 }}>Vui lòng đăng nhập để đặt lịch xem phòng</Typography>
          <Stack spacing={1.5}>
            <Button variant="contained" fullWidth onClick={() => { setOpenLoginModal(false); navigate('/login') }}
              sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '8px', py: 1.25, fontWeight: 600 }}>
              Đăng nhập ngay
            </Button>
            <Button variant="outlined" fullWidth onClick={() => setOpenLoginModal(false)}
              sx={{ borderColor: '#c1c1c1', color: '#222222', borderRadius: '8px', py: 1.25, '&:hover': { backgroundColor: '#f7f7f7' } }}>
              Hủy
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#222222' }}>Đặt lịch xem phòng</Typography>
          <IconButton size="small" onClick={() => setOpenSchedule(false)} sx={{ color: '#222222' }}><CloseIcon /></IconButton>
        </Box>
        <Box component="form" onSubmit={handleScheduleSubmit} sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField 
              label="Ngày xem" 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
              required
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              value={scheduleData.date} 
              onChange={e => {
                setScheduleData({ ...scheduleData, date: e.target.value, time: '' })
                fetchAvailableSlots(e.target.value)
              }} 
            />
            
            {scheduleData.date && (
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#222222', mb: 1, fontWeight: 500 }}>
                  Chọn khung giờ *
                </Typography>
                {loadingSlots ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : availableSlots.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        variant={scheduleData.time === slot ? 'contained' : 'outlined'}
                        onClick={() => setScheduleData({ ...scheduleData, time: slot })}
                        sx={{
                          borderColor: scheduleData.time === slot ? '#4A90E2' : '#e8e8e8',
                          backgroundColor: scheduleData.time === slot ? '#4A90E2' : 'transparent',
                          color: scheduleData.time === slot ? '#ffffff' : '#222222',
                          '&:hover': {
                            borderColor: '#4A90E2',
                            backgroundColor: scheduleData.time === slot ? '#2E5C8A' : '#f0f7ff'
                          },
                          py: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                    Không có khung giờ trống trong ngày này
                  </Alert>
                )}
              </Box>
            )}
            
            <TextField label="Họ và tên" fullWidth required
              value={scheduleData.name} onChange={e => setScheduleData({ ...scheduleData, name: e.target.value })} />
            <TextField label="Số điện thoại" type="tel" fullWidth required
              value={scheduleData.phone} onChange={e => setScheduleData({ ...scheduleData, phone: e.target.value })} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenSchedule(false)}
              sx={{ borderColor: '#c1c1c1', color: '#222222', borderRadius: '8px', py: 1.25, '&:hover': { backgroundColor: '#f7f7f7' } }}>
              Hủy
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              type="submit"
              disabled={!scheduleData.date || !scheduleData.time || availableSlots.length === 0}
              sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '8px', py: 1.25, fontWeight: 600 }}>
              Xác nhận đặt lịch
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={openCancelModal} onClose={() => setOpenCancelModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e8e8e8' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#222222' }}>Hủy lịch xem phòng</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {userSchedule && (
            <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Thông tin lịch xem</Typography>
              <Typography variant="body2">⏰ {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}</Typography>
              <Typography variant="body2">Trạng thái: <strong>{userSchedule.Status}</strong></Typography>
            </Alert>
          )}
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={() => setOpenCancelModal(false)}
              sx={{ borderColor: '#c1c1c1', color: '#222222', borderRadius: '8px', py: 1.25 }}>
              Đóng
            </Button>
            <Button fullWidth variant="contained" onClick={handleCancelSchedule} disabled={cancelLoading}
              sx={{ backgroundColor: '#c13515', '&:hover': { backgroundColor: '#a02a0f' }, borderRadius: '8px', py: 1.25, fontWeight: 600 }}>
              {cancelLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <NotificationModal open={notification.open} onClose={hideNotification} type={notification.type} title={notification.title} message={notification.message} />
    </Box>
  )
}