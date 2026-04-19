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
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BuildingIcon,
  MeetingRoom as RoomIcon,
  AttachMoney as MoneyIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowRightIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon
} from '@mui/icons-material'

// ─── Loading Skeleton ────────────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 5 }) => (
  <TableBody>
    {[...Array(rows)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
        <TableCell><Skeleton variant="text" width="70%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: '4px' }} /></TableCell>
        <TableCell><Skeleton variant="text" width="50%" /></TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
)

// ─── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, action, onAction }) => (
  <Box
    sx={{
      py: 8,
      px: 3,
      textAlign: 'center',
      backgroundColor: '#f6f9fc',
      borderRadius: '6px',
      border: '1px dashed #e5edf5'
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '6px',
        backgroundColor: 'rgba(83,58,253,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}
    >
      <Icon sx={{ fontSize: '1.5rem', color: '#533afd' }} />
    </Box>
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 400, color: '#061b31', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: '0.8125rem', color: '#64748d', mb: 2 }}>
      {description}
    </Typography>
    {action && (
      <Button variant="outlined" size="small" onClick={onAction}>
        {action}
      </Button>
    )}
  </Box>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, meta, trend, isPositive, accent = '#533afd', icon: Icon, loading }) => {
  if (loading) {
    return (
      <Card sx={{ p: 0, overflow: 'hidden', border: '1px solid #e5edf5' }}>
        <Box sx={{ p: 2.5 }}>
          <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '6px', mb: 2 }} />
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.25 }} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Skeleton variant="rectangular" height={3} />
      </Card>
    )
  }

  return (
    <Card
      sx={{
        p: 0,
        overflow: 'hidden',
        border: '1px solid #e5edf5',
        boxShadow: 'rgba(50,50,93,0.25) 0px 2px 5px -1px, rgba(0,0,0,0.1) 0px 1px 3px -1px',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 'rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.1) 0px 3px 7px -3px',
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
              borderRadius: '6px',
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
                fontWeight: 400,
                color: isPositive ? '#15be53' : '#ea2261',
                backgroundColor: isPositive ? 'rgba(21,190,83,0.1)' : 'rgba(234,34,97,0.1)',
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
            fontWeight: 300,
            color: '#061b31',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            mb: 0.5
          }}
        >
          {value}
        </Typography>

        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400, color: '#061b31', mb: 0.25 }}>
          {title}
        </Typography>

        {meta && (
          <Typography sx={{ fontSize: '0.75rem', color: '#64748d' }}>
            {meta}
          </Typography>
        )}
      </Box>
      <Box sx={{ height: 3, backgroundColor: accent, opacity: 0.6 }} />
    </Card>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusMap = {
  active: { label: 'Hoạt động', color: '#15be53', bg: 'rgba(21,190,83,0.2)', border: 'rgba(21,190,83,0.4)' },
  inactive: { label: 'Không hoạt động', color: '#64748d', bg: 'rgba(100,116,141,0.2)', border: 'rgba(100,116,141,0.4)' },
  banned: { label: 'Bị khóa', color: '#ea2261', bg: 'rgba(234,34,97,0.2)', border: 'rgba(234,34,97,0.4)' },
  pending: { label: 'Chờ duyệt', color: '#9b6829', bg: 'rgba(155,104,41,0.2)', border: 'rgba(155,104,41,0.4)' },
  available: { label: 'Còn trống', color: '#15be53', bg: 'rgba(21,190,83,0.2)', border: 'rgba(21,190,83,0.4)' }
}

