import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, Container, Typography, Button, Grid, Card, CardMedia,
  CardContent, Chip, Stack, IconButton, Tabs, Tab, Skeleton, Fab, Tooltip,
} from '@mui/material'
import {
  Star as StarIcon, LocationOn as LocationIcon, Straighten as RulerIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Map as MapIcon,
  Group as PeopleIcon, Visibility as EyeIcon, AccessTime as ClockIcon,
  ImageNotSupported as NoImageIcon, Verified as VerifiedIcon, CameraAlt as CameraIcon,
  Security as ShieldIcon, SmartToy as BotIcon, Home as HomeIcon, Chat as ChatIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import AIChatWidget from '../components/AIChatWidget'

const HeroSection = styled(Box)({
  backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('img/5.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '96px 0',
  textAlign: 'center',
  color: 'white',
})

const RoomCard = styled(Box)({
  cursor: 'pointer',
  '&:hover .room-image': {
    transform: 'scale(1.04)',
  },
})

const ImageWrapper = styled(Box)({
  borderRadius: '12px',
  overflow: 'hidden',
  aspectRatio: '20/13',
  position: 'relative',
  backgroundColor: '#f2f2f2',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 400ms ease',
    display: 'block',
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
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  '&:hover img': {
    transform: 'scale(1.06)',
  },
})

function RoomCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" sx={{ borderRadius: '12px', aspectRatio: '20/13', width: '100%', mb: 1.5 }} animation="wave" />
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

  const districts = [
    { name: 'Cầu Giấy', rooms: 245, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' },
    { name: 'Hà Đông', rooms: 189, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { name: 'Thanh Xuân', rooms: 312, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
    { name: 'Nam Từ Liêm', rooms: 276, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
  ]

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => { fetchRooms() }, [])

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
    <Box sx={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ color: 'white', mb: 2, fontWeight: 700, fontSize: { xs: '2rem', md: '2.75rem' } }}>
            Tìm chung cư mini tại Hà Nội
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontSize: '1.125rem', fontWeight: 400 }}>
            Xem bản đồ · Đặt lịch xem · Hỗ trợ ở ghép thông minh
          </Typography>

          {/* Quick Filters */}
          <Box sx={{ mb: 5, overflow: 'hidden' }}>
            <Stack 
              direction="row" 
              spacing={1.5} 
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
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.38)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  fontWeight: 50,
                  fontSize: '0.875rem',
                  height: 30,
                  px: 1.5,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    boxShadow: 'rgba(0,0,0,0.2) 0px 4px 12px',
                    border: '1px solid rgba(255,255,255,0.4)'
                  },
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<MapIcon />}
              sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, px: 4, py: 1.5, borderRadius: '8px', fontWeight: 600 }}
            >
              Xem phòng trên bản đồ
            </Button>
            <Button
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/roommate')}
              sx={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#222222', '&:hover': { backgroundColor: '#ffffff' }, px: 4, py: 1.5, borderRadius: '8px', fontWeight: 600 }}
            >
              Tìm bạn ở ghép
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Recommended Rooms */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '1.75rem' }}>
            Phòng phù hợp với bạn
          </Typography>
          <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
            Dựa trên lịch sử xem · ngân sách · khu vực quan tâm
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {loading
            ? [1, 2, 3, 4].map(i => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <RoomCardSkeleton />
                </Grid>
              ))
            : listings.slice(0, 4).map(listing => (
                <Grid item xs={12} sm={6} md={3} key={listing.id}>
                  <RoomCard onClick={() => navigate(`/room/${listing.id}`)}>
                    <ImageWrapper>
                      {listing.image ? (
                        <img
                          className="room-image"
                          src={listing.image}
                          alt={listing.title}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' }}>
                          <NoImageIcon sx={{ fontSize: 48, color: '#c1c1c1' }} />
                        </Box>
                      )}
                      {/* Favorite */}
                      <IconButton
                        size="small"
                        onClick={e => toggleFavorite(listing.id, e)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: favorites[listing.id] ? '#4A90E2' : 'rgba(255,255,255,0.85)', p: 0.75, '&:hover': { color: favorites[listing.id] ? '#2E5C8A' : '#ffffff' } }}
                      >
                        {favorites[listing.id] ? <FavoriteIcon sx={{ fontSize: '1.25rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1.25rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />}
                      </IconButton>
                    </ImageWrapper>
                    {/* Card Info */}
                    <Box sx={{ pt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#222222', flex: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.buildingName || listing.title}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                          <StarIcon sx={{ fontSize: '0.875rem', color: '#222222' }} />
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#222222' }}>{listing.rating}</Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <StatusDot status={listing.status} />
                        <Typography variant="body2" sx={{ color: '#6a6a6a', fontSize: '0.8125rem' }}>
                          {statusLabel[listing.status]} · {listing.area}m²
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.9375rem', color: '#222222' }}>
                        <Box component="span" sx={{ fontWeight: 600 }}>{formatPrice(listing.price)}đ</Box>
                        <Box component="span" sx={{ color: '#6a6a6a', fontWeight: 400 }}>/tháng</Box>
                      </Typography>
                    </Box>
                  </RoomCard>
                </Grid>
              ))
          }
        </Grid>

        {!loading && (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/listings')}
              sx={{ borderColor: '#222222', color: '#222222', borderRadius: '8px', px: 4, py: 1.5, fontWeight: 600, '&:hover': { backgroundColor: '#f7f7f7' } }}
            >
              Xem tất cả phòng
            </Button>
          </Box>
        )}
      </Container>

      {/* Featured Tabs Section */}
      <Box sx={{ backgroundColor: '#f7f7f7', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Left: Featured Rooms */}
            <Grid item xs={12} md={8}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '1.75rem' }}>
                Phòng nổi bật
              </Typography>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                sx={{ mb: 4, '& .MuiTabs-indicator': { backgroundColor: '#222222' }, '& .MuiTab-root': { color: '#6a6a6a', fontWeight: 500, '&.Mui-selected': { color: '#222222', fontWeight: 600 } } }}
              >
                <Tab label="Được xem nhiều" disableRipple />
                <Tab label="Còn trống" disableRipple />
                <Tab label="Đánh giá cao" disableRipple />
              </Tabs>

              <Grid container spacing={2.5}>
                {listings
                  .filter(l => tabValue === 0 ? l.views > 500 : tabValue === 1 ? l.status === 'available' : l.rating >= 4.5)
                  .slice(0, 6)
                  .map(listing => (
                    <Grid item xs={12} sm={6} key={listing.id}>
                      <RoomCard onClick={() => navigate(`/room/${listing.id}`)}>
                        <Box sx={{ 
                          position: 'relative', 
                          borderRadius: '14px', 
                          overflow: 'hidden', 
                          height: 200,
                          boxShadow: 'rgba(0,0,0,0.08) 0px 2px 8px',
                          '&:hover': { 
                            boxShadow: 'rgba(0,0,0,0.15) 0px 8px 24px',
                            transform: 'translateY(-4px)'
                          },
                          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                          {/* Background Image */}
                          {listing.image ? (
                            <Box
                              className="room-image"
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
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' }}>
                              <NoImageIcon sx={{ fontSize: 48, color: '#c1c1c1' }} />
                            </Box>
                          )}
                          
                          {/* Gradient Overlay */}
                          <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)',
                            transition: 'opacity 400ms ease',
                            '.MuiBox-root:hover &': {
                              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.8) 100%)'
                            }
                          }} />

                          {/* Top Actions */}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            left: 10, 
                            right: 10, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            zIndex: 2,
                            opacity: 0,
                            transform: 'translateY(-8px)',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '.MuiBox-root:hover &': {
                              opacity: 1,
                              transform: 'translateY(0)'
                            }
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5, 
                              backgroundColor: 'rgba(255,255,255,0.95)', 
                              borderRadius: '16px', 
                              px: 1, 
                              py: 0.4, 
                              backdropFilter: 'blur(8px)',
                              boxShadow: 'rgba(0,0,0,0.1) 0px 2px 8px'
                            }}>
                              <EyeIcon sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }} />
                              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#222222' }}>{listing.views}</Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={e => toggleFavorite(listing.id, e)}
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.95)', 
                                backdropFilter: 'blur(8px)',
                                color: favorites[listing.id] ? '#4A90E2' : '#6a6a6a',
                                p: 0.6,
                                boxShadow: 'rgba(0,0,0,0.1) 0px 2px 8px',
                                '&:hover': { 
                                  backgroundColor: 'rgba(255,255,255,1)', 
                                  transform: 'scale(1.15) rotate(10deg)',
                                  color: '#4A90E2'
                                },
                                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              {favorites[listing.id] ? <FavoriteIcon sx={{ fontSize: '1rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />}
                            </IconButton>
                          </Box>

                          {/* Bottom Info */}
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            p: 2,
                            zIndex: 2,
                            transform: 'translateY(0)',
                            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '.MuiBox-root:hover &': {
                              transform: 'translateY(-4px)'
                            }
                          }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.75 }}>
                              <Typography sx={{ 
                                fontWeight: 700, 
                                fontSize: '1rem', 
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
                              <Stack 
                                direction="row" 
                                alignItems="center" 
                                spacing={0.4}
                                sx={{
                                  transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                  '.MuiBox-root:hover &': {
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <StarIcon sx={{ fontSize: '0.9375rem', color: '#FFB800', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{listing.rating}</Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 1.25 }}>
                              <LocationIcon sx={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.95)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                              <Typography sx={{ 
                                color: 'rgba(255,255,255,0.95)', 
                                fontSize: '0.8125rem',
                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {listing.location.split(',')[0]}
                              </Typography>
                            </Stack>

                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center'
                            }}>
                              <Box sx={{
                                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                '.MuiBox-root:hover &': {
                                  transform: 'scale(1.05)'
                                }
                              }}>
                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                                  {formatPrice(listing.price)}đ
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', mt: 0.25, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                  /tháng
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                '.MuiBox-root:hover &': {
                                  transform: 'translateX(4px)'
                                }
                              }}>
                                <RulerIcon sx={{ fontSize: '0.9375rem', color: '#ffffff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                  {listing.area}m²
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </RoomCard>
                    </Grid>
                  ))
                }
              </Grid>
            </Grid>

            {/* Right: New Listings */}
            <Grid item xs={12} md={4}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: '1.375rem' }}>
                Phòng mới đăng
              </Typography>
              <Stack spacing={2}>
                {listings.slice(0, 5).map(listing => (
                  <Box 
                    key={listing.id}
                    onClick={() => navigate(`/room/${listing.id}`)}
                    sx={{ 
                      display: 'flex',
                      gap: 1.5,
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e8e8e8',
                      '&:hover': {
                        boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Box sx={{ 
                      width: 150,
                      height: 100,
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden'
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
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' }}>
                          <NoImageIcon sx={{ fontSize: 32, color: '#c1c1c1' }} />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, py: 1, pr: 1.5, minWidth: 0 }}>
                      <Typography sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem', 
                        color: '#222222',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3
                      }}>
                        {listing.buildingName || listing.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <LocationIcon sx={{ fontSize: '0.75rem', color: '#6a6a6a' }} />
                        <Typography sx={{ 
                          fontSize: '0.75rem', 
                          color: '#6a6a6a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {listing.location.split(',')[0]}
                        </Typography>
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4A90E2' }}>
                          {formatPrice(listing.price)}đ
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6a6a6a' }}>
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

      {/* Search by Location */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '1.75rem' }}>
          Tìm theo khu vực
        </Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 5 }}>
          Khám phá các khu vực phổ biến tại Hà Nội
        </Typography>
        <Grid container spacing={3}>
          {districts.map(district => (
            <Grid item xs={12} sm={6} md={3} key={district.name}>
              <LocationCard onClick={() => navigate('/listings')}>
                <Box sx={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <Box component="img" src={district.image} alt={district.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms ease', display: 'block' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                  <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                    <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1.0625rem', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      {district.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8125rem' }}>
                      {district.rooms} phòng
                    </Typography>
                  </Box>
                </Box>
              </LocationCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us */}
      <Box sx={{ backgroundColor: '#f7f7f7', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, fontSize: '1.75rem' }}>
            Tại sao chọn Rentify?
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#6a6a6a', mb: 6 }}>
            Nền tảng tìm phòng trọ uy tín và hiện đại nhất
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: <VerifiedIcon sx={{ fontSize: 40, color: '#4A90E2' }} />, title: 'Phòng xác thực', desc: '100% phòng được kiểm duyệt kỹ lưỡng trước khi đăng' },
              { icon: <CameraIcon sx={{ fontSize: 40, color: '#4A90E2' }} />, title: 'Ảnh thật 100%', desc: 'Hình ảnh chụp thực tế, không qua chỉnh sửa' },
              { icon: <ShieldIcon sx={{ fontSize: 40, color: '#4A90E2' }} />, title: 'Chủ nhà uy tín', desc: 'Được xác minh và đánh giá bởi cộng đồng người thuê' },
              { icon: <BotIcon sx={{ fontSize: 40, color: '#4A90E2' }} />, title: 'AI tư vấn 24/7', desc: 'Trợ lý thông minh hỗ trợ tìm phòng nhanh chóng' },
            ].map(item => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222', mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#6a6a6a', lineHeight: 1.6 }}>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Cards */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {[
            { icon: <MapIcon sx={{ fontSize: 36, color: '#4A90E2' }} />, title: 'Xem phòng trên bản đồ', desc: 'Tìm phòng theo vị trí địa lý, xem khoảng cách đến trường, công ty, bệnh viện', btnLabel: 'Khám phá bản đồ', count: `${listings.length} phòng trên bản đồ`, onClick: () => {} },
            { icon: <PeopleIcon sx={{ fontSize: 36, color: '#5CB85C' }} />, title: 'Tìm bạn ở ghép', desc: 'Kết nối với người cùng sở thích, tiết kiệm chi phí, an toàn hơn khi ở ghép', btnLabel: 'Tìm bạn ngay', count: '156 người đang tìm bạn', onClick: () => navigate('/roommate'), color: '#5CB85C' },
            { icon: <HomeIcon sx={{ fontSize: 36, color: '#F0AD4E' }} />, title: 'Bạn là chủ nhà?', desc: 'Đăng tin cho thuê phòng miễn phí, tiếp cận hàng nghìn người thuê', btnLabel: 'Đăng phòng miễn phí', count: 'Miễn phí • Không giới hạn', onClick: () => window.location.href = 'http://localhost:3333/login', color: '#F0AD4E' },
          ].map(item => (
            <Grid item xs={12} md={4} key={item.title}>
              <Box sx={{ p: 4, border: '1px solid #e8e8e8', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, '&:hover': { boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px' }, transition: 'box-shadow 200ms ease' }}>
                {item.icon}
                <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#222222' }}>{item.title}</Typography>
                <Typography variant="body2" sx={{ color: '#6a6a6a', flex: 1, lineHeight: 1.6 }}>{item.desc}</Typography>
                <Button
                  variant="contained"
                  onClick={item.onClick}
                  sx={{ backgroundColor: item.color || '#4A90E2', '&:hover': { backgroundColor: item.color ? item.color + 'cc' : '#2E5C8A' }, borderRadius: '8px', py: 1.25, fontWeight: 600 }}
                >
                  {item.btnLabel}
                </Button>
                <Typography variant="caption" sx={{ color: '#6a6a6a', textAlign: 'center' }}>{item.count}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* AI Chat Button */}
      <Tooltip title="Hỏi AI về phòng trọ" placement="left">
        <Fab
          onClick={() => setChatOpen(!chatOpen)}
          size="medium"
          sx={{
            position: 'fixed', bottom: 120, right: 32, zIndex: 1000,
            backgroundColor: '#4A90E2', color: '#ffffff',
            '&:hover': { backgroundColor: '#2E5C8A' },
            boxShadow: 'rgba(74,144,226,0.35) 0px 4px 20px',
            width: 48, height: 48,
          }}
        >
          <ChatIcon sx={{ fontSize: 22 }} />
        </Fab>
      </Tooltip>

      {/* AI Chat Widget */}
      {chatOpen && (
        <Box sx={{ position: 'fixed', bottom: 180, right: 32, zIndex: 1300 }}>
          <AIChatWidget apiUrl={import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'} onClose={() => setChatOpen(false)} />
        </Box>
      )}
    </Box>
  )
}