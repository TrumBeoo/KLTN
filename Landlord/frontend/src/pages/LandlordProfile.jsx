import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Stack,
  Button,
  Chip,
  IconButton,
  Divider,
  Paper,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  Apartment as ApartmentIcon,
  MeetingRoom as RoomIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

export default function LandlordProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [buildings, setBuildings] = useState([])
  const [listings, setListings] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch profile with stats
      const profileRes = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const profileJson = await profileRes.json()

      if (!profileJson.success) {
        throw new Error(profileJson.message)
      }

      setProfileData(profileJson.data)

      // Fetch buildings
      const buildingsRes = await fetch(`${API_URL}/profile/buildings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const buildingsJson = await buildingsRes.json()
      if (buildingsJson.success) {
        setBuildings(buildingsJson.data)
      }

      // Fetch listings
      const listingsRes = await fetch(`${API_URL}/profile/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const listingsJson = await listingsRes.json()
      if (listingsJson.success) {
        setListings(listingsJson.data)
      }

      // Fetch reviews
      const reviewsRes = await fetch(`${API_URL}/profile/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const reviewsJson = await reviewsRes.json()
      if (reviewsJson.success) {
        setReviews(reviewsJson.data)
      }

      setLoading(false)
    } catch (err) {
      console.error('Fetch profile error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!profileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không tìm thấy thông tin hồ sơ</Alert>
      </Box>
    )
  }

  const { profile, stats } = profileData

  return (
    <Box>
      {/* Profile Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #5E6AD2 0%, #7170FF 100%)', color: 'white', border: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.avatarURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=128&background=7170FF&color=fff`}
                sx={{ width: 112, height: 112, border: '4px solid white', boxShadow: 3 }}
              />
              {profile.status === 'Active' && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 28,
                    height: 28,
                    backgroundColor: '#22C55E',
                    border: '3px solid white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: '1rem', color: 'white' }} />
                </Box>
              )}
            </Box>

            {/* Profile Info */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {profile.name}
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 0.5, sm: 2 }} 
                sx={{ mb: 1.5, fontSize: '0.9375rem', opacity: 0.95 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <EmailIcon sx={{ fontSize: '1rem' }} />
                  {profile.email}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <PhoneIcon sx={{ fontSize: '1rem' }} />
                  {profile.phone}
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Đã xác thực"
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<StarIcon />}
                  label={`${stats.avgRating} ⭐ (${stats.totalReviews} đánh giá)`}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<CalendarIcon />}
                  label={`Tham gia ${formatDate(profile.memberSince)}`}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                }}
                startIcon={<EditIcon />}
                onClick={() => navigate('/profile/edit')}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'primary.subtle', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5
              }}>
                <ApartmentIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.totalBuildings}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tòa nhà
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'info.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5
              }}>
                <RoomIcon sx={{ fontSize: '1.5rem', color: 'info.main' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.totalRooms}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tổng phòng
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'success.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5
              }}>
                <TrendingUpIcon sx={{ fontSize: '1.5rem', color: 'success.main' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.occupancyRate}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tỷ lệ lấp đầy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'warning.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5
              }}>
                <VisibilityIcon sx={{ fontSize: '1.5rem', color: 'warning.main' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.activeListings}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tin đang đăng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Buildings List */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Danh sách tòa nhà ({buildings.length})
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/buildings')}
                  sx={{ textTransform: 'none' }}
                >
                  Xem tất cả
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              {buildings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tòa nhà nào
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {buildings.map((building) => (
                    <Paper 
                      key={building.BuildingID} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => navigate(`/buildings/${building.BuildingID}`)}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box sx={{ 
                          width: 56, 
                          height: 56, 
                          borderRadius: 2, 
                          backgroundColor: 'primary.subtle', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <ApartmentIcon sx={{ fontSize: '1.75rem', color: 'primary.main' }} />
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {building.BuildingName}
                          </Typography>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                              <LocationIcon sx={{ fontSize: '1rem' }} />
                              {building.Address}, {building.Ward}, {building.District}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`${building.totalRooms} phòng`} 
                                size="small" 
                                sx={{ fontSize: '0.75rem' }}
                              />
                              <Chip 
                                label={`${building.rentedRooms} đã thuê`} 
                                size="small" 
                                color="success"
                                sx={{ fontSize: '0.75rem' }}
                              />
                              <Chip 
                                label={`${building.availableRooms} trống`} 
                                size="small" 
                                color="info"
                                sx={{ fontSize: '0.75rem' }}
                              />
                              <Chip 
                                label={`${building.occupancyRate}% lấp đầy`} 
                                size="small" 
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Active Listings */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tin đăng đang hoạt động ({listings.length})
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/listings')}
                  sx={{ textTransform: 'none' }}
                >
                  Xem tất cả
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              {listings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tin đăng nào
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {listings.slice(0, 6).map((listing) => (
                    <Grid item xs={12} sm={6} key={listing.ListingID}>
                      <Paper 
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => navigate(`/listings/${listing.ListingID}`)}
                      >
                        {listing.primaryImage && (
                          <Box
                            component="img"
                            src={listing.primaryImage}
                            alt={listing.Title}
                            sx={{
                              width: '100%',
                              height: 160,
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, noWrap: true }}>
                            {listing.Title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8125rem' }}>
                            {listing.BuildingName} • {listing.RoomCode}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {listing.Price?.toLocaleString('vi-VN')}đ
                            </Typography>
                            <Chip 
                              icon={<VisibilityIcon />}
                              label={listing.viewCount}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Stack>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Đánh giá từ người thuê
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {reviews.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có đánh giá nào
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {reviews.slice(0, 5).map((review) => (
                    <Paper key={review.ReviewID} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                        <Avatar 
                          src={review.TenantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.TenantName)}&size=40`}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {review.TenantName}
                          </Typography>
                          <Rating value={review.Rating} size="small" readOnly />
                        </Box>
                      </Stack>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        {review.Content}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {review.BuildingName} • {review.RoomCode} • {formatDate(review.ReviewDate)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