const StatusBadge = ({ status }) => {
  const cfg = statusMap[status] || statusMap.active
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.875,
        py: 0.375,
        borderRadius: '4px',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: '0.6875rem',
        fontWeight: 400,
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
const SectionHeader = ({ title, count, action, onAction, showFilters, searchValue, onSearchChange, filterValue, onFilterChange, filterOptions }) => (
  <Box
    sx={{
      px: 2.5,
      py: 1.75,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2,
      borderBottom: '1px solid #e5edf5'
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 400, color: '#061b31', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {count !== undefined && (
        <Box
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 400,
            color: '#64748d',
            backgroundColor: '#f6f9fc',
            px: 0.75,
            py: 0.125,
            borderRadius: '4px'
          }}
        >
          {count}
        </Box>
      )}
    </Stack>
    
    {showFilters && (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1rem', color: '#64748d' }} />
              </InputAdornment>
            )
          }}
          sx={{ width: { xs: '100%', md: 200 } }}
        />
        {filterOptions && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon sx={{ fontSize: '1rem', color: '#64748d', ml: -0.5 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">Tất cả</MenuItem>
              {filterOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    )}
    
    {action && (
      <Button
        size="small"
        endIcon={<ArrowRightIcon sx={{ fontSize: '0.875rem' }} />}
        onClick={onAction}
        sx={{
          fontSize: '0.8125rem',
          color: '#533afd',
          fontWeight: 400,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: 'rgba(83,58,253,0.08)' }
        }}
      >
        {action}
      </Button>
    )}
  </Box>
)

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 1247,
      totalTenants: 856,
      totalLandlords: 391,
      totalBuildings: 124,
      totalRooms: 2341,
      availableRooms: 456,
      totalRevenue: 12450000000,
      monthlyRevenue: 1850000000,
      revenueChange: 12.5,
      revenueChangePositive: true
    },
    recentUsers: [
      { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'Tenant', status: 'active', joinedAt: '2024-01-15' },
      { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'Landlord', status: 'active', joinedAt: '2024-01-14' },
      { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'Tenant', status: 'pending', joinedAt: '2024-01-13' },
      { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', role: 'Landlord', status: 'active', joinedAt: '2024-01-12' },
      { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', role: 'Tenant', status: 'banned', joinedAt: '2024-01-11' }
    ],
    recentRooms: [
      { id: 1, code: 'R-001', building: 'Chung cư A', price: 3500000, area: 25, status: 'available', landlord: 'Trần Thị B' },
      { id: 2, code: 'R-002', building: 'Chung cư B', price: 4200000, area: 30, status: 'available', landlord: 'Phạm Thị D' },
      { id: 3, code: 'R-003', building: 'Chung cư C', price: 2800000, area: 20, status: 'pending', landlord: 'Nguyễn Văn F' },
      { id: 4, code: 'R-004', building: 'Chung cư D', price: 5000000, area: 35, status: 'available', landlord: 'Lê Thị G' }
    ]
  })

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const fmt = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  const fmtDate = (s) => new Date(s).toLocaleDateString('vi-VN')

  const filteredUsers = dashboardData.recentUsers.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                       user.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchFilter = !userFilter || user.status === userFilter
    return matchSearch && matchFilter
  })

  const filteredRooms = dashboardData.recentRooms.filter(room => {
    const matchSearch = room.code.toLowerCase().includes(roomSearch.toLowerCase()) || 
                       room.building.toLowerCase().includes(roomSearch.toLowerCase())
    const matchFilter = !roomFilter || room.status === roomFilter
    return matchSearch && matchFilter
  })

  if (error) return (
    <Alert
      severity="error"
      action={<Button size="small" sx={{ color: 'inherit' }}>Thử lại</Button>}
      sx={{ borderRadius: '6px' }}
    >
      {error}
    </Alert>
  )

  const { stats } = dashboardData

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748d' }}>
            Tổng quan hệ thống quản lý chung cư mini
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: '1rem' }} />}
          >
            Xuất báo cáo
          </Button>
          <Button
            variant="contained"
            size="small"
          >
            Làm mới dữ liệu
          </Button>
        </Stack>
      </Box>

      {/* ── KPI Row ── */}
      <Grid container spacing={2}>
        {[
          {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            meta: `${stats.totalTenants} người thuê, ${stats.totalLandlords} chủ nhà`,
            trend: '+8.2%',
            isPositive: true,
            accent: '#533afd',
            icon: PeopleIcon
          },
          {
            title: 'Chung cư',
            value: stats.totalBuildings,
            meta: 'Đang hoạt động',
            trend: '+3',
            isPositive: true,
            accent: '#15be53',
            icon: BuildingIcon
          },
          {
            title: 'Phòng',
            value: stats.totalRooms,
            meta: `${stats.availableRooms} phòng trống`,
            trend: '+24',
            isPositive: true,
            accent: '#2874ad',
            icon: RoomIcon
          },
          {
            title: 'Doanh thu tháng',
            value: fmt(stats.monthlyRevenue),
            meta: `${stats.revenueChange}% so với tháng trước`,
            trend: `${stats.revenueChange}%`,
            isPositive: stats.revenueChangePositive,
            accent: '#9b6829',
            icon: MoneyIcon
          }
        ].map((card, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Recent Users ── */}
      <Card sx={{ border: '1px solid #e5edf5', overflow: 'hidden' }}>
        <SectionHeader
          title="Người dùng mới"
          count={filteredUsers.length}
          action="Xem tất cả"
          showFilters
          searchValue={userSearch}
          onSearchChange={setUserSearch}
          filterValue={userFilter}
          onFilterChange={setUserFilter}
          filterOptions={[
            { value: 'active', label: 'Hoạt động' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'banned', label: 'Bị khóa' }
          ]}
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tham gia</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : filteredUsers.length > 0 ? (
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#533afd', fontSize: '0.6875rem', fontWeight: 400 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400, color: '#061b31' }}>
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#64748d' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#061b31' }}>
                        {user.role === 'Tenant' ? 'Người thuê' : 'Chủ nhà'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748d' }}>
                        {fmtDate(user.joinedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.375} justifyContent="flex-end">
                        {[
                          { icon: EyeIcon, label: 'Xem', color: '#64748d' },
                          { icon: EditIcon, label: 'Sửa', color: '#64748d' },
                          { icon: BlockIcon, label: 'Khóa', color: '#ea2261' }
                        ].map(({ icon: Icon, label, color }, i) => (
                          <Tooltip key={i} title={label}>
                            <IconButton
                              size="small"
                              sx={{
                                color,
                                p: 0.5,
                                borderRadius: '4px',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  backgroundColor: color === '#ea2261' ? 'rgba(234,34,97,0.08)' : 'rgba(0,0,0,0.06)'
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
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                    <EmptyState
                      icon={PeopleIcon}
                      title="Không tìm thấy người dùng"
                      description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Card>

      {/* ── Recent Rooms ── */}
      <Card sx={{ border: '1px solid #e5edf5', overflow: 'hidden' }}>
        <SectionHeader
          title="Phòng mới đăng"
          count={filteredRooms.length}
          action="Quản lý phòng"
          showFilters
          searchValue={roomSearch}
          onSearchChange={setRoomSearch}
          filterValue={roomFilter}
          onFilterChange={setRoomFilter}
          filterOptions={[
            { value: 'available', label: 'Còn trống' },
            { value: 'pending', label: 'Chờ duyệt' }
          ]}
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã phòng</TableCell>
                <TableCell>Chung cư</TableCell>
                <TableCell>Giá thuê</TableCell>
                <TableCell>Diện tích</TableCell>
                <TableCell>Chủ nhà</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <TableSkeleton rows={4} />
            ) : filteredRooms.length > 0 ? (
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400, color: '#061b31', fontFamily: 'ui-monospace, monospace' }}>
                        {room.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#64748d' }}>{room.building}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400, color: '#533afd' }}>
                        {fmt(room.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#64748d' }}>{room.area}m²</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#061b31' }}>{room.landlord}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={room.status} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.375} justifyContent="flex-end">
                        {[
                          { icon: EyeIcon, label: 'Xem', color: '#64748d' },
                          { icon: CheckIcon, label: 'Duyệt', color: '#15be53' },
                          { icon: BlockIcon, label: 'Từ chối', color: '#ea2261' }
                        ].map(({ icon: Icon, label, color }, i) => (
                          <Tooltip key={i} title={label}>
                            <IconButton
                              size="small"
                              sx={{
                                color,
                                p: 0.5,
                                borderRadius: '4px',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  backgroundColor: color === '#ea2261' ? 'rgba(234,34,97,0.08)' : 
                                                   color === '#15be53' ? 'rgba(21,190,83,0.08)' : 'rgba(0,0,0,0.06)'
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
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                    <EmptyState
                      icon={RoomIcon}
                      title="Không tìm thấy phòng"
                      description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
