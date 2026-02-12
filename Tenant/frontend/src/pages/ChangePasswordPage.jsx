import { useState } from 'react'
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material'
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const PasswordCard = styled(Card)(({ theme }) => ({
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

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('../../backend/change-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại')
      }

      setSuccess('Đổi mật khẩu thành công!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <PasswordCard sx={{ p: 4, position: 'relative' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Đổi mật khẩu
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Cập nhật mật khẩu của bạn để bảo vệ tài khoản
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Password */}
              <TextField
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
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
                        onClick={() => toggleShowPassword('current')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* New Password */}
              <TextField
                label="Mật khẩu mới"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                required
                fullWidth
                helperText="Tối thiểu 8 ký tự, bao gồm chữ và số"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowPassword('new')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm Password */}
              <TextField
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                helperText={
                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                    ? 'Mật khẩu không khớp'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowPassword('confirm')}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
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
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </Button>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                💡 <strong>Mẹo bảo mật:</strong> Sử dụng mật khẩu mạnh với ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </Typography>
            </Box>
          </Stack>
        </PasswordCard>
      </Container>
    </Box>
  )
}
