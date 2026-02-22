import { useState } from 'react'
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

  const isActive = (path) => location.pathname === path

  const handleUserMenuOpen = (e) => setUserMenuAnchor(e.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchor(null)
  const handleNotificationOpen = (e) => setNotificationAnchor(e.currentTarget)
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
            <NavLink onClick={() => window.location.href = 'http://localhost:3333/login'}>Đăng tin</NavLink>
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
                >
                  {unreadCount > 0 ? (
                    <>
                      <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        {unreadCount} thông báo chưa đọc
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleNotificationClose}>Xem tất cả thông báo</MenuItem>
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
