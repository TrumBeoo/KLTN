/**
 * Navbar — Booking.com style redesign
 *
 * Design decisions (from UI_Design.md):
 *  - Blue header (#006ce4) — Booking brand
 *  - font.size.base=14px, font.weight.base=400
 *  - radius.xs=4px for inputs/buttons
 *  - shadow.1 for dropdowns
 *  - motion.duration.instant=120ms
 *  - WCAG 2.2 AA: focus-visible, aria-labels, keyboard nav
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Menu, MenuItem, Avatar, Badge, Drawer, List, ListItem,
  ListItemText, Divider, CircularProgress,
  Typography, Tooltip, Chip, Container,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Article as BlogIcon,
  AddBox as AddIcon,
  Login as LoginIcon,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteAllIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useAuth } from '../hooks/useAuth'
import FilterModal from './FilterModal'
import notificationService from '../services/notificationService'
import { VercelNavTabs } from './ui/vercel-tabs'

// ─── Tokens ─────────────────────────────────────────────────────────────────
const BLUE      = '#006ce4'
const BLUE_DARK = '#003f8a'
const WHITE     = '#ffffff'
const BORDER    = '#d4d6d9'

// ─── Styled ─────────────────────────────────────────────────────────────────
const StyledAppBar = styled(AppBar)({
  backgroundColor: BLUE,
  color: WHITE,
  boxShadow: 'none',
  position: 'relative',
  zIndex: 1100,
})

/** Ghost nav button — white text on blue */
const NavBtn = styled(Button)(({ active }) => ({
  color: WHITE,
  fontSize: '0.857rem',
  fontWeight: active ? 700 : 500,
  padding: '6px 12px',
  minWidth: 'auto',
  whiteSpace: 'nowrap',
  borderBottom: active ? '3px solid #febb02' : '3px solid transparent',
  borderRadius: 0,
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)', color: WHITE },
  '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
  transition: 'all 120ms ease',
}))

/** Yellow CTA — "Đăng tin" */
const PostBtn = styled(Button)({
  backgroundColor: '#febb02',
  color: '#1a1a1a',
  fontSize: '0.857rem',
  fontWeight: 700,
  padding: '6px 14px',
  borderRadius: '4px',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: '#f5aa00' },
  '&:focus-visible': { outline: '2px solid #ffffff', outlineOffset: '2px' },
})

/** User menu pill */
const UserPill = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.6)',
  cursor: 'pointer',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
  '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
  transition: 'background 120ms ease',
})

