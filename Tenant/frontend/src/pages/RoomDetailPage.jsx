import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Rating,
  IconButton,
  Dialog,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Star as StarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ImageGallery = styled(Box)(({ theme }) => (({
  position: 'relative',
  height: 400,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[200],
})))

const GalleryImage = styled(CardMedia)({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

const GalleryNav = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  zIndex: 10,
}))

export default function RoomDetailPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { id: roomId } = useParams()
  const auth = useAuth()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [userSchedule, setUserSchedule] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    name: '',
    phone: '',
  })
  const { notification, showSuccess, showError, hideNotification } = useNotification()

  useEffect(() => {
    if (roomId) {
      fetchRoomData()
      fetchUserSchedule() // Always check schedule status
    }
  }, [roomId])

  // Re-fetch schedule when user login/logout
  useEffect(() => {
    if (roomId) {
      fetchUserSchedule()
    }
  }, [auth.user])

  const fetchRoomData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rooms/${roomId}`)
      const data = await response.json()
      if (data.success) {
        setRoom(data.data)
      }
    } catch (error) {
      console.error('Fetch room error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSchedule = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUserSchedule(null)
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success && data.data) {
        setUserSchedule(data.data)
      } else {
        setUserSchedule(null)
      }
    } catch (error) {
      console.error('Fetch user schedule error:', error)
      setUserSchedule(null)
    }
  }

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setOpenLoginModal(true)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: room.RoomID,
          date: scheduleData.date,
          time: scheduleData.time
        })
      })

      const data = await response.json()

      if (data.success) {
        setOpenSchedule(false)
        setScheduleData({ date: '', time: '', name: '', phone: '' })
        showSuccess('Thành công!', 'Đặt lịch xem phòng thành công! Chủ nhà sẽ xác nhận trong vòng 24 giờ.')
        fetchUserSchedule() // Refresh user schedule
      } else {
        showError('Lỗi!', data.message || 'Đặt lịch xem phòng thất bại')
      }
    } catch (error) {
      console.error('Schedule error:', error)
      showError('Lỗi!', 'Lỗi khi đặt lịch xem phòng')
    }
  }

  const handleCancelSchedule = async () => {
    if (!userSchedule) return

    try {
      setCancelLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/schedule/${userSchedule.ScheduleID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setUserSchedule(null) // Clear user schedule
        setOpenCancelModal(false)
        showSuccess('Thành công!', 'Hủy lịch xem phòng thành công!')
      } else {
        showError('Lỗi!', data.message || 'Hủy lịch xem phòng thất bại')
      }
    } catch (error) {
      console.error('Cancel schedule error:', error)
      showError('Lỗi!', 'Lỗi khi hủy lịch xem phòng')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleBackHome = () => {
    window.scrollTo(0, 0)
    navigate('/')
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!room) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Không tìm thấy phòng</Typography>
      </Box>
    )
  }

  const images = room.images?.length > 0 
    ? room.images.map(img => `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${img.ImageURL}`)
    : []

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackHome}
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>
        <Grid container spacing={4}>
          {/* Left Column - Images & Details */}
          <Grid item xs={12} md={8}>
            {/* Image Gallery */}
            {images.length > 0 ? (
              <ImageGallery>
                <GalleryImage
                  component="img"
                  image={images[currentImageIndex]}
                  alt={`Room ${currentImageIndex + 1}`}
                />
                {images.length > 1 && (
                  <>
                    <GalleryNav onClick={handlePrevImage} sx={{ left: 16 }}>
                      <ChevronLeftIcon />
                    </GalleryNav>
                    <GalleryNav onClick={handleNextImage} sx={{ right: 16 }}>
                      <ChevronRightIcon />
                    </GalleryNav>
                  </>
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                    />
                  ))}
                </Box>
              </ImageGallery>
            ) : (
              <Box
                sx={{
                  height: 400,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Chưa có hình ảnh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chủ nhà chưa tải lên hình ảnh cho phòng này
                </Typography>
              </Box>
            )}

            {/* Room Info */}
            <Card sx={{ mt: 4, p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {room.Description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => setIsFavorite(!isFavorite)}
                        color={isFavorite ? 'error' : 'default'}
                      >
                        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <IconButton>
                        <ShareIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {Math.floor(parseFloat(room.Price)).toLocaleString('vi-VN')}đ/tháng
                    </Typography>
                    <Chip
                      label={
                        (room.DisplayStatus || room.Status) === 'available' ? 'Còn trống' : 
                        (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'Chờ duyệt' :
                        (room.DisplayStatus || room.Status) === 'viewing' ? 'Đã đặt lịch' : 
                        (room.DisplayStatus || room.Status) === 'rented' ? 'Đã thuê' : 'Không khả dụng'
                      }
                      color={
                        (room.DisplayStatus || room.Status) === 'available' ? 'success' : 
                        (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'warning' :
                        (room.DisplayStatus || room.Status) === 'viewing' ? 'info' : 'error'
                      }
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Tiện nghi
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {room.amenities?.map((amenity) => (
                      <Chip
                        key={amenity.AmenityID}
                        label={amenity.Name}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Right Column - Landlord & CTA */}
          <Grid item xs={12} md={4}>
            {/* Landlord Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Thông tin chủ nhà
                </Typography>

                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src="https://i.pravatar.cc/150?img=12"
                    alt={room.LandlordName}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {room.LandlordName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Chủ nhà
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    onClick={() => window.location.href = `tel:${room.LandlordPhone}`}
                  >
                    Gọi
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<MessageIcon />}
                  >
                    Nhắn tin
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {/* Schedule Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Đặt lịch xem phòng
                </Typography>

                {userSchedule ? (
                  <>
                    <Alert 
                      severity={userSchedule.Status === 'Chờ duyệt' ? 'warning' : userSchedule.Status === 'Đã duyệt' ? 'success' : 'info'}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {userSchedule.Status === 'Chờ duyệt' ? 'Lịch xem đang chờ duyệt' : 
                         userSchedule.Status === 'Đã duyệt' ? 'Lịch xem đã được duyệt' : 
                         'Lịch xem của bạn'}
                      </Typography>
                      <Typography variant="body2">
                        Thời gian: {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2">
                        Trạng thái: <strong>{userSchedule.Status}</strong>
                      </Typography>
                    </Alert>
                    
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      size="large"
                      onClick={() => setOpenCancelModal(true)}
                      disabled={cancelLoading}
                    >
                      {userSchedule.Status === 'Chờ duyệt' ? 'Hủy lịch xem' : 'Xem chi tiết'}
                    </Button>
                  </>
                ) : room.Status === 'available' && (room.DisplayStatus || room.Status) === 'available' ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => {
                      if (!auth.user) {
                        setOpenLoginModal(true)
                      } else {
                        setOpenSchedule(true)
                      }
                    }}
                  >
                    Đặt lịch ngay
                  </Button>
                ) : (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Phòng này hiện không khả dụng để đặt lịch xem
                    </Typography>
                    <Typography variant="body2">
                      Trạng thái: {
                        (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'Có người đặt lịch chờ duyệt' :
                        (room.DisplayStatus || room.Status) === 'rented' ? 'Đã thuê' : 
                        (room.DisplayStatus || room.Status) === 'viewing' ? 'Có người đã đặt lịch' : 'Không khả dụng'
                      }
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                >
                  Xem phòng trên bản đồ
                </Button>

                {!userSchedule && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      Chủ nhà sẽ xác nhận lịch xem của bạn trong vòng 24 giờ
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Login Modal */}
      <Dialog open={openLoginModal} onClose={() => setOpenLoginModal(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Yêu cầu đăng nhập
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Vui lòng đăng nhập để đặt lịch xem phòng
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" fullWidth onClick={() => setOpenLoginModal(false)}>
              Hủy
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setOpenLoginModal(false)
                navigate('/login')
              }}
            >
              Đăng nhập
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Đặt lịch xem phòng
          </Typography>

          <Box component="form" onSubmit={handleScheduleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Ngày xem"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={scheduleData.date}
              onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
            />
            <TextField
              label="Giờ xem"
              type="time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={scheduleData.time}
              onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
            />
            <TextField
              label="Họ và tên"
              fullWidth
              required
              value={scheduleData.name}
              onChange={(e) => setScheduleData({ ...scheduleData, name: e.target.value })}
            />
            <TextField
              label="Số điện thoại"
              type="tel"
              fullWidth
              required
              value={scheduleData.phone}
              onChange={(e) => setScheduleData({ ...scheduleData, phone: e.target.value })}
            />

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" fullWidth onClick={() => setOpenSchedule(false)}>
                Hủy
              </Button>
              <Button variant="contained" fullWidth type="submit">
                Xác nhận
              </Button>
            </Stack>
          </Box>
        </Box>
      </Dialog>

      {/* Cancel Schedule Modal */}
      <Dialog open={openCancelModal} onClose={() => setOpenCancelModal(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {userSchedule?.Status === 'Chờ duyệt' ? 'Hủy lịch xem phòng' : 'Thông tin lịch xem'}
          </Typography>

          {userSchedule && (
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity={userSchedule.Status === 'Chờ duyệt' ? 'warning' : userSchedule.Status === 'Đã duyệt' ? 'success' : 'info'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Thông tin lịch xem:
                </Typography>
                <Typography variant="body2">
                  • Thời gian: {new Date(userSchedule.DateTime).toLocaleString('vi-VN')}
                </Typography>
                <Typography variant="body2">
                  • Trạng thái: <strong>{userSchedule.Status}</strong>
                </Typography>
                <Typography variant="body2">
                  • Đặt lúc: {new Date(userSchedule.CreatedAt).toLocaleString('vi-VN')}
                </Typography>
              </Alert>

              {userSchedule.Status === 'Chờ duyệt' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Bạn có thể hủy lịch xem này trước khi chủ nhà xác nhận. Sau khi đã được duyệt, vui lòng liên hệ trực tiếp với chủ nhà để thay đổi.
                  </Typography>
                </Alert>
              )}

              {userSchedule.Status === 'Đã duyệt' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Lịch xem của bạn đã được chủ nhà xác nhận. Vui lòng đến đúng giờ hoặc liên hệ chủ nhà nếu cần thay đổi.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setOpenCancelModal(false)}
            >
              Đóng
            </Button>
            {userSchedule?.Status === 'Chờ duyệt' && (
              <Button 
                variant="contained" 
                color="error"
                fullWidth 
                onClick={handleCancelSchedule}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Đang hủy...' : 'Hủy lịch xem'}
              </Button>
            )}
          </Stack>
        </Box>
      </Dialog>

      {/* Notification Modal */}
      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Box>
  )
}
