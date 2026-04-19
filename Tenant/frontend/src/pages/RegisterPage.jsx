import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (!formData.termsAccepted) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng')
      return
    }

    setLoading(true)

    try {
      await register(
        formData.username,
        formData.password,
        formData.fullName,
        formData.email,
        formData.phone
      )
      navigate('/login?registered=true')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Left: Hero Image */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        position: 'relative',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        alignItems: 'flex-end',
        p: 6,
      }}>
        <Box>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '2rem', mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Tham gia cộng đồng Rentify
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Bắt đầu hành trình tìm kiếm phòng trọ của bạn
          </Typography>
        </Box>
      </Box>

      {/* Right: Form */}
      <Box sx={{ flex: { xs: 1, md: 'none' }, width: { xs: '100%', md: 520 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, sm: 6 }, py: 6 }}>
        {/* Logo */}
        <Box sx={{ mb: 6 }}>
          <Link href="/" underline="none">
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#4A90E2', letterSpacing: '-0.5px' }}>Rentify</Typography>
          </Link>
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#222222', mb: 0.75 }}>Tạo tài khoản mới</Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 4 }}>Điền thông tin để bắt đầu</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>
              }}
            />
            <TextField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>
              }}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>
              }}
            />
            <TextField
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: '1.125rem' }} /> : <VisibilityIcon sx={{ fontSize: '1.125rem' }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required fullWidth
              error={formData.confirmPassword && formData.password !== formData.confirmPassword}
              helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#929292', fontSize: '1.125rem' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: '1.125rem' }} /> : <VisibilityIcon sx={{ fontSize: '1.125rem' }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>

          <FormControlLabel
            control={<Checkbox name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} size="small" />}
            label={
              <Typography variant="body2" sx={{ color: '#222222' }}>
                Tôi đồng ý với <Link href="#" underline="hover" sx={{ fontWeight: 600, color: '#222222' }}>Điều khoản sử dụng</Link> và <Link href="#" underline="hover" sx={{ fontWeight: 600, color: '#222222' }}>Chính sách bảo mật</Link>
              </Typography>
            }
            sx={{ mt: 2, mb: 3 }}
          />

          <Button
            type="submit" variant="contained" fullWidth disabled={loading}
            sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '8px', py: 1.75, fontWeight: 600, fontSize: '1rem', mb: 2 }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>

          <Divider sx={{ mb: 2 }}><Typography variant="body2" sx={{ color: '#6a6a6a', px: 1 }}>hoặc</Typography></Divider>

          <Button
            fullWidth variant="outlined"
            startIcon={<svg width="18" height="18" viewBox="0 0 20 20"><path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/><path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/><path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/><path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/></svg>}
            sx={{ borderColor: '#c1c1c1', color: '#222222', borderRadius: '8px', py: 1.5, fontWeight: 500 }}
          >
            Đăng ký với Google
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#6a6a6a', mt: 4 }}>
          Đã có tài khoản?{' '}
          <Link href="/login" underline="hover" sx={{ fontWeight: 600, color: '#222222' }}>Đăng nhập</Link>
        </Typography>
      </Box>
    </Box>
  )
}