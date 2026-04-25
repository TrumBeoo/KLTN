import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, Container, Typography, Button, Grid, Card, CardMedia,
  CardContent, Chip, Stack, IconButton, Tabs, Tab, Skeleton, Fab, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import {
  Star as StarIcon, LocationOn as LocationIcon, Straighten as RulerIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Map as MapIcon,
  Group as PeopleIcon, Visibility as EyeIcon, AccessTime as ClockIcon,
  ImageNotSupported as NoImageIcon, Verified as VerifiedIcon, CameraAlt as CameraIcon,
  Security as ShieldIcon, SmartToy as BotIcon, Home as HomeIcon, Chat as ChatIcon,
  Search as SearchIcon, CalendarToday as CalendarIcon, CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon, ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import AIChatWidget from '../components/AIChatWidget'

// Design System Tokens
const tokens = {
  font: {
    size: { xs: 14, sm: 16, md: 20, lg: 23, xl: 24 },
    weight: { base: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { base: 1.43 },
  },
  space: { 1: 2, 2: 4, 3: 5, 4: 8, 5: 11, 6: 12, 7: 16, 8: 32 },
  radius: { xs: 4, sm: 8, md: 50, lg: 9999 },
  shadow: {
    1: 'rgba(26, 26, 26, 0.16) 0px 2px 8px 0px',
    2: 'rgb(170, 170, 170) 0px 0px 3px 0px',
  },
  motion: { instant: '120ms' },
  color: {
    primary: '#4A90E2',
    primaryHover: '#2E5C8A',
    text: { primary: '#1a1a1a', secondary: '#595959', tertiary: '#6a6a6a' },
    surface: { base: '#ffffff', muted: '#f7f7f7' },
  },
}

const HeroSection = styled(Box)({
  backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('img/5.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: `${tokens.space[8] * 3}px 0`,
  textAlign: 'center',
  color: 'white',
})

const RoomCard = styled(Box)({
  cursor: 'pointer',
  borderRadius: `${tokens.radius.sm}px`,
  overflow: 'hidden',
  backgroundColor: tokens.color.surface.base,
  boxShadow: tokens.shadow[1],
  transition: `all ${tokens.motion.instant} ease`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 'rgba(26, 26, 26, 0.24) 0px 8px 24px 0px',
  },
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary}`,
    outlineOffset: '2px',
  },
})

const ImageWrapper = styled(Box)({
  borderRadius: `${tokens.radius.sm}px ${tokens.radius.sm}px 0 0`,
  overflow: 'hidden',
  aspectRatio: '20/13',
  position: 'relative',
  backgroundColor: tokens.color.surface.muted,
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: `transform 400ms ease`,
    display: 'block',
  },
  '&:hover img': {
    transform: 'scale(1.08)',
  },
})

const StatusDot = styled(Box)(({ status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor:
    status === 'available' ? '#5CB85C' :
    status === 'pending' ? '#F0AD4E' :
    status === 'booked' ? '#5BC0DE' : '#c13515',
  flexShrink: 0,
}))

const LocationCard = styled(Box)({
  cursor: 'pointer',
  borderRadius: `${tokens.radius.sm}px`,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: tokens.shadow[1],
  transition: `all ${tokens.motion.instant} ease`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 'rgba(26, 26, 26, 0.24) 0px 8px 24px 0px',
  },
  '&:hover img': {
    transform: 'scale(1.1)',
  },
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.primary}`,
    outlineOffset: '2px',
  },
})

function RoomCardSkeleton() {
  return (
    <Box>
      <Skeleton 
        variant="rectangular" 
        sx={{ borderRadius: `${tokens.radius.sm}px`, aspectRatio: '20/13', width: '100%', mb: 1.5 }} 
        animation="wave" 
      />
      <Skeleton variant="text" width="80%" height={22} />
      <Skeleton variant="text" width="50%" height={18} />
      <Skeleton variant="text" width="40%" height={24} />
    </Box>
  )
}

