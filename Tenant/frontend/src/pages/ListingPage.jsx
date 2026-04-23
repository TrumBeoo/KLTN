import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import RoomCardSkeleton from '../components/RoomCardSkeleton'
import SecondaryMenu from '../components/SecondaryMenu'
import {
  Box, Container, Grid, Button, Typography, Stack, IconButton, Skeleton,
} from '@mui/material'
import {
  Star as StarIcon, LocationOn as LocationIcon, Straighten as RulerIcon,
  Wifi as WifiIcon, AcUnit as AcIcon, Opacity as DropletIcon,
  Security as ShieldIcon, DirectionsCar as CarIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  Visibility as EyeIcon, AccessTime as ClockIcon,
  Tv as TvIcon, LocalLaundryService as WasherIcon,
  Kitchen as FridgeIcon, Balcony as BalconyIcon,
  ImageNotSupported as NoImageIcon, Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ImageWrapper = styled(Box)({
  borderRadius: '10px',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#f2f2f2',
  width: 280,
  height: 210,
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 400ms ease',
    display: 'block',
  },
})

const ListingRow = styled(Box)({
  display: 'flex',
  gap: 20,
  padding: '20px 0',
  borderBottom: '1px solid #e8e8e8',
  cursor: 'pointer',
  '&:hover .listing-image': { transform: 'scale(1.04)' },
  '&:last-child': { borderBottom: 'none' },
})

const AmenityIcon = ({ amenity }) => {
  const icons = {
    wifi: <WifiIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    ac: <AcIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    heater: <DropletIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    security: <ShieldIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    parking: <CarIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    washer: <WasherIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    fridge: <FridgeIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    tv: <TvIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
    balcony: <BalconyIcon sx={{ fontSize: '1rem', color: '#222222' }} />,
  }
  return icons[amenity] || null
}

const StatusBadge = styled(Box)(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '0.8125rem',
  fontWeight: 500,
  backgroundColor:
    status === 'available' ? '#e8f5e9' :
    status === 'pending' ? '#fff3e0' :
    status === 'booked' ? '#e8f0fe' : '#fce8e6',
  color:
    status === 'available' ? '#5CB85C' :
    status === 'pending' ? '#F0AD4E' :
    status === 'booked' ? '#5BC0DE' : '#c13515',
}))

const statusLabel = { available: 'Còn trống', pending: 'Chờ duyệt', booked: 'Đã đặt lịch', rented: 'Đã thuê' }

const SideCard = styled(Box)({
  cursor: 'pointer',
  display: 'flex',
  gap: 12,
  padding: '12px 0',
  borderBottom: '1px solid #f2f2f2',
  '&:last-child': { borderBottom: 'none' },
  '&:hover .side-title': { color: '#4A90E2' },
})

function ListingPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState({})
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/rooms`)
      const data = await response.json()
      if (data.success) {
        const formattedRooms = data.data.map(room => {
          let imageUrl = null
          if (room.images?.length > 0) {
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
          amenities: parseAmenities(room.Amenities),
          landlordName: room.LandlordName,
          buildingName: room.BuildingName,
          maxPeople: room.MaxPeople,
          description: room.Description,
          views: Math.floor(Math.random() * 100) + 10,
        }
        })
        setListings(formattedRooms)
      } else {
        setError('Không thể tải danh sách phòng')
      }
    } catch {
      setError('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const parseAmenities = (d) => {
    if (!d) return []
    try { return typeof d === 'string' ? JSON.parse(d) : Array.isArray(d) ? d : [] }
    catch { return [] }
  }

  const toggleFavorite = (id, e) => {
    e?.stopPropagation()
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const formatPrice = (price) => Math.floor(parseFloat(price)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <SecondaryMenu onCategoryChange={() => {}} onDistrictChange={() => {}} />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#222222', mb: 0.5 }}>
            Danh sách phòng cho thuê
          </Typography>
          <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
            <Box component="span" sx={{ fontWeight: 600, color: '#222222' }}>{listings.length}</Box> phòng đang cho thuê tại Hà Nội
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Stack spacing={0}>
                {[1, 2, 3, 4].map(i => <RoomCardSkeleton key={i} />)}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
            </Grid>
          </Grid>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#c13515', mb: 2, fontWeight: 500 }}>{error}</Typography>
            <Button onClick={fetchRooms} variant="contained" sx={{ backgroundColor: '#4A90E2' }}>Thử lại</Button>
          </Box>
        ) : listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#6a6a6a', mb: 1, fontSize: '1.125rem' }}>Chưa có phòng nào được đăng</Typography>
            <Typography variant="body2" sx={{ color: '#929292' }}>Vui lòng quay lại sau</Typography>
          </Box>
        ) : (
          <Grid container spacing={5}>
            {/* Left: Listings */}
            <Grid item xs={12} lg={8}>
              <Box>
                {listings.map(listing => (
                  <ListingRow key={listing.id} onClick={() => navigate(`/room/${listing.id}`)}>
                    <ImageWrapper>
                      {listing.image ? (
                        <img className="listing-image" src={listing.image} alt={listing.title} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NoImageIcon sx={{ fontSize: 48, color: '#c1c1c1' }} />
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        onClick={e => toggleFavorite(listing.id, e)}
                        sx={{ position: 'absolute', top: 6, right: 6, color: favorites[listing.id] ? '#4A90E2' : 'rgba(255,255,255,0.85)', p: 0.5 }}
                      >
                        {favorites[listing.id]
                          ? <FavoriteIcon sx={{ fontSize: '1.125rem' }} />
                          : <FavoriteBorderIcon sx={{ fontSize: '1.125rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                        }
                      </IconButton>
                      {/* Views Badge */}
                      <Box sx={{ position: 'absolute', bottom: 6, right: 6, display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', px: 0.75, py: 0.25 }}>
                        <EyeIcon sx={{ fontSize: '0.75rem', color: '#6a6a6a' }} />
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6a6a6a' }}>{listing.views}</Typography>
                      </Box>
                    </ImageWrapper>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', py: 0.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.75 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.0625rem', color: '#222222', flex: 1, mr: 2 }}>
                          {listing.buildingName || listing.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                          <StarIcon sx={{ fontSize: '0.875rem', color: '#222222' }} />
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#222222' }}>{listing.rating}</Typography>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }}>({listing.reviews})</Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <LocationIcon sx={{ fontSize: '0.875rem', color: '#6a6a6a' }} />
                        <Typography variant="body2" sx={{ color: '#6a6a6a', fontSize: '0.8125rem' }}>
                          {listing.buildingName || listing.location}
                        </Typography>
                      </Stack>

                      {/* Status */}
                      <StatusBadge status={listing.status} sx={{ mb: 1.5, alignSelf: 'flex-start' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', flexShrink: 0 }} />
                        {statusLabel[listing.status]}
                      </StatusBadge>

                      {/* Specs */}
                      <Stack direction="row" spacing={2.5} sx={{ mb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <RulerIcon sx={{ fontSize: '0.875rem', color: '#6a6a6a' }} />
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }}>{listing.area}m²</Typography>
                        </Stack>
                        {listing.maxPeople && (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <GroupIcon sx={{ fontSize: '0.875rem', color: '#6a6a6a' }} />
                            <Typography sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }}>{listing.maxPeople} người</Typography>
                          </Stack>
                        )}
                        {listing.landlordName && (
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }}>
                            Chủ: {listing.landlordName}
                          </Typography>
                        )}
                      </Stack>

                      {/* Amenities */}
                      {listing.amenities.length > 0 && (
                        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                          {listing.amenities.slice(0, 6).map(a => (
                            <Box key={a} title={a}><AmenityIcon amenity={a} /></Box>
                          ))}
                          {listing.amenities.length > 6 && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#6a6a6a', alignSelf: 'center' }}>+{listing.amenities.length - 6}</Typography>
                          )}
                        </Stack>
                      )}

                      {/* Price & CTA */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
                        <Typography sx={{ fontSize: '1.0625rem' }}>
                          <Box component="span" sx={{ fontWeight: 700, color: '#222222' }}>{formatPrice(listing.price)}đ</Box>
                          <Box component="span" sx={{ color: '#6a6a6a', fontWeight: 400 }}>/tháng</Box>
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            onClick={e => { e.stopPropagation(); toggleFavorite(listing.id, e) }}
                            sx={{ color: favorites[listing.id] ? '#4A90E2' : '#6a6a6a', borderColor: favorites[listing.id] ? '#4A90E2' : '#c1c1c1', border: '1px solid', borderRadius: '20px', px: 1.5, py: 0.75, minWidth: 'auto', fontSize: '0.8125rem' }}
                          >
                            {favorites[listing.id] ? 'Đã lưu' : 'Lưu'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: '0.875rem' }} />}
                            sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '20px', px: 2, py: 0.75, fontSize: '0.8125rem', fontWeight: 600 }}
                          >
                            Xem chi tiết
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </ListingRow>
                ))}
              </Box>

              {/* Pagination */}
              <Stack direction="row" spacing={1} sx={{ mt: 5, justifyContent: 'center' }}>
                {['← Trước', '1', '2', '3', '...', '10', 'Tiếp →'].map((label, i) => (
                  <Button
                    key={i}
                    variant={label === '1' ? 'contained' : 'text'}
                    sx={{
                      minWidth: 40, height: 40, fontWeight: label === '1' ? 700 : 400,
                      backgroundColor: label === '1' ? '#222222' : 'transparent',
                      color: label === '1' ? '#ffffff' : '#222222',
                      '&:hover': { backgroundColor: label === '1' ? '#3f3f3f' : '#f7f7f7' },
                      fontSize: '0.875rem',
                      padding: label.includes('←') || label.includes('→') ? '0 16px' : undefined,
                      borderRadius: label.includes('←') || label.includes('→') ? '8px' : '50%',
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            {/* Right Sidebar */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 96 }}>
                {/* Map placeholder */}
                <Box sx={{ borderRadius: '12px', overflow: 'hidden', height: 320, backgroundColor: '#f7f7f7', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 1 }}>🗺️</Typography>
                    <Typography variant="body2" sx={{ color: '#6a6a6a', fontWeight: 500 }}>Bản đồ phòng trọ</Typography>
                    <Typography variant="caption" sx={{ color: '#929292', display: 'block', mt: 0.5 }}>Sẽ được tích hợp sớm</Typography>
                  </Box>
                </Box>

                {/* Latest Listings */}
                <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden', p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                    <ClockIcon sx={{ fontSize: '1.125rem', color: '#4A90E2' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222' }}>Tin đăng mới nhất</Typography>
                  </Stack>
                  {listings.slice(0, 10).map(listing => (
                    <SideCard key={listing.id} onClick={() => navigate(`/room/${listing.id}`)}>
                      <Box sx={{ width: 72, height: 72, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f2f2f2' }}>
                        {listing.image ? (
                          <Box component="img" src={listing.image} alt={listing.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <NoImageIcon sx={{ fontSize: 24, color: '#c1c1c1' }} />
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography className="side-title" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#222222', mb: 0.375, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 150ms' }}>
                          {listing.buildingName || listing.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#4A90E2', fontWeight: 600, mb: 0.25 }}>
                          {formatPrice(listing.price)}đ/tháng
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6a6a6a' }}>
                          {listing.area}m² · Mới đăng
                        </Typography>
                      </Box>
                    </SideCard>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default ListingPage