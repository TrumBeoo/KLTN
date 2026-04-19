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
  Tune as TuneIcon,
  Language as LanguageIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useAuth } from '../hooks/useAuth'
import FilterModal from './FilterModal'
import notificationService from '../services/notificationService'

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#ffffff',
  color: '#222222',
  borderBottom: '1px solid #e8e8e8',
  boxShadow: 'none',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
})

const SearchPill = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e8e8e8',
  borderRadius: '40px',
  boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'box-shadow 200ms ease',
  '&:hover': {
    boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
  },
  height: 48,
}))

const SearchSegment = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  height: '100%',
  '&:not(:last-child)': {
    borderRight: '1px solid #e8e8e8',
  },
}))

const SearchButton = styled(IconButton)({
  backgroundColor: '#4A90E2',
  color: '#ffffff',
  width: 32,
  height: 32,
  margin: '0 6px',
  '&:hover': {
    backgroundColor: '#2E5C8A',
  },
})

const UserMenuButton = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #c1c1c1',
  borderRadius: '21px',
  padding: '5px 5px 5px 12px',
  cursor: 'pointer',
  transition: 'box-shadow 200ms ease',
  '&:hover': {
    boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
  },
})

const NavLink = styled(Button)({
  color: '#222222',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: '6px 12px',
  borderRadius: '20px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#f7f7f7',
  },
  '&.active': {
    fontWeight: 600,
  },
})

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
    if (user) fetchUnreadCount()
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount()
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {}
  }

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const data = await notificationService.getNotifications(50, 0)
      setNotifications(data.data || [])
    } catch (error) {}
    finally { setLoadingNotifications(false) }
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
      <StyledAppBar>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: '80px !important', gap: 2, justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexShrink: 0 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundImage: "url('/logo/5.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
              }}
            />
            <Typography sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#4A90E2',
              letterSpacing: '-0.5px',
              display: { xs: 'none', sm: 'block' },
            }}>
              Rentify
            </Typography>
          </Box>

          {/* Search Pill - Desktop */}
          <SearchPill sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, maxWidth: 500 }}>
            <SearchSegment sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                placeholder="Tìm khu vực, phòng..."
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '0.875rem', color: '#222222', fontWeight: 500 },
                }}
                sx={{ '& .MuiInput-input::placeholder': { color: '#222222', opacity: 1 } }}
              />
            </SearchSegment>
            <SearchSegment sx={{ px: 1 }}>
              <SearchButton size="small" onClick={() => navigate('/listings')}>
                <SearchIcon sx={{ fontSize: '1rem' }} />
              </SearchButton>
            </SearchSegment>
          </SearchPill>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Nav Links - Desktop */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <NavLink onClick={() => navigate('/')} className={isActive('/') ? 'active' : ''}>
                Trang chủ
              </NavLink>
              <NavLink onClick={() => navigate('/listings')} className={isActive('/listings') ? 'active' : ''}>
                Tin đăng
              </NavLink>
              <NavLink onClick={() => navigate('/roommate')} className={isActive('/roommate') ? 'active' : ''}>
                Ở ghép
              </NavLink>
              <NavLink onClick={() => navigate('/blog')} className={isActive('/blog') ? 'active' : ''}>
                Blog
              </NavLink>
            </Box>

            {/* Post Ad Button */}
            <Button
              onClick={() => window.location.href = 'http://localhost:3333/login'}
              sx={{
                display: { xs: 'none', md: 'flex' },
                backgroundColor: '#FF385C',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: '20px',
                padding: '8px 16px',
                '&:hover': { backgroundColor: '#E31C5F' },
              }}
            >
              Đăng tin
            </Button>

            {/* Filter Button */}
            <IconButton
              onClick={() => setFilterOpen(true)}
              sx={{ display: { xs: 'none', md: 'flex' }, color: '#222222', p: 1 }}
            >
              <TuneIcon />
            </IconButton>

            {/* Notification */}
            {user && (
              <IconButton onClick={handleNotificationOpen} sx={{ color: '#222222' }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            {/* User Menu */}
            {!user ? (
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ display: { xs: 'none', sm: 'flex' }, borderColor: '#222222', color: '#222222', borderRadius: '20px', px: 2, py: 1 }}
              >
                Đăng nhập
              </Button>
            ) : (
              <UserMenuButton onClick={handleUserMenuOpen}>
                <MenuIcon sx={{ fontSize: '1.125rem', color: '#222222' }} />
                <Avatar sx={{ width: 30, height: 30, backgroundColor: '#4A90E2', fontSize: '0.75rem' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </UserMenuButton>
            )}

            {/* Mobile Menu Toggle */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#222222' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={!!notificationAnchor}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { width: 400, maxHeight: 500, borderRadius: '12px', mt: 1, boxShadow: 'rgba(0,0,0,0.20) 0px 12px 40px', border: '1px solid #e8e8e8' }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222' }}>Thông báo</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" sx={{ color: '#6a6a6a' }}>{unreadCount} chưa đọc</Typography>
          )}
        </Box>
        {loadingNotifications ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#4A90E2' }} />
          </Box>
        ) : notifications.length > 0 ? (
          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <Box
                key={notif.NotificationID}
                sx={{
                  py: 1.5, px: 2,
                  borderBottom: '1px solid #f2f2f2',
                  backgroundColor: notif.Status === 'Chưa đọc' ? '#E8F4FD' : 'transparent',
                  '&:hover': { backgroundColor: '#f7f7f7' },
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, cursor: 'pointer'
                }}
              >
                <Box sx={{ flex: 1 }} onClick={() => { if (notif.Link) navigate(notif.Link); handleNotificationClose() }}>
                  <Typography variant="body2" sx={{ fontWeight: notif.Status === 'Chưa đọc' ? 600 : 400, color: '#222222', mb: 0.25 }}>
                    {notif.Content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6a6a6a' }}>
                    {notif.Type} • {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  {notif.Status === 'Chưa đọc' && (
                    <Button size="small" onClick={(e) => { e.stopPropagation(); notificationService.markAsRead(notif.NotificationID).then(() => fetchNotifications()) }}
                      sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem', color: '#4A90E2' }}>Đọc</Button>
                  )}
                  <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); notificationService.deleteNotification(notif.NotificationID).then(() => fetchNotifications()) }}
                    sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}>Xóa</Button>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6a6a6a' }}>Không có thông báo nào</Typography>
          </Box>
        )}
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={!!userMenuAnchor}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: { width: 220, borderRadius: '12px', mt: 1, boxShadow: 'rgba(0,0,0,0.20) 0px 12px 40px', border: '1px solid #e8e8e8', py: 0.5 }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222' }}>{user?.name}</Typography>
          <Typography variant="caption" sx={{ color: '#6a6a6a' }}>{user?.email}</Typography>
        </Box>
        <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose() }} sx={{ py: 1.25 }}>Hồ sơ của tôi</MenuItem>
        <MenuItem sx={{ py: 1.25 }}>Sở thích & Tiêu chí</MenuItem>
        <MenuItem sx={{ py: 1.25 }}>Lịch sử thuê phòng</MenuItem>
        <MenuItem onClick={() => { navigate('/change-password'); handleUserMenuClose() }} sx={{ py: 1.25 }}>Đổi mật khẩu</MenuItem>
        <MenuItem sx={{ py: 1.25 }}>Lịch xem phòng</MenuItem>
        <MenuItem sx={{ py: 1.25 }}>Phòng yêu thích</MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.25, color: '#4A90E2', fontWeight: 500 }}>Đăng xuất</MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 300, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#4A90E2' }}>Rentify</Typography>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#222222' }}><CloseIcon /></IconButton>
          </Box>
          <Divider />
          <List>
            {[
              { label: 'Trang chủ', path: '/' },
              { label: 'Tin đăng', path: '/listings' },
              { label: 'Tìm bạn ở ghép', path: '/roommate' },
              { label: 'Blog', path: '/blog' },
              { label: 'Phòng yêu thích', path: null },
              { label: 'Lịch xem phòng', path: null },
            ].map((item) => (
              <ListItem
                button key={item.label}
                onClick={() => { if (item.path) navigate(item.path); setMobileOpen(false) }}
                sx={{ py: 1.5, px: 3, '&:hover': { backgroundColor: '#f7f7f7' }, color: isActive(item.path) ? '#4A90E2' : '#222222' }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400, fontSize: '0.9375rem' }} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {!user ? (
              <Button fullWidth variant="contained" onClick={() => { navigate('/login'); setMobileOpen(false) }}
                sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' } }}>
                Đăng nhập
              </Button>
            ) : (
              <Button fullWidth variant="outlined" onClick={handleLogout} sx={{ borderColor: '#222222', color: '#222222' }}>
                Đăng xuất
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} onApply={() => {}} />
    </>
  )
}