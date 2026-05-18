import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  InputBase,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  People as UsersIcon,
  ArticleOutlined as ListingsIcon,
  ReportProblem as ReportsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as BellIcon,
  Logout as LogOutIcon
} from '@mui/icons-material'

const SIDEBAR_WIDTH = 260
const SIDEBAR_WIDTH_COLLAPSED = 80

const AdminLayout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null)
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null)

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Users', path: '/users', icon: <UsersIcon /> },
    { label: 'Listings', path: '/listings', icon: <ListingsIcon /> },
    { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> }
  ]

  const isActive = (path) => location.pathname === path

  const handleMenuItemClick = (path) => {
    navigate(path)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    // TODO: Implement logout logic
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Top Navigation */}
      <AppBar
        position="fixed"
        sx={{
          left: isMobile ? 0 : sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
          right: 0,
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Tooltip title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
                <IconButton
                  size="small"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  sx={{ color: theme.palette.text.primary }}
                >
                  {sidebarCollapsed ? <MenuIcon /> : <CloseIcon />}
                </IconButton>
              </Tooltip>
            )}
            {isMobile && (
              <IconButton
                size="small"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ color: theme.palette.text.primary }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Center search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: theme.palette.background.subtle,
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              flex: 1,
              maxWidth: 300,
              mx: 2
            }}
          >
            <SearchIcon sx={{ fontSize: '1.2rem', color: theme.palette.text.secondary }} />
            <InputBase
              placeholder="Search..."
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem', color: theme.palette.text.secondary }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>

          {/* Right section */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                onClick={(e) => setNotificationMenuAnchor(e.currentTarget)}
                sx={{ color: theme.palette.text.primary }}
              >
                <Badge badgeContent={3} color="error">
                  <BellIcon sx={{ fontSize: '1.3rem' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" variant="middle" flexItem sx={{ my: 1 }} />

            <Tooltip title="Profile">
              <IconButton
                size="small"
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  backgroundColor: theme.palette.primary.light,
                  color: '#fff'
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  AD
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarCollapsed && !isMobile ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarCollapsed && !isMobile ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: 'width 0.3s ease',
            mt: 0,
            pt: 0,
            top: 0,
            overflowX: 'hidden'
          }
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          {!sidebarCollapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                A
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>
                  Admin
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Dashboard
                </Typography>
              </Box>
            </Box>
          )}
          {sidebarCollapsed && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            >
              A
            </Box>
          )}
        </Box>

        {/* Sidebar Menu */}
        <Box sx={{ py: 1, px: 1.5, mt: 2 }}>
          <List sx={{ p: 0 }}>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleMenuItemClick(item.path)}
                selected={isActive(item.path)}
                sx={{
                  py: 1,
                  px: 1.5,
                  mb: 0.5,
                  borderRadius: '6px',
                  backgroundColor: isActive(item.path) ? theme.palette.primary.light : 'transparent',
                  color: isActive(item.path) ? '#fff' : theme.palette.text.primary,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? theme.palette.primary.light
                      : theme.palette.background.subtle,
                    color: isActive(item.path) ? '#fff' : theme.palette.text.primary
                  },
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? 0 : 40,
                    color: 'inherit',
                    justifyContent: 'center'
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: '1.25rem' } })}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      ml: 0.5
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Sidebar Footer */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Tooltip title={sidebarCollapsed ? 'Logout' : ''}>
            <ListItem
              button
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: theme.palette.error.light,
                  color: theme.palette.error.main
                },
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 40, color: 'inherit' }}>
                <LogOutIcon sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, ml: 0.5 }}
                />
              )}
            </ListItem>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: isMobile ? 0 : sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED - SIDEBAR_WIDTH : 0,
          transition: 'margin 0.3s ease',
          mt: 8,
          overflow: 'auto'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem sx={{ py: 1.5, px: 2, fontSize: '0.875rem' }}>
          <Avatar sx={{ mr: 1.5, width: 32, height: 32 }}>AD</Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              admin@platform.com
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose} sx={{ fontSize: '0.875rem' }}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose} sx={{ fontSize: '0.875rem' }}>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', color: theme.palette.error.main }}>
          <LogOutIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={() => setNotificationMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Notifications</Typography>
        </Box>
        <MenuItem sx={{ py: 1.5, px: 2, fontSize: '0.875rem', whiteSpace: 'normal' }}>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>New listing submitted</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              5 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1.5, px: 2, fontSize: '0.875rem', whiteSpace: 'normal' }}>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>User flagged for review</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              10 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1.5, px: 2, fontSize: '0.875rem', whiteSpace: 'normal' }}>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Report submitted</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.drawer - 1
          }}
        />
      )}
    </Box>
  )
}

export default AdminLayout
