import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('Loading from localStorage:', { storedToken: !!storedToken, storedUser })

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('Parsed user:', parsedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const data = await authAPI.login(username, password)
    console.log('Login response data:', data)
    console.log('User data to save:', data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (username, password, name, email, phone, role = 'Tenant') => {
    return await authAPI.register(username, password, name, email, phone, role)
  }

  const logout = async () => {
    const currentToken = localStorage.getItem('token')
    if (currentToken) {
      try {
        await authAPI.logout()
      } catch (error) {
        // Ignore logout API errors (token might be expired)
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const changePassword = async (newPassword) => {
    return await authAPI.changePassword(newPassword)
  }

  const setTokenAndUser = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    // Fetch user info with the new token
    authAPI.getCurrentUser(newToken).then(data => {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }).catch(error => {
      console.error('Failed to fetch user info:', error)
      logout()
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, changePassword, setToken: setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
