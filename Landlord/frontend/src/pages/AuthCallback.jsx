import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'

const API_URL = import.meta.env.VITE_API_URL

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      let errorMessage = 'Đăng nhập thất bại'
      
      switch (error) {
        case 'google_auth_failed':
          errorMessage = 'Xác thực Google thất bại. Vui lòng thử lại.'
          break
        case 'invalid_role':
          errorMessage = 'Tài khoản này không phải là tài khoản chủ nhà. Vui lòng sử dụng tài khoản chủ nhà để đăng nhập.'
          break
        case 'auth_failed':
          errorMessage = 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.'
          break
      }

      navigate(`/login?error=${encodeURIComponent(errorMessage)}`)
      return
    }

    if (token) {
      // Save token
      localStorage.setItem('token', token)

      // Fetch user info
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user))
            navigate('/dashboard')
          } else {
            throw new Error('Failed to fetch user info')
          }
        })
        .catch(err => {
          console.error('Error fetching user info:', err)
          localStorage.removeItem('token')
          navigate('/login?error=Không thể lấy thông tin người dùng')
        })
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F8F8'
      }}
    >
      <CircularProgress size={48} sx={{ color: '#5E6AD2', mb: 2 }} />
      <Typography sx={{ fontSize: '0.9375rem', color: '#62666D' }}>
        Đang xử lý đăng nhập...
      </Typography>
    </Box>
  )
}
