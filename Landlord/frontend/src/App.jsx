import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import LandlordLayout from './components/LandlordLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LandlordDashboard from './pages/LandlordDashboard'
import ManageRooms from './pages/ManageRooms'
import LandlordProfile from './pages/LandlordProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute><LandlordLayout /></ProtectedRoute>}>
          <Route path="/" element={<LandlordDashboard />} />
          <Route path="/dashboard" element={<LandlordDashboard />} />
          <Route path="/manage-rooms" element={<ManageRooms />} />
          <Route path="/profile" element={<LandlordProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
