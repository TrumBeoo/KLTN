/**
 * HomePage — Booking.com style redesign
 *
 * Token usage (from UI_Design.md):
 *  - color.text.secondary = #006ce4 (links, CTAs)
 *  - color.text.primary   = #1a1a1a
 *  - font.size.base=14px / font.size.sm=16px / font.size.md=20px
 *  - space tokens: 2 4 5 8 11 12 16 32 px
 *  - radius.xs=4 radius.sm=8
 *  - shadow.1 = rgba(26,26,26,0.16) 0px 2px 8px 0px
 *  - motion.duration.instant=120ms
 *  - WCAG 2.2 AA throughout
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, Container, Typography, Button, Grid, Chip, Stack,
  IconButton, Tabs, Tab, Skeleton, Fab, Tooltip, TextField, Popover, MenuItem, Autocomplete,
  Snackbar, Alert,
} from '@mui/material'
import {
  Star as StarIcon,
  LocationOn as LocationIcon,
  Straighten as RulerIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Map as MapIcon,
  Group as PeopleIcon,
  Visibility as EyeIcon,
  ImageNotSupported as NoImageIcon,
  Verified as VerifiedIcon,
  CameraAlt as CameraIcon,
  Security as ShieldIcon,
  SmartToy as BotIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingIcon,
  Close as CloseIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import AIChatWidget from '../components/AIChatWidget'
import NearUniversities from '../components/NearUniversities'
import NearMetroStations from '../components/NearMetroStations'
import NearbyAmenities from '../components/NearbyAmenities'

// ─── Design tokens ─────────────────────────────────────────────────────────
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
  shadow1: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
  motion:  '120ms',
}

// ─── Styled ────────────────────────────────────────────────────────────────

/** Hero: search-bar style with background image */
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: 'auto',
  padding: '80px 0 64px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    padding: '60px 0 48px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '48px 0 40px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 53, 128, 0.5)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0, left: 0, right: 0, height: 8,
    background: T.yellow,
    [theme.breakpoints.down('sm')]: {
      height: 4,
    },
  },
}))

const HeroSearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  flexDirection: 'row',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: T.white,
  boxShadow: 'rgba(0,0,0,0.2) 0px 8px 32px',
  border: '1px solid rgba(255,255,255,0.3)',
  maxWidth: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    borderRadius: '8px',
    boxShadow: 'rgba(0,0,0,0.15) 0px 4px 16px',
    gap: 0,
  },
}))

const SearchSegment = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: T.white,
  padding: '0 20px',
  flex: 1,
  minWidth: 0,
  height: '64px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 120ms ease',
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1px',
    height: '32px',
    backgroundColor: '#e0e0e0',
    [theme.breakpoints.down('md')]: {
      width: 'calc(100% - 32px)',
      height: '1px',
      top: 'auto',
      bottom: 0,
      left: '16px',
      transform: 'none',
    },
  },
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  [theme.breakpoints.down('md')]: {
    height: '60px',
    padding: '12px 16px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '56px',
    padding: '10px 16px',
  },
}))

/** Room card — list style (horizontal on md+) */
const RoomCard = styled(Box)({
  backgroundColor: T.white,
  borderRadius: '8px',
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow1,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  '&:hover': {
    boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
    transform: 'translateY(-2px)',
  },
  '&:focus-visible': {
    outline: `2px solid ${T.blue}`,
    outlineOffset: '2px',
  },
})

/** Small card for grids */
const GridCard = styled(Box)({
  backgroundColor: T.white,
  borderRadius: '8px',
  border: `1px solid ${T.border}`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  '&:hover': {
    boxShadow: 'rgba(26,26,26,0.24) 0px 4px 16px',
    transform: 'translateY(-2px)',
  },
  '&:focus-visible': {
    outline: `2px solid ${T.blue}`,
    outlineOffset: '2px',
  },
})

const TrendCard = styled(Box)({
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  border: `1px solid ${T.border}`,
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  '&:hover': {
    boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
    transform: 'translateY(-2px)',
  },
  '&:hover .trend-img': { transform: 'scale(1.04)' },
  '&:focus-visible': {
    outline: `2px solid ${T.blue}`,
    outlineOffset: '2px',
  },
})

