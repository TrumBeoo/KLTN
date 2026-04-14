import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTopButton from './components/ScrollToTopButton'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import TenantProfilePage from './pages/TenantProfilePage'
import RoomDetailPage from './pages/RoomDetailPage'
import ListingPage from './pages/ListingPage'
import RoommateMatchingPage from './pages/RoommateMatchingPage'
import BlogPage from './pages/BlogPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/profile" element={<TenantProfilePage />} />
              <Route path="/room/:id" element={<RoomDetailPage />} />
              <Route path="/listings" element={<ListingPage />} />
              <Route path="/roommate" element={<RoommateMatchingPage />} />
              <Route path="/blog" element={<BlogPage />} />
            </Routes>
          </Box>
          <ScrollToTopButton />
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App
