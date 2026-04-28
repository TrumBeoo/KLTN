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
  IconButton, Tabs, Tab, Skeleton, Fab, Tooltip,
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
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import AIChatWidget from '../components/AIChatWidget'

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

/** Hero: search-bar style (no full-bleed image — Booking.com uses blue+search) */
const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, #003580 0%, ${T.blue} 50%, #0078cc 100%)`,
  padding: '48px 0 56px',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0, left: 0, right: 0, height: 8,
    background: T.yellow,
  },
})

const HeroSearchBar = styled(Box)({
  display: 'flex',
  alignItems: 'stretch',
  borderRadius: '4px',
  overflow: 'visible',
  backgroundColor: T.yellow,
  padding: '4px',
  gap: '4px',
  boxShadow: 'rgba(0,0,0,0.24) 0px 4px 16px',
})

const SearchSegment = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: T.white,
  borderRadius: '2px',
  padding: '0 12px',
  flex: 1,
  minWidth: 0,
  height: '48px',
  cursor: 'text',
})

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
  const [listings, setListings]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [chatOpen, setChatOpen]           = useState(false)
  const [districts, setDistricts]         = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(true)
  const [selectedMetroLine, setSelectedMetroLine] = useState('2A')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const statistics = [
    { value: '10.000+', label: 'Phòng trọ đăng ký',  icon: <HomeIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '5.000+',  label: 'Người dùng',          icon: <PeopleIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '98%',     label: 'Hài lòng',             icon: <StarIcon sx={{ fontSize: 32, color: T.yellow }} /> },
    { value: '24/7',    label: 'Hỗ trợ AI',            icon: <BotIcon sx={{ fontSize: 32, color: T.blue }} /> },
  ]

  const nearUniversities = [
    {
      name: 'ĐH Bách Khoa Hà Nội',
      distance: 'Trong bán kính 2km',
      rooms: 245,
      badge: '🎓 Sinh viên',
      badgeColor: '#008234',
      tag: 'Đi bộ 10-15 phút',
      tagColor: '#008234',
      priceFrom: '1.800.000',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    },
    {
      name: 'ĐH Ngoại Thương',
      distance: 'Dưới 1.5km',
      rooms: 189,
      badge: 'Phổ biến',
      badgeColor: T.blue,
      priceFrom: '2.200.000',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
    },
    {
      name: 'ĐH Kinh Tế Quốc Dân',
      distance: 'Trong bán kính 1km',
      rooms: 167,
      badge: '⭐ Gần nhất',
      badgeColor: '#c8102e',
      priceFrom: '2.500.000',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
    },
    {
      name: 'ĐH FPT Hà Nội',
      rooms: 134,
      priceFrom: '2.000.000',
      tag: 'Gần khu công nghệ',
      tagColor: T.blue,
      image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300&q=80',
    },
    {
      name: 'ĐH Quốc Gia Hà Nội',
      rooms: 198,
      priceFrom: '1.900.000',
      tag: 'Khu vực Cầu Giấy',
      tagColor: T.muted,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80',
    },
    {
      name: 'Học viện Ngân Hàng',
      rooms: 142,
      priceFrom: '2.300.000',
      tag: 'An ninh tốt',
      tagColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=300&q=80',
    },
  ]

  const metroLine2A = [
    {
      name: 'Ga Cát Linh',
      line: 'Tuyến 2A',
      rooms: 245,
      priceAvg: '2.500.000',
      walkTime: '5-10 phút',
      badge: '🚇 Ga đầu',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80',
    },
    {
      name: 'Ga La Thành',
      line: 'Tuyến 2A',
      rooms: 189,
      priceAvg: '2.300.000',
      walkTime: '8-12 phút',
      badge: 'Phổ biến',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1569950593140-9b5b93fd0d86?w=400&q=80',
    },
    {
      name: 'Ga Thái Hà',
      line: 'Tuyến 2A',
      rooms: 167,
      priceAvg: '2.800.000',
      walkTime: '6-10 phút',
      badge: 'Trung tâm',
      badgeColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400&q=80',
    },
    {
      name: 'Ga Láng',
      line: 'Tuyến 2A',
      rooms: 134,
      priceAvg: '2.600.000',
      walkTime: '7-11 phút',
      badge: 'Yên tĩnh',
      badgeColor: T.muted,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
    },
    {
      name: 'Ga Đại học Quốc gia',
      line: 'Tuyến 2A',
      rooms: 198,
      priceAvg: '2.400.000',
      walkTime: '5-8 phút',
      badge: '🎓 Sinh viên',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    },
    {
      name: 'Ga Vành đai 3',
      line: 'Tuyến 2A',
      rooms: 156,
      priceAvg: '2.200.000',
      walkTime: '10-15 phút',
      badge: 'Giá tốt',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&q=80',
    },
    {
      name: 'Ga Thanh Xuân 3',
      line: 'Tuyến 2A',
      rooms: 176,
      priceAvg: '2.300.000',
      walkTime: '8-12 phút',
      badge: 'Tiện lợi',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    },
    {
      name: 'Ga bến xe Hà Đông',
      line: 'Tuyến 2A',
      rooms: 203,
      priceAvg: '2.100.000',
      walkTime: '5-10 phút',
      badge: 'Sầm uất',
      badgeColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    },
    {
      name: 'Ga Hà Đông',
      line: 'Tuyến 2A',
      rooms: 187,
      priceAvg: '2.000.000',
      walkTime: '6-10 phút',
      badge: 'Phổ biến',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    },
    {
      name: 'Ga La Khê',
      line: 'Tuyến 2A',
      rooms: 142,
      priceAvg: '1.900.000',
      walkTime: '10-15 phút',
      badge: 'Rẻ nhất',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    },
    {
      name: 'Ga Văn Khê',
      line: 'Tuyến 2A',
      rooms: 165,
      priceAvg: '1.950.000',
      walkTime: '8-12 phút',
      badge: 'Yên tĩnh',
      badgeColor: T.muted,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
    },
    {
      name: 'Ga bến xe Yên Nghĩa',
      line: 'Tuyến 2A',
      rooms: 128,
      priceAvg: '1.850.000',
      walkTime: '12-18 phút',
      badge: '🚇 Ga cuối',
      badgeColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&q=80',
    },
  ]

  const metroLine3 = [
    {
      name: 'Ga Nhổn',
      line: 'Tuyến 3',
      rooms: 267,
      priceAvg: '2.700.000',
      walkTime: '5-10 phút',
      badge: '🚇 Ga đầu',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&q=80',
    },
    {
      name: 'Ga Cầu Giấy',
      line: 'Tuyến 3',
      rooms: 212,
      priceAvg: '2.900.000',
      walkTime: '6-11 phút',
      badge: 'Trung tâm',
      badgeColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1569950593140-9b5b93fd0d86?w=400&q=80',
    },
    {
      name: 'Ga Bạch Mai',
      line: 'Tuyến 3',
      rooms: 189,
      priceAvg: '2.600.000',
      walkTime: '7-12 phút',
      badge: 'Phổ biến',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400&q=80',
    },
    {
      name: 'Ga Chợ Dừa',
      line: 'Tuyến 3',
      rooms: 156,
      priceAvg: '2.400.000',
      walkTime: '8-13 phút',
      badge: 'Yên tĩnh',
      badgeColor: T.muted,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
    },
    {
      name: 'Ga Giáp Bát',
      line: 'Tuyến 3',
      rooms: 201,
      priceAvg: '2.200.000',
      walkTime: '6-10 phút',
      badge: 'Giá tốt',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    },
    {
      name: 'Ga Bồ Đề',
      line: 'Tuyến 3',
      rooms: 178,
      priceAvg: '2.350.000',
      walkTime: '7-11 phút',
      badge: 'Tiện lợi',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    },
    {
      name: 'Ga Yên Phụ',
      line: 'Tuyến 3',
      rooms: 145,
      priceAvg: '2.150.000',
      walkTime: '9-14 phút',
      badge: 'Yên tĩnh',
      badgeColor: T.muted,
      image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&q=80',
    },
    {
      name: 'Ga Cầu Diễn',
      line: 'Tuyến 3',
      rooms: 192,
      priceAvg: '2.050.000',
      walkTime: '8-12 phút',
      badge: 'Phổ biến',
      badgeColor: T.blue,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    },
    {
      name: 'Ga Tây Mỗ',
      line: 'Tuyến 3',
      rooms: 168,
      priceAvg: '1.950.000',
      walkTime: '10-15 phút',
      badge: 'Giá tốt',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    },
    {
      name: 'Ga Thượng Thanh',
      line: 'Tuyến 3',
      rooms: 154,
      priceAvg: '1.900.000',
      walkTime: '9-13 phút',
      badge: 'Rẻ nhất',
      badgeColor: '#008234',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    },
    {
      name: 'Ga Đông Anh',
      line: 'Tuyến 3',
      rooms: 131,
      priceAvg: '1.800.000',
      walkTime: '11-16 phút',
      badge: '🚇 Ga cuối',
      badgeColor: '#c8102e',
      image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400&q=80',
    },
  ]

  const metroStations = selectedMetroLine === '2A' ? metroLine2A : metroLine3

  const howItWorks = [
    { step: 1, icon: '🔍', title: 'Tìm phòng', desc: 'Tìm kiếm theo khu vực, ngân sách và tiện nghi' },
    { step: 2, icon: '📅', title: 'Đặt lịch xem', desc: 'Chọn khung giờ thuận tiện để đến tận nơi' },
    { step: 3, icon: '👁️', title: 'Xem phòng', desc: 'Gặp chủ nhà, kiểm tra thực tế' },
    { step: 4, icon: '✅', title: 'Thuê phòng', desc: 'Ký hợp đồng và dọn vào ở ngay' },
  ]

  useEffect(() => { fetchRooms(); fetchDistricts() }, [])

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
      }
    } catch {} finally { setLoading(false) }
  }

  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')
  const toggleFav = (id, e) => { e.stopPropagation(); setFavorites(prev => ({ ...prev, [id]: !prev[id] })) }
  const statusLabel = { available: 'Còn trống', pending: 'Chờ duyệt', booked: 'Đã đặt lịch', rented: 'Đã thuê' }

  // Filter for tabs
  const tabListings = listings.filter(l =>
    tabValue === 0 ? true :
    tabValue === 1 ? l.status === 'available' : l.rating >= 4.5
  ).slice(0, 8)

  return (
    <Box sx={{ backgroundColor: T.bg }}>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection role="banner" aria-label="Hero section">
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              color: T.white, textAlign: 'center', mb: 1,
              fontSize: { xs: '1.429rem', md: '2rem' },
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            Tìm phòng trọ lý tưởng tại Hà Nội
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 3, fontSize: '0.929rem' }}>
            Xem bản đồ · Đặt lịch xem · Tìm bạn ở ghép thông minh
          </Typography>

          {/* Search bar — Booking.com style */}
          <HeroSearchBar role="search" aria-label="Tìm kiếm phòng">
            <SearchSegment sx={{ flex: 2 }}>
              <LocationIcon sx={{ fontSize: 20, color: T.muted, mr: 1, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.714rem', color: T.muted, lineHeight: 1 }}>Khu vực</Typography>
                <Typography sx={{ fontSize: '0.857rem', color: T.text, fontWeight: 500 }}>Hà Nội, Việt Nam</Typography>
              </Box>
            </SearchSegment>
            <SearchSegment sx={{ flex: 1 }}>
              <CalendarIcon sx={{ fontSize: 20, color: T.muted, mr: 1, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.714rem', color: T.muted, lineHeight: 1 }}>Nhận phòng</Typography>
                <Typography sx={{ fontSize: '0.857rem', color: T.text, fontWeight: 500 }}>Chọn ngày</Typography>
              </Box>
            </SearchSegment>
            <SearchSegment sx={{ flex: 1 }}>
              <PeopleIcon sx={{ fontSize: 20, color: T.muted, mr: 1, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.714rem', color: T.muted, lineHeight: 1 }}>Số người</Typography>
                <Typography sx={{ fontSize: '0.857rem', color: T.text, fontWeight: 500 }}>1 người</Typography>
              </Box>
            </SearchSegment>
            <Button
              onClick={() => navigate('/listings')}
              variant="contained"
              aria-label="Tìm phòng"
              sx={{
                backgroundColor: T.blue, color: T.white, borderRadius: '2px',
                px: 3, height: '48px', fontSize: '0.929rem', fontWeight: 700,
                whiteSpace: 'nowrap', flexShrink: 0,
                '&:hover': { backgroundColor: T.blueDk },
              }}
            >
              <SearchIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Tìm phòng
            </Button>
          </HeroSearchBar>

          {/* Quick filter chips */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center', flexWrap: 'wrap', gap: '8px !important' }}>
            {['Gần trường ĐH', 'Dưới 3 triệu', 'Có điều hòa', 'Studio', 'Khép kín', 'Ở ghép'].map(label => (
              <Chip
                key={label} label={label}
                onClick={() => navigate('/listings')}
                aria-label={`Lọc: ${label}`}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: T.white, fontSize: '0.786rem', fontWeight: 600,
                  height: '28px', borderRadius: '20px',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
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
                        aria-label={favorites[listing.id] ? 'Bỏ yêu thích' : 'Lưu phòng'}
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(4px)',
                          color: favorites[listing.id] ? T.blue : '#595959',
                          p: '4px',
                          '&:hover': { backgroundColor: T.white, color: T.blue },
                          '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
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
                      onClick={() => navigate('/listings')}
                      tabIndex={0} role="article"
                      aria-label={`${d.name}: ${d.rooms} phòng`}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
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
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="near-universities-heading">
          <SectionHeader
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/listings')}
                sx={{ color: T.blue, fontSize: '0.857rem', fontWeight: 600, p: 0 }}
              >
                Xem tất cả
              </Button>
            }
          >
            <span id="near-universities-heading">Phòng gần trường ĐH</span>
          </SectionHeader>
          <Typography variant="body2" sx={{ color: T.muted, mb: 2, mt: -1, fontSize: '0.857rem' }}>
            Tiện lợi cho sinh viên · Tiết kiệm thời gian di chuyển
          </Typography>

          {/* Grid chính: 1 big card bên trái + 2 small stacked bên phải */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gridTemplateRows: 'auto',
              gap: 1.5,
              mb: 1.5,
            }}
          >
            {/* Big card — span 2 rows */}
            <TrendCard
              sx={{ gridColumn: 1, gridRow: { md: '1 / 3' }, height: { xs: 220, md: 340 } }}
              onClick={() => navigate('/listings')}
              tabIndex={0}
              role="article"
              aria-label={`${nearUniversities[0].name} - ${nearUniversities[0].rooms} phòng`}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
            >
              <Box
                className="trend-img"
                component="img"
                src={nearUniversities[0].image}
                alt={nearUniversities[0].name}
                loading="lazy"
                sx={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transition: 'transform 300ms ease',
                }}
              />
              {/* Gradient overlay */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)',
              }} />
              {/* Badge */}
              <Box sx={{
                position: 'absolute', top: 12, left: 12,
                backgroundColor: nearUniversities[0].badgeColor,
                color: T.white, fontSize: '0.714rem', fontWeight: 700,
                px: 1, py: 0.25, borderRadius: '4px', letterSpacing: '0.03em',
              }}>
                {nearUniversities[0].badge}
              </Box>
              {/* Content */}
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '14px 16px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.286rem', color: T.white, lineHeight: 1.25, mb: 0.25 }}>
                  {nearUniversities[0].name}
                </Typography>
                <Typography sx={{ fontSize: '0.857rem', color: 'rgba(255,255,255,0.85)' }}>
                  {nearUniversities[0].distance} · {nearUniversities[0].rooms} phòng
                </Typography>
                {nearUniversities[0].tag && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: nearUniversities[0].tagColor, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      {nearUniversities[0].tag}
                    </Typography>
                  </Box>
                )}
              </Box>
            </TrendCard>

            {/* Small card 1 */}
            <TrendCard
              sx={{ height: { xs: 160, md: 164 } }}
              onClick={() => navigate('/listings')}
              tabIndex={0}
              role="article"
              aria-label={`${nearUniversities[1].name} - ${nearUniversities[1].rooms} phòng`}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
            >
              <Box
                className="trend-img"
                component="img"
                src={nearUniversities[1].image}
                alt={nearUniversities[1].name}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
              <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: nearUniversities[1].badgeColor, color: T.white, fontSize: '0.714rem', fontWeight: 700, px: 1, py: 0.25, borderRadius: '4px' }}>
                {nearUniversities[1].badge}
              </Box>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{nearUniversities[1].name}</Typography>
                <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>{nearUniversities[1].distance} · {nearUniversities[1].rooms} phòng</Typography>
              </Box>
            </TrendCard>

            {/* Small card 2 */}
            <TrendCard
              sx={{ height: { xs: 160, md: 164 } }}
              onClick={() => navigate('/listings')}
              tabIndex={0}
              role="article"
              aria-label={`${nearUniversities[2].name} - ${nearUniversities[2].rooms} phòng`}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
            >
              <Box
                className="trend-img"
                component="img"
                src={nearUniversities[2].image}
                alt={nearUniversities[2].name}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
              <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: nearUniversities[2].badgeColor, color: T.white, fontSize: '0.714rem', fontWeight: 700, px: 1, py: 0.25, borderRadius: '4px' }}>
                {nearUniversities[2].badge}
              </Box>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{nearUniversities[2].name}</Typography>
                <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>{nearUniversities[2].distance} · {nearUniversities[2].rooms} phòng</Typography>
              </Box>
            </TrendCard>
          </Box>

          {/* Hàng dưới: 3 cards với ảnh full */}
          <Grid container spacing={1.5}>
            {nearUniversities.slice(3, 6).map(d => (
              <Grid item xs={12} sm={4} key={d.name}>
                <TrendCard
                  sx={{ height: { xs: 160, md: 164 } }}
                  onClick={() => navigate('/listings')}
                  tabIndex={0}
                  role="article"
                  aria-label={`${d.name} - từ ${d.priceFrom}đ/tháng`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
                >
                  <Box
                    className="trend-img"
                    component="img"
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{d.name}</Typography>
                    <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>
                      {d.rooms} phòng · từ {d.priceFrom}đ/tháng
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: d.tagColor, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.714rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{d.tag}</Typography>
                    </Box>
                  </Box>
                </TrendCard>
              </Grid>
            ))}
          </Grid>

        </Container>
      </Box>

      {/* ─── Near Metro Stations ───────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="metro-heading">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: T.text }}>Phòng gần tàu điện/Metro</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/listings')}
                sx={{ color: T.blue, fontSize: '0.857rem', fontWeight: 600, p: 0 }}
              >
                Xem tất cả
              </Button>
            </Box>
          </Box>
          
          {/* Metro Line Toggle */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.857rem', color: T.muted, fontWeight: 500 }}>Chọn tuyến:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setSelectedMetroLine('2A')}
                variant={selectedMetroLine === '2A' ? 'contained' : 'outlined'}
                size="small"
                aria-label="Tuyến 2A"
                sx={{
                  borderRadius: '20px',
                  fontSize: '0.857rem',
                  fontWeight: 600,
                  px: 2,
                  backgroundColor: selectedMetroLine === '2A' ? T.blue : 'transparent',
                  color: selectedMetroLine === '2A' ? T.white : T.blue,
                  border: `1px solid ${T.blue}`,
                  '&:hover': {
                    backgroundColor: selectedMetroLine === '2A' ? T.blueDk : T.blueLt,
                  },
                }}
              >
                🚇 Tuyến 2A
              </Button>
              <Button
                onClick={() => setSelectedMetroLine('3')}
                variant={selectedMetroLine === '3' ? 'contained' : 'outlined'}
                size="small"
                aria-label="Tuyến 3"
                sx={{
                  borderRadius: '20px',
                  fontSize: '0.857rem',
                  fontWeight: 600,
                  px: 2,
                  backgroundColor: selectedMetroLine === '3' ? T.blue : 'transparent',
                  color: selectedMetroLine === '3' ? T.white : T.blue,
                  border: `1px solid ${T.blue}`,
                  '&:hover': {
                    backgroundColor: selectedMetroLine === '3' ? T.blueDk : T.blueLt,
                  },
                }}
              >
                🚇 Tuyến 3
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ color: T.muted, mb: 3, mt: -1, fontSize: '0.857rem' }}>
            {selectedMetroLine === '2A' ? 'Tuyến 2A Cát Linh - Hà Đông' : 'Tuyến 3 Nhổn - Đông Anh'} · Di chuyển nhanh · Tiết kiệm thời gian
          </Typography>

          {/* Metro Timeline - Horizontal Scroll */}
          <Box
            sx={{
              position: 'relative',
              overflowX: 'auto',
              overflowY: 'visible',
              pb: 2,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-track': { backgroundColor: T.bg, borderRadius: '3px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: T.border, borderRadius: '3px', '&:hover': { backgroundColor: T.muted } },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 0,
                minWidth: 'max-content',
                position: 'relative',
                pt: 3,
              }}
            >
              {metroStations.map((station, idx) => (
                <Box
                  key={station.name}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    minWidth: 200,
                  }}
                >
                  {/* Metro Line */}
                  {idx < metroStations.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        width: '100%',
                        height: 3,
                        background: `repeating-linear-gradient(to right, ${T.blue} 0px, ${T.blue} 8px, transparent 8px, transparent 16px)`,
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Station Icon */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: T.blue,
                      border: `4px solid ${T.white}`,
                      boxShadow: `0 0 0 2px ${T.blue}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ fontSize: '1rem' }}>🚇</Box>
                  </Box>

                  {/* Station Card */}
                  <Box
                    onClick={() => navigate('/listings')}
                    tabIndex={0}
                    role="article"
                    aria-label={`${station.name} - ${station.rooms} phòng`}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
                    sx={{
                      width: 180,
                      backgroundColor: T.white,
                      border: `1px solid ${T.border}`,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: `all ${T.motion} ease`,
                      '&:hover': {
                        boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
                        transform: 'translateY(-4px)',
                        borderColor: T.blue,
                      },
                      '&:hover .metro-img': { transform: 'scale(1.08)' },
                      '&:focus-visible': {
                        outline: `2px solid ${T.blue}`,
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    {/* Image */}
                    <Box sx={{ height: 100, position: 'relative', overflow: 'hidden', backgroundColor: T.bg }}>
                      <Box
                        className="metro-img"
                        component="img"
                        src={station.image}
                        alt={station.name}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 300ms ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                        }}
                      />
                      {/* Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          backgroundColor: station.badgeColor,
                          color: T.white,
                          fontSize: '0.643rem',
                          fontWeight: 700,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: '3px',
                        }}
                      >
                        {station.badge}
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 1.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.857rem',
                          color: T.text,
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {station.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.714rem',
                          color: T.muted,
                          mb: 1,
                        }}
                      >
                        {station.line}
                      </Typography>

                      {/* Walking time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                        <Box sx={{ fontSize: '0.857rem' }}>🚶</Box>
                        <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>
                          {station.walkTime}
                        </Typography>
                      </Box>

                      {/* Rooms count */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 0.75,
                          borderTop: `1px solid ${T.border}`,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>
                          {station.rooms} phòng
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.786rem',
                            fontWeight: 700,
                            color: T.blue,
                          }}
                        >
                          ~{fmt(station.priceAvg)}đ
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Info note */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: T.blueLt,
              borderRadius: '8px',
              border: `1px solid ${T.blue}20`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ fontSize: '1.286rem', flexShrink: 0, mt: 0.25 }}></Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: T.text, mb: 0.5 }}>
                  Lợi ích khi ở gần ga tàu điện
                </Typography>
                <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.6 }}>
                  Tiết kiệm 30-45 phút di chuyển mỗi ngày · Tránh kẹt xe giờ cao điểm · An toàn và tiện lợi · Giá vé chỉ 8.000-15.000đ/lượt
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── Nearby Amenities ──────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="amenities-heading">
          <SectionHeader>
            <span id="amenities-heading">Tiện ích xung quanh</span>
          </SectionHeader>
          <Typography variant="body2" sx={{ color: T.muted, mb: 3, mt: -1, fontSize: '0.857rem' }}>
            Tìm phòng theo tiện ích sinh hoạt hàng ngày · Thuận tiện cho cuộc sống
          </Typography>

          <Grid container spacing={2}>
            {[
              {
                icon: '🏪',
                title: 'Gần siêu thị',
                desc: 'Circle K, Mini Stop, VinMart',
                rooms: 342,
                color: '#008234',
                image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80',
              },
              {
                icon: '🏥',
                title: 'Gần bệnh viện',
                desc: 'Phòng khám, bệnh viện',
                rooms: 218,
                color: '#c8102e',
                image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
              },
              {
                icon: '🍜',
                title: 'Gần chợ/quán ăn',
                desc: 'Chợ, khu ẩm thực',
                rooms: 456,
                color: '#f5a623',
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
              },
              {
                icon: '💪',
                title: 'Gần gym/thể thao',
                desc: 'Phòng gym, sân thể thao',
                rooms: 187,
                color: T.blue,
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
              },
              {
                icon: '🏦',
                title: 'Gần ngân hàng',
                desc: 'ATM, chi nhánh ngân hàng',
                rooms: 298,
                color: '#6a1b9a',
                image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&q=80',
              },
              {
                icon: '☕',
                title: 'Gần cafe/coworking',
                desc: 'Quán cafe, không gian làm việc',
                rooms: 265,
                color: '#5d4037',
                image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
              },
            ].map((item, i) => (
              <Grid item xs={6} md={4} key={i}>
                <Box
                  onClick={() => navigate('/listings')}
                  tabIndex={0}
                  role="article"
                  aria-label={`${item.title} - ${item.rooms} phòng`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/listings')}
                  sx={{
                    position: 'relative',
                    height: { xs: 180, md: 200 },
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `1px solid ${T.border}`,
                    transition: `all ${T.motion} ease`,
                    '&:hover': {
                      boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
                      transform: 'translateY(-4px)',
                    },
                    '&:hover .amenity-img': { transform: 'scale(1.08)' },
                    '&:focus-visible': {
                      outline: `2px solid ${T.blue}`,
                      outlineOffset: '2px',
                    },
                  }}
                >
                  {/* Background Image */}
                  <Box
                    className="amenity-img"
                    component="img"
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 300ms ease',
                    }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    }}
                  />

                  {/* Icon Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.714rem',
                      boxShadow: 'rgba(0,0,0,0.15) 0px 2px 8px',
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Content */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: '12px 14px',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: T.white,
                        mb: 0.25,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.786rem',
                        color: 'rgba(255,255,255,0.85)',
                        mb: 0.75,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.desc}
                    </Typography>

                    {/* Rooms Badge */}
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: T.white,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.786rem',
                          fontWeight: 600,
                          color: T.white,
                        }}
                      >
                        {item.rooms} phòng
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Info note */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: '#fff9e6',
              borderRadius: '8px',
              border: '1px solid #febb0220',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ fontSize: '1.286rem', flexShrink: 0, mt: 0.25 }}></Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: T.text, mb: 0.5 }}>
                  Mẹo chọn phòng theo tiện ích
                </Typography>
                <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.6 }}>
                  Ưu tiên chọn phòng gần siêu thị và chợ để mua sắm hàng ngày · Gần bệnh viện/phòng khám giúp an tâm khi cần khám chữa bệnh · Khu vực có nhiều quán ăn tiết kiệm thời gian nấu nướng · Gym và cafe phù hợp với người trẻ năng động
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

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
              { icon: '🏠', title: 'Bạn là chủ nhà?',
                desc: 'Đăng tin miễn phí, tiếp cận hàng nghìn người thuê đang tìm kiếm',
                btn: 'Đăng phòng miễn phí', btnColor: '#f5a623', btnTextColor: T.white,
                onClick: () => window.location.href = 'http://localhost:3333/login' },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
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
        <Box sx={{ position: 'fixed', bottom: 80, right: 90, zIndex: 9999 }}>
          <AIChatWidget
            apiUrl={import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'}
            onClose={() => setChatOpen(false)}
          />
        </Box>
      )}
    </Box>
  )
}