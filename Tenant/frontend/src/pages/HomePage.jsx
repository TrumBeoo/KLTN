import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Skeleton,
  Fab,
  Tooltip,
} from '@mui/material'
import {
  Star as StarIcon,
  LocationOn as LocationIcon,
  Straighten as RulerIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  Opacity as DropletIcon,
  Security as ShieldIcon,
  DirectionsCar as CarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Map as MapIcon,
  Group as PeopleIcon,
  Visibility as EyeIcon,
  AccessTime as ClockIcon,
  ImageNotSupported as NoImageIcon,
  Verified as VerifiedIcon,
  CameraAlt as CameraIcon,
  SmartToy as BotIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('img/5.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
  color: 'white',
}))

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  height: 'auto',
  padding: theme.spacing(1, 2),
  fontSize: '0.875rem',
  fontWeight: 500,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    borderColor: theme.palette.primary.main,
  },
}))

const FeaturedCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.02)',
    boxShadow: theme.shadows[12],
  },
}))

const LatestListingItem = styled(Card)(({ theme }) => ({
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
  },
}))

const LocationCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.03)',
    boxShadow: theme.shadows[16],
  },
}))

const ChatButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 123,
  right: 33,
  zIndex: 1000,
  width: 45,
  height: 45,
  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
  '&:hover': {
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    boxShadow: '0 6px 30px rgba(59, 130, 246, 0.7)',
    transform: 'scale(1.1)',
  },
  animation: 'glow 1.5s ease-in-out infinite',
  '@keyframes glow': {
    '0%, 100%': {
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
      transform: 'scale(1)',
    },
    '50%': {
      boxShadow: '0 4px 35px rgba(59, 130, 246, 0.9), 0 0 20px rgba(6, 182, 212, 0.6)',
      transform: 'scale(1.05)',
    },
  },
}))