export default function HomePage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [favorites, setFavorites] = useState({})
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [districts, setDistricts] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // Mock data for new sections
  const statistics = [
    { value: '10,000+', label: 'Phòng trọ', icon: <HomeIcon sx={{ fontSize: 40, color: tokens.color.primary }} /> },
    { value: '5,000+', label: 'Người dùng', icon: <PeopleIcon sx={{ fontSize: 40, color: tokens.color.primary }} /> },
    { value: '98%', label: 'Hài lòng', icon: <StarIcon sx={{ fontSize: 40, color: tokens.color.primary }} /> },
    { value: '24/7', label: 'Hỗ trợ', icon: <BotIcon sx={{ fontSize: 40, color: tokens.color.primary }} /> },
  ]

  const howItWorks = [
    { step: 1, icon: <SearchIcon sx={{ fontSize: 48 }} />, title: 'Tìm phòng', desc: 'Tìm kiếm phòng phù hợp với nhu cầu và ngân sách của bạn' },
    { step: 2, icon: <CalendarIcon sx={{ fontSize: 48 }} />, title: 'Đặt lịch xem', desc: 'Chọn thời gian thuận tiện để xem phòng trực tiếp' },
    { step: 3, icon: <EyeIcon sx={{ fontSize: 48 }} />, title: 'Xem phòng', desc: 'Gặp chủ nhà và kiểm tra phòng trọ thực tế' },
    { step: 4, icon: <CheckIcon sx={{ fontSize: 48 }} />, title: 'Thuê phòng', desc: 'Hoàn tất thủ tục và bắt đầu ở ngay' },
  ]

  const faqs = [
    { q: 'Làm sao để đặt lịch xem phòng?', a: 'Bạn chỉ cần chọn phòng yêu thích, nhấn "Đặt lịch xem" và chọn thời gian phù hợp. Chủ nhà sẽ xác nhận lịch hẹn qua email hoặc điện thoại.' },
    { q: 'Có mất phí khi sử dụng dịch vụ không?', a: 'Hoàn toàn miễn phí! Rentify không thu bất kỳ khoản phí nào từ người thuê phòng. Bạn chỉ trả tiền thuê trực tiếp cho chủ nhà.' },
    { q: 'Tôi có thể tin tưởng thông tin phòng trên Rentify?', a: '100% phòng trên Rentify đều được xác thực và kiểm duyệt. Chúng tôi yêu cầu chủ nhà cung cấp hình ảnh thật và thông tin chính xác.' },
    { q: 'Nếu không hài lòng với phòng đã đặt thì sao?', a: 'Bạn có thể hủy lịch xem phòng bất cứ lúc nào trước giờ hẹn. Nếu đã thuê, vui lòng trao đổi trực tiếp với chủ nhà về chính sách hủy.' },
    { q: 'Làm sao để tìm bạn ở ghép?', a: 'Truy cập mục "Tìm bạn ở ghép", tạo profile của bạn và hệ thống AI sẽ gợi ý những người phù hợp về sở thích, lối sống và ngân sách.' },
  ]

  useEffect(() => { 
    fetchRooms()
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true)
      const response = await fetch(`${API_URL}/locations/districts-with-stats`)
      const data = await response.json()
      if (data.success) {
        const formattedDistricts = data.data.map(district => {
          let imageUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
          if (district.ImageURL) {
            const imgUrl = district.ImageURL
            if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
              imageUrl = imgUrl
            } else {
              imageUrl = `${API_URL.replace('/api', '')}${imgUrl}`
            }
          }
          return {
            name: district.District,
            rooms: district.RoomCount,
            image: imageUrl,
          }
        })
        setDistricts(formattedDistricts)
      }
    } catch (error) {
      console.error('Fetch districts error:', error)
      // Fallback to mock data
      setDistricts([
        { name: 'Cầu Giấy', rooms: 245, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' },
        { name: 'Hà Đông', rooms: 189, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
        { name: 'Thanh Xuân', rooms: 312, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
        { name: 'Nam Từ Liêm', rooms: 276, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
      ])
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/rooms?limit=10`)
      const data = await response.json()
      if (data.success) {
        const formattedRooms = data.data.map(room => {
          let imageUrl = null
          if (room.images && room.images.length > 0) {
            const imgUrl = room.images[0].ImageURL
            // If URL is already a full URL (http/https), use it directly
            if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
              imageUrl = imgUrl
            } else {
              // Otherwise, treat as local path
              imageUrl = `${API_URL.replace('/api', '')}${imgUrl}`
            }
          }
          return {
            id: room.RoomID,
            title: `${room.RoomType} - ${room.RoomCode}`,
            location: room.BuildingAddress || 'Địa chỉ chưa cập nhật',
            price: room.Price?.toString() || '0',
            area: room.Area || 0,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 1,
            image: imageUrl,
            status: (room.DisplayStatus || room.Status) === 'available' ? 'available' :
                    (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'pending' :
                    (room.DisplayStatus || room.Status) === 'viewing' ? 'booked' : 'rented',
            views: Math.floor(Math.random() * 1000) + 100,
            landlordName: room.LandlordName,
            buildingName: room.BuildingName,
          }
        })
        setListings(formattedRooms)
      }
    } catch (error) {
      console.error('Fetch rooms error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    const numPrice = Math.floor(parseFloat(price))
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const toggleFavorite = (id, e) => {
    e.stopPropagation()
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const statusLabel = {
    available: 'Còn trống',
    pending: 'Chờ duyệt',
    booked: 'Đã đặt lịch',
    rented: 'Đã thuê',
  }

  return (
    <Box sx={{ backgroundColor: tokens.color.surface.base }}>
      {/* Hero Section */}
      <HeroSection role="banner" aria-label="Hero section">
        <Container maxWidth="md">
          <Typography 
            variant="h1" 
            sx={{ 
              color: 'white', 
              mb: tokens.space[7] / 8, 
              fontWeight: tokens.font.weight.bold, 
              fontSize: { xs: `${tokens.font.size.md}px`, md: `${tokens.font.size.xl}px` },
              lineHeight: 1.2,
            }}
          >
            Tìm chung cư mini tại Hà Nội
          </Typography>
          <Typography 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: tokens.space[8] / 8, 
              fontSize: `${tokens.font.size.sm}px`, 
              fontWeight: tokens.font.weight.base,
            }}
          >
            Xem bản đồ · Đặt lịch xem · Hỗ trợ ở ghép thông minh
          </Typography>

          {/* Quick Filters */}
          <Box sx={{ mb: tokens.space[8] / 8, overflow: 'hidden' }} role="navigation" aria-label="Quick filters">
            <Stack 
              direction="row" 
              spacing={tokens.space[6] / 8} 
              sx={{ 
                justifyContent: 'center',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none'
              }}
            >
            {['🏫 Gần trường', '💰 Dưới 3 triệu', '❄️ Có điều hòa', '🏠 Studio', '🚪 Khép kín', '👥 Ở ghép'].map(label => (
              <Chip
                key={label}
                label={label}
                onClick={() => navigate('/listings')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate('/listings')
                  }
                }}
                tabIndex={0}
                aria-label={`Filter: ${label}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.38)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  fontWeight: tokens.font.weight.medium,
                  fontSize: `${tokens.font.size.xs}px`,
                  height: 30,
                  px: tokens.space[6] / 8,
                  borderRadius: `${tokens.radius.md}px`,
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    boxShadow: 'rgba(0,0,0,0.2) 0px 4px 12px',
                    border: '1px solid rgba(255,255,255,0.4)'
                  },
                  '&:focus-visible': {
                    outline: '2px solid white',
                    outlineOffset: '2px',
                  },
                  transition: `all ${tokens.motion.instant} cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
              />
            ))}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={tokens.space[7] / 8} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<MapIcon />}
              tabIndex={0}
              aria-label="Xem phòng trên bản đồ"
              sx={{ 
                backgroundColor: tokens.color.primary, 
                '&:hover': { backgroundColor: tokens.color.primaryHover }, 
                px: tokens.space[8] / 8, 
                py: tokens.space[6] / 8, 
                borderRadius: `${tokens.radius.sm}px`, 
                fontWeight: tokens.font.weight.semibold,
                '&:focus-visible': {
                  outline: '2px solid white',
                  outlineOffset: '2px',
                },
              }}
            >
              Xem phòng trên bản đồ
            </Button>
            <Button
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/roommate')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/roommate')
                }
              }}
              tabIndex={0}
              aria-label="Tìm bạn ở ghép"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                color: tokens.color.text.primary, 
                '&:hover': { backgroundColor: '#ffffff' }, 
                px: tokens.space[8] / 8, 
                py: tokens.space[6] / 8, 
                borderRadius: `${tokens.radius.sm}px`, 
                fontWeight: tokens.font.weight.semibold,
                '&:focus-visible': {
                  outline: '2px solid white',
                  outlineOffset: '2px',
                },
              }}
            >
              Tìm bạn ở ghép
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Recommended Rooms */}
      <Container maxWidth="lg" sx={{ py: tokens.space[8] / 8 }} component="section" aria-labelledby="recommended-rooms">
        <Box sx={{ mb: tokens.space[8] / 8 }}>
          <Typography 
            id="recommended-rooms"
            variant="h2" 
            sx={{ 
              fontWeight: tokens.font.weight.bold, 
              mb: tokens.space[4] / 8, 
              fontSize: `${tokens.font.size.md}px`,
              color: tokens.color.text.primary,
            }}
          >
            Phòng phù hợp với bạn
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: tokens.color.text.tertiary, fontSize: `${tokens.font.size.xs}px` }}
          >
            Dựa trên lịch sử xem · ngân sách · khu vực quan tâm
          </Typography>
        </Box>

        <Grid container spacing={tokens.space[7] / 8}>
          {loading
            ? [1, 2, 3, 4].map(i => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <RoomCardSkeleton />
                </Grid>
              ))
            : listings.slice(0, 4).map(listing => (
                <Grid item xs={12} sm={6} md={3} key={listing.id}>
                  <RoomCard 
                    onClick={() => navigate(`/room/${listing.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/room/${listing.id}`)
                      }
                    }}
                    tabIndex={0}
                    role="article"
                    aria-label={`Phòng ${listing.buildingName || listing.title}, giá ${formatPrice(listing.price)} đồng mỗi tháng`}
                  >
                    <ImageWrapper>
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={`Hình ảnh phòng ${listing.title}`}
                          onError={e => { e.target.style.display = 'none' }}
                          loading="lazy"
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: tokens.color.surface.muted,
                          }}
                          role="img"
                          aria-label="Không có hình ảnh"
                        >
                          <NoImageIcon sx={{ fontSize: 48, color: '#c1c1c1' }} />
                        </Box>
                      )}
                      {/* Gradient Overlay */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.2) 100%)',
                          pointerEvents: 'none',
                        }} 
                      />
                      {/* Favorite */}
                      <IconButton
                        size="small"
                        onClick={e => toggleFavorite(listing.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(listing.id, e)
                          }
                        }}
                        aria-label={favorites[listing.id] ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        sx={{ 
                          position: 'absolute', 
                          top: tokens.space[4], 
                          right: tokens.space[4], 
                          color: favorites[listing.id] ? tokens.color.primary : 'rgba(255,255,255,0.85)', 
                          p: tokens.space[3] / 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(4px)',
                          '&:hover': { 
                            color: favorites[listing.id] ? tokens.color.primaryHover : tokens.color.primary,
                            backgroundColor: 'rgba(255,255,255,1)',
                            transform: 'scale(1.1)',
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${tokens.color.primary}`,
                            outlineOffset: '2px',
                          },
                          transition: `all ${tokens.motion.instant}`,
                        }}
                      >
                        {favorites[listing.id] ? 
                          <FavoriteIcon sx={{ fontSize: `${tokens.font.size.sm}px` }} /> : 
                          <FavoriteBorderIcon sx={{ fontSize: `${tokens.font.size.sm}px` }} />
                        }
                      </IconButton>
                    </ImageWrapper>
                    {/* Card Info */}
                    <Box sx={{ p: tokens.space[6] / 8 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: tokens.space[2] / 8 }}>
                        <Typography 
                          sx={{ 
                            fontWeight: tokens.font.weight.semibold, 
                            fontSize: `${tokens.font.size.sm}px`, 
                            color: tokens.color.text.primary, 
                            flex: 1, 
                            mr: 1, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {listing.buildingName || listing.title}
                        </Typography>
                        <Stack direction="row" spacing={tokens.space[2] / 8} alignItems="center" sx={{ flexShrink: 0 }}>
                          <StarIcon sx={{ fontSize: `${tokens.font.size.xs}px`, color: tokens.color.text.primary }} />
                          <Typography sx={{ fontSize: `${tokens.font.size.xs}px`, fontWeight: tokens.font.weight.medium, color: tokens.color.text.primary }}>
                            {listing.rating}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={tokens.space[2] / 8} sx={{ mb: tokens.space[2] / 8 }}>
                        <StatusDot status={listing.status} aria-hidden="true" />
                        <Typography 
                          variant="body2" 
                          sx={{ color: tokens.color.text.tertiary, fontSize: `${tokens.font.size.xs}px` }}
                        >
                          {statusLabel[listing.status]} · {listing.area}m²
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: `${tokens.font.size.sm}px`, color: tokens.color.text.primary }}>
                        <Box component="span" sx={{ fontWeight: tokens.font.weight.semibold }}>{formatPrice(listing.price)}đ</Box>
                        <Box component="span" sx={{ color: tokens.color.text.tertiary, fontWeight: tokens.font.weight.base }}>/tháng</Box>
                      </Typography>
                    </Box>
                  </RoomCard>
                </Grid>
              ))
          }
        </Grid>

        {!loading && (
          <Box sx={{ textAlign: 'center', mt: tokens.space[8] / 8 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/listings')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/listings')
                }
              }}
              tabIndex={0}
              aria-label="Xem tất cả phòng"
              sx={{ 
                borderColor: tokens.color.text.primary, 
                color: tokens.color.text.primary, 
                borderRadius: `${tokens.radius.sm}px`, 
                px: tokens.space[8] / 8, 
                py: tokens.space[6] / 8, 
                fontWeight: tokens.font.weight.semibold, 
                '&:hover': { 
                  backgroundColor: tokens.color.surface.muted,
                  borderColor: tokens.color.text.primary,
                },
                '&:focus-visible': {
                  outline: `2px solid ${tokens.color.primary}`,
                  outlineOffset: '2px',
                },
              }}
            >
              Xem tất cả phòng
            </Button>
          </Box>
        )}
      </Container>

      {/* Featured Tabs Section */}
      <Box sx={{ backgroundColor: tokens.color.surface.muted, py: tokens.space[8] / 8 }} component="section" aria-labelledby="featured-rooms">
        <Container maxWidth="lg">
          <Grid container spacing={tokens.space[8] / 8}>
            {/* Left: Featured Rooms */}
            <Grid item xs={12} md={8}>
              <Typography 
                id="featured-rooms"
                variant="h2" 
                sx={{ 
                  fontWeight: tokens.font.weight.bold, 
                  mb: tokens.space[4] / 8, 
                  fontSize: `${tokens.font.size.md}px`,
                  color: tokens.color.text.primary,
                }}
              >
                Phòng nổi bật
              </Typography>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                aria-label="Featured rooms tabs"
                sx={{ 
                  mb: tokens.space[8] / 8, 
                  '& .MuiTabs-indicator': { backgroundColor: tokens.color.text.primary },
                  '& .MuiTab-root': { 
                    color: tokens.color.text.tertiary, 
                    fontWeight: tokens.font.weight.medium,
                    fontSize: `${tokens.font.size.xs}px`,
                    '&.Mui-selected': { 
                      color: tokens.color.text.primary, 
                      fontWeight: tokens.font.weight.semibold,
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${tokens.color.primary}`,
                      outlineOffset: '2px',
                    },
                  },
                }}
              >
                <Tab label="Được xem nhiều" disableRipple />
                <Tab label="Còn trống" disableRipple />
                <Tab label="Đánh giá cao" disableRipple />
              </Tabs>

              <Grid container spacing={tokens.space[7] / 8}>
                {listings
                  .filter(l => tabValue === 0 ? l.views > 500 : tabValue === 1 ? l.status === 'available' : l.rating >= 4.5)
                  .slice(0, 6)
                  .map(listing => (
                    <Grid item xs={12} sm={6} key={listing.id}>
                      <Box 
                        onClick={() => navigate(`/room/${listing.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/room/${listing.id}`)
                          }
                        }}
                        tabIndex={0}
                        role="article"
                        aria-label={`Phòng ${listing.buildingName || listing.title}`}
                        sx={{ 
                          position: 'relative', 
                          borderRadius: `${tokens.radius.sm}px`, 
                          overflow: 'hidden', 
                          height: 200,
                          boxShadow: tokens.shadow[1],
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 'rgba(26, 26, 26, 0.24) 0px 8px 24px 0px',
                            transform: 'translateY(-4px)'
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${tokens.color.primary}`,
                            outlineOffset: '2px',
                          },
                          transition: `all ${tokens.motion.instant} cubic-bezier(0.4, 0, 0.2, 1)`,
                        }}
                      >
                          {/* Background Image */}
                          {listing.image ? (
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${listing.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              position: 'absolute', 
                              inset: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              backgroundColor: tokens.color.surface.muted,
                            }}>
                              <NoImageIcon sx={{ fontSize: 48, color: '#c1c1c1' }} />
                            </Box>
                          )}
                          
                          {/* Gradient Overlay */}
                          <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)',
                            pointerEvents: 'none',
                          }} />

                          {/* Top Actions */}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: tokens.space[5], 
                            left: tokens.space[5], 
                            right: tokens.space[5], 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            zIndex: 2,
                            opacity: 0,
                            transform: 'translateY(-8px)',
                            transition: `all ${tokens.motion.instant} cubic-bezier(0.4, 0, 0.2, 1)`,
                            '*:hover > &': {
                              opacity: 1,
                              transform: 'translateY(0)'
                            }
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: tokens.space[2] / 8, 
                              backgroundColor: 'rgba(255,255,255,0.95)', 
                              borderRadius: `${tokens.radius.sm}px`, 
                              px: tokens.space[4] / 8, 
                              py: tokens.space[2] / 8, 
                              backdropFilter: 'blur(8px)',
                              boxShadow: tokens.shadow[1],
                            }}>
                              <EyeIcon sx={{ fontSize: `${tokens.font.size.xs}px`, color: tokens.color.text.tertiary }} />
                              <Typography sx={{ fontSize: `${tokens.font.size.xs - 1}px`, fontWeight: tokens.font.weight.semibold, color: tokens.color.text.primary }}>
                                {listing.views}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={e => toggleFavorite(listing.id, e)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleFavorite(listing.id, e)
                                }
                              }}
                              aria-label={favorites[listing.id] ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.95)', 
                                backdropFilter: 'blur(8px)',
                                color: favorites[listing.id] ? tokens.color.primary : tokens.color.text.tertiary,
                                p: tokens.space[3] / 8,
                                boxShadow: tokens.shadow[1],
                                '&:hover': { 
                                  backgroundColor: 'rgba(255,255,255,1)', 
                                  transform: 'scale(1.15) rotate(10deg)',
                                  color: tokens.color.primary,
                                },
                                '&:focus-visible': {
                                  outline: `2px solid ${tokens.color.primary}`,
                                  outlineOffset: '2px',
                                },
                                transition: `all ${tokens.motion.instant} cubic-bezier(0.4, 0, 0.2, 1)`,
                              }}
                            >
                              {favorites[listing.id] ? 
                                <FavoriteIcon sx={{ fontSize: `${tokens.font.size.sm}px` }} /> : 
                                <FavoriteBorderIcon sx={{ fontSize: `${tokens.font.size.sm}px` }} />
                              }
                            </IconButton>
                          </Box>

                          {/* Bottom Info */}
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            p: tokens.space[7] / 8,
                            zIndex: 2,
                          }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: tokens.space[3] / 8 }}>
                              <Typography sx={{ 
                                fontWeight: tokens.font.weight.bold, 
                                fontSize: `${tokens.font.size.sm}px`, 
                                color: '#ffffff', 
                                flex: 1, 
                                mr: 1,
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {listing.buildingName || listing.title}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={tokens.space[2] / 8}>
                                <StarIcon sx={{ fontSize: `${tokens.font.size.sm}px`, color: '#FFB800', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                                <Typography sx={{ fontSize: `${tokens.font.size.xs}px`, fontWeight: tokens.font.weight.bold, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                  {listing.rating}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" alignItems="center" spacing={tokens.space[3] / 8} sx={{ mb: tokens.space[5] / 8 }}>
                              <LocationIcon sx={{ fontSize: `${tokens.font.size.sm}px`, color: 'rgba(255,255,255,0.95)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                              <Typography sx={{ 
                                color: 'rgba(255,255,255,0.95)', 
                                fontSize: `${tokens.font.size.xs}px`,
                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                fontWeight: tokens.font.weight.medium,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {listing.location.split(',')[0]}
                              </Typography>
                            </Stack>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography sx={{ fontSize: `${tokens.font.size.lg}px`, fontWeight: tokens.font.weight.bold, color: '#ffffff', lineHeight: 1, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                                  {formatPrice(listing.price)}đ
                                </Typography>
                                <Typography sx={{ fontSize: `${tokens.font.size.xs - 1}px`, color: 'rgba(255,255,255,0.9)', mt: tokens.space[1] / 8, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                  /tháng
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: tokens.space[2] / 8 }}>
                                <RulerIcon sx={{ fontSize: `${tokens.font.size.sm}px`, color: '#ffffff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                                <Typography sx={{ fontSize: `${tokens.font.size.xs}px`, fontWeight: tokens.font.weight.semibold, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                  {listing.area}m²
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))
                  }
                </Grid>
              </Grid>

            {/* Right: New Listings */}
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: tokens.font.weight.bold, 
                  mb: tokens.space[7] / 8, 
                  fontSize: `${tokens.font.size.md - 3}px`,
                  color: tokens.color.text.primary,
                }}
              >
                Phòng mới đăng
              </Typography>
              <Stack spacing={tokens.space[7] / 8}>
                {listings.slice(0, 5).map(listing => (
                  <Box 
                    key={listing.id}
                    onClick={() => navigate(`/room/${listing.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/room/${listing.id}`)
                      }
                    }}
                    tabIndex={0}
                    role="article"
                    aria-label={`Phòng mới ${listing.buildingName || listing.title}`}
                    sx={{ 
                      display: 'flex',
                      gap: tokens.space[6] / 8,
                      cursor: 'pointer',
                      backgroundColor: tokens.color.surface.base,
                      borderRadius: `${tokens.radius.sm}px`,
                      overflow: 'hidden',
                      border: '1px solid #e8e8e8',
                      '&:hover': {
                        boxShadow: tokens.shadow[1],
                        transform: 'translateX(4px)'
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${tokens.color.primary}`,
                        outlineOffset: '2px',
                      },
                      transition: `all ${tokens.motion.instant} cubic-bezier(0.4, 0, 0.2, 1)`,
                    }}
                  >
                    <Box sx={{ 
                      width: 150,
                      height: 100,
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    }}>
                      {listing.image ? (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${listing.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 400ms ease',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          backgroundColor: tokens.color.surface.muted,
                        }}>
                          <NoImageIcon sx={{ fontSize: 32, color: '#c1c1c1' }} />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, py: tokens.space[4] / 8, pr: tokens.space[6] / 8, minWidth: 0 }}>
                      <Typography sx={{ 
                        fontWeight: tokens.font.weight.semibold, 
                        fontSize: `${tokens.font.size.xs}px`, 
                        color: tokens.color.text.primary,
                        mb: tokens.space[2] / 8,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3
                      }}>
                        {listing.buildingName || listing.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={tokens.space[2] / 8} sx={{ mb: tokens.space[2] / 8 }}>
                        <LocationIcon sx={{ fontSize: `${tokens.font.size.xs - 2}px`, color: tokens.color.text.tertiary }} />
                        <Typography sx={{ 
                          fontSize: `${tokens.font.size.xs - 2}px`, 
                          color: tokens.color.text.tertiary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {listing.location.split(',')[0]}
                        </Typography>
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: `${tokens.font.size.sm}px`, fontWeight: tokens.font.weight.bold, color: tokens.color.primary }}>
                          {formatPrice(listing.price)}đ
                        </Typography>
                        <Typography sx={{ fontSize: `${tokens.font.size.xs - 2}px`, color: tokens.color.text.tertiary }}>
                          {listing.area}m²
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: tokens.space[8] / 8 }} component="section" aria-labelledby="statistics">
        <Typography 
          id="statistics"
          variant="h2" 
          sx={{ 
            fontWeight: tokens.font.weight.bold, 
            textAlign: 'center', 
            mb: tokens.space[8] / 8, 
            fontSize: `${tokens.font.size.md}px`,
            color: tokens.color.text.primary,
          }}
        >
          Con số nói lên tất cả
        </Typography>
        <Grid container spacing={tokens.space[8] / 8}>
          {statistics.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: tokens.space[8] / 8,
                  borderRadius: `${tokens.radius.sm}px`,
                  backgroundColor: tokens.color.surface.base,
                  boxShadow: tokens.shadow[1],
                  transition: `all ${tokens.motion.instant}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'rgba(26, 26, 26, 0.24) 0px 8px 24px 0px',
                  },
                }}
              >
                <Box sx={{ mb: tokens.space[7] / 8, display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </Box>
                <Typography 
                  sx={{ 
                    fontWeight: tokens.font.weight.bold, 
                    fontSize: `${tokens.font.size.xl}px`, 
                    color: tokens.color.text.primary, 
                    mb: tokens.space[2] / 8,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: tokens.color.text.tertiary, 
                    fontSize: `${tokens.font.size.xs}px`,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ backgroundColor: tokens.color.surface.muted, py: tokens.space[8] / 8 }} component="section" aria-labelledby="how-it-works">
        <Container maxWidth="lg">
          <Typography 
            id="how-it-works"
            variant="h2" 
            sx={{ 
              fontWeight: tokens.font.weight.bold, 
              textAlign: 'center', 
              mb: tokens.space[4] / 8, 
              fontSize: `${tokens.font.size.md}px`,
              color: tokens.color.text.primary,
            }}
          >
            Quy trình thuê phòng
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: tokens.color.text.tertiary, 
              mb: tokens.space[8] / 8,
              fontSize: `${tokens.font.size.xs}px`,
            }}
          >
            Chỉ với 4 bước đơn giản
          </Typography>
          <Grid container spacing={tokens.space[8] / 8}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    position: 'relative',
                    p: tokens.space[7] / 8,
                  }}
                >
                  {/* Step Number */}
                  <Box 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      backgroundColor: tokens.color.primary,
                      color: tokens.color.surface.base,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: tokens.space[7] / 8,
                      boxShadow: tokens.shadow[1],
                    }}
                  >
                    {step.icon}
                  </Box>
                  {/* Connector Line */}
                  {index < howItWorks.length - 1 && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 32,
                        left: '50%',
                        width: '100%',
                        height: 2,
                        backgroundColor: '#e0e0e0',
                        zIndex: 0,
                        display: { xs: 'none', md: 'block' },
                      }} 
                    />
                  )}
                  <Typography 
                    sx={{ 
                      fontWeight: tokens.font.weight.semibold, 
                      fontSize: `${tokens.font.size.sm}px`, 
                      color: tokens.color.text.primary, 
                      mb: tokens.space[4] / 8,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: tokens.color.text.tertiary, 
                      lineHeight: 1.6,
                      fontSize: `${tokens.font.size.xs}px`,
                    }}
                  >
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Search by Location */}
      <Container maxWidth="lg" sx={{ py: tokens.space[8] / 8 }} component="section" aria-labelledby="search-by-location">
        <Typography 
          id="search-by-location"
          variant="h2" 
          sx={{ 
            fontWeight: tokens.font.weight.bold, 
            mb: tokens.space[4] / 8, 
            fontSize: `${tokens.font.size.md}px`,
            color: tokens.color.text.primary,
          }}
        >
          Tìm theo khu vực
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: tokens.color.text.tertiary, 
            mb: tokens.space[8] / 8,
            fontSize: `${tokens.font.size.xs}px`,
          }}
        >
          Khám phá các khu vực phổ biến tại Hà Nội
        </Typography>
        <Grid container spacing={tokens.space[7] / 8}>
          {loadingDistricts ? (
            [1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton 
                  variant="rectangular" 
                  sx={{ borderRadius: `${tokens.radius.sm}px`, height: 220, width: '100%' }} 
                  animation="wave" 
                />
              </Grid>
            ))
          ) : (
            districts.map(district => (
              <Grid item xs={12} sm={6} md={3} key={district.name}>
                <LocationCard 
                  onClick={() => navigate('/listings')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate('/listings')
                    }
                  }}
                  tabIndex={0}
                  role="article"
                  aria-label={`Khu vực ${district.name}, ${district.rooms} phòng`}
                >
                  <Box sx={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                    <Box 
                      component="img" 
                      src={district.image} 
                      alt={`Khu vực ${district.name}`} 
                      loading="lazy"
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 500ms ease', 
                        display: 'block',
                      }} 
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                    }} />
                    <Box sx={{ position: 'absolute', bottom: tokens.space[7], left: tokens.space[7] }}>
                      <Typography sx={{ 
                        color: 'white', 
                        fontWeight: tokens.font.weight.semibold, 
                        fontSize: `${tokens.font.size.sm}px`, 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}>
                        {district.name}
                      </Typography>
                      <Typography sx={{ 
                        color: 'rgba(255,255,255,0.85)', 
                        fontSize: `${tokens.font.size.xs}px`,
                      }}>
                        {district.rooms} phòng
                      </Typography>
                    </Box>
                  </Box>
                </LocationCard>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Why Choose Us */}
      <Box sx={{ backgroundColor: tokens.color.surface.muted, py: tokens.space[8] / 8 }} component="section" aria-labelledby="why-choose-us">
        <Container maxWidth="lg">
          <Typography 
            id="why-choose-us"
            variant="h2" 
            sx={{ 
              fontWeight: tokens.font.weight.bold, 
              textAlign: 'center', 
              mb: tokens.space[4] / 8, 
              fontSize: `${tokens.font.size.md}px`,
              color: tokens.color.text.primary,
            }}
          >
            Tại sao chọn Rentify?
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: tokens.color.text.tertiary, 
              mb: tokens.space[8] / 8,
              fontSize: `${tokens.font.size.xs}px`,
            }}
          >
            Nền tảng tìm phòng trọ uy tín và hiện đại nhất
          </Typography>
          <Grid container spacing={tokens.space[8] / 8}>
            {[
              { icon: <VerifiedIcon sx={{ fontSize: 40, color: tokens.color.primary }} />, title: 'Phòng xác thực', desc: '100% phòng được kiểm duyệt kỹ lưỡng trước khi đăng' },
              { icon: <CameraIcon sx={{ fontSize: 40, color: tokens.color.primary }} />, title: 'Ảnh thật 100%', desc: 'Hình ảnh chụp thực tế, không qua chỉnh sửa' },
              { icon: <ShieldIcon sx={{ fontSize: 40, color: tokens.color.primary }} />, title: 'Chủ nhà uy tín', desc: 'Được xác minh và đánh giá bởi cộng đồng người thuê' },
              { icon: <BotIcon sx={{ fontSize: 40, color: tokens.color.primary }} />, title: 'AI tư vấn 24/7', desc: 'Trợ lý thông minh hỗ trợ tìm phòng nhanh chóng' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: tokens.space[7] / 8, display: 'flex', justifyContent: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ 
                    fontWeight: tokens.font.weight.semibold, 
                    fontSize: `${tokens.font.size.sm}px`, 
                    color: tokens.color.text.primary, 
                    mb: tokens.space[4] / 8,
                  }}>
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: tokens.color.text.tertiary, 
                      lineHeight: 1.6,
                      fontSize: `${tokens.font.size.xs}px`,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Cards */}
      <Container maxWidth="lg" sx={{ py: tokens.space[8] / 8 }} component="section" aria-label="Call to action cards">
        <Grid container spacing={tokens.space[7] / 8}>
          {[
            { 
              icon: <MapIcon sx={{ fontSize: 36, color: tokens.color.primary }} />, 
              title: 'Xem phòng trên bản đồ', 
              desc: 'Tìm phòng theo vị trí địa lý, xem khoảng cách đến trường, công ty, bệnh viện', 
              btnLabel: 'Khám phá bản đồ', 
              count: `${listings.length} phòng trên bản đồ`, 
              onClick: () => {},
              color: tokens.color.primary,
            },
            { 
              icon: <PeopleIcon sx={{ fontSize: 36, color: '#5CB85C' }} />, 
              title: 'Tìm bạn ở ghép', 
              desc: 'Kết nối với người cùng sở thích, tiết kiệm chi phí, an toàn hơn khi ở ghép', 
              btnLabel: 'Tìm bạn ngay', 
              count: '156 người đang tìm bạn', 
              onClick: () => navigate('/roommate'), 
              color: '#5CB85C',
            },
            { 
              icon: <HomeIcon sx={{ fontSize: 36, color: '#F0AD4E' }} />, 
              title: 'Bạn là chủ nhà?', 
              desc: 'Đăng tin cho thuê phòng miễn phí, tiếp cận hàng nghìn người thuê', 
              btnLabel: 'Đăng phòng miễn phí', 
              count: 'Miễn phí • Không giới hạn', 
              onClick: () => window.location.href = 'http://localhost:3333/login', 
              color: '#F0AD4E',
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box 
                sx={{ 
                  p: tokens.space[8] / 8, 
                  border: '1px solid #e8e8e8', 
                  borderRadius: `${tokens.radius.sm}px`, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: tokens.space[7] / 8, 
                  backgroundColor: tokens.color.surface.base,
                  '&:hover': { 
                    boxShadow: tokens.shadow[1],
                  }, 
                  transition: `box-shadow ${tokens.motion.instant} ease`,
                }}
              >
                {item.icon}
                <Typography sx={{ 
                  fontWeight: tokens.font.weight.bold, 
                  fontSize: `${tokens.font.size.sm}px`, 
                  color: tokens.color.text.primary,
                }}>
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: tokens.color.text.tertiary, 
                    flex: 1, 
                    lineHeight: 1.6,
                    fontSize: `${tokens.font.size.xs}px`,
                  }}
                >
                  {item.desc}
                </Typography>
                <Button
                  variant="contained"
                  onClick={item.onClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  tabIndex={0}
                  aria-label={item.btnLabel}
                  sx={{ 
                    backgroundColor: item.color, 
                    '&:hover': { 
                      backgroundColor: item.color === tokens.color.primary ? tokens.color.primaryHover : `${item.color}cc`,
                    }, 
                    borderRadius: `${tokens.radius.sm}px`, 
                    py: tokens.space[5] / 8, 
                    fontWeight: tokens.font.weight.semibold,
                    '&:focus-visible': {
                      outline: `2px solid ${item.color}`,
                      outlineOffset: '2px',
                    },
                  }}
                >
                  {item.btnLabel}
                </Button>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: tokens.color.text.tertiary, 
                    textAlign: 'center',
                    fontSize: `${tokens.font.size.xs - 2}px`,
                  }}
                >
                  {item.count}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ backgroundColor: tokens.color.surface.muted, py: tokens.space[8] / 8 }} component="section" aria-labelledby="faq">
        <Container maxWidth="md">
          <Typography 
            id="faq"
            variant="h2" 
            sx={{ 
              fontWeight: tokens.font.weight.bold, 
              textAlign: 'center', 
              mb: tokens.space[4] / 8, 
              fontSize: `${tokens.font.size.md}px`,
              color: tokens.color.text.primary,
            }}
          >
            Câu hỏi thường gặp
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: tokens.color.text.tertiary, 
              mb: tokens.space[8] / 8,
              fontSize: `${tokens.font.size.xs}px`,
            }}
          >
            Giải đáp các thắc mắc phổ biến
          </Typography>
          <Box>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                expanded={expandedFaq === index}
                onChange={() => setExpandedFaq(expandedFaq === index ? false : index)}
                sx={{
                  mb: tokens.space[4] / 8,
                  borderRadius: `${tokens.radius.sm}px !important`,
                  boxShadow: tokens.shadow[1],
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: `0 0 ${tokens.space[4]}px 0`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-${index}-content`}
                  id={`faq-${index}-header`}
                  sx={{
                    '&:focus-visible': {
                      outline: `2px solid ${tokens.color.primary}`,
                      outlineOffset: '2px',
                    },
                    '& .MuiAccordionSummary-content': {
                      my: tokens.space[6] / 8,
                    },
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontWeight: tokens.font.weight.semibold, 
                      fontSize: `${tokens.font.size.sm}px`,
                      color: tokens.color.text.primary,
                    }}
                  >
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography 
                    sx={{ 
                      color: tokens.color.text.tertiary, 
                      lineHeight: 1.6,
                      fontSize: `${tokens.font.size.xs}px`,
                    }}
                  >
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* AI Chat Button */}
      <Tooltip title="Hỏi AI về phòng trọ" placement="left">
        <Fab
          onClick={() => setChatOpen(!chatOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setChatOpen(!chatOpen)
            }
          }}
          size="medium"
          aria-label="Mở chat AI"
          sx={{
            position: 'fixed', 
            bottom: 120, 
            right: 32, 
            zIndex: 1000,
            backgroundColor: tokens.color.primary, 
            color: tokens.color.surface.base,
            '&:hover': { 
              backgroundColor: tokens.color.primaryHover,
              transform: 'scale(1.1)',
            },
            '&:focus-visible': {
              outline: `2px solid ${tokens.color.primary}`,
              outlineOffset: '2px',
            },
            boxShadow: `rgba(74,144,226,0.35) 0px 4px 20px`,
            width: 48, 
            height: 48,
            transition: `all ${tokens.motion.instant}`,
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* AI Chat Widget */}
      {chatOpen && (
        <Box sx={{ position: 'fixed', bottom: 50, right: 89, zIndex: 1300 }}>
          <AIChatWidget 
            apiUrl={import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'} 
            onClose={() => setChatOpen(false)} 
          />
        </Box>
      )}
    </Box>
  )
}