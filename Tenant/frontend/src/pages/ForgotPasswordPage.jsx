import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Stack,
  Link,
} from '@mui/material'
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const ForgotCard = styled(Card)(({ theme }) => ({
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
}))

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    setLoading(true)

    try {
      const response = await fetch('../../backend/forgot-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Không tìm thấy tài khoản')
      }

      setSuccess('Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn.')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <ForgotCard sx={{ p: 4, position: 'relative' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Quên mật khẩu?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                {success}
              </Alert>
            )}

            {!submitted ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email hoặc Tên đăng nhập"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="your@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Kiểm tra email của bạn để nhận hướng dẫn đặt lại mật khẩu
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Nếu bạn không nhận được email trong vòng 5 phút, vui lòng kiểm tra thư mục spam.
                </Typography>
              </Box>
            )}

            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="/login"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Quay lại đăng nhập
              </Link>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                💡 <strong>Mẹo:</strong> Nếu bạn không nhớ email hoặc tên đăng nhập, vui lòng liên hệ với bộ phận hỗ trợ.
              </Typography>
            </Box>
          </Stack>
        </ForgotCard>
      </Container>
    </Box>
  )
}
