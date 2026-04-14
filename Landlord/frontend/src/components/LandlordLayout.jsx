import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  TextField,
  IconButton,
  Badge,
  Button,
  Container,
  Menu,
  MenuItem,
  CircularProgress,
  Typography
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  MeetingRoom as DoorIcon,
  Announcement as AnnouncementIcon,
  EventNote as CalendarIcon,
  Description as ContractIcon,
  Bolt as BoltIcon,
  BarChart as ReportIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AddCircle as AddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'

import notificationService from '../services/notificationService'

const SIDEBAR_WIDTH = 260
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Quản lý chung cư', icon: ApartmentIcon, path: '/manage-buildings' },
  { label: 'Quản lý phòng', icon: DoorIcon, path: '/manage-rooms' },
  { label: 'Tin đăng', icon: AnnouncementIcon, path: '/listings' },
  { label: 'Lịch xem phòng', icon: CalendarIcon, path: '/viewing-schedules' },
  { label: 'Hợp đồng & Thanh toán', icon: ContractIcon, path: '/contracts' }
]

const bottomMenuItems = [
  { label: 'Tự động đăng tin', icon: BoltIcon, path: '/automation' },
  { label: 'Báo cáo', icon: ReportIcon, path: '/reports' },
  { label: 'Hồ sơ của tôi', icon: PersonIcon, path: '/profile' },
  { label: 'Cài đặt', icon: SettingsIcon, path: '/settings' }
]

export default function LandlordLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchUnreadCount()
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount()
      console.log('Unread count response:', data)
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const data = await notificationService.getNotifications(50, 0)
      console.log('Notifications response:', data)
      setNotifications(data.data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const handleNotificationOpen = (e) => {
    setNotificationAnchor(e.currentTarget)
    fetchUnreadCount()
    fetchNotifications()
  }
  const handleNotificationClose = () => setNotificationAnchor(null)

  const SidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          component="img"
          src="/logo/5.png"
          alt="Rentify"
          sx={{ height: 40, width: 'auto', borderRadius: 1, border: '2px solid', borderColor: 'primary.subtle', p: 0.25 }}
        />
        <Box sx={{ fontFamily: 'Manrope', fontSize: '1.5rem', fontWeight: 800, color: 'text.primary' }}>
          Rentify
        </Box>
      </Box>

      {/* Main Menu */}
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 1,
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                backgroundColor: isActive(item.path) ? 'primary.subtle' : 'transparent',
                fontWeight: isActive(item.path) ? 600 : 500,
                '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' },
                position: 'relative',
                '&.Mui-selected::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: 'primary.main',
                  borderRadius: '0 4px 4px 0'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {item.badge && (
                <Badge badgeContent={item.badge} color="secondary" sx={{ ml: 1 }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Bottom Menu */}
      <List sx={{ px: 1, mb: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 1,
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                backgroundColor: isActive(item.path) ? 'primary.subtle' : 'transparent',
                fontWeight: isActive(item.path) ? 600 : 500,
                '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* User Info */}
      <Box
        onClick={() => navigate('/profile')}
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          borderRadius: 1,
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'Chủ nhà'}
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>Chủ nhà</Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar - Desktop */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        {SidebarContent}
      </Box>

      {/* Sidebar - Mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: SIDEBAR_WIDTH }}>{SidebarContent}</Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` }, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.primary'
          }}
        >
          <Toolbar sx={{ height: 70, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ fontFamily: 'Manrope', fontSize: '1.5rem', fontWeight: 700 }}>
              Dashboard
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                placeholder="Tìm phòng, hợp đồng..."
                size="small"
                variant="outlined"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} />
                }}
                sx={{
                  width: 300,
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />

              <IconButton onClick={handleNotificationOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={notificationAnchor}
                open={!!notificationAnchor}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: { width: 400, maxHeight: 500 }
                }}
              >
                {loadingNotifications ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : notifications.length > 0 ? (
                  <>
                    <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary', py: 1 }}>
                      {unreadCount} thông báo chưa đọc
                    </MenuItem>
                    <Divider />
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {notifications.map((notif) => (
                        <Box
                          key={notif.NotificationID}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: notif.Status === 'Chưa đọc' ? 'action.hover' : 'transparent',
                            '&:hover': { backgroundColor: 'action.selected' },
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 1,
                            cursor: 'pointer'
                          }}
                        >
                          <Box
                            sx={{ flex: 1, minWidth: 0 }}
                            onClick={() => {
                              if (notif.Link) {
                                navigate(notif.Link)
                              }
                              handleNotificationClose()
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: notif.Status === 'Chưa đọc' ? 600 : 400 }}>
                              {notif.Content}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              {notif.Type} • {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {notif.Status === 'Chưa đọc' && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  notificationService.markAsRead(notif.NotificationID)
                                    .then(() => fetchNotifications())
                                    .catch(err => console.error('Failed to mark as read:', err))
                                }}
                                sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
                              >
                                Đọc
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                notificationService.deleteNotification(notif.NotificationID)
                                  .then(() => fetchNotifications())
                                  .catch(err => console.error('Failed to delete:', err))
                              }}
                              sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
                            >
                              Xóa
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center', py: 1 }}>
                      <Typography variant="body2" sx={{ color: 'primary.main' }}>Xem tất cả thông báo</Typography>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'black' }}>
                    Không có thông báo
                  </MenuItem>
                )}
              </Menu>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none' }}
              >
                Thêm phòng
              </Button>

              <IconButton onClick={handleLogout} title="Đăng xuất">
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
