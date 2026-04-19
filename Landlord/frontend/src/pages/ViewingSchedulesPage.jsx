import { useState, useEffect } from 'react'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

// ─── Status Badge ──────────────────────────────────────────────────────────────
const statusCfg = {
  'Chờ duyệt': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'Đã duyệt': { color: '#27A644', bg: 'rgba(39,166,68,0.1)' },
  'Từ chối': { color: '#E5484D', bg: 'rgba(229,72,77,0.1)' }
}

const StatusBadge = ({ status }) => {
  const cfg = statusCfg[status] || statusCfg['Chờ duyệt']
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
        whiteSpace: 'nowrap'
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: cfg.color }} />
      {status}
    </Box>
  )
}

// ─── Stat Mini Card ────────────────────────────────────────────────────────────
const StatMini = ({ label, value, color }) => (
  <Card sx={{ p: 2, border: '1px solid #E8EAED', boxShadow: 'none', flex: 1 }}>
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 510, color: '#8A8F98', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '1.75rem', fontWeight: 590, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
      {value}
    </Typography>
  </Card>
)

// ─── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, count, children, action }) => (
  <Card sx={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
    <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #F0F1F3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 590, color: '#0F1011', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        {count !== undefined && (
          <Box sx={{ fontSize: '0.6875rem', fontWeight: 590, color: '#8A8F98', backgroundColor: '#F0F1F3', px: 0.75, py: 0.125, borderRadius: '4px' }}>
            {count}
          </Box>
        )}
      </Stack>
      {action}
    </Box>
    {children}
  </Card>
)

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ViewingSchedulesPage() {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [action, setAction] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

  useEffect(() => { fetchSchedules() }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/schedules`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setSchedules(data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAction = (schedule, type) => {
    setSelectedSchedule(schedule)
    setAction(type)
    setOpenDialog(true)
  }

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const res = await fetch(`${API_URL}/schedules/${selectedSchedule.ScheduleID}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        fetchSchedules()
        showSuccess('Thành công!', data.message)
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (err) {
      showError('Lỗi!', 'Có lỗi xảy ra')
    }
  }

  const pending = schedules.filter(s => s.Status === 'Chờ duyệt')
  const approved = schedules.filter(s => s.Status === 'Đã duyệt')
  const rejected = schedules.filter(s => s.Status === 'Từ chối')

  const fmtDate = (s) => new Date(s).toLocaleDateString('vi-VN')
  const fmtTime = (s) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
      <CircularProgress size={32} sx={{ color: '#5E6AD2' }} />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatMini label="Chờ duyệt" value={pending.length} color="#F59E0B" />
        <StatMini label="Đã duyệt" value={approved.length} color="#27A644" />
        <StatMini label="Từ chối" value={rejected.length} color="#E5484D" />
      </Stack>

      {/* Pending */}
      <SectionCard
        title="Lịch xem chờ duyệt"
        count={pending.length}
        action={
          <Tooltip title="Làm mới">
            <IconButton
              size="small"
              onClick={fetchSchedules}
              sx={{ color: '#62666D', p: 0.5, borderRadius: '5px', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
            >
              <RefreshIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        }
      >
        {pending.length === 0 ? (
          <Box sx={{ px: 2.5, py: 3 }}>
            <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.875rem' }}>
              Không có lịch xem nào đang chờ duyệt
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Người thuê</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Ngày xem</TableCell>
                  <TableCell>Giờ</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pending.map((s) => (
                  <TableRow key={s.ScheduleID} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 590, color: '#0F1011' }}>
                        {s.TenantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'ui-monospace, monospace', color: '#5E6AD2', fontWeight: 590 }}>
                        {s.RoomID}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>
                        {fmtDate(s.DateTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', px: 0.75, py: 0.125, backgroundColor: '#F0F1F3', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 590, color: '#62666D', fontFamily: 'ui-monospace, monospace' }}>
                        {fmtTime(s.DateTime)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.375}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625, fontSize: '0.75rem', color: '#62666D' }}>
                          <PhoneIcon sx={{ fontSize: '0.75rem' }} />
                          {s.TenantPhone}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625, fontSize: '0.75rem', color: '#62666D' }}>
                          <EmailIcon sx={{ fontSize: '0.75rem' }} />
                          {s.TenantEmail}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          onClick={() => handleAction(s, 'approve')}
                          startIcon={<CheckIcon sx={{ fontSize: '0.875rem' }} />}
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 510,
                            color: '#27A644',
                            border: '1px solid rgba(39,166,68,0.3)',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'rgba(39,166,68,0.1)', borderColor: '#27A644' }
                          }}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAction(s, 'reject')}
                          startIcon={<CloseIcon sx={{ fontSize: '0.875rem' }} />}
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 510,
                            color: '#E5484D',
                            border: '1px solid rgba(229,72,77,0.3)',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'rgba(229,72,77,0.1)', borderColor: '#E5484D' }
                          }}
                        >
                          Từ chối
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Approved */}
      <SectionCard title="Lịch xem đã duyệt" count={approved.length}>
        {approved.length === 0 ? (
          <Box sx={{ px: 2.5, py: 3 }}>
            <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.875rem' }}>Không có lịch xem nào đã duyệt</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Người thuê</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Ngày xem</TableCell>
                  <TableCell>Giờ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approved.map((s) => (
                  <TableRow key={s.ScheduleID} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>{s.TenantName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'ui-monospace, monospace', color: '#5E6AD2', fontWeight: 590 }}>{s.RoomID}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#0F1011' }}>{fmtDate(s.DateTime)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', px: 0.75, py: 0.125, backgroundColor: '#F0F1F3', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 590, color: '#62666D', fontFamily: 'ui-monospace, monospace' }}>
                        {fmtTime(s.DateTime)}
                      </Box>
                    </TableCell>
                    <TableCell><StatusBadge status={s.Status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', border: '1px solid #E8EAED' } }}
      >
        <DialogTitle sx={{ pb: 1.5, fontSize: '0.9375rem', fontWeight: 590, color: '#0F1011', letterSpacing: '-0.02em' }}>
          {action === 'approve' ? 'Xác nhận duyệt lịch xem' : 'Xác nhận từ chối lịch xem'}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {selectedSchedule && (
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: '#F7F8F8',
                border: '1px solid #E8EAED'
              }}
            >
              {[
                { label: 'Người thuê', val: selectedSchedule.TenantName },
                { label: 'Phòng', val: selectedSchedule.RoomID },
                { label: 'Thời gian', val: `${fmtDate(selectedSchedule.DateTime)} lúc ${fmtTime(selectedSchedule.DateTime)}` }
              ].map((r, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.625 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#8A8F98' }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 510, color: '#0F1011' }}>{r.val}</Typography>
                </Box>
              ))}
            </Box>
          )}
          <Alert
            severity={action === 'approve' ? 'success' : 'warning'}
            sx={{ mt: 2, borderRadius: '6px', fontSize: '0.8125rem' }}
          >
            {action === 'approve'
              ? 'Người thuê sẽ nhận thông báo xác nhận.'
              : 'Người thuê sẽ nhận thông báo từ chối.'}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#62666D', fontWeight: 510, fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #E8EAED', px: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: action === 'approve' ? '#27A644' : '#E5484D',
              color: '#FFFFFF',
              fontWeight: 510,
              fontSize: '0.875rem',
              borderRadius: '6px',
              px: 2,
              '&:hover': { backgroundColor: action === 'approve' ? '#1E8236' : '#C93B40' }
            }}
          >
            {action === 'approve' ? 'Duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Box>
  )
}