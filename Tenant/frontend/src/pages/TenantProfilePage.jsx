import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  Typography,
  Button,
  Stack,
  TextField,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab,
  CardMedia,
  CardContent,
  Rating,
} from '@mui/material'
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Favorite as FavoriteIcon,
  Tune as TuneIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'rgba(26,26,26,0.08) 0px 2px 8px',
}))

const StatusBadge = styled(Chip)(({ theme, status }) => {
  const colors = {
    active: { bg: '#e8f5ee', color: '#008234' },
    pending: { bg: '#fef6e8', color: '#a16100' },
    expired: { bg: '#f2f4f8', color: '#595959' },
    available: { bg: '#e8f5ee', color: '#008234' },
    rented: { bg: '#fde8eb', color: '#c8102e' },
  }
  const style = colors[status] || colors.expired
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    borderRadius: '4px',
  }
})

const InfoChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  fontSize: '0.786rem',
  fontWeight: 500,
  height: '28px',
  backgroundColor: '#e8f2ff',
  color: '#006ce4',
  border: 'none',
}))

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ py: 2 }}>
    {value === index && children}
  </Box>
)

export default function TenantProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState(null)
  const [rentalHistory, setRentalHistory] = useState([])
  const [viewingSchedules, setViewingSchedules] = useState([])
  const [favorites, setFavorites] = useState([])
  const [avatarDialog, setAvatarDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ratingDialog, setRatingDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingNote, setRatingNote] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    budget: '',
    habit: '',
    preference: '',
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'preferences') setTabValue(1)
    else if (tab === 'favorites') setTabValue(2)
    else setTabValue(0)
  }, [searchParams])

  useEffect(() => {
    fetchProfile()
    fetchRentalHistory()
    fetchViewingSchedules()
    fetchFavorites()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API_URL}/tenant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(data.data)
      setFormData({
        name: data.data.Name || '',
        age: data.data.Age || '',
        phone: data.data.Phone || '',
        email: data.data.Email || '',
        budget: data.data.Budget || '',
        habit: data.data.Habit || '',
        preference: data.data.Preference || '',
      })
      setLoading(false)
    } catch (err) {
      console.error('Fetch profile error:', err)
      setError('Không thể tải thông tin hồ sơ')
      setLoading(false)
    }
  }

  const fetchRentalHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API_URL}/tenant/rental-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRentalHistory(data.data)
    } catch (err) {
      console.error('Fetch rental history error:', err)
    }
  }

  const fetchViewingSchedules = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API_URL}/tenant/viewing-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setViewingSchedules(data.data)
    } catch (err) {
      console.error('Fetch viewing schedules error:', err)
    }
  }

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API_URL}/tenant/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(data.data)
    } catch (err) {
      console.error('Fetch favorites error:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      setError('')
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/tenant/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Cập nhật thông tin thành công')
      setEditMode(false)
      fetchProfile()
    } catch (err) {
      setError('Không thể cập nhật thông tin')
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return
    
    try {
      setUploading(true)
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('avatar', selectedFile)
      
      const { data } = await axios.post(`${API_URL}/tenant/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setSuccess('Cập nhật ảnh đại diện thành công')
      setAvatarDialog(false)
      setSelectedFile(null)
      fetchProfile()
    } catch (err) {
      setError('Không thể tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleOpenRating = (room) => {
    setSelectedRoom(room)
    setRatingValue(room.Rating || 0)
    setRatingNote(room.Note || '')
    setRatingDialog(true)
  }

  const handleSaveRating = async () => {
    if (!selectedRoom) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/tenant/favorites/${selectedRoom.RoomID}/rating`,
        { rating: ratingValue, note: ratingNote },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Đánh giá thành công')
      setRatingDialog(false)
      fetchFavorites()
    } catch (err) {
      setError('Không thể lưu đánh giá')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getStatusIcon = (status) => {
    if (status === 'Đã duyệt') return <CheckIcon fontSize="small" />
    if (status === 'Từ chối') return <CancelIcon fontSize="small" />
    return <PendingIcon fontSize="small" />
  }

  const parseHabits = (habitString) => {
    if (!habitString) return []
    return habitString.split(',').map(h => h.trim()).filter(h => h)
  }

  const parsePreferences = (prefString) => {
    if (!prefString) return []
    return prefString.split(',').map(p => p.trim()).filter(p => p)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Profile Header */}
        <ProfileCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile?.AvatarURL}
                sx={{ 
                  width: { xs: 80, sm: 100 }, 
                  height: { xs: 80, sm: 100 },
                  border: '3px solid #e8f2ff'
                }}
              >
                {profile?.Name?.charAt(0)}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => setAvatarDialog(true)}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#006ce4',
                  color: 'white',
                  '&:hover': { bgcolor: '#0057b8' },
                  width: 32,
                  height: 32,
                }}
              >
                <CameraIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {profile?.Name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                <StatusBadge label="Người thuê" size="small" status="active" />
                <StatusBadge 
                  label={profile?.Status === 'Active' ? 'Hoạt động' : 'Bị khóa'} 
                  size="small" 
                  status={profile?.Status === 'Active' ? 'active' : 'expired'} 
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                @{profile?.Username} • Tham gia {formatDate(profile?.CreatedAt)}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                startIcon={<EditIcon />}
                onClick={() => setEditMode(!editMode)}
                size="small"
              >
                {editMode ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
              >
                Đăng xuất
              </Button>
            </Stack>
          </Stack>
        </ProfileCard>

        {/* Tabs */}
        <Card sx={{ mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Thông tin cá nhân" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Sở thích & Tiêu chí" icon={<TuneIcon />} iconPosition="start" />
            <Tab label="Phòng yêu thích" icon={<FavoriteIcon />} iconPosition="start" />
            <Tab label="Lịch sử thuê" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Lịch xem phòng" icon={<ScheduleIcon />} iconPosition="start" />
          </Tabs>
        </Card>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <ProfileCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
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
                      size="small"
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
                      size="small"
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
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                </Grid>
                {editMode && (
                  <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
                    Lưu thay đổi
                  </Button>
                )}
              </ProfileCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ProfileCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Thống kê
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tổng hợp đồng</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {rentalHistory.length}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Lịch xem phòng</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {viewingSchedules.length}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phòng yêu thích</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {favorites.length}
                    </Typography>
                  </Box>
                </Stack>
              </ProfileCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProfileCard>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              <TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tiêu chí tìm phòng
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Ngân sách (VNĐ/tháng)
                </Typography>
                <TextField
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode}
                  size="small"
                  InputProps={{
                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {formData.budget && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    ≈ {formatCurrency(formData.budget)} VNĐ/tháng
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Thói quen sinh hoạt
                </Typography>
                {editMode ? (
                  <TextField
                    name="habit"
                    value={formData.habit}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="VD: Đi ngủ sớm, thích yên tĩnh, không hút thuốc, nuôi thú cưng..."
                    helperText="Phân cách bằng dấu phẩy"
                  />
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {parseHabits(formData.habit).length > 0 ? (
                      parseHabits(formData.habit).map((habit, idx) => (
                        <InfoChip key={idx} label={habit} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa cập nhật thói quen
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tiện nghi mong muốn
                </Typography>
                {editMode ? (
                  <TextField
                    name="preference"
                    value={formData.preference}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="VD: Wifi, điều hòa, khép kín, chỗ để xe, gần trường học..."
                    helperText="Phân cách bằng dấu phẩy"
                  />
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {parsePreferences(formData.preference).length > 0 ? (
                      parsePreferences(formData.preference).map((pref, idx) => (
                        <InfoChip key={idx} label={pref} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa cập nhật tiện nghi mong muốn
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              {editMode && (
                <Button variant="contained" onClick={handleSave}>
                  Lưu thay đổi
                </Button>
              )}
            </Stack>
          </ProfileCard>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#c8102e' }} />
            Phòng yêu thích ({favorites.length})
          </Typography>
          {favorites.length === 0 ? (
            <ProfileCard>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Chưa có phòng yêu thích. Hệ thống AI sẽ gợi ý các phòng phù hợp với bạn!
              </Typography>
            </ProfileCard>
          ) : (
            <Grid container spacing={2}>
              {favorites.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.RoomID}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                    {room.ImageURL && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={room.ImageURL}
                        alt={room.RoomCode}
                      />
                    )}
                    <CardContent sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {room.RoomCode}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenRating(room)}
                          sx={{ color: '#006ce4' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      {room.Rating && (
                        <Box sx={{ mb: 1 }}>
                          <Rating value={room.Rating} precision={0.5} size="small" readOnly />
                        </Box>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {room.Ward}, {room.District}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                        <InfoChip label={`${formatCurrency(room.Price)} VNĐ`} size="small" />
                        <InfoChip label={`${room.Area}m²`} size="small" />
                        <StatusBadge 
                          label={room.Status === 'available' ? 'Còn trống' : 'Đã thuê'} 
                          size="small" 
                          status={room.Status}
                        />
                      </Stack>
                      {room.Note && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                          📝 {room.Note}
                        </Typography>
                      )}
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/room/${room.RoomID}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lịch sử thuê phòng ({rentalHistory.length})
          </Typography>
          {rentalHistory.length === 0 ? (
            <ProfileCard>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Chưa có lịch sử thuê phòng
              </Typography>
            </ProfileCard>
          ) : (
            <Stack spacing={2}>
              {rentalHistory.map((rental) => (
                <ProfileCard key={rental.ContractID}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {rental.ImageURL && (
                      <Box
                        component="img"
                        src={rental.ImageURL}
                        sx={{
                          width: { xs: '100%', sm: 140 },
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {rental.RoomType} - {rental.RoomCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {rental.Ward}, {rental.District}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                        <InfoChip label={`${formatCurrency(rental.Price)} VNĐ/tháng`} size="small" />
                        <InfoChip label={`${rental.Area}m²`} size="small" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(rental.StartDate)} - {formatDate(rental.EndDate)}
                      </Typography>
                      <StatusBadge 
                        label={rental.Status} 
                        size="small" 
                        status={rental.Status === 'Đang thuê' ? 'active' : 'expired'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Stack>
                </ProfileCard>
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lịch xem phòng ({viewingSchedules.length})
          </Typography>
          {viewingSchedules.length === 0 ? (
            <ProfileCard>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Chưa có lịch xem phòng
              </Typography>
            </ProfileCard>
          ) : (
            <Grid container spacing={2}>
              {viewingSchedules.map((schedule) => (
                <Grid item xs={12} sm={6} md={4} key={schedule.ScheduleID}>
                  <Card sx={{ borderRadius: 2 }}>
                    {schedule.ImageURL && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={schedule.ImageURL}
                        alt={schedule.RoomCode}
                      />
                    )}
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        {getStatusIcon(schedule.Status)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                          {schedule.RoomCode}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {schedule.Ward}, {schedule.District}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        📅 {formatDate(schedule.DateTime)}
                      </Typography>
                      <StatusBadge 
                        label={schedule.Status} 
                        size="small" 
                        status={schedule.Status === 'Đã duyệt' ? 'active' : schedule.Status === 'Chờ duyệt' ? 'pending' : 'expired'}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Avatar Upload Dialog */}
        <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ marginTop: 16 }}
            />
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Đã chọn: {selectedFile.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialog(false)}>Hủy</Button>
            <Button 
              onClick={handleAvatarUpload} 
              variant="contained" 
              disabled={!selectedFile || uploading}
            >
              {uploading ? <CircularProgress size={20} /> : 'Tải lên'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Đánh giá phòng {selectedRoom?.RoomCode}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Đánh giá của bạn
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(e, newValue) => setRatingValue(newValue)}
                  precision={0.5}
                  size="large"
                />
              </Box>
              <TextField
                label="Ghi chú (tùy chọn)"
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                multiline
                rows={4}
                fullWidth
                placeholder="Nhận xét của bạn về phòng này..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialog(false)}>Hủy</Button>
            <Button onClick={handleSaveRating} variant="contained">
              Lưu đánh giá
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
