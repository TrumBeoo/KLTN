import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Chip,
  Rating,
  IconButton,
  Dialog,
  Alert,
} from '@mui/material'
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as ClockIcon,
  Key as KeyIcon,
  Tune as TuneIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ProfileHeader = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
}))

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
)

export default function TenantProfilePage() {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [favorites, setFavorites] = useState({})
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn A',
    age: 25,
    phone: '0912 345 678',
    email: 'nguyenvana@email.com',
    profession: 'Nhân viên văn phòng',
    gender: 'Nam',
  })

  const rentalHistory = [
    {
      id: 1,
      title: 'Phòng Studio Quận 1',
      price: '4.5 triệu/tháng',
      startDate: '01/01/2024',
      endDate: '31/12/2024',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Phòng trọ Tân Bình',
      price: '3.2 triệu/tháng',
      startDate: '01/06/2023',
      endDate: '31/12/2023',
      status: 'expired',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    },
  ]

  const favoriteRooms = [
    {
      id: 1,
      title: 'Phòng Studio Cao Cấp',
      price: '4.5 triệu',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Phòng Quận 3 Tiện Nghi',
      price: '3.8 triệu',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Chung Cư Mini Phú Nhuận',
      price: '5.2 triệu',
      status: 'rented',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    // Save profile changes
    setEditMode(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <ProfileHeader>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar
              src="https://i.pravatar.cc/150?img=12"
              sx={{ width: 100, height: 100, border: '4px solid white' }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formData.name}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip label="Người thuê" variant="outlined" sx={{ borderColor: 'white', color: 'white' }} />
                <Chip label="Tài khoản hoạt động" variant="outlined" sx={{ borderColor: 'white', color: 'white' }} />
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {formData.email} • {formData.phone}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </Stack>
          </Stack>
        </ProfileHeader>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Thông tin cá nhân" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Sở thích & Tiêu chí" icon={<TuneIcon />} iconPosition="start" />
            <Tab label="Lịch sử thuê phòng" icon={<ClockIcon />} iconPosition="start" />
            <Tab label="Phòng yêu thích" icon={<FavoriteIcon />} iconPosition="start" />
            <Tab label="Đổi mật khẩu" icon={<KeyIcon />} iconPosition="start" />
          </Tabs>
        </Card>

        {/* Tab Content */}
        <Box>
          {/* Personal Info Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Thông tin cá nhân
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tuổi"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nghề nghiệp"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Giới tính"
                      name="gender"
                      select
                      value={formData.gender}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </TextField>
                  </Grid>
                </Grid>

                {editMode && (
                  <Button variant="contained" onClick={handleSave}>
                    Lưu thay đổi
                  </Button>
                )}
              </Stack>
            </Card>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Thông tin cho AI Matching
                </Typography>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Ngân sách dự kiến (triệu VNĐ/tháng)
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField label="Từ" type="number" defaultValue={3} size="small" sx={{ flex: 1 }} />
                    <TextField label="Đến" type="number" defaultValue={5} size="small" sx={{ flex: 1 }} />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Thói quen sinh hoạt
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label="🌙 Đi ngủ sớm" variant="outlined" color="primary" />
                    <Chip label="🎵 Thích yên tĩnh" variant="outlined" color="primary" />
                    <Chip label="🚭 Không hút thuốc" variant="outlined" color="primary" />
                    <Chip label="🐕 Nuôi thú cưng" variant="outlined" color="primary" />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Tiện nghi cần thiết
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label="📶 Wifi" variant="outlined" color="primary" />
                    <Chip label="❄️ Điều hòa" variant="outlined" color="primary" />
                    <Chip label="🚿 Khép kín" variant="outlined" color="primary" />
                    <Chip label="🏍️ Chỗ để xe" variant="outlined" color="primary" />
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </TabPanel>

          {/* Rental History Tab */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              {rentalHistory.map((rental) => (
                <Card key={rental.id} sx={{ overflow: 'hidden' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2 }}>
                    <CardMedia
                      component="img"
                      image={rental.image}
                      alt={rental.title}
                      sx={{ width: { xs: '100%', sm: 200 }, height: 150, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {rental.title}
                      </Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Giá:</strong> {rental.price}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Thời gian:</strong> {rental.startDate} - {rental.endDate}
                        </Typography>
                        <Chip
                          label={rental.status === 'active' ? 'Đang thuê' : 'Đã kết thúc'}
                          color={rental.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>
                      <Button variant="outlined" size="small">
                        Xem hợp đồng
                      </Button>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* Favorites Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {favoriteRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={room.image}
                      alt={room.title}
                    />
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {room.title}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                        {room.price}/tháng
                      </Typography>
                      <Chip
                        label={room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                        color={room.status === 'available' ? 'success' : 'error'}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Button variant="outlined" fullWidth size="small">
                          Xem chi tiết
                        </Button>
                        <IconButton
                          onClick={() => toggleFavorite(room.id)}
                          color={favorites[room.id] ? 'error' : 'default'}
                        >
                          {favorites[room.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Change Password Tab */}
          <TabPanel value={tabValue} index={4}>
            <Card sx={{ p: 3, maxWidth: 500 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Đổi mật khẩu
                </Typography>

                <TextField
                  label="Mật khẩu hiện tại"
                  type="password"
                  fullWidth
                />
                <TextField
                  label="Mật khẩu mới"
                  type="password"
                  fullWidth
                  helperText="Tối thiểu 8 ký tự"
                />
                <TextField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  fullWidth
                />

                <Button variant="contained">
                  Cập nhật mật khẩu
                </Button>

                <Alert severity="info">
                  💡 Sử dụng mật khẩu mạnh với ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </Alert>
              </Stack>
            </Card>
          </TabPanel>
        </Box>
      </Container>
    </Box>
  )
}
