import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Divider
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: 'background.default' }}>
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
            Chào mừng chủ nhà!
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Đăng nhập để quản lý phòng, xem lịch xem phòng và quản lý hợp đồng
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
                label="Email hoặc Tên đăng nhập"
                name="username"
                value={formData.username}
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Ghi nhớ đăng nhập"
                />
                <Link href="/forgot-password" sx={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 2 }}>hoặc</Divider>

          <Button
            fullWidth
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Đăng nhập với Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Chưa có tài khoản?{' '}
              <Link href="/register" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}
