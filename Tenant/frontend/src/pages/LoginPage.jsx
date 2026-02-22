import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Grid,
  Card,
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
  Lock as LockIcon,
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useAuth } from '../hooks/useAuth'

const BrandSection = styled(Box)(({ theme }) => (({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)`,
  borderRight: `1px solid ${theme.palette.grey[200]}`,
  minHeight: '100vh',
})))

const AuthCard = styled(Card)(({ theme }) => (({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[3],
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  },
})))

export default function LoginPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Brand Section */}
      <BrandSection sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }}>
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 2rem',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
            }}
          >
            🏠
          </Box>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Chào mừng quay lại!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Đăng nhập để quản lý phòng, đặt lịch xem và theo dõi hợp đồng của bạn
          </Typography>
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 300,
              background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.5) 0%, rgba(241, 245, 249, 0.5) 100%)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
            }}
          >
            🏘️
          </Box>
        </Box>
      </BrandSection>

      {/* Form Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {/* Back Button */}
          <Link
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 4,
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            ← Trang chủ
          </Link>

          <AuthCard sx={{ p: 4, position: 'relative' }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
              Đăng nhập
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Nhập thông tin để tiếp tục
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email hoặc Tên đăng nhập"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Ghi nhớ đăng nhập"
                />
                <Link href="/forgot-password" sx={{ fontSize: '0.875rem' }}>
                  Quên mật khẩu?
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ArrowRightIcon />}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <Divider sx={{ my: 2 }}>hoặc</Divider>

              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
                    <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
                    <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
                    <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
                  </svg>
                }
              >
                Đăng nhập với Google
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Chưa có tài khoản?{' '}
                <Link href="/register" sx={{ fontWeight: 600 }}>
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </AuthCard>
        </Box>
      </Box>
    </Box>
  )
}
