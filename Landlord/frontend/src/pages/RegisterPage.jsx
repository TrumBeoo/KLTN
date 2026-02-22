import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Person2 as UsernameIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL

export default function RegisterPage() {
  const navigate = useNavigate()
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return Math.min(Math.floor(strength / 1.25), 4)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      showError('Lỗi!', 'Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      showError('Lỗi!', 'Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      showError('Lỗi!', 'Vui lòng đồng ý với Điều khoản sử dụng')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Đăng ký thất bại')
      }

      showSuccess('Thành công!', 'Đăng ký thành công! Vui lòng đăng nhập.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      showError('Lỗi đăng ký!', err.message)
    } finally {
      setLoading(false)
    }
  }

  const strengthLabels = ['Chưa nhập', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
  const strengthColors = ['', 'error', 'warning', 'warning', 'success']

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Box
              component="img"
              src="/logo/5.png"
              alt="Rentify"
              sx={{ height: 48, width: 'auto' }}
            />
            <Typography variant="h4" sx={{ fontFamily: 'Manrope', fontWeight: 800, background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Rentify
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Bắt đầu quản lý phòng
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Đăng ký tài khoản chủ nhà để bắt đầu đăng tin, quản lý phòng và theo dõi lịch xem phòng
          </Typography>
        </Box>

        <Card sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UsernameIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />

              <Box>
                <TextField
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength + 1) * 25}
                      color={strengthColors[passwordStrength] || 'primary'}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      Độ mạnh: {strengthLabels[passwordStrength]}
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Tôi đồng ý với{' '}
                    <Link href="#" sx={{ textDecoration: 'none' }}>
                      Điều khoản sử dụng
                    </Link>
                    {' '}và{' '}
                    <Link href="#" sx={{ textDecoration: 'none' }}>
                      Chính sách bảo mật
                    </Link>
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 2 }}>hoặc</Divider>

          <Button
            fullWidth
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Đăng ký với Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Đã có tài khoản?{' '}
              <Link href="/login" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
        
        <NotificationModal
          open={notification.open}
          onClose={hideNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </Container>
    </Box>
  )
}
