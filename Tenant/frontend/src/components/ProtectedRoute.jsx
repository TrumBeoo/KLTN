import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Box, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading, logout } = useAuth()
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const validateRole = async () => {
      if (!user) {
        setIsValid(false)
        setValidating(false)
        return
      }

      // Kiểm tra role từ localStorage
      if (user.role !== 'Tenant') {
        console.log('Invalid role detected:', user.role)
        await logout()
        setIsValid(false)
        setValidating(false)
        return
      }

      // Validate với server
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.status === 403) {
            // Forbidden - sai role
            console.log('403 Forbidden - wrong role')
            await logout()
            setIsValid(false)
          } else if (response.ok) {
            setIsValid(true)
          } else {
            await logout()
            setIsValid(false)
          }
        } catch (error) {
          console.error('Role validation error:', error)
          await logout()
          setIsValid(false)
        }
      }
      
      setValidating(false)
    }

    if (!authLoading) {
      validateRole()
    }
  }, [user, authLoading, logout])

  if (authLoading || validating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user || !isValid) {
    return <Navigate to="/login" replace />
  }

  return children
}
