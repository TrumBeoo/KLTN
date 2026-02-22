import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowRight as ArrowRightIcon
} from '@mui/icons-material'
import { dashboardService } from '../utils/dashboardService'

const KPICard = ({ title, value, change, isPositive, icon: Icon, color = 'primary' }) => (
  <Card sx={{ position: 'relative', overflow: 'hidden' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${color}.main 0%, ${color}.light 100%)`
      }}
    />
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', fontWeight: 600, color: isPositive ? 'success.main' : 'error.main' }}>
            {isPositive ? <TrendingUpIcon sx={{ fontSize: '1rem' }} /> : <TrendingDownIcon sx={{ fontSize: '1rem' }} />}
            {change}
          </Box>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
            fontSize: '1.5rem'
          }}
        >
          <Icon />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status, displayStatus }) => {
  const currentStatus = displayStatus || status;
  const statusConfig = {
    available: { label: 'Trống', color: 'success' },
    pending_viewing: { label: 'Chờ duyệt', color: 'warning' },
    viewing: { label: 'Đã đặt lịch', color: 'info' },
    rented: { label: 'Đã thuê', color: 'error' },
    maintenance: { label: 'Bảo trì', color: 'warning' }
  }
  const config = statusConfig[currentStatus] || statusConfig.available
  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />
}

export default function LandlordDashboard() {
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    pendingViewings: [],
    availableRooms: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập để xem dashboard')
        return
      }
      
      const [statsResponse, viewingsResponse, roomsResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getPendingViewings(),
        dashboardService.getAvailableRooms()
      ])

      setDashboardData({
        stats: statsResponse.data,
        pendingViewings: viewingsResponse.data,
        availableRooms: roomsResponse.data
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error.message.includes('Authentication failed')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else if (error.message.includes('No authentication token')) {
        setError('Vui lòng đăng nhập để xem dashboard')
      } else {
        setError('Không thể tải dữ liệu dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getTimeSince = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 ngày trước'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`
    return `${Math.ceil(diffDays / 30)} tháng trước`
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchDashboardData} sx={{ ml: 2 }}>Thử lại</Button>
      </Alert>
    )
  }

  const { stats, pendingViewings, availableRooms } = dashboardData

  return (
    <Box>
      {/* KPI Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Tổng số phòng" 
            value={stats?.totalRooms || 0} 
            change={`${stats?.availableRooms || 0} phòng trống`} 
            isPositive 
            color="primary" 
            icon={() => '🏠'} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Phòng trống" 
            value={stats?.availableRooms || 0} 
            change={`${(stats?.pendingViewingRooms || 0) + (stats?.viewingRooms || 0)} có lịch xem`} 
            isPositive={stats?.availableRooms > 0} 
            color="success" 
            icon={() => '🚪'} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Đang cho thuê" 
            value={stats?.rentedRooms || 0} 
            change={`Tỷ lệ: ${stats?.occupancyRate || 0}%`} 
            isPositive 
            color="error" 
            icon={() => '👥'} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Sắp hết hợp đồng" 
            value={stats?.expiringContracts || 0} 
            change="Trong 30 ngày tới" 
            isPositive={false} 
            color="warning" 
            icon={() => '📅'} 
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tỷ lệ lấp đầy phòng
              </Typography>
              <FormControl size="small" sx={{ width: 150 }}>
                <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                  <MenuItem value="6months">Tháng này</MenuItem>
                  <MenuItem value="lastMonth">Tháng trước</MenuItem>
                  <MenuItem value="3months">3 tháng</MenuItem>
                  <MenuItem value="year">6 tháng</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                {stats?.occupancyRate || 0}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {stats?.rentedRooms || 0}/{stats?.totalRooms || 0} phòng đang thuê
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ fontSize: '0.875rem' }}>
                <Box>
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>●</Box> Trống: {stats?.availableRooms || 0}
                </Box>
                <Box>
                  <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>●</Box> Đã thuê: {stats?.rentedRooms || 0}
                </Box>
                <Box>
                  <Box component="span" sx={{ color: 'warning.main', fontWeight: 600 }}>●</Box> Chờ duyệt: {stats?.pendingViewingRooms || 0}
                </Box>
                <Box>
                  <Box component="span" sx={{ color: 'info.main', fontWeight: 600 }}>●</Box> Đã đặt lịch: {stats?.viewingRooms || 0}
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Doanh thu theo tháng
              </Typography>
              <FormControl size="small" sx={{ width: 150 }}>
                <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                  <MenuItem value="6months">6 tháng gần đây</MenuItem>
                  <MenuItem value="year">Năm nay</MenuItem>
                  <MenuItem value="lastYear">Năm trước</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                {formatCurrency(stats?.currentMonthRevenue || 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: stats?.revenueChangePositive ? 'success.main' : 'error.main', fontWeight: 600 }}>
                {stats?.revenueChangePositive ? '↑' : '↓'} {Math.abs(stats?.revenueChange || 0)}% so với tháng trước
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Viewings */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lịch xem phòng chờ duyệt
          </Typography>
          <Button endIcon={<ArrowRightIcon />} sx={{ textTransform: 'none' }}>
            Xem tất cả
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Người thuê</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Ngày & Giờ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingViewings.length > 0 ? pendingViewings.map((viewing) => {
                const dateTime = formatDateTime(viewing.DateTime)
                return (
                <TableRow key={viewing.ScheduleID} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {viewing.TenantName?.charAt(0) || 'T'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {viewing.TenantName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {viewing.TenantPhone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {viewing.RoomCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {viewing.BuildingName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {dateTime.date}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {dateTime.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {viewing.Status}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" sx={{ color: 'success.main' }} title="Xác nhận">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} title="Từ chối">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có lịch xem phòng chờ duyệt
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Available Rooms */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Phòng trống mới
          </Typography>
          <Button endIcon={<ArrowRightIcon />} sx={{ textTransform: 'none' }}>
            Quản lý phòng
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Mã phòng</TableCell>
                <TableCell>Loại phòng</TableCell>
                <TableCell>Giá thuê</TableCell>
                <TableCell>Diện tích</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableRooms.length > 0 ? availableRooms.map((room) => (
                <TableRow key={room.RoomID} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{room.RoomCode}</TableCell>
                  <TableCell>{room.RoomType}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{formatCurrency(room.Price)}</TableCell>
                  <TableCell>{room.Area}m²</TableCell>
                  <TableCell>
                    <StatusBadge status={room.Status} displayStatus={room.DisplayStatus} />
                  </TableCell>
                  <TableCell>{getTimeSince(room.UpdatedAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" title="Xem">
                        <EyeIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Sửa">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} title="Xóa">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có phòng trống
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
