import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTopButton from './components/ScrollToTopButton'

// Lazy load all pages for better code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'))
const TenantProfilePage = lazy(() => import('./pages/TenantProfilePage'))
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage'))
const ListingPage = lazy(() => import('./pages/ListingPage'))
const RoommateMatchingPage = lazy(() => import('./pages/RoommateMatchingPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const MovingServicePage = lazy(() => import('./pages/MovingServicePage'))
const ProviderDashboardPage = lazy(() => import('./pages/ProviderDashboardPage'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
)

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flex: 1 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/profile" element={<TenantProfilePage />} />
                <Route path="/room/:id" element={<RoomDetailPage />} />
                <Route path="/listings" element={<ListingPage />} />
                <Route path="/roommate" element={<RoommateMatchingPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/moving-service" element={<MovingServicePage />} />
                <Route 
                  path="/provider/dashboard" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute requiredRole="Provider">
                        <ProviderDashboardPage />
                      </ProtectedRoute>
                    </Suspense>
                  } 
                />
              </Routes>
            </Suspense>
          </Box>
          <ScrollToTopButton />
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App
