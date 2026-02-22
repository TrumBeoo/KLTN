import { useState, useEffect } from 'react'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Chờ duyệt': { label: 'Chờ duyệt', color: 'warning' },
    'Đã duyệt': { label: 'Đã duyệt', color: 'success' },
    'Từ chối': { label: 'Từ chối', color: 'error' }
  }
  const config = statusConfig[status] || statusConfig['Chờ duyệt']
  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />
}

export default function ViewingSchedulesPage() {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [action, setAction] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setSchedules(data.data || [])
      }
    } catch (error) {
      console.error('Fetch schedules error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (schedule) => {
    setSelectedSchedule(schedule)
    setAction('approve')
    setOpenDialog(true)
  }

  const handleReject = (schedule) => {
    setSelectedSchedule(schedule)
    setAction('reject')
    setOpenDialog(true)
  }

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      
      const response = await fetch(`${API_URL}/schedules/${selectedSchedule.ScheduleID}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setOpenDialog(false)
        setSelectedSchedule(null)
        setAction(null)
        fetchSchedules()
        showSuccess('Thành công!', data.message)
      } else {
        showError('Lỗi!', data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Action error:', error)
      showError('Lỗi!', 'Lỗi khi xử lý lịch xem')
    }
  }

  const pendingSchedules = schedules.filter(s => s.Status === 'Chờ duyệt')
  const approvedSchedules = schedules.filter(s => s.Status === 'Đã duyệt')
  const rejectedSchedules = schedules.filter(s => s.Status === 'Từ chối')

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Stats */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Chờ duyệt
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
            {pendingSchedules.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Đã duyệt
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
            {approvedSchedules.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Từ chối
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
            {rejectedSchedules.length}
          </Typography>
        </Paper>
      </Box>

      {/* Pending Schedules */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lịch xem chờ duyệt ({pendingSchedules.length})
          </Typography>
          <IconButton onClick={fetchSchedules} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        {pendingSchedules.length === 0 ? (
          <CardContent>
            <Alert severity="info">Không có lịch xem nào chờ duyệt</Alert>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Người thuê</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Ngày xem</TableCell>
                  <TableCell>Giờ xem</TableCell>
                  <TableCell>Điện thoại</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingSchedules.map((schedule) => (
                  <TableRow key={schedule.ScheduleID} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{schedule.TenantName}</TableCell>
                    <TableCell>{schedule.RoomID}</TableCell>
                    <TableCell>{new Date(schedule.DateTime).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(schedule.DateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{schedule.TenantPhone}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{schedule.TenantEmail}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="success"
                          title="Duyệt"
                          onClick={() => handleApprove(schedule)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Từ chối"
                          onClick={() => handleReject(schedule)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Approved Schedules */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lịch xem đã duyệt ({approvedSchedules.length})
          </Typography>
        </Box>

        {approvedSchedules.length === 0 ? (
          <CardContent>
            <Alert severity="info">Không có lịch xem nào đã duyệt</Alert>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Người thuê</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Ngày xem</TableCell>
                  <TableCell>Giờ xem</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedSchedules.map((schedule) => (
                  <TableRow key={schedule.ScheduleID} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{schedule.TenantName}</TableCell>
                    <TableCell>{schedule.RoomID}</TableCell>
                    <TableCell>{new Date(schedule.DateTime).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(schedule.DateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>
                      <StatusBadge status={schedule.Status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Xác nhận duyệt lịch xem' : 'Xác nhận từ chối lịch xem'}
        </DialogTitle>
        <DialogContent>
          {selectedSchedule && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Người thuê</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedSchedule.TenantName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phòng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedSchedule.RoomID}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ngày giờ xem</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {new Date(selectedSchedule.DateTime).toLocaleString('vi-VN')}
                </Typography>
              </Box>
              <Alert severity={action === 'approve' ? 'success' : 'warning'}>
                {action === 'approve'
                  ? 'Người thuê sẽ nhận được thông báo xác nhận lịch xem'
                  : 'Người thuê sẽ nhận được thông báo từ chối lịch xem'}
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
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
