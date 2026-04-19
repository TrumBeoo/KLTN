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
  Typography,
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BuildingIcon,
  MeetingRoom as RoomIcon,
  Description as ContractIcon,
  Payment as PaymentIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'

const SIDEBAR_WIDTH = 240
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Người dùng', icon: PeopleIcon, path: '/users' },
  { label: 'Chung cư', icon: BuildingIcon, path: '/buildings' },
  { label: 'Phòng', icon: RoomIcon, path: '/rooms' },
  { label: 'Hợp đồng', icon: ContractIcon, path: '/contracts' },
  { label: 'Thanh toán', icon: PaymentIcon, path: '/payments' }
]

const bottomMenuItems = [
  { label: 'Báo cáo', icon: ReportIcon, path: '/reports' },
  { label: 'Cài đặt', icon: SettingsIcon, path: '/settings' }
]

const NavItem = ({ item, isActive, onClick }) => (
  <ListItem disablePadding sx={{ mb: 0.25 }}>
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: '4px',
        px: 1.25,
        py: 0.875,
        color: isActive ? '#061b31' : '#64748d',
        backgroundColor: isActive ? 'rgba(83,58,253,0.08)' : 'transparent',
        fontWeight: isActive ? 400 : 300,
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(83,58,253,0.1)' : 'rgba(0,0,0,0.04)',
          color: '#061b31'
        },
        '& .MuiListItemIcon-root': {
          color: isActive ? '#533afd' : '#64748d',
          transition: 'color 0.15s ease'
        },
        '&:hover .MuiListItemIcon-root': {
          color: isActive ? '#533afd' : '#273951'
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
            backgroundColor: '#533afd',
            flexShrink: 0
          }}
        />
      )}
    </ListItemButton>
  </ListItem>
)

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('admin')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    } catch (error) {}
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const SidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5edf5'
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/logo/5.png"
          alt="Admin"
          sx={{
            height: 28,
            width: 'auto',
            borderRadius: '4px',
            border: '1px solid rgba(83,58,253,0.2)'
          }}
        />
        <Box
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 400,
            color: '#061b31',
            letterSpacing: '-0.02em',
            fontFeatureSettings: '"ss01"'
          }}
        >
          Admin Panel
        </Box>
        <Box
          sx={{
            ml: 'auto',
            fontSize: '0.625rem',
            fontWeight: 400,
            color: '#533afd',
            backgroundColor: 'rgba(83,58,253,0.1)',
            px: 0.75,
            py: 0.25,
            borderRadius: '4px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          Admin
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#e5edf5' }} />

      {/* Main Menu */}
      <Box sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto' }}>
        <Box sx={{ mb: 0.5, px: 1, pb: 0.5 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 400,
              color: '#64748d',
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
              fontWeight: 400,
              color: '#64748d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Hệ thống
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

      <Divider sx={{ borderColor: '#e5edf5' }} />

      {/* User Info */}
      <Box sx={{ p: 1.5 }}>
        <Box
          onClick={() => navigate('/settings')}
          sx={{
            px: 1.25,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: '#533afd',
              fontSize: '0.75rem',
              fontWeight: 400
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 400,
                color: '#061b31',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em'
              }}
            >
              {user?.name || 'Admin'}
            </Box>
            <Box sx={{ fontSize: '0.6875rem', color: '#64748d' }}>
              Quản trị viên
            </Box>
          </Box>
          <Tooltip title="Đăng xuất">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
              sx={{
                color: '#64748d',
                p: 0.5,
                '&:hover': { color: '#ea2261', backgroundColor: 'rgba(234,34,97,0.08)' }
              }}
            >
              <LogoutIcon sx={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/users': 'Quản lý người dùng',
    '/buildings': 'Quản lý chung cư',
    '/rooms': 'Quản lý phòng',
    '/contracts': 'Quản lý hợp đồng',
    '/payments': 'Quản lý thanh toán',
    '/reports': 'Báo cáo',
    '/settings': 'Cài đặt'
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
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
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e5edf5',
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
              sx={{ display: { md: 'none' }, color: '#64748d' }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 400,
                color: '#061b31',
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
                startAdornment: <SearchIcon sx={{ mr: 0.75, color: '#64748d', fontSize: '1rem' }} />,
                sx: {
                  height: 32,
                  fontSize: '0.8125rem',
                  backgroundColor: '#ffffff',
                  '& input': { py: 0 }
                }
              }}
              sx={{
                width: { xs: 160, sm: 240 },
                display: { xs: 'none', sm: 'block' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  height: 32
                }
              }}
            />

            <Tooltip title="Thông báo">
              <IconButton
                sx={{
                  color: '#64748d',
                  p: 0.875,
                  border: '1px solid #e5edf5',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#533afd',
                    color: '#533afd'
                  }
                }}
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.5625rem', minWidth: 14, height: 14, p: '0 3px' } }}
                >
                  <NotificationsIcon sx={{ fontSize: '1.1rem' }} />
                </Badge>
              </IconButton>
            </Tooltip>
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
