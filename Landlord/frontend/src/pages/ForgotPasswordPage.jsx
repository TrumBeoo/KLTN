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
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email) {
        throw new Error('Vui lòng nhập email')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Mã xác nhận đã được gửi đến email của bạn')
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!code) {
        throw new Error('Vui lòng nhập mã xác nhận')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Mã xác nhận hợp lệ')
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!password || !confirmPassword) {
        throw new Error('Vui lòng nhập mật khẩu')
      }

      if (password !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }

      if (password.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Mật khẩu đã được đặt lại thành công')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
            Đặt lại mật khẩu
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nhập email của bạn để nhận mã xác nhận
          </Typography>
        </Box>

        <Card sx={{ p: 3 }}>
          {/* Stepper */}
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Email</StepLabel>
            </Step>
            <Step>
              <StepLabel>Xác nhận</StepLabel>
            </Step>
            <Step>
              <StepLabel>Mật khẩu mới</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Step 1: Email */}
          {step === 0 && (
            <form onSubmit={handleSendCode}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                </Button>
              </Stack>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 1 && (
            <form onSubmit={handleVerifyCode}>
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Mã xác nhận đã được gửi đến <strong>{email}</strong>
                </Typography>
                <TextField
                  label="Mã xác nhận"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập 6 chữ số"
                  fullWidth
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setStep(0)}
                    startIcon={<ArrowBackIcon />}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                  >
                    {loading ? 'Đang xác nhận...' : 'Xác nhận'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <Stack spacing={2}>
                <TextField
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <TextField
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setStep(1)}
                    startIcon={<ArrowBackIcon />}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                  >
                    {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nhớ mật khẩu?{' '}
              <Link href="/login" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}
