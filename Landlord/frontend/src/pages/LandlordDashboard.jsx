import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
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
  Alert,
  Tooltip
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowForward as ArrowRightIcon,
  HomeWork as HomeIcon,
  DoorFront as DoorIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { dashboardService } from '../utils/dashboardService'

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, meta, trend, isPositive, accent = '#5E6AD2', icon: Icon }) => (
  <Card
    sx={{
      p: 0,
      overflow: 'hidden',
      border: '1px solid #E8EAED',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transform: 'translateY(-1px)'
      }
    }}
  >
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: `${accent}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: '1.1rem', color: accent }} />
        </Box>
        {trend !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              fontSize: '0.6875rem',
              fontWeight: 510,
              color: isPositive ? '#27A644' : '#E5484D',
              backgroundColor: isPositive ? 'rgba(39,166,68,0.1)' : 'rgba(229,72,77,0.1)',
              px: 0.75,
              py: 0.25,
              borderRadius: '4px'
            }}
          >
            {isPositive ? <TrendingUpIcon sx={{ fontSize: '0.75rem' }} /> : <TrendingDownIcon sx={{ fontSize: '0.75rem' }} />}
            {trend}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          fontSize: '1.625rem',
          fontWeight: 590,
          color: '#0F1011',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          mb: 0.5
        }}
      >
        {value}
      </Typography>

      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011', mb: 0.25 }}>
        {title}
      </Typography>

      {meta && (
        <Typography sx={{ fontSize: '0.75rem', color: '#8A8F98' }}>
          {meta}
        </Typography>
      )}
    </Box>
    <Box sx={{ height: 3, backgroundColor: accent, opacity: 0.6 }} />
  </Card>
)

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusMap = {
  available: { label: 'Trống', color: '#27A644', bg: 'rgba(39,166,68,0.1)' },
  pending_viewing: { label: 'Chờ duyệt', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  viewing: { label: 'Đã đặt lịch', color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)' },
  rented: { label: 'Đã thuê', color: '#E5484D', bg: 'rgba(229,72,77,0.1)' },
  maintenance: { label: 'Bảo trì', color: '#8A8F98', bg: 'rgba(138,143,152,0.1)' }
}

const StatusBadge = ({ status, displayStatus }) => {
  const key = displayStatus || status
  const cfg = statusMap[key] || statusMap.available
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.875,
        py: 0.25,
        borderRadius: '4px',
        backgroundColor: cfg.bg,
        fontSize: '0.6875rem',
        fontWeight: 590,
        color: cfg.color,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </Box>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, action, onAction }) => (
  <Box
    sx={{
      px: 2.5,
      py: 1.75,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #F0F1F3'
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 590, color: '#0F1011', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {count !== undefined && (
        <Box
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 590,
            color: '#8A8F98',
            backgroundColor: '#F0F1F3',
            px: 0.75,
            py: 0.125,
            borderRadius: '4px'
          }}
        >
          {count}
        </Box>
      )}
    </Stack>
    {action && (
      <Button
        size="small"
        endIcon={<ArrowRightIcon sx={{ fontSize: '0.875rem' }} />}
        onClick={onAction}
        sx={{
          fontSize: '0.8125rem',
          color: '#5E6AD2',
          fontWeight: 510,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: 'rgba(94,106,210,0.08)' }
        }}
      >
        {action}
      </Button>
    )}
  </Box>
)

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function LandlordDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    pendingViewings: [],
    availableRooms: []
  })

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) { setError('Vui lòng đăng nhập'); return }

      const [statsRes, viewingsRes, roomsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getPendingViewings(),
        dashboardService.getAvailableRooms()
      ])
      setDashboardData({
        stats: statsRes.data,
        pendingViewings: viewingsRes.data,
        availableRooms: roomsRes.data
      })
    } catch (err) {
      console.error(err)
      setError(err.message.includes('Authentication') ? 'Phiên hết hạn, vui lòng đăng nhập lại.' : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  const fmtDate = (s) => {
    const d = new Date(s)
    return { date: d.toLocaleDateString('vi-VN'), time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
  }
  const timeSince = (s) => {
    const diff = Math.ceil((Date.now() - new Date(s)) / 86400000)
    if (diff <= 1) return '1 ngày trước'
    if (diff < 7) return `${diff} ngày trước`
    if (diff < 30) return `${Math.ceil(diff / 7)} tuần trước`
    return `${Math.ceil(diff / 30)} tháng trước`
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
      <CircularProgress size={32} sx={{ color: '#5E6AD2' }} />
    </Box>
  )

  if (error) return (
    <Alert
      severity="error"
      action={<Button size="small" onClick={fetchDashboardData} sx={{ color: 'inherit' }}>Thử lại</Button>}
      sx={{ borderRadius: '8px' }}
    >
      {error}
    </Alert>
  )

  const { stats, pendingViewings, availableRooms } = dashboardData

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── KPI Row ── */}
      <Grid container spacing={2}>
        {[
          {
            title: 'Tổng số phòng',
            value: stats?.totalRooms ?? 0,
            meta: `${stats?.availableRooms ?? 0} phòng trống`,
            trend: `${stats?.availableRooms ?? 0} trống`,
            isPositive: true,
            accent: '#5E6AD2',
            icon: HomeIcon
          },
          {
            title: 'Phòng trống',
            value: stats?.availableRooms ?? 0,
            meta: `${(stats?.pendingViewingRooms ?? 0) + (stats?.viewingRooms ?? 0)} đang có lịch`,
            isPositive: (stats?.availableRooms ?? 0) > 0,
            accent: '#27A644',
            icon: DoorIcon
          },
          {
            title: 'Đang cho thuê',
            value: stats?.rentedRooms ?? 0,
            meta: `Tỷ lệ lấp đầy ${stats?.occupancyRate ?? 0}%`,
            trend: `${stats?.occupancyRate ?? 0}%`,
            isPositive: true,
            accent: '#E5484D',
            icon: PeopleIcon
          },
          {
            title: 'Sắp hết hợp đồng',
            value: stats?.expiringContracts ?? 0,
            meta: 'Trong 30 ngày tới',
            isPositive: false,
            accent: '#F59E0B',
            icon: ScheduleIcon
          }
        ].map((card, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* ── Occupancy + Revenue ── */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <SectionHeader title="Tỷ lệ lấp đầy" />
            <Box sx={{ px: 2.5, py: 2.5 }}>
              {/* Big number */}
              <Typography
                sx={{
                  fontSize: '3rem',
                  fontWeight: 590,
                  color: '#5E6AD2',
                  letterSpacing: '-0.06em',
                  lineHeight: 1,
                  mb: 0.5
                }}
              >
                {stats?.occupancyRate ?? 0}
                <Box component="span" sx={{ fontSize: '1.5rem', color: '#8A8F98', fontWeight: 400 }}>%</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#8A8F98', mb: 2.5 }}>
                {stats?.rentedRooms ?? 0}/{stats?.totalRooms ?? 0} phòng đang cho thuê
              </Typography>

              {/* Bar breakdown */}
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', height: 8, mb: 1.5, gap: '2px' }}>
                  {[
                    { val: stats?.rentedRooms ?? 0, color: '#E5484D' },
                    { val: stats?.availableRooms ?? 0, color: '#27A644' },
                    { val: stats?.pendingViewingRooms ?? 0, color: '#F59E0B' },
                    { val: stats?.viewingRooms ?? 0, color: '#0EA5E9' }
                  ].filter(s => s.val > 0).map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: s.val,
                        backgroundColor: s.color,
                        borderRadius: '2px',
                        transition: 'flex 0.4s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Stack spacing={0.875}>
                {[
                  { label: 'Đang cho thuê', val: stats?.rentedRooms ?? 0, color: '#E5484D' },
                  { label: 'Phòng trống', val: stats?.availableRooms ?? 0, color: '#27A644' },
                  { label: 'Chờ duyệt', val: stats?.pendingViewingRooms ?? 0, color: '#F59E0B' },
                  { label: 'Đã đặt lịch', val: stats?.viewingRooms ?? 0, color: '#0EA5E9' }
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: row.color }} />
                      <Typography sx={{ fontSize: '0.8125rem', color: '#62666D' }}>{row.label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 590, color: '#0F1011' }}>{row.val}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <SectionHeader title="Doanh thu tháng này" />
            <Box sx={{ px: 2.5, py: 2.5 }}>
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: 590,
                  color: '#0F1011',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  mb: 0.5
                }}
              >
                {fmt(stats?.currentMonthRevenue ?? 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
                {stats?.revenueChangePositive ? (
                  <TrendingUpIcon sx={{ fontSize: '0.875rem', color: '#27A644' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: '0.875rem', color: '#E5484D' }} />
                )}
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 510,
                    color: stats?.revenueChangePositive ? '#27A644' : '#E5484D'
                  }}
                >
                  {Math.abs(stats?.revenueChange ?? 0)}% so với tháng trước
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: '6px',
                  backgroundColor: '#F7F8F8',
                  border: '1px solid #E8EAED'
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: '#8A8F98', mb: 1, fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Phân tích nhanh
                </Typography>
                {[
                  { label: 'Phòng đang thuê', val: `${stats?.rentedRooms ?? 0} phòng` },
                  { label: 'Hợp đồng sắp hết hạn', val: `${stats?.expiringContracts ?? 0} hợp đồng` }
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#62666D' }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 590, color: '#0F1011' }}>{row.val}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Pending Viewings ── */}
      <Card sx={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <SectionHeader
          title="Lịch xem chờ duyệt"
          count={pendingViewings.length}
          action="Xem tất cả"
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Người thuê</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingViewings.length > 0 ? pendingViewings.map((v) => {
                const dt = fmtDate(v.DateTime)
                return (
                  <TableRow key={v.ScheduleID} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#5E6AD2', fontSize: '0.6875rem', fontWeight: 590 }}>
                          {v.TenantName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>
                            {v.TenantName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: '#8A8F98' }}>
                            {v.TenantPhone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>
                        {v.RoomCode}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#8A8F98' }}>
                        {v.BuildingName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>
                        {dt.date}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#8A8F98' }}>
                        {dt.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.875, py: 0.25, borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.1)', fontSize: '0.6875rem', fontWeight: 590, color: '#F59E0B' }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        {v.Status || 'Chờ duyệt'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Duyệt">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#27A644',
                              p: 0.625,
                              border: '1px solid rgba(39,166,68,0.2)',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease',
                              '&:hover': { backgroundColor: 'rgba(39,166,68,0.1)', borderColor: '#27A644' }
                            }}
                          >
                            <CheckIcon sx={{ fontSize: '0.875rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#E5484D',
                              p: 0.625,
                              border: '1px solid rgba(229,72,77,0.2)',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease',
                              '&:hover': { backgroundColor: 'rgba(229,72,77,0.1)', borderColor: '#E5484D' }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: '0.875rem' }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#8A8F98', fontSize: '0.875rem' }}>
                    Không có lịch xem nào đang chờ duyệt
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Available Rooms ── */}
      <Card sx={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <SectionHeader
          title="Phòng trống"
          count={availableRooms.length}
          action="Quản lý phòng"
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã phòng</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá thuê</TableCell>
                <TableCell>Diện tích</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableRooms.length > 0 ? availableRooms.map((room) => (
                <TableRow key={room.RoomID} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 590, color: '#0F1011', fontFamily: 'ui-monospace, monospace' }}>
                      {room.RoomCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#62666D' }}>{room.RoomType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 590, color: '#5E6AD2' }}>
                      {fmt(room.Price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#62666D' }}>{room.Area}m²</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={room.Status} displayStatus={room.DisplayStatus} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', color: '#8A8F98' }}>{timeSince(room.UpdatedAt)}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Stack direction="row" spacing={0.375} justifyContent="flex-end">
                      {[
                        { icon: EyeIcon, label: 'Xem', color: '#62666D' },
                        { icon: EditIcon, label: 'Sửa', color: '#62666D' },
                        { icon: DeleteIcon, label: 'Xóa', color: '#E5484D' }
                      ].map(({ icon: Icon, label, color }, i) => (
                        <Tooltip key={i} title={label}>
                          <IconButton
                            size="small"
                            sx={{
                              color,
                              p: 0.5,
                              borderRadius: '5px',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: color === '#E5484D' ? 'rgba(229,72,77,0.08)' : 'rgba(0,0,0,0.06)'
                              }
                            }}
                          >
                            <Icon sx={{ fontSize: '0.875rem' }} />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#8A8F98', fontSize: '0.875rem' }}>
                    Không có phòng trống
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