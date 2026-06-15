import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import LandlordLayout from './components/LandlordLayout'

// Eager load critical pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandlordDashboard from './pages/LandlordDashboard'

// Lazy load non-critical pages
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const ManageRooms = lazy(() => import('./pages/ManageRooms'))
const ManageBuildings = lazy(() => import('./pages/ManageBuildings'))
const LandlordProfile = lazy(() => import('./pages/LandlordProfile'))
const ViewingSchedulesPage = lazy(() => import('./pages/ViewingSchedulesPage'))
const ContractManagement = lazy(() => import('./pages/ContractManagement'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const TenantManagement = lazy(() => import('./pages/TenantManagement'))
const TenantDetail = lazy(() => import('./pages/TenantDetail'))
const ContractExpiringNotifications = lazy(() => import('./pages/ContractExpiringNotifications'))

// Loading fallback component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress />
  </Box>
)

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute><LandlordLayout /></ProtectedRoute>}>
            <Route path="/" element={<LandlordDashboard />} />
            <Route path="/dashboard" element={<LandlordDashboard />} />
            <Route path="/manage-buildings" element={<ManageBuildings />} />
            <Route path="/manage-rooms" element={<ManageRooms />} />
            <Route path="/viewing-schedules" element={<ViewingSchedulesPage />} />
            <Route path="/contracts" element={<ContractManagement />} />
            <Route path="/tenants" element={<TenantManagement />} />
            <Route path="/tenants/:id" element={<TenantDetail />} />
            <Route path="/contract-notifications" element={<ContractExpiringNotifications />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<LandlordProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
