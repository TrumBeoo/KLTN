import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import LandlordLayout from './components/LandlordLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LandlordDashboard from './pages/LandlordDashboard'
import ManageRooms from './pages/ManageRooms'
import ManageBuildings from './pages/ManageBuildings'
import LandlordProfile from './pages/LandlordProfile'
import ViewingSchedulesPage from './pages/ViewingSchedulesPage'
import ManageListings from './pages/ManageListings'
import ManageContracts from './pages/ManageContracts'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute><LandlordLayout /></ProtectedRoute>}>
          <Route path="/" element={<LandlordDashboard />} />
          <Route path="/dashboard" element={<LandlordDashboard />} />
          <Route path="/manage-buildings" element={<ManageBuildings />} />
          <Route path="/manage-rooms" element={<ManageRooms />} />
          <Route path="/listings" element={<ManageListings />} />
          <Route path="/viewing-schedules" element={<ViewingSchedulesPage />} />
          <Route path="/contracts" element={<ManageContracts />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<LandlordProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