const TrendCardH = styled(Box)({
  display: 'flex',
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
  border: `1px solid ${T.border}`,
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  backgroundColor: T.white,
  '&:hover': {
    boxShadow: 'rgba(26,26,26,0.24) 0px 4px 16px',
    transform: 'translateY(-2px)',
  },
  '&:hover .trend-h-img': { transform: 'scale(1.05)' },
  '&:focus-visible': {
    outline: `2px solid ${T.blue}`,
    outlineOffset: '2px',
  },
})

/** Score badge — Booking.com style dark blue */
const ScoreBadge = styled(Box)({
  backgroundColor: '#003580',
  color: T.white,
  borderRadius: '4px 4px 4px 0',
  padding: '4px 8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '0.857rem',
  minWidth: '36px',
})

/** Status badge */
const StatusBadge = styled(Box)(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.786rem',
  fontWeight: 600,
  backgroundColor:
    status === 'available' ? '#e8f5ee' :
    status === 'pending'   ? '#fef6e8' :
    status === 'booked'    ? T.blueLt  : '#fde8eb',
  color:
    status === 'available' ? '#005a23' :
    status === 'pending'   ? '#a16100' :
    status === 'booked'    ? T.blue    : '#8b0d1f',
}))

/** Blue bullet */
const StatusDot = styled(Box)(({ status }) => ({
  width: 6, height: 6, borderRadius: '50%',
  backgroundColor:
    status === 'available' ? '#008234' :
    status === 'pending'   ? '#f5a623' :
    status === 'booked'    ? T.blue    : '#c8102e',
}))

/** Section header divider — left blue bar */
function SectionHeader({ children, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{children}</Typography>
      {action}
    </Box>
  )
}

