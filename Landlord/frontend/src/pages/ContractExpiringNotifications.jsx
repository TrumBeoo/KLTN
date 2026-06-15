import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  NotificationsActive as NotificationsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Description as ContractIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

const ContractExpiringNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [daysFilter, setDaysFilter] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpiringContracts();
  }, [daysFilter]);

  const fetchExpiringContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tenants/expiring/notifications`, {
        params: { days: daysFilter },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setContracts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching expiring contracts:', err);
      setError('Không thể tải danh sách hợp đồng sắp hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getDaysRemainingChip = (days) => {
    if (days <= 7) {
      return <Chip label={`${days} ngày`} color="error" size="small" />;
    } else if (days <= 14) {
      return <Chip label={`${days} ngày`} color="warning" size="small" />;
    } else {
      return <Chip label={`${days} ngày`} color="info" size="small" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
          <Typography variant="h4" component="h1">
            Nhắc hết hạn hợp đồng
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Thời gian nhắc trước</InputLabel>
          <Select
            value={daysFilter}
            label="Thời gian nhắc trước"
            onChange={(e) => setDaysFilter(e.target.value)}
          >
            <MenuItem value={7}>7 ngày</MenuItem>
            <MenuItem value={15}>15 ngày</MenuItem>
            <MenuItem value={30}>30 ngày</MenuItem>
            <MenuItem value={60}>60 ngày</MenuItem>
            <MenuItem value={90}>90 ngày</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : contracts.length === 0 ? (
            <Alert severity="success">
              Không có hợp đồng nào sắp hết hạn trong {daysFilter} ngày tới
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Có {contracts.length} hợp đồng sắp hết hạn trong {daysFilter} ngày tới
              </Alert>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã HĐ</TableCell>
                      <TableCell>Người thuê</TableCell>
                      <TableCell>Liên hệ</TableCell>
                      <TableCell>Phòng</TableCell>
                      <TableCell>Địa chỉ</TableCell>
                      <TableCell>Ngày hết hạn</TableCell>
                      <TableCell>Còn lại</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow 
                        key={contract.ContractID}
                        sx={{
                          backgroundColor: contract.DaysRemaining <= 7 
                            ? 'error.lighter' 
                            : contract.DaysRemaining <= 14 
                            ? 'warning.lighter' 
                            : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {contract.ContractID}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {contract.TenantName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption">
                                {contract.TenantPhone || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" noWrap>
                                {contract.TenantEmail || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {contract.RoomCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.RoomType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {contract.BuildingName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.Address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(contract.EndDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getDaysRemainingChip(contract.DaysRemaining)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Xem người thuê">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/tenants/${contract.TenantID}`)}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xem hợp đồng">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/contracts`)}
                            >
                              <ContractIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          💡 Mẹo: Liên hệ người thuê sớm để thỏa thuận gia hạn hoặc chuẩn bị tìm người thuê mới
        </Alert>
      </Box>
    </Container>
  );
};

export default ContractExpiringNotifications;
