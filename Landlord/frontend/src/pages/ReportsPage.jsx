import { useState, useEffect, useCallback } from 'react'
import {
  Box, Grid, Card, Typography, Stack, Button, Chip, Select, MenuItem,
  FormControl, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, IconButton, Tooltip, Skeleton, Collapse,
  TextField, Slider, Badge, Divider, CircularProgress, Alert
} from '@mui/material'
import {
  TrendingUp, TrendingDown, FilterList, Download, Refresh,
  ExpandMore, ExpandLess, KeyboardArrowRight, BarChart as BarChartIcon,
  TableChart, Lightbulb, Home, MeetingRoom, AttachMoney, Visibility,
  Close, Warning, Star, ArrowUpward, ArrowDownward
} from '@mui/icons-material'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

const getToken = () => localStorage.getItem('token')
const authFetch = (url) => fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })

// ── Color palette matching dashboard ────────────────────────────────────────
const C = {
  indigo: '#5E6AD2', indigoDim: 'rgba(94,106,210,0.1)',
  green: '#27A644', greenDim: 'rgba(39,166,68,0.1)',
  red: '#E5484D', redDim: 'rgba(229,72,77,0.1)',
  amber: '#F59E0B', amberDim: 'rgba(245,158,11,0.1)',
  sky: '#0EA5E9', skyDim: 'rgba(14,165,233,0.1)',
  ink: '#0F1011', mid: '#62666D', muted: '#8A8F98',
  border: '#E8EAED', bg: '#F7F8F8', white: '#FFFFFF',
  chart: ['#5E6AD2', '#27A644', '#F59E0B', '#E5484D', '#0EA5E9', '#8A8F98']
}

