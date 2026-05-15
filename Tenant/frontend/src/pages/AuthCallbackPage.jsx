import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      let errorMessage = 'Đăng nhập thất bại';
      if (error === 'google_auth_failed') {
        errorMessage = 'Xác thực Google thất bại';
      } else if (error === 'invalid_role') {
        errorMessage = 'Chỉ người thuê mới có thể đăng nhập ở trang này';
      }
      navigate('/login', { state: { error: errorMessage } });
      return;
    }

    if (token) {
      setToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { state: { error: 'Không nhận được token xác thực' } });
    }
  }, [searchParams, navigate, setToken]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Đang xử lý đăng nhập...
      </Typography>
    </Box>
  );
}
