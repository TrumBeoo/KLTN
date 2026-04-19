import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="buildings" element={<AdminDashboard />} />
            <Route path="rooms" element={<AdminDashboard />} />
            <Route path="contracts" element={<AdminDashboard />} />
            <Route path="payments" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
