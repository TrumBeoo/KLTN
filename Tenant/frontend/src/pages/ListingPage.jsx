import { useState } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Typography,
  Stack,
  IconButton,
} from '@mui/material'
import SecondaryMenu from '../components/SecondaryMenu'
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
  Visibility as EyeIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ListingCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 200ms ease',
  '&:hover': {
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

function ListingPage() {
  useScrollToTop()
  const [favorites, setFavorites] = useState({})

  const listings = [
    {
      id: 1,
      title: 'Studio cao cấp full nội thất',
      location: '123 Nguyễn Huệ, P. Bến Nghé, Q1, TPHCM',
      price: '5500000',
      area: 25,
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop',
      status: 'available',
      amenities: ['wifi', 'ac', 'heater', 'security'],
    },
    {
      id: 2,
      title: 'Phòng khép kín đầy đủ tiện nghi',
      location: '456 Lê Lai, P. Bến Thành, Q1, TPHCM',
      price: '4200000',
      area: 20,
      rating: 4.5,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop',
      status: 'available',
      amenities: ['wifi', 'heater', 'washer'],
    },
    {
      id: 3,
      title: 'Căn hộ mini view đẹp',
      location: '789 Võ Văn Tần, P. 6, Q3, TPHCM',
      price: '7000000',
      area: 35,
      rating: 4.9,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop',
      status: 'booking',
      amenities: ['wifi', 'ac', 'heater', 'parking'],
    },
    {
      id: 4,
      title: 'Phòng ở ghép sinh viên',
      location: '321 Cách Mạng Tháng 8, P. 12, Q. Tân Bình',
      price: '2500000',
      area: 15,
      rating: 4.2,
      reviews: 11,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=350&fit=crop',
      status: 'available',
      amenities: ['wifi', 'ac', 'security'],
    },
    {
      id: 5,
      title: 'Duplex sang trọng 2 tầng',
      location: '147 Đường D2, P. 25, Q. Bình Thạnh',
      price: '12000000',
      area: 55,
      rating: 5.0,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=350&fit=crop',
      status: 'available',
      amenities: ['wifi', 'ac', 'heater', 'washer', 'parking'],
    },
    {
      id: 6,
      title: 'Studio gần BV Chợ Rẫy',
      location: '258 Hồng Bàng, P. 11, Q. 5',
      price: '3800000',
      area: 22,
      rating: 4.6,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=350&fit=crop',
      status: 'rented',
      amenities: ['wifi', 'heater'],
    },
  ]

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <WifiIcon sx={{ fontSize: '1rem' }} />,
      ac: <AcIcon sx={{ fontSize: '1rem' }} />,
      heater: <DropletIcon sx={{ fontSize: '1rem' }} />,
      security: <ShieldIcon sx={{ fontSize: '1rem' }} />,
      parking: <CarIcon sx={{ fontSize: '1rem' }} />,
      washer: <span>🧺</span>,
    }
    return icons[amenity] || null
  }

  const formatPrice = (price) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleCategoryChange = (categoryId) => {
    console.log('Category changed:', categoryId)
    // Handle category filter logic
  }

  const handleDistrictChange = (district) => {
    console.log('District changed:', district)
    // Handle district filter logic
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <SecondaryMenu onCategoryChange={handleCategoryChange} onDistrictChange={handleDistrictChange} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Danh sách phòng cho thuê
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Tìm phòng phù hợp với nhu cầu của bạn
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left: Listings */}
          <Grid item xs={12} lg={8}>
            {/* Listings Grid */}
            <Stack spacing={2}>
              {listings.map((listing) => (
                <ListingCard key={listing.id}>
                  <Stack direction="row" spacing={2} sx={{ p: 2 }}>
                    {/* Image */}
                    <Box sx={{ position: 'relative', width: 200, height: 150, flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        image={listing.image}
                        alt={listing.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => toggleFavorite(listing.id)}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)' }}
                      >
                        {favorites[listing.id] ? (
                          <FavoriteIcon sx={{ color: '#F43F5E', fontSize: '1.25rem' }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ fontSize: '1.25rem' }} />
                        )}
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          bgcolor: listing.status === 'available' ? '#22C55E' : listing.status === 'booking' ? '#2563EB' : '#EF4444',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 0.5,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {listing.status === 'available' ? 'Trống' : listing.status === 'booking' ? 'Đang đặt lịch' : 'Đã thuê'}
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                        }}
                      >
                        <EyeIcon sx={{ fontSize: '0.875rem' }} />
                        {listing.views}
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {listing.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {listing.location.split(',')[0]}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                        {formatPrice(listing.price)}đ/tháng
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <RulerIcon sx={{ fontSize: '0.875rem' }} />
                          <Typography variant="body2">{listing.area}m²</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <StarIcon sx={{ fontSize: '0.875rem', color: '#F59E0B' }} />
                          <Typography variant="body2">
                            {listing.rating} ({listing.reviews})
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        {listing.amenities.map((amenity) => (
                          <Box key={amenity} sx={{ color: 'text.secondary' }}>
                            {getAmenityIcon(amenity)}
                          </Box>
                        ))}
                      </Stack>
                      <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
                        Xem chi tiết
                      </Button>
                    </Box>
                  </Stack>
                </ListingCard>
              ))}
            </Stack>

            {/* Pagination */}
            <Stack direction="row" spacing={1} sx={{ mt: 4, justifyContent: 'center' }}>
              <Button variant="outlined" disabled>← Trước</Button>
              <Button variant="contained">1</Button>
              <Button variant="outlined">2</Button>
              <Button variant="outlined">3</Button>
              <Typography sx={{ px: 1, display: 'flex', alignItems: 'center' }}>...</Typography>
              <Button variant="outlined">10</Button>
              <Button variant="outlined">Tiếp →</Button>
            </Stack>
          </Grid>

          {/* Right: Map & Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Map */}
              <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>🗺️ Bản đồ</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tích hợp bản đồ sẽ được thêm sau
                  </Typography>
                </Box>
              </Card>

              {/* Latest Listings */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClockIcon /> Tin đăng mới nhất
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  {listings.slice(0, 4).map((listing) => (
                    <LatestListingItem key={listing.id}>
                      <Stack direction="row" spacing={1}>
                        <CardMedia
                          component="img"
                          image={listing.image}
                          alt={listing.title}
                          sx={{ width: 80, height: 80, objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                            {listing.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '0.75rem', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {listing.location.split(',')[1]}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>
                            {formatPrice(listing.price)}đ
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <RulerIcon sx={{ fontSize: '0.7rem' }} />
                            <Typography variant="caption">{listing.area}m²</Typography>
                            <ClockIcon sx={{ fontSize: '0.7rem', ml: 0.5 }} />
                            <Typography variant="caption">2h trước</Typography>
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
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ListingPage
