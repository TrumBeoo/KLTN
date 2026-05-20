import { useState, useEffect } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ProviderServiceForm from '../components/ProviderServiceForm';
import ProviderBookingManager from '../components/ProviderBookingManager';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Kiểm tra role
    if (!user || user.role !== 'Provider') {
      navigate('/login');
      return;
    }

    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/moving/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      setError('Lỗi khi tải danh mục: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== 'Provider') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản nhà cung cấp dịch vụ.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ background: '#f2f4f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1a1a1a' }}>
              🏢 Bảng điều khiển nhà cung cấp
            </Typography>
            <Typography variant="body1" sx={{ color: '#595959' }}>
              Quản lý dịch vụ chuyển nhà của bạn
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/moving-service')}
            sx={{
              borderColor: '#006ce4',
              color: '#006ce4',
              '&:hover': {
                borderColor: '#003f8a',
                backgroundColor: '#e8f2ff',
              }
            }}
          >
            Quay lại
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="📦 Quản lý dịch vụ" />
            <Tab label="📋 Đơn đặt dịch vụ" />
            <Tab label="📊 Thống kê" />
            <Tab label="⚙️ Cài đặt" />
          </Tabs>
        </Box>

        {/* Tab 0: Quản lý dịch vụ */}
        {tabValue === 0 && (
          <ProviderServiceForm categories={categories} />
        )}

        {/* Tab 1: Đơn đặt dịch vụ */}
        {tabValue === 1 && (
          <Box sx={{ background: 'white', p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📋 Quản lý đơn đặt dịch vụ
            </Typography>
            <ProviderBookingManager />
          </Box>
        )}

        {/* Tab 2: Thống kê */}
        {tabValue === 2 && (
          <Box sx={{ background: 'white', p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📊 Thống kê (Sắp có)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tính năng thống kê sẽ được cập nhật sớm...
            </Typography>
          </Box>
        )}

        {/* Tab 3: Cài đặt */}
        {tabValue === 3 && (
          <Box sx={{ background: 'white', p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              ⚙️ Cài đặt (Sắp có)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tính năng cài đặt sẽ được cập nhật sớm...
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
