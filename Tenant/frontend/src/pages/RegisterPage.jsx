/**
 * RegisterPage — Booking.com style redesign
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
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

const T = {
  blue: '#006ce4', blueDk: '#003f8a', blueLt: '#e8f2ff',
  text: '#1a1a1a', muted: '#595959', bg: '#f2f4f8',
  white: '#ffffff', border: '#d4d6d9',
}

export default function RegisterPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    username: '', fullName: '', email: '', phone: '',
    password: '', confirmPassword: '', termsAccepted: false,
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const handleChange = e => {
    const { name, value, checked, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Mật khẩu không khớp'); return }
    if (!formData.termsAccepted) { setError('Vui lòng đồng ý với Điều khoản sử dụng'); return }
    setLoading(true)
    try {
      await register(formData.username, formData.password, formData.fullName, formData.email, formData.phone)
      navigate('/login?registered=true')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Tên đăng nhập', name: 'username', type: 'text', icon: <PersonIcon sx={{ fontSize: 18, color: T.muted }} />, autoComplete: 'username' },
    { label: 'Họ và tên', name: 'fullName', type: 'text', icon: <PersonIcon sx={{ fontSize: 18, color: T.muted }} />, autoComplete: 'name' },
    { label: 'Email', name: 'email', type: 'email', icon: <EmailIcon sx={{ fontSize: 18, color: T.muted }} />, autoComplete: 'email' },
    { label: 'Số điện thoại', name: 'phone', type: 'tel', icon: <PhoneIcon sx={{ fontSize: 18, color: T.muted }} />, autoComplete: 'tel' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: { xs: 0, sm: 4 }, pb: 4 }}>
      {/* Mobile blue bar */}
      <Box sx={{ width: '100%', backgroundColor: T.blue, py: 2, px: 3, display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1, mb: 0 }}>
        <IconButton size="small" onClick={() => navigate('/')} aria-label="Quay lại" sx={{ color: T.white }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.white }}>Rentify</Typography>
      </Box>

      <Box sx={{
        width: '100%', maxWidth: 480,
        backgroundColor: T.white,
        borderRadius: { xs: 0, sm: '8px' },
        border: { xs: 'none', sm: `1px solid ${T.border}` },
        boxShadow: { xs: 'none', sm: 'rgba(26,26,26,0.16) 0px 2px 8px 0px' },
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{ backgroundColor: T.blue, px: 3, py: 2.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: 24, backgroundImage: "url('/logo/5.png')", backgroundSize: 'cover', borderRadius: '4px' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.white }}>Rentify</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.286rem', color: T.white, mb: 0.25 }}>Tạo tài khoản</Typography>
          <Typography sx={{ fontSize: '0.857rem', color: 'rgba(255,255,255,0.85)' }}>Tham gia cộng đồng Rentify ngay hôm nay</Typography>
        </Box>

        {/* Form */}
        <Box sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '4px', fontSize: '0.857rem' }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {fields.map(f => (
                <TextField
                  key={f.name}
                  label={f.label} name={f.name} type={f.type}
                  value={formData[f.name]} onChange={handleChange}
                  required fullWidth autoComplete={f.autoComplete}
                  inputProps={{ 'aria-label': f.label }}
                  InputProps={{ startAdornment: <InputAdornment position="start">{f.icon}</InputAdornment> }}
                />
              ))}

              {/* Password */}
              <TextField
                label="Mật khẩu" name="password"
                type={showPass ? 'text' : 'password'}
                value={formData.password} onChange={handleChange}
                required fullWidth autoComplete="new-password"
                helperText="Tối thiểu 8 ký tự"
                inputProps={{ 'aria-label': 'Mật khẩu' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: T.muted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Ẩn' : 'Hiện'}>
                        {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm password */}
              <TextField
                label="Xác nhận mật khẩu" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={handleChange}
                required fullWidth autoComplete="new-password"
                error={!!(formData.confirmPassword && formData.password !== formData.confirmPassword)}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : ''}
                inputProps={{ 'aria-label': 'Xác nhận mật khẩu' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: T.muted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Ẩn' : 'Hiện'}>
                        {showConfirm ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange}
                  size="small" sx={{ '&.Mui-checked': { color: T.blue } }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.857rem', color: T.text }}>
                  Tôi đồng ý với{' '}
                  <Link href="#" underline="hover" sx={{ color: T.blue, fontWeight: 600 }}>Điều khoản</Link>
                  {' '}và{' '}
                  <Link href="#" underline="hover" sx={{ color: T.blue, fontWeight: 600 }}>Bảo mật</Link>
                </Typography>
              }
              sx={{ mt: 2, mb: 2.5 }}
            />

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
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </Button>

            <Divider sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted, px: 1 }}>hoặc</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined"
              aria-label="Đăng ký với Google"
              startIcon={
                <svg width="18" height="18" viewBox="0 0 20 20">
                  <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                  <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                  <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                  <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                </svg>
              }
              sx={{
                borderColor: T.border, color: T.text, borderRadius: '4px',
                py: 1.25, fontWeight: 500, fontSize: '0.929rem',
                '&:hover': { borderColor: '#8b8b8b', backgroundColor: T.bg },
              }}
            >
              Tiếp tục với Google
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${T.border}`, textAlign: 'center', backgroundColor: T.bg }}>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
            Đã có tài khoản?{' '}
            <Link href="/login" underline="hover" sx={{ fontWeight: 700, color: T.blue }}>Đăng nhập</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}