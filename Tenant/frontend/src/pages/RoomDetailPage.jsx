import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
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
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  Opacity as DropletIcon,
  Security as ShieldIcon,
  DirectionsCar as CarIcon,
  Star as StarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ImageGallery = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 400,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[200],
}))

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    name: '',
    phone: '',
  })

  const images = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  ]

  const room = {
    id: 1,
    title: 'Studio cao cấp full nội thất',
    location: '123 Nguyễn Huệ, P. Bến Nghé, Q1, TPHCM',
    price: '5.500.000',
    area: 25,
    rating: 4.8,
    reviewCount: 24,
    status: 'available',
    description:
      'Studio hiện đại, đầy đủ tiện nghi, gần trung tâm thành phố. Phòng sáng, thoáng, an toàn 24/7.',
    amenities: [
      { name: 'Wifi', icon: <WifiIcon /> },
      { name: 'Điều hòa', icon: <AcIcon /> },
      { name: 'Nóng lạnh', icon: <DropletIcon /> },
      { name: 'Bảo vệ 24/7', icon: <ShieldIcon /> },
      { name: 'Bãi đậu xe', icon: <CarIcon /> },
    ],
    landlord: {
      name: 'Nguyễn Văn A',
      phone: '0912 345 678',
      email: 'landlord@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    reviews: [
      {
        id: 1,
        author: 'Trần Thị B',
        rating: 5,
        comment: 'Phòng rất đẹp, chủ nhà thân thiện, sạch sẽ. Rất hài lòng!',
        date: '2 tuần trước',
      },
      {
        id: 2,
        author: 'Lê Văn C',
        rating: 4,
        comment: 'Tốt, nhưng hơi ồn vào buổi tối. Nhìn chung vẫn ổn.',
        date: '1 tháng trước',
      },
    ],
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    setOpenSchedule(false)
  }

  const handleBackHome = () => {
    window.scrollTo(0, 0)
    navigate('/')
  }

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
            <ImageGallery>
              <GalleryImage
                component="img"
                image={images[currentImageIndex]}
                alt={`Room ${currentImageIndex + 1}`}
              />
              <GalleryNav onClick={handlePrevImage} sx={{ left: 16 }}>
                <ChevronLeftIcon />
              </GalleryNav>
              <GalleryNav onClick={handleNextImage} sx={{ right: 16 }}>
                <ChevronRightIcon />
              </GalleryNav>
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

            {/* Room Info */}
            <Card sx={{ mt: 4, p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {room.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                        <LocationIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {room.location}
                        </Typography>
                      </Stack>
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
                      {room.price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ/tháng
                    </Typography>
                    <Chip
                      label={room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                      color={room.status === 'available' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Thông tin phòng
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Diện tích
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {room.area}m²
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Đánh giá
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                          <StarIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {room.rating}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Bình luận
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {room.reviews.length}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Mô tả
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {room.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Tiện nghi
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {room.amenities.map((amenity) => (
                      <Chip
                        key={amenity.name}
                        icon={amenity.icon}
                        label={amenity.name}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Đánh giá từ khách
                  </Typography>
                  <Stack spacing={2}>
                    {room.reviews.map((review) => (
                      <Card key={review.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {review.author}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Stack>
                          <Typography variant="body2">{review.comment}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {review.date}
                          </Typography>
                        </Stack>
                      </Card>
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
                    src={room.landlord.avatar}
                    alt={room.landlord.name}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {room.landlord.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Chủ nhà
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <PhoneIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2">{room.landlord.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <EmailIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2">{room.landlord.email}</Typography>
                  </Stack>
                </Stack>

                <Button variant="outlined" fullWidth>
                  Liên hệ chủ nhà
                </Button>
              </Stack>
            </Card>

            {/* Schedule Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Đặt lịch xem phòng
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setOpenSchedule(true)}
                >
                  Đặt lịch ngay
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                >
                  Xem phòng trên bản đồ
                </Button>

                {room.type !== 'Khép kín' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                  >
                    Liên hệ ở ghép
                  </Button>
                )}

                <Alert severity="info">
                  <Typography variant="body2">
                    Chủ nhà sẽ xác nhận lịch xem của bạn trong vòng 24 giờ
                  </Typography>
                </Alert>
              </Stack>
            </Card>

            {/* Similar Rooms */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Phòng tương tự
              </Typography>
              <Stack spacing={2}>
                {[1, 2].map((item) => (
                  <Card key={item} sx={{ overflow: 'hidden', cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={`https://images.unsplash.com/photo-${1522708323590 + item}?w=300&h=200&fit=crop`}
                      alt="Similar room"
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Phòng tương tự {item}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        4.5tr/tháng
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

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
            />
            <TextField
              label="Giờ xem"
              type="time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Họ và tên"
              fullWidth
              required
            />
            <TextField
              label="Số điện thoại"
              type="tel"
              fullWidth
              required
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
    </Box>
  )
}