export default function HomePage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [favorites, setFavorites] = useState({})
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const districts = [
    { name: 'Cầu Giấy', rooms: 245, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400' },
    { name: 'Hà Đông', rooms: 189, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
    { name: 'Thanh Xuân', rooms: 312, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' },
    { name: 'Nam Từ Liêm', rooms: 276, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
  ]

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/rooms?limit=10`)
      const data = await response.json()
      
      if (data.success) {
        const formattedRooms = data.data.map(room => {
          // Get first image URL if exists
          let imageUrl = null;
          if (room.images && room.images.length > 0) {
            imageUrl = `${API_URL.replace('/api', '')}${room.images[0].ImageURL}`;
          }
          
          console.log('HomePage - Room:', room.RoomID, 'Image URL:', imageUrl, 'Images:', room.images);
          
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
            buildingName: room.BuildingName
          };
        });
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

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Tìm phòng chung cư mini tại Hà Nội
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', mb: 4 }}>
            Xem bản đồ – đặt lịch xem – hỗ trợ ở ghép thông minh
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <FilterChip label="🏫 Gần trường" />
            <FilterChip label="💰 Dưới 3 triệu" />
            <FilterChip label="❄️ Có điều hòa" />
            <FilterChip label="🚿 Có nóng lạnh" />
            <FilterChip label="🏠 Studio" />
            <FilterChip label="🚪 Phòng khép kín" />
            <FilterChip label="👥 Ở ghép" />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<MapIcon />}
              sx={{
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 6
                },
                '&:active': {
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Xem phòng trên bản đồ
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<PeopleIcon />} 
              sx={{ 
                bgcolor: 'grey.200',
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-3px)',
                  boxShadow: 6
                },
                '&:active': {
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Tìm bạn ở ghép
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Recommendations Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Phòng phù hợp với bạn
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Dựa trên lịch sử xem • ngân sách • khu vực quan tâm
        </Typography>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={200} animation="wave" />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Skeleton variant="text" width={60} />
                      <Skeleton variant="text" width={80} />
                    </Stack>
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {listings.slice(0, 4).map((listing) => (
              <Grid item xs={12} sm={6} md={3} key={listing.id}>
                <FeaturedCard>
                  <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    {listing.image ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={listing.image}
                        alt={listing.title}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.15)'
                          }
                        }}
                        onError={(e) => {
                          console.error('Image load error:', listing.image);
                          e.target.style.display = 'none';
                          e.target.parentElement.style.backgroundColor = '#e0e0e0';
                        }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <NoImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                      </Box>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(listing.id)}
                      sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
                    >
                      {favorites[listing.id] ? (
                        <FavoriteIcon sx={{ color: '#F43F5E' }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <Box sx={{ position: 'absolute', top: 8, right: 8, 
                      bgcolor: listing.status === 'available' ? '#22C55E' : 
                               listing.status === 'pending' ? '#F59E0B' :
                               listing.status === 'booked' ? '#2563EB' : '#EF4444', 
                      color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                      {listing.status === 'available' ? 'Trống' : 
                       listing.status === 'pending' ? 'Chờ duyệt' :
                       listing.status === 'booked' ? 'Đã đặt lịch' : 'Đã thuê'}
                    </Box>
                  </Box>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
                      {listing.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mb: 2, alignItems: 'flex-start' }}>
                      <LocationIcon sx={{ fontSize: '1rem', color: 'primary.main', mt: 0.25 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {listing.buildingName || listing.location}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1, fontWeight: 600 }}>
                      {formatPrice(listing.price)}đ/tháng
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <RulerIcon sx={{ fontSize: '1rem' }} />
                        <Typography variant="body2">{listing.area}m²</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: '1rem', color: '#F59E0B' }} />
                        <Typography variant="body2">
                          {listing.rating} ({listing.reviews})
                        </Typography>
                      </Stack>
                    </Stack>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="small" 
                      sx={{ 
                        mt: 'auto',
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        },
                        '&:active': {
                          transform: 'scale(0.98)'
                        }
                      }} 
                      onClick={() => navigate(`/room/${listing.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </FeaturedCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Featured Rooms Section */}
      <Container maxWidth="lg" sx={{ py: 0}}>
        <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Phòng nổi bật
        </Typography>

        <Grid container spacing={3}>
          {/* Main Featured Grid */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Tabs */}
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Được xem nhiều" />
                <Tab label="Còn trống" />
                <Tab label="Đánh giá cao" />
              </Tabs>

              {/* Featured Cards Grid */}
              <Grid container spacing={2}>
                {listings
                  .filter(listing => {
                    if (tabValue === 0) return listing.views > 500 // Được xem nhiều
                    if (tabValue === 1) return listing.status === 'available' // Còn trống
                    if (tabValue === 2) return listing.rating >= 4.5 // Đánh giá cao
                    return true
                  })
                  .slice(0, 5)
                  .map((listing) => (
                  <Grid item xs={12} key={listing.id}>
                    <FeaturedCard onClick={() => navigate(`/room/${listing.id}`)}>
                      <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                        {listing.image ? (
                          <CardMedia
                            component="img"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            image={listing.image}
                            alt={listing.title}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <NoImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <EyeIcon sx={{ fontSize: '1rem' }} />
                          {listing.views}
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2.5,
                            color: 'white',
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {listing.title}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ fontSize: '1.1rem' }} />
                            <Typography variant="caption" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                              {listing.location.split(',')[0]}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                              {formatPrice(listing.price)}đ/tháng
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <RulerIcon sx={{ fontSize: '1.1rem' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{listing.area}m²</Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: '1.1rem', color: '#FCD34D' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {listing.rating} ({listing.reviews})
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </FeaturedCard>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          {/* Latest Listings Sidebar */}
          <Grid item xs={12} md={4}>
            
              {/* Latest Listings Card */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClockIcon /> Tin đăng mới nhất
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  {listings.slice(0, 4).map((listing) => (
                    <LatestListingItem key={listing.id} onClick={() => navigate(`/room/${listing.id}`)}>
                      <Stack direction="row" spacing={1}>
                        {listing.image ? (
                          <CardMedia
                            component="img"
                            image={listing.image}
                            alt={listing.title}
                            sx={{ width: 130, height: 130, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <Box sx={{ width: 130, height: 130, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <NoImageIcon sx={{ fontSize: 50, color: 'grey.400' }} />
                          </Box>
                        )}
                        <CardContent sx={{ p: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {listing.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {listing.buildingName || 'Chưa cập nhật'}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            {formatPrice(listing.price)}đ
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                            <RulerIcon sx={{ fontSize: '0.75rem' }} />
                            <Typography variant="caption">{listing.area}m²</Typography>
                            <ClockIcon sx={{ fontSize: '0.75rem', ml: 1 }} />
                            <Typography variant="caption">Mới đăng</Typography>
                          </Stack>
                        </CardContent>
                      </Stack>
                    </LatestListingItem>
                  ))}
                </Stack>

                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  Xem tất cả tin đăng
                </Button>
              </Card>
           
          </Grid>
        </Grid>
      </Container>

      {/* Search by Location Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Tìm theo khu vực
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Khám phá các khu vực phổ biến tại Hà Nội
        </Typography>

        <Grid container spacing={3}>
          {districts.map((district) => (
            <Grid item xs={12} sm={6} md={3} key={district.name}>
              <LocationCard>
                <Box sx={{ position: 'relative', height: 200 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={district.image}
                    alt={district.name}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      p: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {district.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {district.rooms} phòng
                    </Typography>
                  </Box>
                </Box>
              </LocationCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trust Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
            Tại sao chọn chúng tôi?
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, opacity: 0.9 }}>
            Nền tảng tìm phòng trọ uy tín và hiện đại nhất
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <VerifiedIcon sx={{ fontSize: 64, mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Phòng xác thực
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  100% phòng được kiểm duyệt kỹ lưỡng
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <CameraIcon sx={{ fontSize: 64, mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ảnh thật 100%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Hình ảnh chụp thực tế, không qua chỉnh sửa
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <ShieldIcon sx={{ fontSize: 64, mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Chủ nhà uy tín
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Được xác minh và đánh giá bởi cộng đồng
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <BotIcon sx={{ fontSize: 64, mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  AI tư vấn 24/7
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Trợ lý thông minh hỗ trợ tìm phòng nhanh chóng
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Stack spacing={2}>
                  <MapIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Xem phòng trên bản đồ
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tìm phòng theo vị trí địa lý, xem khoảng cách đến trường, công ty, bệnh viện
                  </Typography>
                  <Button variant="contained" startIcon={<MapIcon />}>
                    Khám phá bản đồ
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>{listings.length}</strong> phòng trên bản đồ
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Stack spacing={2}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Tìm bạn ở ghép
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Kết nối với người cùng sở thích, tiết kiệm chi phí, an toàn hơn khi ở ghép
                  </Typography>
                  <Button variant="contained" color="success" startIcon={<PeopleIcon />}>
                    Tìm bạn ngay
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>156</strong> người đang tìm bạn
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, height: '100%', bgcolor: 'white' }}>
                <Stack spacing={2}>
                  <HomeIcon sx={{ fontSize: 48, color: 'warning.dark' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Bạn là chủ nhà?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Đăng tin cho thuê phòng miễn phí, tiếp cận hàng nghìn người thuê
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<HomeIcon />}
                    onClick={() => window.location.href = 'http://localhost:3333/login'}
                  >
                    Đăng phòng miễn phí
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Miễn phí</strong> • Không giới hạn tin đăng
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* AI Chatbot Button */}
      <Tooltip title="Bạn cần tìm phòng? Hỏi AI ngay!" placement="left">
        <ChatButton
          onClick={() => alert('Chức năng AI tư vấn đang được phát triển!')}
        >
          <ChatIcon sx={{ color: 'white', fontSize: 24 }} />
        </ChatButton>
      </Tooltip>
    </Box>
  )
}
