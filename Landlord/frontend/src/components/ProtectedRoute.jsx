import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'

const API_URL = import.meta.env.VITE_API_URL

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Kiểm tra role
            const user = data.user
            if (user.role === 'Landlord' || user.role === 'Admin') {
              setIsValid(true)
            } else {
              // Sai role - logout
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setIsValid(false)
            }
          } else {
            setIsValid(false)
          }
        } else if (response.status === 403) {
          // Forbidden - sai role
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsValid(false)
        } else {
          // Token không hợp lệ
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsValid(false)
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsValid(false)
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  
  if (!isValid) {
    return <Navigate to="/login" replace />
  }

  return children
}
