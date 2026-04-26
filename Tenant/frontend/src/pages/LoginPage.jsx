/**
 * LoginPage — Booking.com style redesign
 *
 * Layout: centered card (max-width 440px) on gray bg.
 * Blue header bar, form below.
 * No full-bleed hero image — Booking style is pure form-focused.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton, Checkbox, FormControlLabel,
  Divider, Stack,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

const T = {
  blue:   '#006ce4',
  blueDk: '#003f8a',
  blueLt: '#e8f2ff',
  text:   '#1a1a1a',
  muted:  '#595959',
  bg:     '#f2f4f8',
  white:  '#ffffff',
  border: '#d4d6d9',
  yellow: '#febb02',
}

export default function LoginPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: { xs: 0, sm: 4 } }}>
      {/* Blue top bar (mobile) */}
      <Box sx={{ width: '100%', backgroundColor: T.blue, py: 2, px: 3, display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1, mb: 0 }}>
        <IconButton size="small" onClick={() => navigate('/')} aria-label="Quay lại" sx={{ color: T.white }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.white }}>Rentify</Typography>
      </Box>

      {/* Card */}
      <Box sx={{
        width: '100%', maxWidth: 440,
        backgroundColor: T.white,
        borderRadius: { xs: 0, sm: '8px' },
        border: { xs: 'none', sm: `1px solid ${T.border}` },
        boxShadow: { xs: 'none', sm: 'rgba(26,26,26,0.16) 0px 2px 8px 0px' },
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <Box sx={{ backgroundColor: T.blue, px: 3, py: 2.5 }}>
          {/* Logo — desktop only */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: 24, backgroundImage: "url('/logo/5.png')", backgroundSize: 'cover', borderRadius: '4px' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.white }}>Rentify</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.286rem', color: T.white, mb: 0.25 }}>
            Đăng nhập
          </Typography>
          <Typography sx={{ fontSize: '0.857rem', color: 'rgba(255,255,255,0.85)' }}>
            Chào mừng bạn quay lại!
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '4px', fontSize: '0.857rem' }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email hoặc tên đăng nhập"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required fullWidth
                autoComplete="username"
                inputProps={{ 'aria-label': 'Email hoặc tên đăng nhập' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: 18, color: T.muted }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mật khẩu"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required fullWidth
                autoComplete="current-password"
                inputProps={{ 'aria-label': 'Mật khẩu' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: T.muted }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small" edge="end"
                        onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ '&.Mui-checked': { color: T.blue } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.857rem', color: T.text }}>Ghi nhớ đăng nhập</Typography>}
              />
              <Link
                href="/forgot-password" underline="hover"
                sx={{ fontSize: '0.857rem', color: T.blue, fontWeight: 600 }}
              >
                Quên mật khẩu?
              </Link>
            </Box>

            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{
                backgroundColor: T.blue, borderRadius: '4px',
                py: 1.5, fontWeight: 700, fontSize: '1rem',
                '&:hover': { backgroundColor: T.blueDk },
                '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                mb: 2,
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Divider sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted, px: 1 }}>hoặc</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined"
              aria-label="Đăng nhập với Google"
              startIcon={
                <svg width="18" height="18" viewBox="0 0 20 20">
                  <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                  <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                  <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                  <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                </svg>
              }
              sx={{
                borderColor: T.border, borderWidth: '1px', color: T.text,
                borderRadius: '4px', py: 1.25, fontWeight: 500, fontSize: '0.929rem',
                '&:hover': { borderColor: '#8b8b8b', backgroundColor: T.bg },
              }}
            >
              Tiếp tục với Google
            </Button>
          </Box>
        </Box>

        {/* Card footer */}
        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${T.border}`, textAlign: 'center', backgroundColor: T.bg }}>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" underline="hover" sx={{ fontWeight: 700, color: T.blue }}>
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '0.786rem', color: T.muted, mt: 2, textAlign: 'center', px: 2 }}>
        Bằng cách đăng nhập, bạn đồng ý với{' '}
        <Link href="#" underline="hover" sx={{ color: T.muted }}>Điều khoản sử dụng</Link>
        {' '}và{' '}
        <Link href="#" underline="hover" sx={{ color: T.muted }}>Chính sách bảo mật</Link>
      </Typography>
    </Box>
  )
}