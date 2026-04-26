/**
 * RoomDetailPage — Booking.com style redesign
 *
 * Key patterns:
 *  - Blue hotel name link
 *  - Score badge (dark blue pill)
 *  - Sticky booking card (right side)
 *  - Gallery: main image + thumbnails
 *  - Amenities as icon grid
 *  - Booking.com yellow CTA
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box, Container, Grid, Typography, Button, Stack, IconButton,
  Dialog, TextField, Alert, CircularProgress, Divider, Breadcrumbs, Link,
  Chip,
} from '@mui/material'
import {
  LocationOn as LocationIcon, Phone as PhoneIcon, Message as MessageIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon, Check as CheckIcon, Close as CloseIcon,
  Straighten as RulerIcon, Group as GroupIcon, Star as StarIcon,
  CalendarToday as CalendarIcon, AccessTime as ClockIcon,
  NavigateNext as NavNextIcon,
  Info as InfoIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

// ─── Tokens ──────────────────────────────────────────────────────────────
const T = {
  blue:    '#006ce4',
  blueDk:  '#003f8a',
  blueLt:  '#e8f2ff',
  text:    '#1a1a1a',
  muted:   '#595959',
  bg:      '#f2f4f8',
  white:   '#ffffff',
  border:  '#d4d6d9',
  yellow:  '#febb02',
  green:   '#008234',
  greenLt: '#e8f5ee',
  shadow1: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
  motion:  '120ms',
}

// ─── Styled ──────────────────────────────────────────────────────────────
const ScoreBadge = styled(Box)({
  backgroundColor: '#003580', color: T.white,
  borderRadius: '4px 4px 4px 0', padding: '6px 12px',
  fontWeight: 800, fontSize: '1.143rem',
  display: 'inline-flex', alignItems: 'center',
})

const BookingCard = styled(Box)({
  backgroundColor: T.white, borderRadius: '8px',
  border: `1px solid ${T.border}`, boxShadow: T.shadow1,
  padding: '20px',
})

const AmenityRow = ({ label }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{
    py: 0.75, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' },
  }}>
    <CheckIcon sx={{ fontSize: 16, color: T.green }} />
    <Typography sx={{ fontSize: '0.929rem', color: T.text }}>{label}</Typography>
  </Stack>
)

const NavBtn = styled(IconButton)({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
  border: `1px solid ${T.border}`, color: T.text, width: 36, height: 36,
  boxShadow: T.shadow1, zIndex: 10,
  '&:hover': { backgroundColor: T.white },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
  transition: `all ${T.motion} ease`,
})

// ─── Component ────────────────────────────────────────────────────────────
export default function RoomDetailPage() {
  useScrollToTop()
  const navigate  = useNavigate()
  const { id: roomId } = useParams()
  const auth      = useAuth()

  const [room, setRoom]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [imgIdx, setImgIdx]               = useState(0)
  const [isFav, setIsFav]                 = useState(false)
  const [openSchedule, setOpenSchedule]   = useState(false)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [userSchedule, setUserSchedule]   = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [scheduleData, setScheduleData]   = useState({ date: '', time: '', name: '', phone: '' })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots]   = useState(false)

  const { notification, showSuccess, showError, hideNotification } = useNotification()

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const BASE = API.replace('/api', '')

  useEffect(() => { if (roomId) { fetchRoom(); fetchUserSchedule() } }, [roomId])
  useEffect(() => { if (roomId) fetchUserSchedule() }, [auth.user])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/rooms/${roomId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      if (data.success) setRoom(data.data)
    } catch {} finally { setLoading(false) }
  }

  const fetchUserSchedule = async () => {
    const token = localStorage.getItem('token')
    if (!token) { setUserSchedule(null); return }
    try {
      const res = await fetch(`${API}/schedule/${roomId}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setUserSchedule(data.success && data.data ? data.data : null)
    } catch { setUserSchedule(null) }
  }

  const fetchSlots = async date => {
    if (!date) return
    setLoadingSlots(true)
    try {
      const res = await fetch(`${API}/available-slots/${roomId}?date=${date}`)
      const data = await res.json()
      if (data.success) setAvailableSlots(data.data)
    } catch { setAvailableSlots([]) }
    finally { setLoadingSlots(false) }
  }

  const images = room?.images?.length > 0
    ? room.images.map(img => img.ImageURL.startsWith('http') ? img.ImageURL : `${BASE}${img.ImageURL.startsWith('/') ? '' : '/'}${img.ImageURL}`)
    : []

  const handleScheduleSubmit = async e => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) { setOpenLoginModal(true); return }
    try {
      const res = await fetch(`${API}/schedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.RoomID, date: scheduleData.date, time: scheduleData.time }),
      })
      const data = await res.json()
      if (data.success) {
        setOpenSchedule(false)
        setScheduleData({ date: '', time: '', name: '', phone: '' })
        showSuccess('Thành công!', 'Đặt lịch xem phòng thành công! Chủ nhà sẽ xác nhận trong 24 giờ.')
        fetchUserSchedule(); fetchRoom()
      } else showError('Lỗi!', data.message || 'Đặt lịch thất bại')
    } catch { showError('Lỗi!', 'Lỗi kết nối') }
  }

  const handleCancelSchedule = async () => {
    if (!userSchedule) return
    setCancelLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/schedule/${userSchedule.ScheduleID}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setUserSchedule(null); setOpenCancelModal(false)
        showSuccess('Thành công!', 'Hủy lịch xem thành công!')
        fetchRoom()
      } else showError('Lỗi!', data.message || 'Hủy lịch thất bại')
    } catch { showError('Lỗi!', 'Lỗi kết nối') }
    finally { setCancelLoading(false) }
  }

  const displayStatus = room?.DisplayStatus || room?.Status
  const statusConfig = {
    available:       { color: T.green,  bg: T.greenLt,  text: 'Còn trống' },
    pending_viewing: { color: '#a16100', bg: '#fef6e8', text: 'Chờ duyệt' },
    viewing:         { color: T.blue,   bg: T.blueLt,   text: 'Đã đặt lịch' },
    rented:          { color: '#8b0d1f', bg: '#fde8eb', text: 'Đã thuê' },
  }
  const sc = statusConfig[displayStatus] || statusConfig.available
  const canSchedule = displayStatus !== 'rented'

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
      <CircularProgress sx={{ color: T.blue }} />
    </Box>
  )
  if (!room) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, backgroundColor: T.bg }}>
      <Typography sx={{ color: T.muted }}>Không tìm thấy phòng</Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ backgroundColor: T.blue }}>Về trang chủ</Button>
    </Box>
  )

  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')

  return (
    <Box sx={{ backgroundColor: T.bg, minHeight: '100vh' }}>
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 1.25 }}>
            <Breadcrumbs separator={<NavNextIcon sx={{ fontSize: 14 }} />} aria-label="Breadcrumb">
              <Link underline="hover" sx={{ fontSize: '0.857rem', color: T.blue, cursor: 'pointer' }} onClick={() => navigate('/')}>Trang chủ</Link>
              <Link underline="hover" sx={{ fontSize: '0.857rem', color: T.blue, cursor: 'pointer' }} onClick={() => navigate('/listings')}>Tin đăng</Link>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>{room.BuildingName}</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* ─── Title block ─────────────────────────────────────────────────── */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.429rem', color: T.text, mb: 0.5 }}>
                {room.Description || room.RoomType}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocationIcon sx={{ fontSize: 14, color: T.muted }} />
                  <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>{room.BuildingAddress}</Typography>
                </Stack>
                <Typography sx={{ color: T.muted }}>·</Typography>
                <Link underline="hover" sx={{ fontSize: '0.929rem', color: T.blue, cursor: 'pointer' }}>Xem bản đồ</Link>
                <Typography sx={{ color: T.muted }}>·</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '4px', backgroundColor: sc.bg }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.color }} />
                  <Typography sx={{ fontSize: '0.857rem', color: sc.color, fontWeight: 600 }}>{sc.text}</Typography>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                sx={{ color: T.blue, border: `1px solid ${T.blue}`, borderRadius: '4px', fontSize: '0.857rem' }}>
                Chia sẻ
              </Button>
              <Button
                size="small"
                startIcon={isFav ? <FavoriteIcon sx={{ fontSize: 16, color: T.blue }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                onClick={() => setIsFav(!isFav)}
                aria-label={isFav ? 'Bỏ lưu' : 'Lưu phòng'}
                sx={{ color: isFav ? T.blue : T.text, border: `1px solid ${T.border}`, borderRadius: '4px', fontSize: '0.857rem' }}
              >
                {isFav ? 'Đã lưu' : 'Lưu'}
              </Button>
            </Stack>
          </Stack>

          {/* Score row */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ScoreBadge>4.8</ScoreBadge>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text }}>Tuyệt vời</Typography>
              <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>Dựa trên đánh giá của người thuê</Typography>
            </Box>
          </Stack>
        </Box>

        {/* ─── Gallery ─────────────────────────────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          {images.length > 0 ? (
            <Box>
              {/* Main image */}
              <Box sx={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: { xs: 240, md: 420 }, backgroundColor: T.bg, mb: 1 }}>
                <Box
                  component="img" src={images[imgIdx]} alt={`Hình ${imgIdx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 200ms ease' }}
                />
                {images.length > 1 && (
                  <>
                    <NavBtn onClick={() => setImgIdx(p => p === 0 ? images.length - 1 : p - 1)} sx={{ left: 12 }} aria-label="Ảnh trước">
                      <ChevronLeftIcon />
                    </NavBtn>
                    <NavBtn onClick={() => setImgIdx(p => p === images.length - 1 ? 0 : p + 1)} sx={{ right: 12 }} aria-label="Ảnh tiếp">
                      <ChevronRightIcon />
                    </NavBtn>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: T.white, px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '0.857rem', fontWeight: 600 }}>
                      {imgIdx + 1} / {images.length}
                    </Box>
                  </>
                )}
              </Box>
              {/* Thumbnails */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 } }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      component="img" src={img} alt={`Thumbnail ${i + 1}`}
                      onClick={() => setImgIdx(i)}
                      tabIndex={0} role="button" aria-label={`Xem ảnh ${i + 1}`}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setImgIdx(i)}
                      sx={{
                        width: 80, height: 56, objectFit: 'cover', borderRadius: '4px', flexShrink: 0,
                        cursor: 'pointer', border: `2px solid ${i === imgIdx ? T.blue : 'transparent'}`,
                        opacity: i === imgIdx ? 1 : 0.7,
                        transition: `all ${T.motion} ease`,
                        '&:hover': { opacity: 1 },
                        '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          ) : (
            <Box sx={{ height: 360, borderRadius: '8px', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}` }}>
              <Stack alignItems="center" spacing={1}>
                <HotelIcon sx={{ fontSize: 48, color: T.border }} />
                <Typography sx={{ color: T.muted, fontSize: '0.929rem' }}>Chưa có hình ảnh</Typography>
              </Stack>
            </Box>
          )}
        </Box>

        {/* ─── Body ─────────────────────────────────────────────────────────── */}
        <Grid container spacing={3}>
          {/* Left */}
          <Grid item xs={12} md={7}>
            {/* Room facts */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Thông tin phòng
              </Typography>
              <Grid container spacing={2}>
                {[
                  { icon: <RulerIcon sx={{ fontSize: 18, color: T.blue }} />, label: 'Diện tích', value: `${room.Area}m²` },
                  { icon: <GroupIcon sx={{ fontSize: 18, color: T.blue }} />, label: 'Sức chứa', value: room.MaxPeople ? `${room.MaxPeople} người` : 'Không giới hạn' },
                  { icon: <HotelIcon sx={{ fontSize: 18, color: T.blue }} />, label: 'Loại phòng', value: room.RoomType },
                  { icon: <LocationIcon sx={{ fontSize: 18, color: T.blue }} />, label: 'Tòa nhà', value: room.BuildingName },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box sx={{ mt: 0.25 }}>{item.icon}</Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.929rem', fontWeight: 600, color: T.text }}>{item.value}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Mô tả */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Mô tả
              </Typography>
              {room.Description ? (
                <Typography sx={{ fontSize: '0.929rem', color: T.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {room.Description}
                </Typography>
              ) : (
                <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>Chưa có mô tả</Typography>
              )}
            </Box>

            {/* Dịch vụ */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Dịch vụ
              </Typography>
              {room.services?.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {room.services.map((s, i) => <AmenityRow key={i} label={s} />)}
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>Chưa có thông tin dịch vụ</Typography>
              )}
            </Box>

            {/* Nội thất */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Nội thất
              </Typography>
              {room.furniture?.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {room.furniture.map((f, i) => <AmenityRow key={i} label={f} />)}
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>Chưa có thông tin nội thất</Typography>
              )}
            </Box>

            {/* Quy định */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Quy định
              </Typography>
              {room.rules?.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                  {room.rules.map((r, i) => <AmenityRow key={i} label={r} />)}
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>Chưa có thông tin quy định</Typography>
              )}
            </Box>

            {/* Amenities */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1.5 }}>
                Tiện nghi phòng
              </Typography>
              {room.amenities?.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {room.amenities.map(a => <AmenityRow key={a.AmenityID} label={a.Name} />)}
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.929rem', color: T.muted }}>Chưa có thông tin tiện nghi</Typography>
              )}
            </Box>

            {/* Landlord */}
            <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 2 }}>Chủ nhà</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img" src="https://i.pravatar.cc/150?img=12" alt={room.LandlordName}
                  sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.border}` }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.957rem', color: T.text }}>{room.LandlordName}</Typography>
                  <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>Thành viên từ 2023</Typography>
                  <Chip
                    label="Đã xác minh" size="small"
                    sx={{ mt: 0.5, backgroundColor: T.greenLt, color: T.green, fontWeight: 700, height: '22px', fontSize: '0.714rem', borderRadius: '4px' }}
                  />
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Right: Booking Card */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <BookingCard>
                {/* Price */}
                <Box sx={{ pb: 2, mb: 2, borderBottom: `1px solid ${T.border}` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.571rem', color: T.text }}>
                        {fmt(room.Price)}đ
                      </Typography>
                      <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>mỗi tháng</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <ScoreBadge sx={{ fontSize: '1rem' }}>4.8</ScoreBadge>
                      <Typography sx={{ fontSize: '0.714rem', color: T.muted, mt: 0.25 }}>Tuyệt vời</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Schedule section */}
                {userSchedule ? (
                  <Box>
                    <Box sx={{
                      backgroundColor: userSchedule.Status === 'Chờ duyệt' ? '#fef6e8' : T.greenLt,
                      borderRadius: '4px', p: 1.5, mb: 1.5,
                      border: `1px solid ${userSchedule.Status === 'Chờ duyệt' ? '#f5a623' : T.green}`,
                    }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 0.75 }}>
                        {userSchedule.Status === 'Chờ duyệt' ? '⏳ Chờ xác nhận' : '✅ Lịch đã duyệt'}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                        <ClockIcon sx={{ fontSize: 14, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
                          {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
                        Trạng thái: <Box component="span" sx={{ fontWeight: 700, color: T.text }}>{userSchedule.Status}</Box>
                      </Typography>
                    </Box>
                    {userSchedule.Status === 'Chờ duyệt' && (
                      <Button
                        fullWidth variant="outlined"
                        onClick={() => setOpenCancelModal(true)}
                        sx={{ borderColor: '#c8102e', color: '#c8102e', borderWidth: '2px', borderRadius: '4px', fontWeight: 700, '&:hover': { borderWidth: '2px', backgroundColor: '#fde8eb' } }}
                      >
                        Hủy lịch xem
                      </Button>
                    )}
                  </Box>
                ) : canSchedule ? (
                  <Button
                    fullWidth variant="contained"
                    onClick={() => auth.user ? setOpenSchedule(true) : setOpenLoginModal(true)}
                    sx={{
                      backgroundColor: T.yellow, color: T.text, borderRadius: '4px',
                      fontWeight: 700, fontSize: '1rem', py: 1.5, mb: 1.5,
                      '&:hover': { backgroundColor: '#f5aa00' },
                      '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                    }}
                  >
                    <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                    Đặt lịch xem phòng
                  </Button>
                ) : (
                  <Box sx={{ backgroundColor: '#fde8eb', borderRadius: '4px', p: 1.5, mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#8b0d1f', fontSize: '0.929rem' }}>Không thể đặt lịch</Typography>
                    <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>Phòng này đã được thuê</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Contact */}
                <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5 }}>Liên hệ chủ nhà</Typography>
                <Stack spacing={1.25}>
                  <Button
                    fullWidth variant="contained"
                    startIcon={<PhoneIcon sx={{ fontSize: 18 }} />}
                    onClick={() => window.location.href = `tel:${room.LandlordPhone}`}
                    aria-label={`Gọi cho ${room.LandlordName}`}
                    sx={{ backgroundColor: T.blue, borderRadius: '4px', fontWeight: 700, py: 1.25, '&:hover': { backgroundColor: T.blueDk } }}
                  >
                    Gọi điện ngay
                  </Button>
                  <Button
                    fullWidth variant="outlined"
                    startIcon={<MessageIcon sx={{ fontSize: 18 }} />}
                    aria-label="Nhắn tin với chủ nhà"
                    sx={{ borderColor: T.blue, borderWidth: '2px', color: T.blue, borderRadius: '4px', fontWeight: 700, py: 1.25, '&:hover': { borderWidth: '2px', backgroundColor: T.blueLt } }}
                  >
                    Nhắn tin
                  </Button>
                </Stack>

                {!userSchedule && (
                  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mt: 2, p: 1.5, backgroundColor: T.bg, borderRadius: '4px' }}>
                    <InfoIcon sx={{ fontSize: 16, color: T.blue, flexShrink: 0, mt: 0.1 }} />
                    <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.5 }}>
                      Chủ nhà thường xác nhận lịch trong vòng 24 giờ
                    </Typography>
                  </Stack>
                )}
              </BookingCard>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ─── Login modal ──────────────────────────────────────────────────── */}
      <Dialog open={openLoginModal} onClose={() => setOpenLoginModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: T.blueLt, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <StarIcon sx={{ fontSize: 24, color: T.blue }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 0.5 }}>Yêu cầu đăng nhập</Typography>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted, mb: 2.5 }}>Đăng nhập để đặt lịch xem phòng</Typography>
          <Stack spacing={1}>
            <Button variant="contained" fullWidth onClick={() => { setOpenLoginModal(false); navigate('/login') }}
              sx={{ backgroundColor: T.blue, borderRadius: '4px', fontWeight: 700 }}>
              Đăng nhập
            </Button>
            <Button variant="outlined" fullWidth onClick={() => setOpenLoginModal(false)}
              sx={{ borderColor: T.border, color: T.text, borderRadius: '4px' }}>
              Huỷ
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ─── Schedule dialog ──────────────────────────────────────────────── */}
      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>Đặt lịch xem phòng</Typography>
          <IconButton size="small" onClick={() => setOpenSchedule(false)} aria-label="Đóng"><CloseIcon /></IconButton>
        </Box>
        <Box component="form" onSubmit={handleScheduleSubmit} sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Ngày xem" type="date" InputLabelProps={{ shrink: true }} fullWidth required
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              value={scheduleData.date}
              onChange={e => { setScheduleData({ ...scheduleData, date: e.target.value, time: '' }); fetchSlots(e.target.value) }}
            />
            {scheduleData.date && (
              <Box>
                <Typography sx={{ fontSize: '0.857rem', color: T.text, mb: 1, fontWeight: 600 }}>Chọn khung giờ *</Typography>
                {loadingSlots ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} sx={{ color: T.blue }} /></Box>
                ) : availableSlots.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        variant={scheduleData.time === slot ? 'contained' : 'outlined'}
                        onClick={() => setScheduleData({ ...scheduleData, time: slot })}
                        sx={{
                          borderRadius: '4px', fontSize: '0.857rem', fontWeight: 600, py: 1,
                          backgroundColor: scheduleData.time === slot ? T.blue : 'transparent',
                          borderColor: scheduleData.time === slot ? T.blue : T.border,
                          borderWidth: scheduleData.time === slot ? '2px' : '1px',
                          color: scheduleData.time === slot ? T.white : T.text,
                          '&:hover': { borderColor: T.blue, borderWidth: '2px' },
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: '4px', fontSize: '0.857rem' }}>
                    Không có khung giờ trống trong ngày này
                  </Alert>
                )}
              </Box>
            )}
            <TextField label="Họ và tên" fullWidth required value={scheduleData.name} onChange={e => setScheduleData({ ...scheduleData, name: e.target.value })} />
            <TextField label="Số điện thoại" type="tel" fullWidth required value={scheduleData.phone} onChange={e => setScheduleData({ ...scheduleData, phone: e.target.value })} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenSchedule(false)}
              sx={{ borderColor: T.border, color: T.text, borderRadius: '4px' }}>
              Huỷ
            </Button>
            <Button fullWidth variant="contained" type="submit"
              disabled={!scheduleData.date || !scheduleData.time || availableSlots.length === 0}
              sx={{ backgroundColor: T.blue, borderRadius: '4px', fontWeight: 700, '&:hover': { backgroundColor: T.blueDk } }}>
              Xác nhận đặt lịch
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ─── Cancel modal ────────────────────────────────────────────────── */}
      <Dialog open={openCancelModal} onClose={() => setOpenCancelModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>Hủy lịch xem phòng</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {userSchedule && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '4px', fontSize: '0.857rem' }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.857rem' }}>Thông tin lịch xem</Typography>
              <Typography sx={{ fontSize: '0.857rem' }}>⏰ {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}</Typography>
            </Alert>
          )}
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={() => setOpenCancelModal(false)} sx={{ borderRadius: '4px', borderColor: T.border, color: T.text }}>Đóng</Button>
            <Button fullWidth variant="contained" onClick={handleCancelSchedule} disabled={cancelLoading}
              sx={{ backgroundColor: '#c8102e', '&:hover': { backgroundColor: '#8b0d1f' }, borderRadius: '4px', fontWeight: 700 }}>
              {cancelLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <NotificationModal open={notification.open} onClose={hideNotification} type={notification.type} title={notification.title} message={notification.message} />
    </Box>
  )
}