import { useState } from 'react'
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
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
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
  transition: 'all 200ms ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}))

const LatestListingItem = styled(Card)(({ theme }) => ({
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 200ms ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}))

export default function HomePage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [favorites, setFavorites] = useState({})

  const listings = [
    {
      id: 1,
      title: 'Studio cao cấp full nội thất',
      location: '123 Nguyễn Huệ, P. Bến Nghé, Q1, TPHCM',
      price: '5.500.000',
      area: 25,
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop',
      status: 'available',
      views: 1200,
    },
    {
      id: 2,
      title: 'Phòng khép kín đầy đủ tiện nghi',
      location: '456 Lê Lai, P. Bến Thành, Q1, TPHCM',
      price: '4.200.000',
      area: 20,
      rating: 4.5,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop',
      status: 'available',
      views: 980,
    },
    {
      id: 3,
      title: 'Căn hộ mini view đẹp',
      location: '789 Võ Văn Tần, P. 6, Q3, TPHCM',
      price: '7.000.000',
      area: 35,
      rating: 4.9,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop',
      status: 'booking',
      views: 856,
    },
    {
      id: 4,
      title: 'Phòng ở ghép sinh viên',
      location: '321 Cách Mạng Tháng 8, P. 12, Q. Tân Bình',
      price: '2.500.000',
      area: 15,
      rating: 4.2,
      reviews: 11,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=350&fit=crop',
      status: 'available',
      views: 742,
    },
    {
      id: 5,
      title: 'Duplex sang trọng 2 tầng',
      location: '147 Đường D2, P. 25, Q. Bình Thạnh',
      price: '12.000.000',
      area: 55,
      rating: 5.0,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=350&fit=crop',
      status: 'available',
      views: 650,
    },
    {
      id: 6,
      title: 'Studio gần BV Chợ Rẫy',
      location: '258 Hồng Bàng, P. 11, Q. 5',
      price: '3.800.000',
      area: 22,
      rating: 4.6,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=350&fit=crop',
      status: 'rented',
      views: 520,
    },
  ]

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
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
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
            <Button variant="contained" size="large" startIcon={<MapIcon />}>
              Xem phòng trên bản đồ
            </Button>
            <Button variant="outlined" size="large" startIcon={<PeopleIcon />}>
              Tìm bạn ở ghép
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Recommendations Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
          ⭐ Phòng phù hợp với bạn
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Dựa trên lịch sử xem • ngân sách • khu vực quan tâm
        </Typography>

        <Grid container spacing={3}>
          {listings.slice(0, 3).map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <FeaturedCard>
                <Box sx={{ position: 'relative', height: 250 }}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={listing.image}
                    alt={listing.title}
                  />
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
                  <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: listing.status === 'available' ? '#22C55E' : listing.status === 'booking' ? '#2563EB' : '#EF4444', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                    {listing.status === 'available' ? 'Trống' : listing.status === 'booking' ? 'Đang đặt lịch' : 'Đã thuê'}
                  </Box>
                </Box>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {listing.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 2, alignItems: 'flex-start' }}>
                    <LocationIcon sx={{ fontSize: '1rem', color: 'primary.main', mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {listing.location}
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 600 }}>
                    {listing.price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ/tháng
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
                  <Button variant="outlined" fullWidth sx={{ mt: 'auto' }} onClick={() => navigate(`/room/${listing.id}`)}>
                    Xem chi tiết
                  </Button>
                </CardContent>
              </FeaturedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Rooms Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ mb: 4, fontWeight: 700 }}>
          🔥 Phòng nổi bật
        </Typography>

        <Grid container spacing={3}>
          {/* Main Featured Grid */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Tabs */}
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="🔥 Được xem nhiều" />
                <Tab label="🚪 Còn trống" />
                <Tab label="⭐ Đánh giá cao" />
              </Tabs>

              {/* Featured Cards Grid */}
              <Grid container spacing={2}>
                {listings.slice(0, 4).map((listing) => (
                  <Grid item xs={12} sm={6} key={listing.id}>
                    <FeaturedCard>
                      <Box sx={{ position: 'relative', height: 180 }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={listing.image}
                          alt={listing.title}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
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
                          {listing.views} lượt xem
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {listing.title}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {listing.location.split(',')[0]}
                          </Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                          {listing.price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ/tháng
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <StarIcon sx={{ fontSize: '1rem', color: '#F59E0B' }} />
                          <Typography variant="body2">
                            {listing.rating} ({listing.reviews})
                          </Typography>
                        </Stack>
                      </CardContent>
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
                        <CardMedia
                          component="img"
                          image={listing.image}
                          alt={listing.title}
                          sx={{ width: 80, height: 80, objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {listing.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {listing.location.split(',')[1]}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            {listing.price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                            <RulerIcon sx={{ fontSize: '0.75rem' }} />
                            <Typography variant="caption">{listing.area}m²</Typography>
                            <ClockIcon sx={{ fontSize: '0.75rem', ml: 1 }} />
                            <Typography variant="caption">2 giờ trước</Typography>
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

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
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
                    <strong>248</strong> phòng trên bản đồ
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
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
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
