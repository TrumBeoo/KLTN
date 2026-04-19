import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
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
  Menu,
  CircularProgress,
  Typography,
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  MeetingRoom as DoorIcon,
  Announcement as AnnouncementIcon,
  EventNote as CalendarIcon,
  Description as ContractIcon,
  BarChart as ReportIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AddCircle as AddIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material'

import notificationService from '../services/notificationService'

const SIDEBAR_WIDTH = 240
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Chung cư', icon: ApartmentIcon, path: '/manage-buildings' },
  { label: 'Phòng', icon: DoorIcon, path: '/manage-rooms' },
  { label: 'Tin đăng', icon: AnnouncementIcon, path: '/listings' },
  { label: 'Lịch xem phòng', icon: CalendarIcon, path: '/viewing-schedules' },
  { label: 'Hợp đồng', icon: ContractIcon, path: '/contracts' }
]

const bottomMenuItems = [
  { label: 'Báo cáo', icon: ReportIcon, path: '/reports' },
  { label: 'Hồ sơ', icon: PersonIcon, path: '/profile' }
]

const NavItem = ({ item, isActive, onClick }) => (
  <ListItem disablePadding sx={{ mb: 0.25 }}>
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: '6px',
        px: 1.25,
        py: 0.875,
        color: isActive ? '#0F1011' : '#62666D',
        backgroundColor: isActive ? 'rgba(94,106,210,0.08)' : 'transparent',
        fontWeight: isActive ? 590 : 400,
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(94,106,210,0.1)' : 'rgba(0,0,0,0.04)',
          color: '#0F1011'
        },
        '& .MuiListItemIcon-root': {
          color: isActive ? '#5E6AD2' : '#8A8F98',
          transition: 'color 0.15s ease'
        },
        '&:hover .MuiListItemIcon-root': {
          color: isActive ? '#5E6AD2' : '#62666D'
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 34 }}>
        <item.icon sx={{ fontSize: '1.1rem' }} />
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          fontSize: '0.875rem',
          fontWeight: 'inherit',
          letterSpacing: '-0.01em'
        }}
      />
      {isActive && (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#5E6AD2',
            flexShrink: 0
          }}
        />
      )}
    </ListItemButton>
  </ListItem>
)

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
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const data = await notificationService.getNotifications(50, 0)
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    } catch (error) {}
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8EAED'
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/logo/5.png"
          alt="Rentify"
          sx={{
            height: 28,
            width: 'auto',
            borderRadius: '6px',
            border: '1px solid rgba(94,106,210,0.2)'
          }}
        />
        <Box
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 590,
            color: '#0F1011',
            letterSpacing: '-0.02em',
            fontFeatureSettings: '"cv01","ss03"'
          }}
        >
          Rentify
        </Box>
        <Box
          sx={{
            ml: 'auto',
            fontSize: '0.625rem',
            fontWeight: 590,
            color: '#5E6AD2',
            backgroundColor: 'rgba(94,106,210,0.1)',
            px: 0.75,
            py: 0.25,
            borderRadius: '4px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          Pro
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#E8EAED' }} />

      {/* Main Menu */}
      <Box sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto' }}>
        <Box sx={{ mb: 0.5, px: 1, pb: 0.5 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 590,
              color: '#8A8F98',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Quản lý
          </Typography>
        </Box>
        <List disablePadding>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </List>

        <Box sx={{ mt: 2, mb: 0.5, px: 1, pb: 0.5 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 590,
              color: '#8A8F98',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Tài khoản
          </Typography>
        </Box>
        <List disablePadding>
          {bottomMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: '#E8EAED' }} />

      {/* User Info */}
      <Box sx={{ p: 1.5 }}>
        <Box
          onClick={() => navigate('/profile')}
          sx={{
            px: 1.25,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: '#5E6AD2',
              fontSize: '0.75rem',
              fontWeight: 590
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 510,
                color: '#0F1011',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em'
              }}
            >
              {user?.name || 'Chủ nhà'}
            </Box>
            <Box sx={{ fontSize: '0.6875rem', color: '#8A8F98' }}>
              Chủ nhà
            </Box>
          </Box>
          <Tooltip title="Đăng xuất">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
              sx={{
                color: '#8A8F98',
                p: 0.5,
                '&:hover': { color: '#E5484D', backgroundColor: 'rgba(229,72,77,0.08)' }
              }}
            >
              <LogoutIcon sx={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )

  // Page title map
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/manage-buildings': 'Quản lý chung cư',
    '/manage-rooms': 'Quản lý phòng',
    '/listings': 'Tin đăng',
    '/viewing-schedules': 'Lịch xem phòng',
    '/contracts': 'Hợp đồng',
    '/profile': 'Hồ sơ của tôi',
    '/reports': 'Báo cáo'
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F8F8' }}>
      {/* Sidebar - Desktop */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 100
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
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        {/* Top Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            backgroundColor: 'rgba(247,248,248,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #E8EAED',
            px: { xs: 2, md: 3 },
            py: 0,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          {/* Left: Mobile menu + Page title */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              sx={{ display: { md: 'none' }, color: '#62666D' }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 590,
                color: '#0F1011',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {pageTitles[location.pathname] || 'Dashboard'}
            </Typography>
          </Stack>

          {/* Right: Search + Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              placeholder="Tìm kiếm..."
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.75, color: '#8A8F98', fontSize: '1rem' }} />,
                sx: {
                  height: 32,
                  fontSize: '0.8125rem',
                  backgroundColor: '#FFFFFF',
                  '& input': { py: 0 }
                }
              }}
              sx={{
                width: { xs: 160, sm: 240 },
                display: { xs: 'none', sm: 'block' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  height: 32
                }
              }}
            />

            <Tooltip title="Thông báo">
              <IconButton
                onClick={handleNotificationOpen}
                sx={{
                  color: '#62666D',
                  p: 0.875,
                  border: '1px solid #E8EAED',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#5E6AD2',
                    color: '#5E6AD2'
                  }
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.5625rem', minWidth: 14, height: 14, p: '0 3px' } }}
                >
                  <NotificationsIcon sx={{ fontSize: '1.1rem' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationAnchor}
              open={!!notificationAnchor}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  width: 380,
                  maxHeight: 480,
                  border: '1px solid #E8EAED',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  borderRadius: '8px',
                  mt: 0.5
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E8EAED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 590, fontSize: '0.875rem', color: '#0F1011' }}>
                  Thông báo
                </Typography>
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 590,
                      color: '#5E6AD2',
                      backgroundColor: 'rgba(94,106,210,0.1)',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: '4px'
                    }}
                  >
                    {unreadCount} chưa đọc
                  </Box>
                )}
              </Box>

              {loadingNotifications ? (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={20} />
                </Box>
              ) : notifications.length > 0 ? (
                <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                  {notifications.map((notif) => (
                    <Box
                      key={notif.NotificationID}
                      onClick={() => {
                        if (notif.Link) navigate(notif.Link)
                        handleNotificationClose()
                      }}
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid #F0F1F3',
                        backgroundColor: notif.Status === 'Chưa đọc' ? 'rgba(94,106,210,0.04)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease',
                        '&:hover': { backgroundColor: '#F7F8F8' },
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start'
                      }}
                    >
                      {notif.Status === 'Chưa đọc' && (
                        <DotIcon sx={{ fontSize: '0.5rem', color: '#5E6AD2', mt: 0.75, flexShrink: 0 }} />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            fontWeight: notif.Status === 'Chưa đọc' ? 510 : 400,
                            color: '#0F1011',
                            lineHeight: 1.45,
                            mb: 0.25
                          }}
                        >
                          {notif.Content}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#8A8F98' }}>
                          {notif.Type} · {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      {notif.Status === 'Chưa đọc' && (
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            notificationService.markAsRead(notif.NotificationID)
                              .then(() => fetchNotifications())
                              .catch(err => console.error(err))
                          }}
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.6875rem',
                            color: '#5E6AD2',
                            flexShrink: 0
                          }}
                        >
                          Đọc
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#8A8F98' }}>
                    Không có thông báo
                  </Typography>
                </Box>
              )}
            </Menu>

            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => navigate('/manage-rooms')}
              sx={{
                backgroundColor: '#5E6AD2',
                color: '#FFFFFF',
                height: 32,
                px: 1.5,
                fontSize: '0.8125rem',
                fontWeight: 510,
                '&:hover': {
                  backgroundColor: '#4F5ABF'
                }
              }}
            >
              Thêm phòng
            </Button>
          </Stack>
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            maxWidth: '100%',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}