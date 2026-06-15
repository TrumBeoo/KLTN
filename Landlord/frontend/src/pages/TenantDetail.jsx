import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

const TenantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenantDetail();
  }, [id]);

  const fetchTenantDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tenants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTenant(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tenant detail:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin người thuê');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getContractStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'terminated':
        return 'default';
      default:
        return 'info';
    }
  };

  const getContractStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hiệu lực';
      case 'expired':
        return 'Đã hết hạn';
      case 'terminated':
        return 'Đã chấm dứt';
      default:
        return status;
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tenants')}
        sx={{ mb: 3 }}
      >
        Quay lại danh sách
      </Button>

      <Grid container spacing={3}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={tenant.AvatarURL}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {tenant.Name?.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {tenant.Name}
                </Typography>
                {tenant.Gender && (
                  <Chip
                    label={tenant.Gender === 'male' ? 'Nam' : tenant.Gender === 'female' ? 'Nữ' : 'Khác'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body2">
                      {tenant.Phone || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {tenant.Email || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Box>

                {tenant.Birthday && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ngày sinh
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(tenant.Birthday)} ({calculateAge(tenant.Birthday)} tuổi)
                      </Typography>
                    </Box>
                  </Box>
                )}

                {tenant.Job && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nghề nghiệp
                      </Typography>
                      <Typography variant="body2">{tenant.Job}</Typography>
                    </Box>
                  </Box>
                )}

                {tenant.University && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Trường học
                      </Typography>
                      <Typography variant="body2">{tenant.University}</Typography>
                    </Box>
                  </Box>
                )}

                {(tenant.BudgetMin || tenant.BudgetMax) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ngân sách
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(tenant.BudgetMin)} - {formatCurrency(tenant.BudgetMax)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {tenant.PreferredDistrict && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Khu vực ưa thích
                      </Typography>
                      <Typography variant="body2">{tenant.PreferredDistrict}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {tenant.Bio && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Giới thiệu
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {tenant.Bio}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lịch sử hợp đồng */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                Lịch sử hợp đồng
              </Typography>
              <Divider sx={{ my: 2 }} />

              {tenant.contracts && tenant.contracts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã hợp đồng</TableCell>
                        <TableCell>Phòng</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Giá thuê</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tenant.contracts.map((contract) => (
                        <TableRow key={contract.ContractID}>
                          <TableCell>{contract.ContractID}</TableCell>
                          <TableCell>
                            {contract.RoomCode}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {contract.RoomType} - {contract.Area}m²
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{contract.BuildingName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contract.Ward}, {contract.District}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(contract.StartDate)}
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(contract.EndDate)}
                            </Typography>
                            {contract.DaysRemaining > 0 && (
                              <Typography variant="caption" color="warning.main">
                                Còn {contract.DaysRemaining} ngày
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(contract.MonthlyRent)}/tháng
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cọc: {formatCurrency(contract.DepositAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getContractStatusLabel(contract.Status)}
                              color={getContractStatusColor(contract.Status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Chưa có hợp đồng nào</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TenantDetail;
