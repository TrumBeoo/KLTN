import { useState, useEffect } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import RoomCardSkeleton from '../components/RoomCardSkeleton'
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
  Skeleton,
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
  Tv as TvIcon,
  LocalLaundryService as WasherIcon,
  Kitchen as FridgeIcon,
  Balcony as BalconyIcon,
  ImageNotSupported as NoImageIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ListingCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}))

const LatestListingItem = styled(Card)(({ theme }) => ({
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}))

function ListingPage() {
  useScrollToTop()
  const [favorites, setFavorites] = useState({})
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/rooms`)
      const data = await response.json()
      
      if (data.success) {
        const formattedRooms = data.data.map(room => ({
          id: room.RoomID,
          title: `${room.RoomType} - ${room.RoomCode}`,
          location: room.BuildingAddress || 'Địa chỉ chưa cập nhật',
          price: room.Price?.toString() || '0',
          area: room.Area || 0,
          rating: 4.5, // Default rating
          reviews: Math.floor(Math.random() * 50) + 1, // Random reviews
          image: room.images?.length > 0 
            ? `${API_URL.replace('/api', '')}${room.images[0].ImageURL}`
            : null,
          status: (room.DisplayStatus || room.Status) === 'available' ? 'available' : 
                  (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'pending' :
                  (room.DisplayStatus || room.Status) === 'viewing' ? 'booked' : 'rented',
          amenities: parseAmenities(room.Amenities),
          landlordName: room.LandlordName,
          buildingName: room.BuildingName,
          maxPeople: room.MaxPeople,
          description: room.Description,
          views: Math.floor(Math.random() * 100) + 10 // Random views
        }))
        setListings(formattedRooms)
      } else {
        setError('Không thể tải danh sách phòng')
      }
    } catch (error) {
      console.error('Fetch rooms error:', error)
      setError('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return []
    try {
      if (typeof amenitiesData === 'string') {
        return JSON.parse(amenitiesData)
      }
      return Array.isArray(amenitiesData) ? amenitiesData : []
    } catch {
      return []
    }
  }

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
      washer: <WasherIcon sx={{ fontSize: '1rem' }} />,
      fridge: <FridgeIcon sx={{ fontSize: '1rem' }} />,
      tv: <TvIcon sx={{ fontSize: '1rem' }} />,
      balcony: <BalconyIcon sx={{ fontSize: '1rem' }} />,
    }
    return icons[amenity] || null
  }

  const formatPrice = (price) => {
    const numPrice = Math.floor(parseFloat(price))
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Danh sách phòng cho thuê
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Tìm phòng phù hợp với nhu cầu của bạn • <strong>{listings.length} kết quả</strong>
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i}>
                      <Stack direction="row" spacing={1}>
                        <Skeleton variant="rectangular" width={120} height={100} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" />
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={fetchRooms}>
              Thử lại
            </Button>
          </Box>
        ) : listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chưa có phòng nào được đăng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng quay lại sau
            </Typography>
          </Box>
        ) : (
        <Grid container spacing={3}>
          {/* Left: Listings */}
          <Grid item xs={12} lg={8}>
            {/* Listings Grid */}
            <Stack spacing={2}>
              {listings.map((listing) => (
                <ListingCard key={listing.id}>
                  <Stack direction="row" spacing={2} sx={{ p: 2 }}>
                    {/* Image */}
                    <Box sx={{ position: 'relative', width: 300, height: 222, flexShrink: 0, borderRadius: 1, overflow: 'hidden' }}>
                      {listing.image ? (
                        <CardMedia
                          component="img"
                          image={listing.image}
                          alt={listing.title}
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.08)'
                            }
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
                          bgcolor: listing.status === 'available' ? '#22C55E' : 
                                   listing.status === 'pending' ? '#F59E0B' :
                                   listing.status === 'booked' ? '#2563EB' : '#EF4444',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 0.5,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {listing.status === 'available' ? 'Trống' : 
                         listing.status === 'pending' ? 'Chờ duyệt' :
                         listing.status === 'booked' ? 'Đã đặt lịch' : 'Đã thuê'}
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
                          {listing.buildingName || listing.location}
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
                        {listing.maxPeople && (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              👥 {listing.maxPeople} người
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        {listing.amenities.slice(0, 5).map((amenity) => (
                          <Box key={amenity} sx={{ color: 'text.secondary' }}>
                            {getAmenityIcon(amenity)}
                          </Box>
                        ))}
                        {listing.amenities.length > 5 && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            +{listing.amenities.length - 5}
                          </Typography>
                        )}
                      </Stack>
                      {listing.landlordName && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.875rem' }}>
                          Chủ nhà: {listing.landlordName}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          sx={{
                            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 2
                            },
                            '&:active': {
                              transform: 'translateY(0)'
                            }
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => toggleFavorite(listing.id)}
                          sx={{
                            borderColor: favorites[listing.id] ? '#F43F5E' : 'inherit',
                            color: favorites[listing.id] ? '#F43F5E' : 'inherit',
                            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: '#F43F5E',
                              backgroundColor: 'rgba(244, 63, 94, 0.04)',
                              transform: 'translateY(-2px)',
                              boxShadow: 2
                            },
                            '&:active': {
                              transform: 'scale(0.95)'
                            }
                          }}
                        >
                          {favorites[listing.id] ? (
                            <>
                              <FavoriteIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                              Đã lưu
                            </>
                          ) : (
                            <>
                              <FavoriteBorderIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                              Lưu phòng
                            </>
                          )}
                        </Button>
                      </Stack>
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
                    <ClockIcon />Tin mới nhất
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  {listings.slice(0, 5).map((listing) => (
                    <LatestListingItem key={listing.id}>
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
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                            {listing.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '0.75rem', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {listing.buildingName || 'Chưa cập nhật'}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>
                            {formatPrice(listing.price)}đ
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <RulerIcon sx={{ fontSize: '0.7rem' }} />
                            <Typography variant="caption">{listing.area}m²</Typography>
                            <ClockIcon sx={{ fontSize: '0.7rem', ml: 0.5 }} />
                            <Typography variant="caption">Mới đăng</Typography>
                          </Stack>
                        </CardContent>
                      </Stack>
                    </LatestListingItem>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        )}
      </Container>
    </Box>
  )
}

export default ListingPage
