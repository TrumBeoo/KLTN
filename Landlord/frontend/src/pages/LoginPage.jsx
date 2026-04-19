import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
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
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      if (!data.success) throw new Error(data.message || 'Đăng nhập thất bại')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      showError('Đăng nhập thất bại', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#F7F8F8',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', py: 6 }}>
        <Box sx={{ width: '100%' }}>
          {/* Logo + Brand */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 3 }}>
              <Box
                component="img"
                src="/logo/5.png"
                alt="Rentify"
                sx={{
                  height: 32,
                  width: 'auto',
                  borderRadius: '6px',
                  border: '1px solid rgba(94,106,210,0.2)'
                }}
              />
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 590,
                  color: '#0F1011',
                  letterSpacing: '-0.02em',
                  fontFeatureSettings: '"cv01","ss03"'
                }}
              >
                Rentify
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: '1.625rem',
                fontWeight: 590,
                color: '#0F1011',
                letterSpacing: '-0.04em',
                lineHeight: 1.2,
                mb: 0.75
              }}
            >
              Chào mừng trở lại
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: '#62666D', letterSpacing: '-0.01em' }}>
              Đăng nhập để quản lý phòng và hợp đồng của bạn
            </Typography>
          </Box>

          {/* Form Card */}
          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8EAED',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              p: 3.5
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011', mb: 0.625 }}>
                    Email hoặc tên đăng nhập
                  </Typography>
                  <TextField
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    placeholder="your@email.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: '1rem', color: '#8A8F98' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.625 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>
                      Mật khẩu
                    </Typography>
                    <Link
                      href="/forgot-password"
                      sx={{
                        fontSize: '0.8125rem',
                        color: '#5E6AD2',
                        textDecoration: 'none',
                        fontWeight: 510,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </Box>
                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    placeholder="••••••••"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: '1rem', color: '#8A8F98' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: '#8A8F98' }}
                          >
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: '1rem' }} /> : <VisibilityIcon sx={{ fontSize: '1rem' }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={<Checkbox size="small" sx={{ color: '#D8DAE0', '&.Mui-checked': { color: '#5E6AD2' } }} />}
                  label={<Typography sx={{ fontSize: '0.8125rem', color: '#62666D' }}>Ghi nhớ đăng nhập</Typography>}
                  sx={{ my: 0 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: '#5E6AD2',
                    color: '#FFFFFF',
                    py: 1.125,
                    fontWeight: 510,
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: '#4F5ABF' },
                    '&:disabled': { backgroundColor: '#D0D6E0', color: '#FFFFFF' }
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, height: 1, backgroundColor: '#E8EAED' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#8A8F98', whiteSpace: 'nowrap' }}>hoặc</Typography>
              <Box sx={{ flex: 1, height: 1, backgroundColor: '#E8EAED' }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 2,
                color: '#0F1011',
                borderColor: '#D8DAE0',
                fontWeight: 510,
                fontSize: '0.875rem',
                py: 1,
                borderRadius: '6px',
                '&:hover': { borderColor: '#5E6AD2', backgroundColor: 'rgba(94,106,210,0.04)' }
              }}
            >
              Đăng nhập với Google
            </Button>
          </Box>

          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#62666D' }}>
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                sx={{
                  color: '#5E6AD2',
                  textDecoration: 'none',
                  fontWeight: 510,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>

      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Box>
  )
}