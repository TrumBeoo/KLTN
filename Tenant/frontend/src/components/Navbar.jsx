import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material'
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  GpsFixed as GpsFixedIcon,
  Tune as TuneIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useAuth } from '../hooks/useAuth'
import FilterModal from './FilterModal'
import notificationService from '../services/notificationService'

const StyledAppBar = styled(AppBar)(({ theme }) => ((
  {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    boxShadow: theme.shadows[1],
  }
)))

const SearchContainer = styled(Box)(({ theme }) => ((
  {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    border: `2px solid ${theme.palette.grey[200]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.4, 0.8),
    flex: 1,
    maxWidth: 400,
    height: 36,
    '&:focus-within': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.subtle}`,
    },
  }
)))

const NavLink = styled(Button)(({ theme }) => ((
  {
    color: theme.palette.text.secondary,
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 200ms ease',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: 'transparent',
    },
    '&.active': {
      color: theme.palette.primary.main,
      fontWeight: 600,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      paddingBottom: '2px',
    },
  }
)))

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
    }
  }, [user])

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

  const handleNotificationOpen = (e) => {
    setNotificationAnchor(e.currentTarget)
    fetchUnreadCount()
    fetchNotifications()
  }

  const isActive = (path) => location.pathname === path

  const handleUserMenuOpen = (e) => setUserMenuAnchor(e.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchor(null)
  const handleNotificationClose = () => setNotificationAnchor(null)

  const handleLogout = async () => {
    await logout()
    handleUserMenuClose()
    navigate('/login')
  }

  return (
    <>
      <StyledAppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundImage: "url('/logo/5.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
            
            </Box>
            <Box sx={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              Rentify
            </Box>
          </Box>

          {/* Search Bar - Desktop */}
          <SearchContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
            <GpsFixedIcon sx={{ color: '#2563EB', fontSize: '1.125rem' }} />
            <TextField
              placeholder="Tìm phòng theo khu vực, giá, tiện nghi..."
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInput-input': {
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  '&::placeholder': {
                    color: '#94A3B8',
                    opacity: 1,
                  },
                },
              }}
            />
          </SearchContainer>

          {/* Filter Button */}
          <Button
            startIcon={<TuneIcon />}
            onClick={() => setFilterOpen(true)}
            sx={{
              display: { xs: 'none', md: 'flex' },
              color: 'text.secondary',
              textTransform: 'none',
            }}
          >
            Bộ lọc
          </Button>

          {/* Nav Links - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, flex: 1 }}>
            <NavLink onClick={() => navigate('/')} className={isActive('/') ? 'active' : ''}>
              Trang chủ
            </NavLink>
            <NavLink onClick={() => navigate('/listings')} className={isActive('/listings') ? 'active' : ''}>
              Tin đăng
            </NavLink>
            <NavLink onClick={() => navigate('/roommate')} className={isActive('/roommate') ? 'active' : ''}>
              Tìm bạn ở ghép
            </NavLink>
            <NavLink onClick={() => navigate('/blog')} className={isActive('/blog') ? 'active' : ''}>
              Blog
            </NavLink>
            <Button
              variant="outlined"
              onClick={() => window.location.href = 'http://localhost:3333/login'}
              sx={{
                textTransform: 'none',
                fontWeight: 300,
                borderWidth: 2,
                borderColor: 'warning.main',
                color: 'warning.main',
                bgcolor: 'warning',
                px: 1.5,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'warning.dark',
                  bgcolor: 'warning.main',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(237, 137, 54, 0.3)',
                },
                transition: 'all 200ms ease',
              }}
            >
              Đăng tin
            </Button>
          </Box>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!user ? (
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Đăng nhập
              </Button>
            ) : (
              <>
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
                <IconButton onClick={handleUserMenuOpen}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={!!userMenuAnchor}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem disabled>
                    <Box>
                      <Box sx={{ fontWeight: 600 }}>{user.name}</Box>
                      <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{user.email}</Box>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                    Hồ sơ của tôi
                  </MenuItem>
                  <MenuItem>Sở thích & Tiêu chí</MenuItem>
                  <MenuItem>Lịch sử thuê phòng</MenuItem>
                  <MenuItem onClick={() => { navigate('/change-password'); handleUserMenuClose(); }}>
                    Đổi mật khẩu
                  </MenuItem>
                  <MenuItem>Lịch xem phòng</MenuItem>
                  <MenuItem>Phòng yêu thích</MenuItem>
                  <MenuItem>Cài đặt</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800 }}>Rentify</Box>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem
              button
              onClick={() => {
                navigate('/')
                setMobileOpen(false)
              }}
              sx={{ bgcolor: isActive('/') ? 'primary.light' : 'transparent', color: isActive('/') ? 'primary.main' : 'inherit' }}
            >
              <ListItemText primary="Trang chủ" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/listings')
                setMobileOpen(false)
              }}
              sx={{ bgcolor: isActive('/listings') ? 'primary.light' : 'transparent', color: isActive('/listings') ? 'primary.main' : 'inherit' }}
            >
              <ListItemText primary="Tin đăng" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/roommate')
                setMobileOpen(false)
              }}
              sx={{ bgcolor: isActive('/roommate') ? 'primary.light' : 'transparent', color: isActive('/roommate') ? 'primary.main' : 'inherit' }}
            >
              <ListItemText primary="Tìm bạn ở ghép" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/blog')
                setMobileOpen(false)
              }}
              sx={{ bgcolor: isActive('/blog') ? 'primary.light' : 'transparent', color: isActive('/blog') ? 'primary.main' : 'inherit' }}
            >
              <ListItemText primary="Blog" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Phòng yêu thích" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Lịch xem phòng" />
            </ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          {!user && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                navigate('/login')
                setMobileOpen(false)
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          // Handle filter apply
        }}
      />
    </>
  )
}