// ─── Component ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [mobileOpen, setMobileOpen]       = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [notifAnchor, setNotifAnchor]      = useState(null)
  const [filterOpen, setFilterOpen]        = useState(false)
  const [unreadCount, setUnreadCount]      = useState(0)
  const [notifications, setNotifications]  = useState([])
  const [loadingNotif, setLoadingNotif]    = useState(false)

  useEffect(() => {
    console.log('Current user in Navbar:', user)
  }, [user])

  useEffect(() => { if (user) fetchUnreadCount() }, [user])

  const fetchUnreadCount = async () => {
    try { const d = await notificationService.getUnreadCount(); setUnreadCount(d.unreadCount || 0) } catch {}
  }
  const fetchNotifications = async () => {
    setLoadingNotif(true)
    try { const d = await notificationService.getNotifications(50, 0); setNotifications(d.data || []); fetchUnreadCount() } catch {}
    finally { setLoadingNotif(false) }
  }

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await notificationService.markAsRead(notificationId)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(notificationId)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return
    try {
      await notificationService.deleteAllNotifications()
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
    }
  }

  const handleFilterApply = (filters) => {
    // Build query params from filters
    const params = new URLSearchParams()
    
    if (filters.district) params.append('district', filters.district)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.minArea) params.append('minArea', filters.minArea)
    if (filters.maxArea) params.append('maxArea', filters.maxArea)
    if (filters.roomTypes?.length > 0) params.append('roomType', filters.roomTypes[0])
    if (filters.amenities?.length > 0) params.append('amenity', filters.amenities[0])
    if (filters.pois?.length > 0) params.append('poi', filters.pois[0])
    
    // Navigate to listings page with filters
    navigate(`/listings?${params.toString()}`)
    setFilterOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout(); setUserMenuAnchor(null); navigate('/login')
  }

  const navLinks = [
    { label: 'Trang chủ', path: '/', icon: <HomeIcon sx={{ fontSize: 16 }} /> },
    { label: 'Tin đăng',  path: '/listings', icon: <ApartmentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Ở ghép',    path: '/roommate', icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
    { label: 'Chuyển phòng', path: '/moving-service', icon: <LocalShippingIcon sx={{ fontSize: 16 }} /> },
    { label: 'Blog',      path: '/blog', icon: <BlogIcon sx={{ fontSize: 16 }} /> },
  ]

  const vercelTabsItems = navLinks.map(link => ({ name: link.label, to: link.path }))

  return (
    <>
      <StyledAppBar>
        <Container maxWidth="lg" disableGutters>
          <Toolbar
            sx={{
              px: { xs: 2, md: 3 },
              minHeight: '60px !important',
              gap: 1.5,
              justifyContent: 'space-between',
            }}
          >
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            tabIndex={0}
            role="link"
            aria-label="Rentify - Trang chủ"
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate('/')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              cursor: 'pointer', flexShrink: 0, userSelect: 'none',
              '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '4px', borderRadius: '4px' },
            }}
          >
            <Box sx={{
              width: 40, height: 40,
              backgroundImage: "url('/logo/5.png')",
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '6px', flexShrink: 0,
            }} />
            <Typography sx={{
              fontWeight: 800, fontSize: '1.714rem', color: WHITE,
              letterSpacing: '-0.8px',
              fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
              display: { xs: 'none', sm: 'block' },
            }}>
              Rentify
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Nav links — desktop */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0, flexShrink: 0, pb: 0.75 }}>
            <VercelNavTabs items={vercelTabsItems} />
          </Box>

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Filter */}
            <Tooltip title="Bộ lọc">
              <IconButton
                onClick={() => setFilterOpen(true)}
                aria-label="Mở bộ lọc"
                sx={{
                  color: WHITE, p: 0.75,
                  display: { xs: 'none', md: 'flex' },
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                  '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
                }}
              >
                <TuneIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Post button */}
            <PostBtn
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => window.location.href = 'http://localhost:3333/login'}
              aria-label="Đăng tin cho thuê"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              Đăng tin
            </PostBtn>

            {/* Notifications */}
            {user && (
              <Tooltip title="Thông báo">
                <IconButton
                  onClick={e => { setNotifAnchor(e.currentTarget); fetchNotifications() }}
                  aria-label={`${unreadCount} thông báo chưa đọc`}
                  sx={{
                    color: WHITE, p: 0.75,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                    '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User menu or login */}
            {!user ? (
              <Button
                startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/login')}
                aria-label="Đăng nhập"
                sx={{
                  color: WHITE, fontSize: '0.857rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: '4px', padding: '5px 12px',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.6)' },
                  '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
                }}
              >
                Đăng nhập
              </Button>
            ) : (
              <UserPill
                onClick={e => setUserMenuAnchor(e.currentTarget)}
                tabIndex={0}
                role="button"
                aria-label="Menu tài khoản"
                aria-expanded={!!userMenuAnchor}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setUserMenuAnchor(e.currentTarget)}
              >
                <Avatar sx={{ width: 26, height: 26, fontSize: '0.714rem', bgcolor: '#febb02', color: '#1a1a1a' }}>
                  {(user.name || user.Name || user.username || user.Username || 'U')?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ color: WHITE, fontSize: '0.857rem', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                  {(user.name || user.Name || user.username || user.Username)?.split(' ').pop()}
                </Typography>
                <ArrowDownIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
              </UserPill>
            )}

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
              sx={{
                color: WHITE,
                display: { xs: 'flex', lg: 'none' },
                '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* ─── Notification dropdown ─────────────────────────────────────────── */}
      <Menu
        anchorEl={notifAnchor}
        open={!!notifAnchor}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{
          sx: {
            width: 360, maxHeight: 480,
            borderRadius: '4px', mt: 0.5,
            boxShadow: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
            border: `1px solid ${BORDER}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: '#1a1a1a' }}>Thông báo</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {unreadCount > 0 && (
              <>
                <Chip label={`${unreadCount} mới`} size="small" sx={{ backgroundColor: '#e8f2ff', color: BLUE, fontWeight: 700, height: '20px', fontSize: '0.714rem' }} />
                <Tooltip title="Đánh dấu tất cả đã đọc">
                  <IconButton
                    size="small"
                    onClick={handleMarkAllAsRead}
                    sx={{ color: BLUE, p: 0.5, '&:hover': { backgroundColor: '#e8f2ff' } }}
                  >
                    <CheckIcon sx={{ fontSize: '0.875rem' }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {notifications.length > 0 && (
              <Tooltip title="Xóa tất cả">
                <IconButton
                  size="small"
                  onClick={handleDeleteAllNotifications}
                  sx={{ color: '#d32f2f', p: 0.5, '&:hover': { backgroundColor: '#ffebee' } }}
                >
                  <DeleteAllIcon sx={{ fontSize: '0.875rem' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        {loadingNotif ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} sx={{ color: BLUE }} />
          </Box>
        ) : notifications.length > 0 ? (
          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.map(n => (
              <Box
                key={n.NotificationID}
                sx={{
                  py: 1.5, px: 2,
                  borderBottom: `1px solid ${BORDER}`,
                  backgroundColor: n.Status === 'Chưa đọc' ? '#f0f6ff' : 'transparent',
                  '&:hover': { backgroundColor: '#f9fafb' },
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
                onClick={() => { if (n.Link) navigate(n.Link); setNotifAnchor(null) }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: n.Status === 'Chưa đọc' ? 700 : 400, color: '#1a1a1a', mb: 0.25, fontSize: '0.857rem' }}>
                    {n.Content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#595959' }}>
                    {n.Type} · {new Date(n.CreatedAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
                  {n.Status === 'Chưa đọc' && (
                    <Tooltip title="Đánh dấu đã đọc">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkAsRead(n.NotificationID, e)}
                        sx={{ color: BLUE, p: 0.5, '&:hover': { backgroundColor: '#e8f2ff' } }}
                      >
                        <CheckIcon sx={{ fontSize: '0.75rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteNotification(n.NotificationID, e)}
                      sx={{ color: '#d32f2f', p: 0.5, '&:hover': { backgroundColor: '#ffebee' } }}
                    >
                      <DeleteIcon sx={{ fontSize: '0.75rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#595959' }}>Không có thông báo</Typography>
          </Box>
        )}
      </Menu>

      {/* ─── User dropdown ─────────────────────────────────────────────────── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={!!userMenuAnchor}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            width: 220, borderRadius: '4px', mt: 0.5,
            boxShadow: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
            border: `1px solid ${BORDER}`,
            py: 0.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: '#1a1a1a' }}>
            {user?.name || user?.Name || user?.username || user?.Username || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#595959' }}>
            {user?.email || user?.Email || 'No email'}
          </Typography>
        </Box>
        {[
          { label: 'Hồ sơ của tôi',     action: () => { navigate('/profile'); setUserMenuAnchor(null) } },
          { label: 'Sở thích & Tiêu chí', action: () => { navigate('/profile?tab=preferences'); setUserMenuAnchor(null) } },
          { label: 'Phòng yêu thích',    action: () => { navigate('/profile?tab=favorites'); setUserMenuAnchor(null) } },
          { label: 'Đổi mật khẩu',       action: () => { navigate('/change-password'); setUserMenuAnchor(null) } },
        ].map(item => (
          <MenuItem key={item.label} onClick={item.action} sx={{ py: 1, fontSize: '0.857rem' }}>
            {item.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 1, fontSize: '0.857rem', color: BLUE, fontWeight: 600 }}
        >
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* ─── Mobile drawer ─────────────────────────────────────────────────── */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, pt: 0 }} role="dialog" aria-label="Menu điều hướng">
          {/* Drawer header */}
          <Box sx={{
            backgroundColor: BLUE, px: 2, py: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: WHITE }}>Rentify</Typography>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Đóng menu" sx={{ color: WHITE }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List disablePadding>
            {navLinks.map(link => (
              <ListItem
                button key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false) }}
                sx={{
                  py: 1.5, px: 2,
                  borderLeft: isActive(link.path) ? `3px solid ${BLUE}` : '3px solid transparent',
                  backgroundColor: isActive(link.path) ? '#f0f6ff' : 'transparent',
                  '&:hover': { backgroundColor: '#f2f4f8' },
                }}
              >
                <Box sx={{ mr: 1.5, color: isActive(link.path) ? BLUE : '#595959' }}>{link.icon}</Box>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(link.path) ? 700 : 400,
                    fontSize: '0.929rem',
                    color: isActive(link.path) ? BLUE : '#1a1a1a',
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Divider />
          <Box sx={{ p: 2 }}>
            <PostBtn fullWidth onClick={() => { window.location.href = 'http://localhost:3333/login'; setMobileOpen(false) }}>
              Đăng tin miễn phí
            </PostBtn>
            <Box sx={{ mt: 1.5 }}>
              {!user ? (
                <Button fullWidth variant="outlined" onClick={() => { navigate('/login'); setMobileOpen(false) }}
                  sx={{ borderColor: BLUE, color: BLUE, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}>
                  Đăng nhập
                </Button>
              ) : (
                <Button fullWidth variant="outlined" onClick={handleLogout}
                  sx={{ borderColor: BORDER, color: '#595959', borderWidth: '1px' }}>
                  Đăng xuất
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} onApply={handleFilterApply} initialFilters={null} />
    </>
  )
}