/** Room card skeleton */
function CardSkeleton() {
  return (
    <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" sx={{ width: '100%', height: 160 }} animation="wave" />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    </Box>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  useScrollToTop()
  const navigate = useNavigate()

  const [tabValue, setTabValue]           = useState(0)
  const [favorites, setFavorites]         = useState({})
  const [favLoading, setFavLoading]       = useState({})
  const [snackbar, setSnackbar]           = useState({ open: false, message: '', severity: 'success' })
  const [listings, setListings]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [chatOpen, setChatOpen]           = useState(false)
  const [districts, setDistricts]         = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(true)
  const [searchDistrict, setSearchDistrict] = useState(null)
  const [districtOptions, setDistrictOptions] = useState([])
  const [searchDate, setSearchDate]       = useState('')
  const [guestAnchor, setGuestAnchor]     = useState(null)
  const [guestCount, setGuestCount]       = useState(1)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const statistics = [
    { value: '10.000+', label: 'Phòng trọ đăng ký',  icon: <HomeIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '5.000+',  label: 'Người dùng',          icon: <PeopleIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '98%',     label: 'Hài lòng',             icon: <StarIcon sx={{ fontSize: 32, color: T.yellow }} /> },
    { value: '24/7',    label: 'Hỗ trợ AI',            icon: <BotIcon sx={{ fontSize: 32, color: T.blue }} /> },
  ]

  const howItWorks = [
    { step: 1, icon: '🔍', title: 'Tìm phòng', desc: 'Tìm kiếm theo khu vực, ngân sách và tiện nghi' },
    { step: 2, icon: '📅', title: 'Đặt lịch xem', desc: 'Chọn khung giờ thuận tiện để đến tận nơi' },
    { step: 3, icon: '👁️', title: 'Xem phòng', desc: 'Gặp chủ nhà, kiểm tra thực tế' },
    { step: 4, icon: '✅', title: 'Thuê phòng', desc: 'Ký hợp đồng và dọn vào ở ngay' },
  ]

  useEffect(() => { fetchRooms(); fetchDistricts(); fetchDistrictOptions(); checkFavorites() }, [])

  const fetchDistrictOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/locations/districts`)
      const data = await res.json()
      if (data.success) {
        setDistrictOptions(data.data.map(d => ({ label: d, value: d })))
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
      // Fallback data
      setDistrictOptions([
        'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy',
        'Tây Hồ', 'Long Biên', 'Hà Đông', 'Thanh Xuân', 'Hoàng Mai',
        'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm',
      ].map(d => ({ label: d, value: d })))
    }
  }

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true)
      const res = await fetch(`${API_URL}/locations/districts-with-stats`)
      const data = await res.json()
      if (data.success) {
        setDistricts(data.data.map(d => ({
          name: d.District, rooms: d.RoomCount,
          image: d.ImageURL?.startsWith('http') ? d.ImageURL : `${API_URL.replace('/api', '')}${d.ImageURL || ''}` || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        })))
      }
    } catch {
      setDistricts([
        { name: 'Cầu Giấy',    rooms: 245, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' },
        { name: 'Hà Đông',     rooms: 189, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
        { name: 'Thanh Xuân',  rooms: 312, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
        { name: 'Nam Từ Liêm', rooms: 276, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
      ])
    } finally { setLoadingDistricts(false) }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/rooms?limit=12`)
      const data = await res.json()
      if (data.success) {
        setListings(data.data.map(room => {
          const imgUrl = room.images?.[0]?.ImageURL
          return {
            id: room.RoomID,
            title: room.Title || `${room.RoomType} - ${room.RoomCode}`,
            location: room.BuildingAddress || 'Chưa cập nhật',
            price: room.Price?.toString() || '0',
            area: room.Area || 0,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 5,
            image: imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_URL.replace('/api', '')}${imgUrl}`) : null,
            status: (['available','pending_viewing','viewing'].includes(room.DisplayStatus || room.Status))
              ? (room.DisplayStatus || room.Status) === 'available' ? 'available'
                : (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'pending' : 'booked'
              : 'rented',
            views: Math.floor(Math.random() * 1000) + 100,
            buildingName: room.BuildingName,
          }
        }))
        checkFavorites()
      }
    } catch {} finally { setLoading(false) }
  }

  const checkFavorites = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch(`${API_URL}/tenant/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const favMap = {}
        data.data.forEach(fav => {
          favMap[fav.RoomID] = true
        })
        setFavorites(favMap)
      }
    } catch (err) {
      console.error('Check favorites error:', err)
    }
  }

  const toggleFav = async (id, e) => {
    e.stopPropagation()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng đăng nhập để lưu phòng yêu thích', severity: 'warning' })
      setTimeout(() => navigate('/login'), 1500)
      return
    }
    
    setFavLoading(prev => ({ ...prev, [id]: true }))
    
    try {
      const isFav = favorites[id]
      
      if (isFav) {
        const res = await fetch(`${API_URL}/tenant/favorites/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setFavorites(prev => ({ ...prev, [id]: false }))
          setSnackbar({ open: true, message: '💔 Đã xóa khỏi danh sách yêu thích', severity: 'info' })
        }
      } else {
        const res = await fetch(`${API_URL}/tenant/favorites`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: id })
        })
        const data = await res.json()
        if (data.success) {
          setFavorites(prev => ({ ...prev, [id]: true }))
          setSnackbar({ open: true, message: '❤️ Đã thêm vào danh sách yêu thích', severity: 'success' })
        } else {
          setSnackbar({ open: true, message: data.message || 'Không thể thêm vào yêu thích', severity: 'error' })
        }
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi kết nối', severity: 'error' })
    } finally {
      setFavLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')
  const statusLabel = { available: 'Còn trống', pending: 'Chờ duyệt', booked: 'Đã đặt lịch', rented: 'Đã thuê' }
  const tabListings = listings.filter(l =>
    tabValue === 0 ? true :
    tabValue === 1 ? l.status === 'available' : l.rating >= 4.5
  ).slice(0, 8)

  return (
    <Box sx={{ backgroundColor: T.bg }}>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection role="banner" aria-label="Hero section">
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h1"
            sx={{
              color: T.white, textAlign: 'center', mb: 1,
              fontSize: { xs: '1.714rem', sm: '2rem', md: '2.286rem' },
              fontWeight: 700,
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Tìm phòng trọ/CCMN lý tưởng tại Hà Nội
          </Typography>
          <Typography sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            textAlign: 'center', 
            mb: { xs: 2.5, sm: 3, md: 3.5 }, 
            fontSize: { xs: '0.857rem', sm: '0.929rem', md: '1rem' },
            maxWidth: '600px',
            mx: 'auto',
          }}>
            Xem bản đồ · Đặt lịch xem · Tìm bạn ở ghép thông minh
          </Typography>

          {/* Search bar - Multi-layout responsive */}
          <HeroSearchBar role="search" aria-label="Tìm kiếm phòng">
            <SearchSegment 
              sx={{ 
                flex: { xs: 1, md: 2 },
                '&::after': { display: { xs: 'block', md: 'block' } }
              }}
            >
              <LocationIcon sx={{ 
                fontSize: { xs: 20, sm: 22, md: 24 }, 
                color: T.blue, 
                mr: { xs: 1.5, md: 1.5 }, 
                flexShrink: 0 
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.786rem', md: '0.75rem' }, 
                  color: T.muted, 
                  lineHeight: 1.3, 
                  mb: { xs: 0.5, md: 0.25 }, 
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}>Địa điểm</Typography>
                <Autocomplete
                  value={searchDistrict}
                  onChange={(e, newValue) => setSearchDistrict(newValue)}
                  options={districtOptions}
                  getOptionLabel={(option) => option?.label || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn quận/huyện"
                      variant="standard"
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        sx: { 
                          fontSize: { xs: '0.929rem', sm: '0.929rem', md: '1rem' }, 
                          fontWeight: 600, 
                          color: T.text,
                          '& input': {
                            padding: 0,
                            '&::placeholder': {
                              color: T.muted,
                              opacity: 0.6,
                            }
                          }
                        }
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-input': { p: 0 },
                    '& .MuiAutocomplete-endAdornment': { display: 'none' },
                  }}
                />
              </Box>
            </SearchSegment>

            <SearchSegment 
              sx={{ 
                flex: { xs: 1, md: 1.2 },
                '&::after': { display: { xs: 'block', md: 'block' } }
              }}
            >
              <CalendarIcon sx={{ 
                fontSize: { xs: 20, sm: 22, md: 24 }, 
                color: T.blue, 
                mr: { xs: 1.5, md: 1.5 }, 
                flexShrink: 0 
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.786rem', md: '0.75rem' }, 
                  color: T.muted, 
                  lineHeight: 1.3, 
                  mb: { xs: 0.5, md: 0.25 }, 
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}>Xem phòng</Typography>
                <TextField
                  type="date"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{ 
                    disableUnderline: true, 
                    sx: { 
                      fontSize: { xs: '0.929rem', sm: '0.929rem', md: '1rem' }, 
                      fontWeight: 600, 
                      color: T.text,
                      '& input': {
                        padding: 0,
                        cursor: 'pointer',
                      }
                    } 
                  }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Box>
            </SearchSegment>

            <SearchSegment 
              sx={{ 
                flex: { xs: 1, md: 1 },
                '&::after': { display: 'none' }
              }} 
              onClick={e => setGuestAnchor(e.currentTarget)}
            >
              <PeopleIcon sx={{ 
                fontSize: { xs: 20, sm: 22, md: 24 }, 
                color: T.blue, 
                mr: { xs: 1.5, md: 1.5 }, 
                flexShrink: 0 
              }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.786rem', md: '0.75rem' }, 
                  color: T.muted, 
                  lineHeight: 1.3, 
                  mb: { xs: 0.5, md: 0.25 }, 
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}>Số người</Typography>
                <Typography sx={{ 
                  fontSize: { xs: '0.929rem', sm: '0.929rem', md: '1rem' }, 
                  color: T.text, 
                  fontWeight: 600 
                }}>{guestCount} người</Typography>
              </Box>
            </SearchSegment>

            <Button
              onClick={() => {
                const params = new URLSearchParams()
                if (searchDistrict?.value) params.set('district', searchDistrict.value)
                if (searchDate) params.set('date', searchDate)
                if (guestCount > 1) params.set('guests', guestCount)
                navigate(`/listings?${params.toString()}`)
              }}
              variant="contained"
              aria-label="Tìm phòng"
              sx={{
                backgroundColor: T.blue,
                color: T.white,
                borderRadius: { xs: 0, md: 0 },
                px: { xs: 3, sm: 3.5, md: 4 },
                height: { xs: '56px', sm: '56px', md: '64px' },
                fontSize: { xs: '1rem', sm: '1rem', md: '1rem' },
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minWidth: { xs: '100%', md: '140px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 0.5, md: 1 },
                transition: 'background-color 120ms ease, transform 120ms ease',
                '&:hover': {
                  backgroundColor: T.blueDk,
                },
                '&:active': {
                  transform: 'translateY(1px)',
                },
                '&:focus-visible': {
                  outline: `3px solid ${T.yellow}`,
                  outlineOffset: '-3px',
                },
              }}
            >
              <SearchIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
              <Box component="span">Tìm</Box>
            </Button>
          </HeroSearchBar>

          {/* Guest count popover */}
          <Popover
            open={!!guestAnchor}
            anchorEl={guestAnchor}
            onClose={() => setGuestAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { mt: 1, borderRadius: '8px', boxShadow: T.shadow1, minWidth: 200 } }}
          >
            {[1, 2, 3, 4].map(n => (
              <MenuItem
                key={n}
                selected={guestCount === n}
                onClick={() => { setGuestCount(n); setGuestAnchor(null) }}
                sx={{ fontSize: '0.857rem', py: 1 }}
              >
                {n} người
              </MenuItem>
            ))}
          </Popover>

          {/* Quick filter chips */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              mt: { xs: 2, sm: 2.5, md: 3 }, 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              gap: { xs: '6px !important', sm: '8px !important' },
              px: { xs: 2, sm: 0 }
            }}
          >
            {[
              { label: 'Gần trường ĐH', filter: 'nearUniversity=true' },
              { label: 'Dưới 3 triệu', filter: 'maxPrice=3000000' },
              { label: 'Có điều hòa', filter: 'amenity=ac' },
              { label: 'Studio', filter: 'roomType=Studio' },
              { label: 'Khép kín', filter: 'roomType=Khép kín' },
              { label: 'Ở ghép', filter: 'roomType=Ở ghép' },
            ].map(({ label, filter }) => (
              <Chip
                key={label} label={label}
                onClick={() => navigate(`/listings?${filter}`)}
                aria-label={`Lọc: ${label}`}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: T.white, 
                  fontSize: { xs: '0.714rem', sm: '0.786rem' }, 
                  fontWeight: 600,
                  height: { xs: '26px', sm: '28px' }, 
                  borderRadius: '20px',
                  px: { xs: 1, sm: 1.5 },
                  transition: 'all 120ms ease',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.28)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
                }}
              />
            ))}
          </Stack>
        </Container>
      </HeroSection>

      {/* ─── Why Rentify ──────────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="why-heading">
        <SectionHeader><span id="why-heading">Tại sao chọn Rentify?</span></SectionHeader>
        <Grid container spacing={2}>
          {[
            { icon: <VerifiedIcon sx={{ fontSize: 50, color: '#008234' }} />, title: 'Phòng xác thực', desc: '100% phòng được kiểm duyệt trước khi đăng' },
            { icon: <CameraIcon sx={{ fontSize: 50, color: '#f5a623' }} />,    title: 'Ảnh thật 100%', desc: 'Hình ảnh chụp thực tế, không chỉnh sửa' },
            { icon: <ShieldIcon sx={{ fontSize: 50, color: '#c8102e' }} />,    title: 'Chủ nhà uy tín', desc: 'Xác minh danh tính và đánh giá cộng đồng' },
            { icon: <BotIcon sx={{ fontSize: 50, color: '#6a1b9a' }} />,       title: 'AI tư vấn 24/7', desc: 'Trợ lý thông minh tìm phòng siêu nhanh' },
          ].map((item, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box sx={{
                p: 2, backgroundColor: T.blueLt, borderRadius: '8px',
                border: `1px solid ${T.border}`, height: '100%',
                transition: `box-shadow ${T.motion} ease`,
                '&:hover': { boxShadow: T.shadow1 },
              }}>
                <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 0.5 }}>{item.title}</Typography>
                <Typography sx={{ fontSize: '0.857rem', color: T.muted, lineHeight: 1.5 }}>{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* ─── Recommended rooms ────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="recommended-heading">
        <SectionHeader
          action={
            <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate('/listings')}
              sx={{ color: T.blue, fontSize: '0.857rem', fontWeight: 600, p: 0 }}>
              Xem tất cả
            </Button>
          }
        >
          <span id="recommended-heading">Phòng phù hợp với bạn</span>
        </SectionHeader>
        <Typography variant="body2" sx={{ color: T.muted, mb: 2, mt: -1, fontSize: '0.857rem' }}>
          Dựa trên lịch sử xem · ngân sách · khu vực quan tâm
        </Typography>

        {/* Tabs */}
        <Tabs
          value={tabValue} onChange={(_, v) => setTabValue(v)}
          aria-label="Phân loại phòng"
          sx={{ mb: 2, minHeight: '36px',
            '& .MuiTabs-indicator': { height: '2px' },
            '& .MuiTab-root': { minHeight: '36px', padding: '6px 16px', fontSize: '0.857rem' },
          }}
        >
          <Tab label="Tất cả" />
          <Tab label="Còn trống" />
          <Tab label="Đánh giá cao" />
        </Tabs>

        <Grid container spacing={2}>
          {loading
            ? [1,2,3,4,5,6].map(i => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                  <CardSkeleton />
                </Grid>
              ))
            : tabListings.map(listing => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id}>
                  <GridCard
                    onClick={() => navigate(`/room/${listing.id}`)}
                    tabIndex={0}
                    role="article"
                    aria-label={`${listing.title}, ${fmt(listing.price)}đ/tháng`}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/room/${listing.id}`)}
                  >
                    {/* Image */}
                    <Box sx={{ height: 160, position: 'relative', backgroundColor: T.bg }}>
                      {listing.image ? (
                        <Box
                          component="img" src={listing.image} alt={listing.title} loading="lazy"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                            transition: `transform 300ms ease`,
                            '&:hover': { transform: 'scale(1.04)' },
                          }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NoImageIcon sx={{ fontSize: 40, color: T.border }} />
                        </Box>
                      )}
                      {/* Favorite */}
                      <IconButton
                        size="small"
                        onClick={e => toggleFav(listing.id, e)}
                        disabled={favLoading[listing.id]}
                        aria-label={favorites[listing.id] ? 'Bỏ yêu thích' : 'Lưu phòng'}
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(4px)',
                          color: favorites[listing.id] ? '#e91e63' : '#595959',
                          p: '4px',
                          '&:hover': { backgroundColor: T.white, color: '#e91e63' },
                          '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                          '&:disabled': { opacity: 0.6 },
                        }}
                      >
                        {favorites[listing.id]
                          ? <FavoriteIcon sx={{ fontSize: 16 }} />
                          : <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                        }
                      </IconButton>
                      {/* Status */}
                      <StatusBadge status={listing.status} sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                        <StatusDot status={listing.status} />
                        {statusLabel[listing.status]}
                      </StatusBadge>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 1.5 }}>
                      <Typography sx={{
                        fontWeight: 700, fontSize: '0.857rem', color: T.text, mb: 0.5,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {listing.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 12, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.buildingName || 'Chưa cập nhật'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <RulerIcon sx={{ fontSize: 12, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{listing.area}m²</Typography>
                      </Stack>
                      {/* Price + score */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.blue }}>
                            {fmt(listing.price)}đ
                          </Typography>
                          <Typography component="span" sx={{ fontSize: '0.786rem', color: T.muted }}>/tháng</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScoreBadge>{listing.rating}</ScoreBadge>
                          <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>({listing.reviews})</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </GridCard>
                </Grid>
              ))
          }
        </Grid>
        </Container>
      </Box>

      {/* ─── Search by district ───────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="district-heading">
          <SectionHeader>
            <span id="district-heading">Tìm theo quận</span>
          </SectionHeader>
          <Grid container spacing={2}>
            {loadingDistricts
              ? [1,2,3,4].map(i => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Skeleton variant="rectangular" sx={{ borderRadius: '8px', height: 140 }} animation="wave" />
                  </Grid>
                ))
              : districts.slice(0, 4).map(d => (
                  <Grid item xs={6} sm={3} key={d.name}>
                    <Box
                      onClick={() => navigate(`/listings?district=${encodeURIComponent(d.name)}`)}
                      tabIndex={0} role="article"
                      aria-label={`${d.name}: ${d.rooms} phòng`}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/listings?district=${encodeURIComponent(d.name)}`)}
                      sx={{
                        position: 'relative', height: 140, borderRadius: '8px', overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover .district-img': { transform: 'scale(1.06)' },
                        '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                      }}
                    >
                      <Box
                        className="district-img"
                        component="img" src={d.image} alt={d.name} loading="lazy"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
                      />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                      <Box sx={{ position: 'absolute', bottom: 10, left: 12 }}>
                        <Typography sx={{ color: T.white, fontWeight: 700, fontSize: '0.929rem' }}>{d.name}</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.786rem' }}>{d.rooms} phòng</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))
            }
          </Grid>
        </Container>
      </Box>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section">
          <SectionHeader><span>Quy trình đặt phòng</span></SectionHeader>
          <Grid container spacing={2}>
            {howItWorks.map((step, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
                  {/* Number + icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: T.blueLt, color: T.blue,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.857rem', flexShrink: 0,
                    }}>
                      {step.step}
                    </Box>
                    <Box sx={{ fontSize: '1.714rem' }}>{step.icon}</Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 0.25 }}>{step.title}</Typography>
                    <Typography sx={{ fontSize: '0.857rem', color: T.muted, lineHeight: 1.5 }}>{step.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Near Universities ─────────────────────────────────────────────── */}
      <NearUniversities />

      {/* ─── Near Metro Stations ───────────────────────────────────────────── */}
      <NearMetroStations />

      {/* ─── Nearby Amenities ──────────────────────────────────────────────── */}
      <NearbyAmenities />

      {/* ─── Statistics ────────────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-label="Thống kê">
        <Grid container spacing={2}>
          {statistics.map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box sx={{
                p: 2.5, backgroundColor: T.white, borderRadius: '8px',
                border: `1px solid ${T.border}`, textAlign: 'center',
                transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
                '&:hover': { boxShadow: T.shadow1, transform: 'translateY(-2px)' },
              }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.429rem', color: T.text, mb: 0.25 }}>{stat.value}</Typography>
                <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* ─── CTA cards ────────────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section">
          <Grid container spacing={2}>
            {[
              { icon: '🗺️', title: 'Xem phòng trên bản đồ',
                desc: 'Tìm phòng theo vị trí, khoảng cách đến trường, công ty, bệnh viện',
                btn: 'Khám phá bản đồ', btnColor: '#006ce4', onClick: () => navigate('/listings') },
              { icon: '👥', title: 'Tìm bạn ở ghép',
                desc: 'Kết nối người có cùng sở thích, tiết kiệm chi phí, an toàn hơn',
                btn: 'Tìm bạn ngay', btnColor: '#6a1b9a', onClick: () => navigate('/roommate') },
              { icon: <TruckIcon sx={{ fontSize: 40, color: '#ff6b35' }} />, title: 'Dịch vụ vận chuyển',
                desc: 'Hỗ trợ chuyển nhà, vận chuyển đồ đạc nhanh chóng, giá tốt',
                btn: 'Đặt dịch vụ ngay', btnColor: '#ff6b35', btnTextColor: T.white,
                onClick: () => navigate('/moving-service') },
              { icon: '🏠', title: 'Bạn là chủ nhà?',
                desc: 'Đăng tin miễn phí, tiếp cận hàng nghìn người thuê đang tìm kiếm',
                btn: 'Đăng phòng miễn phí', btnColor: '#f5a623', btnTextColor: T.white,
                onClick: () => window.location.href = 'http://localhost:3333/login' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{
                  p: 3, borderRadius: '8px', border: `1px solid ${T.border}`,
                  height: '100%', display: 'flex', flexDirection: 'column', gap: 2,
                  transition: `box-shadow ${T.motion} ease`,
                  '&:hover': { boxShadow: T.shadow1 },
                }}>
                  <Box sx={{ fontSize: '1.714rem' }}>{item.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 0.5 }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '0.857rem', color: T.muted, lineHeight: 1.6 }}>{item.desc}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={item.onClick}
                    aria-label={item.btn}
                    sx={{
                      backgroundColor: item.btnColor,
                      color: item.btnTextColor || T.white,
                      '&:hover': { backgroundColor: item.btnColor, filter: 'brightness(0.9)' },
                      borderRadius: '4px', fontWeight: 700, fontSize: '0.857rem',
                    }}
                  >
                    {item.btn}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── AI Chat FAB ──────────────────────────────────────────────────── */}
      <Tooltip title="Hỏi AI về phòng trọ" placement="left">
        <Fab
          onClick={() => setChatOpen(!chatOpen)}
          size="medium" aria-label={chatOpen ? 'Đóng chat AI' : 'Mở chat AI'}
          sx={{
            position: 'fixed', bottom: 100, right: 32, zIndex: 9998,
            backgroundColor: T.blue, color: T.white, width: 48, height: 48,
            '&:hover': { backgroundColor: T.blueDk },
            '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
            boxShadow: 'rgba(0,108,228,0.4) 0px 4px 20px',
          }}
        >
          {chatOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <ChatIcon sx={{ fontSize: 22 }} />}
        </Fab>
      </Tooltip>

      {chatOpen && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: { xs: 100, sm: 63 }, 
          right: { xs: 20, sm: 32, md: 90 }, 
          zIndex: 9999 
        }}>
          <AIChatWidget
            apiUrl={import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'}
            tenantBackendUrl={API_URL}
            onClose={() => setChatOpen(false)}
            userId={localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).accountId : null}
            authToken={localStorage.getItem('token')}
          />
        </Box>
      )}

      {/* Snackbar for favorite actions */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '0.929rem', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}