import { useState } from 'react'
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
  FormControl
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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    available: { label: 'Trống', color: 'success' },
    rented: { label: 'Đã thuê', color: 'error' },
    viewing: { label: 'Đã đặt lịch', color: 'info' }
  }
  const config = statusConfig[status] || statusConfig.available
  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />
}

export default function LandlordDashboard() {
  const [timeRange, setTimeRange] = useState('month')

  const pendingViewings = [
    {
      id: 1,
      tenant: { name: 'Trần Văn A', phone: '0912 345 678', avatar: 'https://i.pravatar.cc/150?img=1' },
      room: { code: 'Studio A-101', floor: 'Tầng 1, Tòa A' },
      date: '15/02/2025',
      time: '10:00 - 11:00',
      note: 'Tôi muốn xem phòng vào buổi sáng'
    },
    {
      id: 2,
      tenant: { name: 'Nguyễn Thị B', phone: '0987 654 321', avatar: 'https://i.pravatar.cc/150?img=2' },
      room: { code: '1PN B-205', floor: 'Tầng 2, Tòa B' },
      date: '16/02/2025',
      time: '14:00 - 15:00',
      note: 'Có thể xem vào cuối tuần không?'
    },
    {
      id: 3,
      tenant: { name: 'Lê Văn C', phone: '0901 234 567', avatar: 'https://i.pravatar.cc/150?img=3' },
      room: { code: 'Studio C-302', floor: 'Tầng 3, Tòa C' },
      date: '17/02/2025',
      time: '17:00 - 18:00',
      note: 'Muốn xem phòng sau giờ làm'
    }
  ]

  const availableRooms = [
    { code: 'A-101', type: 'Studio', price: '5.500.000đ', area: '25m²', status: 'available', updated: '2 ngày trước' },
    { code: 'B-203', type: '1 phòng ngủ', price: '7.000.000đ', area: '35m²', status: 'available', updated: '3 ngày trước' },
    { code: 'C-405', type: 'Studio', price: '4.800.000đ', area: '22m²', status: 'viewing', updated: '1 tuần trước' }
  ]

  return (
    <Box>
      {/* KPI Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Tổng số phòng" value="24" change="+2 phòng mới" isPositive color="primary" icon={() => '🏠'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Phòng trống" value="8" change="-3 so với tháng trước" isPositive={false} color="success" icon={() => '🚪'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Đang cho thuê" value="14" change="+3 hợp đồng mới" isPositive color="error" icon={() => '👥'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Sắp hết hợp đồng" value="3" change="Cần gia hạn" isPositive={false} color="warning" icon={() => '📅'} />
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
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="lastMonth">Tháng trước</MenuItem>
                  <MenuItem value="3months">3 tháng</MenuItem>
                  <MenuItem value="6months">6 tháng</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                58%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                14/24 phòng đang thuê
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ fontSize: '0.875rem' }}>
                <Box>
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>●</Box> Trống: 8
                </Box>
                <Box>
                  <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>●</Box> Đã thuê: 14
                </Box>
                <Box>
                  <Box component="span" sx={{ color: 'info.main', fontWeight: 600 }}>●</Box> Đặt lịch: 2
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
                75.5tr VND
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                ↑ +12.5% so với tháng trước
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
                <TableCell>Ghi chú</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingViewings.map((viewing) => (
                <TableRow key={viewing.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={viewing.tenant.avatar} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {viewing.tenant.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {viewing.tenant.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {viewing.room.code}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {viewing.room.floor}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {viewing.date}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {viewing.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {viewing.note}
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
              ))}
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
              {availableRooms.map((room) => (
                <TableRow key={room.code} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{room.code}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{room.price}</TableCell>
                  <TableCell>{room.area}</TableCell>
                  <TableCell>
                    <StatusBadge status={room.status} />
                  </TableCell>
                  <TableCell>{room.updated}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
