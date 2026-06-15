import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

const TenantManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenants();
  }, [filter]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, tenants]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tenants`, {
        params: { filter: filter !== 'all' ? filter : undefined },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTenants(response.data.data);
        setFilteredTenants(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Không thể tải danh sách người thuê');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredTenants(tenants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tenants.filter(tenant =>
      tenant.Name?.toLowerCase().includes(query) ||
      tenant.Phone?.includes(query) ||
      tenant.Email?.toLowerCase().includes(query) ||
      tenant.RoomCode?.toLowerCase().includes(query) ||
      tenant.BuildingName?.toLowerCase().includes(query)
    );
    setFilteredTenants(filtered);
  };

  const getContractStatusChip = (status, daysRemaining) => {
    if (status === 'active') {
      if (daysRemaining <= 30) {
        return <Chip label="Sắp hết hạn" color="warning" size="small" />;
      }
      return <Chip label="Đang thuê" color="success" size="small" />;
    } else if (status === 'expired') {
      return <Chip label="Đã hết hạn" color="error" size="small" />;
    } else if (status === 'terminated') {
      return <Chip label="Đã chấm dứt" color="default" size="small" />;
    }
    return null;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleViewDetail = (tenantId) => {
    navigate(`/tenants/${tenantId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Quản lý người thuê phòng
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm theo tên, số điện thoại, email, mã phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            variant="fullWidth"
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Đang thuê" value="current" />
            <Tab label="Đã ký hợp đồng" value="contracted" />
          </Tabs>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTenants.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              Không có người thuê nào
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTenants.map((tenant) => (
            <Grid item xs={12} md={6} lg={4} key={tenant.TenantID}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={tenant.AvatarURL}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {tenant.Name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {tenant.Name}
                      </Typography>
                      {tenant.ContractStatus && (
                        getContractStatusChip(tenant.ContractStatus, tenant.DaysRemaining)
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {tenant.Phone || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {tenant.Email || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {tenant.RoomCode && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HomeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {tenant.RoomCode} - {tenant.RoomType}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {tenant.BuildingName}
                      </Typography>
                    </Box>
                  )}

                  {tenant.EndDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Hết hạn: {formatDate(tenant.EndDate)}
                        {tenant.DaysRemaining > 0 && ` (còn ${tenant.DaysRemaining} ngày)`}
                      </Typography>
                    </Box>
                  )}

                  {tenant.Job && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Nghề nghiệp: {tenant.Job}
                    </Typography>
                  )}

                  {tenant.University && (
                    <Typography variant="body2" color="text.secondary">
                      Trường: {tenant.University}
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleViewDetail(tenant.TenantID)}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TenantManagement;
