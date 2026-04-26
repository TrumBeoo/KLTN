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
  IconButton, Tabs, Tab, Skeleton, Fab, Tooltip, Accordion,
  AccordionSummary, AccordionDetails,
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
  ExpandMore as ExpandMoreIcon,
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 4, height: 24, backgroundColor: T.blue, borderRadius: '2px' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1.143rem', color: T.text }}>{children}</Typography>
      </Box>
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
  const [expandedFaq, setExpandedFaq]     = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const statistics = [
    { value: '10.000+', label: 'Phòng trọ đăng ký',  icon: <HomeIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '5.000+',  label: 'Người dùng',          icon: <PeopleIcon sx={{ fontSize: 32, color: T.blue }} /> },
    { value: '98%',     label: 'Hài lòng',             icon: <StarIcon sx={{ fontSize: 32, color: T.yellow }} /> },
    { value: '24/7',    label: 'Hỗ trợ AI',            icon: <BotIcon sx={{ fontSize: 32, color: T.blue }} /> },
  ]

  const howItWorks = [
    { step: 1, icon: <SearchIcon sx={{ fontSize: 28, color: T.blue }} />, title: 'Tìm phòng', desc: 'Tìm kiếm theo khu vực, ngân sách và tiện nghi' },
    { step: 2, icon: <CalendarIcon sx={{ fontSize: 28, color: T.blue }} />, title: 'Đặt lịch xem', desc: 'Chọn khung giờ thuận tiện để đến tận nơi' },
    { step: 3, icon: <EyeIcon sx={{ fontSize: 28, color: T.blue }} />, title: 'Xem phòng', desc: 'Gặp chủ nhà, kiểm tra thực tế' },
    { step: 4, icon: <CheckIcon sx={{ fontSize: 28, color: T.blue }} />, title: 'Thuê phòng', desc: 'Ký hợp đồng và dọn vào ở ngay' },
  ]

  const faqs = [
    { q: 'Làm sao để đặt lịch xem phòng?', a: 'Chọn phòng yêu thích → nhấn "Đặt lịch xem" → chọn ngày giờ. Chủ nhà xác nhận trong 24 giờ.' },
    { q: 'Có mất phí khi sử dụng không?', a: 'Hoàn toàn miễn phí cho người thuê. Bạn chỉ trả tiền thuê trực tiếp cho chủ nhà.' },
    { q: 'Thông tin phòng có đáng tin không?', a: '100% phòng được xác thực và kiểm duyệt. Chủ nhà phải cung cấp hình ảnh thật và thông tin chính xác.' },
    { q: 'Tìm bạn ở ghép như thế nào?', a: 'Vào mục "Ở ghép", tạo profile và AI sẽ gợi ý người phù hợp về lối sống, ngân sách, khu vực.' },
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
            { icon: <VerifiedIcon sx={{ fontSize: 28, color: T.blue }} />, title: 'Phòng xác thực', desc: '100% phòng được kiểm duyệt trước khi đăng' },
            { icon: <CameraIcon sx={{ fontSize: 28, color: T.blue }} />,    title: 'Ảnh thật 100%', desc: 'Hình ảnh chụp thực tế, không chỉnh sửa' },
            { icon: <ShieldIcon sx={{ fontSize: 28, color: T.blue }} />,    title: 'Chủ nhà uy tín', desc: 'Xác minh danh tính và đánh giá cộng đồng' },
            { icon: <BotIcon sx={{ fontSize: 28, color: T.blue }} />,       title: 'AI tư vấn 24/7', desc: 'Trợ lý thông minh tìm phòng siêu nhanh' },
          ].map((item, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box sx={{
                p: 2, backgroundColor: T.white, borderRadius: '8px',
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
                    {step.icon}
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
              { icon: <MapIcon sx={{ fontSize: 32, color: T.blue }} />, title: 'Xem phòng trên bản đồ',
                desc: 'Tìm phòng theo vị trí, khoảng cách đến trường, công ty, bệnh viện',
                btn: 'Khám phá bản đồ', btnColor: T.blue, onClick: () => navigate('/listings') },
              { icon: <PeopleIcon sx={{ fontSize: 32, color: '#008234' }} />, title: 'Tìm bạn ở ghép',
                desc: 'Kết nối người có cùng sở thích, tiết kiệm chi phí, an toàn hơn',
                btn: 'Tìm bạn ngay', btnColor: '#008234', onClick: () => navigate('/roommate') },
              { icon: <HomeIcon sx={{ fontSize: 32, color: T.yellow }} />, title: 'Bạn là chủ nhà?',
                desc: 'Đăng tin miễn phí, tiếp cận hàng nghìn người thuê đang tìm kiếm',
                btn: 'Đăng phòng miễn phí', btnColor: T.yellow, btnTextColor: T.text,
                onClick: () => window.location.href = 'http://localhost:3333/login' },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{
                  p: 3, borderRadius: '8px', border: `1px solid ${T.border}`,
                  height: '100%', display: 'flex', flexDirection: 'column', gap: 2,
                  transition: `box-shadow ${T.motion} ease`,
                  '&:hover': { boxShadow: T.shadow1 },
                }}>
                  {item.icon}
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

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg" component="section" aria-labelledby="faq-heading">
        <SectionHeader><span id="faq-heading">Câu hỏi thường gặp</span></SectionHeader>
        {faqs.map((faq, i) => (
          <Accordion
            key={i}
            expanded={expandedFaq === i}
            onChange={() => setExpandedFaq(expandedFaq === i ? false : i)}
            sx={{ mb: 1, border: `1px solid ${T.border}`, borderRadius: '4px !important',
              '&:before': { display: 'none' }, boxShadow: 'none' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: T.blue }} />}
              aria-controls={`faq-${i}-content`}
              id={`faq-${i}-header`}
              sx={{ '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                '& .MuiAccordionSummary-content': { my: 1.5 } }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.929rem', color: T.text }}>{faq.q}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted, lineHeight: 1.6 }}>{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
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