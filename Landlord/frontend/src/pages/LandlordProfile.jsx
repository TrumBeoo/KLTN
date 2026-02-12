import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Stack,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon,
  Apartment as ApartmentIcon,
  LocationOn as LocationIcon,
  MeetingRoom as DoorIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material'

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function LandlordProfile() {
  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Trần Thị B',
    phone: '0987 654 321',
    email: 'tranthib@email.com',
    dob: '1985-05-15',
    address: 'Quận 1, TP. Hồ Chí Minh'
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const buildings = [
    {
      name: 'Chung cư Mini Phú Nhuận',
      address: '123 Phan Đăng Lưu, Phú Nhuận, TP.HCM',
      rooms: { total: 12, empty: 5, rented: 7 }
    },
    {
      name: 'Nhà trọ Tân Bình',
      address: '456 Lạc Long Quân, Tân Bình, TP.HCM',
      rooms: { total: 8, empty: 2, rented: 6 }
    },
    {
      name: 'Chung cư Sinh viên Quận 7',
      address: '789 Nguyễn Văn Linh, Quận 7, TP.HCM',
      rooms: { total: 4, empty: 1, rented: 3 }
    }
  ]

  const stats = [
    { label: 'Tổng số phòng', value: '24', icon: ApartmentIcon },
    { label: 'Phòng trống', value: '8', icon: DoorIcon },
    { label: 'Phòng đã thuê', value: '14', icon: DoorIcon },
    { label: 'Doanh thu tháng', value: '75.5M', icon: ApartmentIcon }
  ]

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    console.log('Saving profile:', formData)
    setEditMode(false)
  }

  const handleChangePassword = () => {
    console.log('Changing password:', passwordData)
    setShowPasswordDialog(false)
    setPasswordData({ current: '', new: '', confirm: '' })
  }

  return (
    <Box>
      {/* Profile Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)', color: 'white' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src="https://i.pravatar.cc/150?img=8"
                sx={{ width: 112, height: 112, border: '4px solid white' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  backgroundColor: '#22C55E',
                  border: '3px solid white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}
              >
                <CheckIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Trần Thị B
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1, fontSize: '0.9375rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  📧 tranthib@email.com
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  📱 0987 654 321
                </Box>
              </Stack>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(255,255,255,0.25)', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.875rem', fontWeight: 600 }}>
                🟢 Tài khoản hoạt động
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                sx={{ backgroundColor: 'white', color: 'primary.main', textTransform: 'none' }}
                startIcon={<EditIcon />}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white', textTransform: 'none' }}
                startIcon={<LogoutIcon />}
              >
                Đăng xuất
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Thông tin cá nhân" />
          <Tab label="Đổi mật khẩu" />
          <Tab label="Thông tin chung cư" />
        </Tabs>

        {/* Tab 1: Personal Info */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            {editMode ? (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ngày sinh"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleFormChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Địa chỉ"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      multiline
                      rows={2}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button onClick={() => setEditMode(false)}>Hủy</Button>
                  <Button variant="contained" onClick={handleSaveProfile}>
                    Lưu thay đổi
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.address}
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ alignSelf: 'flex-start' }}>
                  Chỉnh sửa
                </Button>
              </Stack>
            )}
          </CardContent>
        </TabPanel>

        {/* Tab 2: Change Password */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Button variant="contained" onClick={() => setShowPasswordDialog(true)}>
              Đổi mật khẩu
            </Button>
          </CardContent>
        </TabPanel>

        {/* Tab 3: Buildings */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {stats.map((stat, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Buildings List */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Danh sách chung cư đang quản lý
            </Typography>
            <Stack spacing={2}>
              {buildings.map((building, i) => (
                <Card key={i}>
                  <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                      <Box sx={{ width: 56, height: 56, backgroundColor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontSize: '1.75rem', flexShrink: 0 }}>
                        🏢
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {building.name}
                        </Typography>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                            <LocationIcon sx={{ fontSize: '1rem' }} />
                            {building.address}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'primary.main', fontWeight: 600 }}>
                            <DoorIcon sx={{ fontSize: '1rem' }} />
                            {building.rooms.total} phòng ({building.rooms.empty} trống, {building.rooms.rented} đã thuê)
                          </Box>
                        </Stack>
                      </Box>
                      <Button variant="outlined" sx={{ textTransform: 'none' }}>
                        Xem chi tiết
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              name="current"
              value={passwordData.current}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              name="new"
              value={passwordData.new}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              name="confirm"
              value={passwordData.confirm}
              onChange={handlePasswordChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Cập nhật mật khẩu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