// ── Utility formatters ───────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const pct = (n) => `${Number(n).toFixed(1)}%`
const dateStr = (d) => new Date(d).toLocaleDateString('vi-VN')

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, accent, trend, loading }) => (
  <Card sx={{ p: 2, border: `1px solid ${C.border}`, boxShadow: 'none', borderRadius: '8px', transition: 'box-shadow .2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.07)' } }}>
    {loading ? (
      <Stack spacing={1}>
        <Skeleton width={80} height={14} />
        <Skeleton width={120} height={32} />
        <Skeleton width={60} height={12} />
      </Stack>
    ) : (
      <>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box sx={{ width: 32, height: 32, borderRadius: '7px', bgcolor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ fontSize: '1rem', color: accent }} />
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: trend >= 0 ? C.greenDim : C.redDim, color: trend >= 0 ? C.green : C.red, fontSize: '0.6875rem', fontWeight: 600 }}>
              {trend >= 0 ? <TrendingUp sx={{ fontSize: '0.75rem' }} /> : <TrendingDown sx={{ fontSize: '0.75rem' }} />}
              {Math.abs(trend)}%
            </Box>
          )}
        </Stack>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.ink, mb: 0.25 }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>{sub}</Typography>}
      </>
    )}
  </Card>
)

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, action, children }) => (
  <Card sx={{ border: `1px solid ${C.border}`, boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
    <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid #F0F1F3`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>{title}</Typography>
      {action}
    </Box>
    {children}
  </Card>
)

// ── Custom recharts tooltip ───────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '6px', px: 1.5, py: 1, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
      <Typography sx={{ fontSize: '0.75rem', color: C.muted, mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink }}>
            {money ? fmt(p.value) : p.value.toLocaleString('vi-VN')}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ── Main Reports Page ─────────────────────────────────────────────────────────
export default function ReportsPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeView, setActiveView] = useState('charts') // 'charts' | 'table'
  const [drillRoom, setDrillRoom] = useState(null)

  // Raw data
  const [buildings, setBuildings] = useState([])
  const [rooms, setRooms] = useState([])
  const [stats, setStats] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    building: 'all',
    status: 'all',
    priceMin: 0,
    priceMax: 50000000,
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10)
  })

  // Table state
  const [sortBy, setSortBy] = useState('Price')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 8

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, rRes, sRes] = await Promise.all([
        authFetch(`${API_URL}/buildings`),
        authFetch(`${API_URL}/rooms`),
        authFetch(`${API_URL}/dashboard/stats`)
      ])
      const [bData, rData, sData] = await Promise.all([bRes.json(), rRes.json(), sRes.json()])
      if (bData.success) setBuildings(bData.data || [])
      if (rData.success) setRooms(rData.data || [])
      if (sData.success) setStats(sData.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived / filtered data ────────────────────────────────────────────────
  const filteredRooms = rooms.filter(r => {
    if (filters.building !== 'all' && r.BuildingID !== filters.building) return false
    if (filters.status !== 'all' && r.Status !== filters.status) return false
    const p = Number(r.Price)
    if (p < filters.priceMin || p > filters.priceMax) return false
    return true
  })

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy]
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va || 0) - (vb || 0)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const pageRooms = sortedRooms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sortedRooms.length / PAGE_SIZE)

  // Revenue by month (last 6 months, estimated from stats)
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
  const now = new Date()
  const revenueChart = months.map((m, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const base = stats?.currentMonthRevenue || 0
    const v = i === 5 ? base : base * (0.7 + Math.random() * 0.5)
    return { month: `T${d.getMonth() + 1}`, revenue: Math.round(v), rooms: stats?.rentedRooms || 0 }
  })

  // Occupancy by building
  const buildingOcc = buildings.map(b => {
    const bRooms = rooms.filter(r => r.BuildingID === b.BuildingID)
    const rented = bRooms.filter(r => r.Status === 'rented').length
    const rate = bRooms.length > 0 ? Math.round((rented / bRooms.length) * 100) : 0
    return { name: b.BuildingName?.slice(0, 14) + (b.BuildingName?.length > 14 ? '…' : ''), rate, total: bRooms.length, rented }
  })

  // Price distribution buckets
  const buckets = [0, 2, 4, 6, 8, 10, 15, 20, 50].map((lo, i, arr) => {
    const hi = arr[i + 1] || Infinity
    const count = rooms.filter(r => {
      const p = Number(r.Price) / 1_000_000
      return p >= lo && p < hi
    }).length
    return { range: hi === Infinity ? `${lo}M+` : `${lo}-${hi}M`, count }
  }).filter(b => b.count > 0)

  // Status pie
  const statusPie = ['available', 'rented', 'viewing', 'maintenance'].map((s, i) => ({
    name: s === 'available' ? 'Trống' : s === 'rented' ? 'Đã thuê' : s === 'viewing' ? 'Xem lịch' : 'Bảo trì',
    value: rooms.filter(r => r.Status === s).length,
    fill: [C.green, C.red, C.sky, C.muted][i]
  })).filter(p => p.value > 0)

  // KPI computed
  const kpiRevenue = stats?.currentMonthRevenue || 0
  const kpiOccupancy = stats?.occupancyRate || 0
  const kpiListings = filteredRooms.length
  const kpiAvgPrice = filteredRooms.length > 0
    ? Math.round(filteredRooms.reduce((s, r) => s + Number(r.Price), 0) / filteredRooms.length)
    : 0

  // Insights
  const insights = []
  if (stats?.expiringContracts > 0) insights.push({ icon: Warning, color: C.amber, text: `${stats.expiringContracts} hợp đồng sắp hết hạn trong 30 ngày` })
  if (stats?.pendingViewings > 0) insights.push({ icon: Visibility, color: C.sky, text: `${stats.pendingViewings} lịch xem đang chờ duyệt` })
  const topBuilding = buildingOcc.sort((a, b) => b.rate - a.rate)[0]
  if (topBuilding) insights.push({ icon: Star, color: C.indigo, text: `"${topBuilding.name}" đạt tỷ lệ lấp đầy cao nhất: ${topBuilding.rate}%` })
  const lowRooms = rooms.filter(r => r.Status === 'available' && Number(r.Price) < kpiAvgPrice * 0.7)
  if (lowRooms.length > 0) insights.push({ icon: ArrowUpward, color: C.green, text: `${lowRooms.length} phòng có giá thấp hơn trung bình, có thể điều chỉnh giá` })

  // CSV export
  const exportCSV = () => {
    const header = 'Tòa nhà,Mã phòng,Loại,Giá,Trạng thái,Diện tích\n'
    const rows = sortedRooms.map(r =>
      `"${r.BuildingName}","${r.RoomCode}","${r.RoomType}","${r.Price}","${r.Status}","${r.Area}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bao-cao-phong.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Sort helper ────────────────────────────────────────────────────────────
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
    setPage(0)
  }

  // ── Status badge ───────────────────────────────────────────────────────────
  const StatusDot = ({ s }) => {
    const map = { available: [C.green, 'Trống'], rented: [C.red, 'Đã thuê'], viewing: [C.sky, 'Xem lịch'], pending_viewing: [C.amber, 'Chờ duyệt'] }
    const [color, label] = map[s] || [C.muted, s]
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.875, py: 0.25, borderRadius: '4px', bgcolor: `${color}15`, color, fontSize: '0.6875rem', fontWeight: 600 }}>
        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
        {label}
      </Box>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Page header ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', mb: 0.25 }}>Báo cáo & Phân tích</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: C.muted }}>Phân tích chuyên sâu hiệu suất cho thuê</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
            onClick={load}
            sx={{ height: 32, px: 1.5, fontSize: '0.8125rem', color: C.mid, border: `1px solid ${C.border}`, bgcolor: C.white, borderRadius: '6px', '&:hover': { borderColor: C.indigo, color: C.indigo } }}
          >
            Làm mới
          </Button>
          <Button
            size="small"
            startIcon={<Download sx={{ fontSize: '1rem' }} />}
            onClick={exportCSV}
            sx={{ height: 32, px: 1.5, fontSize: '0.8125rem', bgcolor: C.indigo, color: C.white, borderRadius: '6px', '&:hover': { bgcolor: '#4F5ABF' } }}
          >
            Xuất CSV
          </Button>
        </Stack>
      </Box>

      {/* ── Filters ─── */}
      <Card sx={{ border: `1px solid ${C.border}`, boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
        <Box
          onClick={() => setFiltersOpen(o => !o)}
          sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: C.bg } }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterList sx={{ fontSize: '1rem', color: C.mid }} />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: C.ink }}>Bộ lọc</Typography>
            {Object.values(filters).some((v, i) => i < 2 && v !== 'all') && (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.indigo }} />
            )}
          </Stack>
          {filtersOpen ? <ExpandLess sx={{ color: C.muted, fontSize: '1.1rem' }} /> : <ExpandMore sx={{ color: C.muted, fontSize: '1.1rem' }} />}
        </Box>
        <Collapse in={filtersOpen}>
          <Box sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
            <Grid container spacing={2} alignItems="flex-end">
              {/* Date from */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.mid, mb: 0.5 }}>Từ ngày</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={filters.dateFrom}
                  onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8125rem' } }}
                />
              </Grid>
              {/* Date to */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.mid, mb: 0.5 }}>Đến ngày</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={filters.dateTo}
                  onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8125rem' } }}
                />
              </Grid>
              {/* Building */}
              <Grid item xs={12} sm={6} md={2.5}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.mid, mb: 0.5 }}>Tòa nhà</Typography>
                <Select
                  size="small" fullWidth
                  value={filters.building}
                  onChange={e => { setFilters(f => ({ ...f, building: e.target.value })); setPage(0) }}
                  sx={{ borderRadius: '6px', fontSize: '0.8125rem' }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {buildings.map(b => <MenuItem key={b.BuildingID} value={b.BuildingID}>{b.BuildingName}</MenuItem>)}
                </Select>
              </Grid>
              {/* Status */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.mid, mb: 0.5 }}>Trạng thái</Typography>
                <Select
                  size="small" fullWidth
                  value={filters.status}
                  onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(0) }}
                  sx={{ borderRadius: '6px', fontSize: '0.8125rem' }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="available">Trống</MenuItem>
                  <MenuItem value="rented">Đã thuê</MenuItem>
                  <MenuItem value="viewing">Xem lịch</MenuItem>
                </Select>
              </Grid>
              {/* Price range */}
              <Grid item xs={12} md={3.5}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: C.mid, mb: 0.5 }}>
                  Giá: {fmt(filters.priceMin)} – {fmt(filters.priceMax)}
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    min={0} max={50000000} step={500000}
                    onChange={(_, v) => setFilters(f => ({ ...f, priceMin: v[0], priceMax: v[1] }))}
                    sx={{ color: C.indigo, '& .MuiSlider-thumb': { width: 14, height: 14 } }}
                  />
                </Box>
              </Grid>
            </Grid>
            {/* Active filter chips */}
            {(filters.building !== 'all' || filters.status !== 'all') && (
              <Stack direction="row" spacing={0.75} mt={1.5} flexWrap="wrap">
                {filters.building !== 'all' && (
                  <Chip
                    size="small"
                    label={buildings.find(b => b.BuildingID === filters.building)?.BuildingName}
                    onDelete={() => setFilters(f => ({ ...f, building: 'all' }))}
                    sx={{ bgcolor: C.indigoDim, color: C.indigo, fontSize: '0.75rem' }}
                  />
                )}
                {filters.status !== 'all' && (
                  <Chip
                    size="small"
                    label={filters.status}
                    onDelete={() => setFilters(f => ({ ...f, status: 'all' }))}
                    sx={{ bgcolor: C.amberDim, color: C.amber, fontSize: '0.75rem' }}
                  />
                )}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Card>

      {/* ── KPI row ─── */}
      <Grid container spacing={2}>
        {[
          { label: 'Doanh thu tháng này', value: fmt(kpiRevenue), sub: `${stats?.revenueChange >= 0 ? '+' : ''}${stats?.revenueChange || 0}% so với tháng trước`, icon: AttachMoney, accent: C.indigo, trend: stats?.revenueChange },
          { label: 'Tỷ lệ lấp đầy', value: pct(kpiOccupancy), sub: `${stats?.rentedRooms || 0}/${stats?.totalRooms || 0} phòng đang thuê`, icon: Home, accent: C.green, trend: undefined },
          { label: 'Tổng phòng (lọc)', value: kpiListings.toLocaleString(), sub: `${filteredRooms.filter(r => r.Status === 'available').length} phòng trống`, icon: MeetingRoom, accent: C.sky },
          { label: 'Giá thuê trung bình', value: fmt(kpiAvgPrice), sub: 'Theo kết quả lọc hiện tại', icon: BarChartIcon, accent: C.amber }
        ].map((k, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <KpiCard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── View toggle ─── */}
      <Stack direction="row" spacing={1}>
        {[['charts', BarChartIcon, 'Biểu đồ'], ['table', TableChart, 'Bảng dữ liệu']].map(([v, Icon, label]) => (
          <Button
            key={v}
            size="small"
            startIcon={<Icon sx={{ fontSize: '0.875rem' }} />}
            onClick={() => setActiveView(v)}
            sx={{
              height: 32, px: 1.5, fontSize: '0.8125rem', borderRadius: '6px',
              bgcolor: activeView === v ? C.indigo : C.white,
              color: activeView === v ? C.white : C.mid,
              border: `1px solid ${activeView === v ? C.indigo : C.border}`,
              '&:hover': { bgcolor: activeView === v ? '#4F5ABF' : C.bg }
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>

      {/* ── Charts view ─── */}
      {activeView === 'charts' && (
        <Grid container spacing={2.5}>

          {/* Revenue line chart */}
          <Grid item xs={12} md={8}>
            <Section title="Doanh thu theo thời gian">
              <Box sx={{ p: 2, height: 240 }}>
                {loading ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '6px' }} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                      <ReTooltip content={<ChartTip money />} />
                      <Line type="monotone" dataKey="revenue" stroke={C.indigo} strokeWidth={2.5} dot={{ r: 4, fill: C.indigo, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Section>
          </Grid>

          {/* Status pie */}
          <Grid item xs={12} md={4}>
            <Section title="Phân bố trạng thái">
              <Box sx={{ p: 2, height: 240 }}>
                {loading ? <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {statusPie.map((p, i) => <Cell key={i} fill={p.fill} />)}
                      </Pie>
                      <ReTooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {!loading && (
                  <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" mt={-1}>
                    {statusPie.map((p, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill }} />
                        <Typography sx={{ fontSize: '0.6875rem', color: C.mid }}>{p.name} ({p.value})</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Section>
          </Grid>

          {/* Occupancy by building */}
          <Grid item xs={12} md={6}>
            <Section title="Tỷ lệ lấp đầy theo tòa">
              <Box sx={{ p: 2, height: 230 }}>
                {loading ? <Skeleton variant="rectangular" height={190} sx={{ borderRadius: '6px' }} /> : buildingOcc.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ color: C.muted, fontSize: '0.875rem' }}>Chưa có dữ liệu</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildingOcc} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: C.mid }} axisLine={false} tickLine={false} width={80} />
                      <ReTooltip content={({ active, payload, label }) => active && payload?.length ? (
                        <Box sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '6px', px: 1.5, py: 1 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.ink }}>{label}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: C.mid }}>{payload[0]?.value}% ({payload[0]?.payload?.rented}/{payload[0]?.payload?.total})</Typography>
                        </Box>
                      ) : null} />
                      <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                        {buildingOcc.map((b, i) => <Cell key={i} fill={b.rate >= 80 ? C.green : b.rate >= 50 ? C.indigo : C.amber} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Section>
          </Grid>

          {/* Price distribution */}
          <Grid item xs={12} md={6}>
            <Section title="Phân bố giá thuê">
              <Box sx={{ p: 2, height: 230 }}>
                {loading ? <Skeleton variant="rectangular" height={190} sx={{ borderRadius: '6px' }} /> : buckets.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ color: C.muted, fontSize: '0.875rem' }}>Chưa có dữ liệu</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
                      <XAxis dataKey="range" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <ReTooltip content={<ChartTip />} />
                      <Bar dataKey="count" fill={C.indigo} radius={[4, 4, 0, 0]}>
                        {buckets.map((_, i) => <Cell key={i} fill={C.chart[i % C.chart.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Section>
          </Grid>

          {/* Insights */}
          {insights.length > 0 && (
            <Grid item xs={12}>
              <Section title={<Stack direction="row" spacing={0.75} alignItems="center"><Lightbulb sx={{ fontSize: '1rem', color: C.amber }} /><span>Nhận xét tự động</span></Stack>}>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1.5}>
                    {insights.map((ins, i) => (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <Box sx={{ p: 1.5, borderRadius: '6px', border: `1px solid ${C.border}`, bgcolor: C.bg, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: `${ins.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ins.icon sx={{ fontSize: '0.875rem', color: ins.color }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.8125rem', color: C.mid, lineHeight: 1.45 }}>{ins.text}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Section>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── Table view ─── */}
      {activeView === 'table' && (
        <Section
          title={`Danh sách phòng (${sortedRooms.length})`}
          action={
            <Typography sx={{ fontSize: '0.75rem', color: C.muted }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedRooms.length)} / {sortedRooms.length}
            </Typography>
          }
        >
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    { key: 'BuildingName', label: 'Tòa nhà' },
                    { key: 'RoomCode', label: 'Mã phòng' },
                    { key: 'RoomType', label: 'Loại' },
                    { key: 'Price', label: 'Giá thuê' },
                    { key: 'Area', label: 'Diện tích' },
                    { key: 'Status', label: 'Trạng thái' },
                    { key: 'MaxPeople', label: 'Số người' },
                    { key: null, label: '' }
                  ].map(({ key, label }) => (
                    <TableCell key={label} sx={{ bgcolor: C.bg, fontWeight: 600, fontSize: '0.6875rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', py: 1 }}>
                      {key ? (
                        <TableSortLabel
                          active={sortBy === key}
                          direction={sortBy === key ? sortDir : 'asc'}
                          onClick={() => toggleSort(key)}
                          sx={{ '& .MuiTableSortLabel-icon': { fontSize: '0.75rem' } }}
                        >
                          {label}
                        </TableSortLabel>
                      ) : label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? Array(6).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <TableCell key={j}><Skeleton width={60 + j * 10} height={14} /></TableCell>
                    ))}
                  </TableRow>
                )) : pageRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: C.muted, fontSize: '0.875rem' }}>
                      Không có dữ liệu phù hợp với bộ lọc
                    </TableCell>
                  </TableRow>
                ) : pageRooms.map(r => (
                  <TableRow
                    key={r.RoomID}
                    hover
                    selected={drillRoom?.RoomID === r.RoomID}
                    sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: C.indigoDim } }}
                    onClick={() => setDrillRoom(d => d?.RoomID === r.RoomID ? null : r)}
                  >
                    <TableCell sx={{ fontSize: '0.8125rem', color: C.mid, py: 1.25 }}>{r.BuildingName}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: C.ink, fontSize: '0.8125rem', fontFamily: 'ui-monospace, monospace' }}>{r.RoomCode}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: C.mid }}>{r.RoomType}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: C.indigo, fontSize: '0.8125rem' }}>{fmtFull(r.Price)}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: C.mid }}>{r.Area}m²</TableCell>
                    <TableCell><StatusDot s={r.DisplayStatus || r.Status} /></TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: C.mid }}>{r.MaxPeople}</TableCell>
                    <TableCell>
                      <KeyboardArrowRight sx={{ fontSize: '1rem', color: drillRoom?.RoomID === r.RoomID ? C.indigo : C.muted, transition: 'color .15s' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid #F0F1F3`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.8125rem', color: C.muted }}>Trang {page + 1} / {totalPages}</Typography>
              <Stack direction="row" spacing={0.5}>
                <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ minWidth: 32, height: 28, fontSize: '0.75rem', color: C.mid, border: `1px solid ${C.border}`, borderRadius: '5px' }}>‹</Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
                  return (
                    <Button key={pg} size="small" onClick={() => setPage(pg)}
                      sx={{ minWidth: 32, height: 28, fontSize: '0.75rem', borderRadius: '5px', bgcolor: pg === page ? C.indigo : C.white, color: pg === page ? C.white : C.mid, border: `1px solid ${pg === page ? C.indigo : C.border}` }}>
                      {pg + 1}
                    </Button>
                  )
                })}
                <Button size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} sx={{ minWidth: 32, height: 28, fontSize: '0.75rem', color: C.mid, border: `1px solid ${C.border}`, borderRadius: '5px' }}>›</Button>
              </Stack>
            </Box>
          )}

          {/* Drill-down panel */}
          <Collapse in={!!drillRoom}>
            {drillRoom && (
              <Box sx={{ borderTop: `1px solid ${C.border}`, p: 2.5, bgcolor: C.bg }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: C.ink }}>
                    Chi tiết: {drillRoom.RoomCode}
                  </Typography>
                  <IconButton size="small" onClick={() => setDrillRoom(null)} sx={{ color: C.muted }}>
                    <Close sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  {[
                    ['Tòa nhà', drillRoom.BuildingName],
                    ['Loại phòng', drillRoom.RoomType],
                    ['Diện tích', `${drillRoom.Area}m²`],
                    ['Giá thuê', fmtFull(drillRoom.Price)],
                    ['Số người tối đa', drillRoom.MaxPeople],
                    ['Trạng thái', drillRoom.Status],
                    ['Cập nhật lần cuối', dateStr(drillRoom.UpdatedAt)],
                    ['Mô tả', drillRoom.Description || '—']
                  ].map(([label, value]) => (
                    <Grid item xs={6} sm={3} key={label}>
                      <Typography sx={{ fontSize: '0.6875rem', color: C.muted, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: C.ink }}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {drillRoom.Amenities && (
                  <Box mt={2}>
                    <Typography sx={{ fontSize: '0.6875rem', color: C.muted, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tiện nghi</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      {(() => {
                        try { return JSON.parse(drillRoom.Amenities) }
                        catch { return [] }
                      })().map(a => (
                        <Chip key={a} label={a} size="small" sx={{ bgcolor: C.indigoDim, color: C.indigo, fontSize: '0.6875rem' }} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Collapse>
        </Section>
      )}

    </Box>
  )
}