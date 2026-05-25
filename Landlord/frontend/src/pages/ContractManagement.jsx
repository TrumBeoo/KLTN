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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Grid,
  Stack,
  IconButton,
  Chip,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import {
  Edit as EditIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Error as ExpiredIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  InsertDriveFile as DocIcon,
  PictureAsPdf as PdfIcon,
  Article as ArticleIcon,
  Gavel as ContractIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

const StatusChip = ({ status, daysRemaining }) => {
  const config = {
    active: { label: 'Đang thuê', color: 'success', icon: ActiveIcon },
    expiring_soon: { label: `Còn ${daysRemaining} ngày`, color: 'warning', icon: WarningIcon },
    expired: { label: 'Đã hết hạn', color: 'error', icon: ExpiredIcon },
    terminated: { label: 'Đã chấm dứt', color: 'default', icon: CancelIcon }
  }
  const cfg = config[status] || config.active
  const Icon = cfg.icon
  return (
    <Chip
      icon={<Icon sx={{ fontSize: '1rem' }} />}
      label={cfg.label}
      color={cfg.color}
      size="small"
      variant="outlined"
    />
  )
}

const DocumentTypeConfig = {
  contract: { label: 'Hợp đồng', icon: ContractIcon, color: '#5E6AD2' },
  handover: { label: 'Biên bản bàn giao', icon: ArticleIcon, color: '#00A76F' },
  rule: { label: 'Nội quy', icon: SecurityIcon, color: '#FF5630' },
  deposit: { label: 'Biên bản đặt cọc', icon: MoneyIcon, color: '#FFAB00' },
  receipt: { label: 'Biên lai', icon: ReceiptIcon, color: '#00B8D9' },
  pricing: { label: 'Bảng giá', icon: MoneyIcon, color: '#7A0C2E' },
  pccc: { label: 'PCCC', icon: SecurityIcon, color: '#E91E63' },
  info: { label: 'Thông tin khác', icon: InfoIcon, color: '#8A8F98' }
}

const DocumentTypeChip = ({ type }) => {
  const config = DocumentTypeConfig[type] || DocumentTypeConfig.info
  const Icon = config.icon
  return (
    <Chip
      icon={<Icon sx={{ fontSize: '1rem' }} />}
      label={config.label}
      size="small"
      sx={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        fontWeight: 500,
        '& .MuiChip-icon': { color: config.color }
      }}
    />
  )
}

const UploadDocumentDialog = ({ open, onClose, rooms, onUpload }) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({
    roomId: '',
    type: 'contract',
    title: '',
    isPrivate: true
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem('token')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        showError('Lỗi!', 'File không được vượt quá 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) { showError('Lỗi!', 'Vui lòng chọn file'); return }
    if (!formData.title) { showError('Lỗi!', 'Vui lòng nhập tiêu đề'); return }

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('document', file)
      formDataUpload.append('type', formData.type)
      formDataUpload.append('title', formData.title)
      formDataUpload.append('isPrivate', formData.isPrivate)
      if (formData.roomId) formDataUpload.append('roomId', formData.roomId)

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', 'Upload tài liệu thành công')
        onUpload()
        onClose()
        setFormData({ roomId: '', type: 'contract', title: '', isPrivate: true })
        setFile(null)
      } else {
        showError('Lỗi!', data.message)
      }
    } catch {
      showError('Lỗi!', 'Không thể upload tài liệu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Upload tài liệu</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <FormLabel>Loại tài liệu *</FormLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} size="small">
                {Object.entries(DocumentTypeConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon sx={{ fontSize: '1.1rem', color: config.color }} />
                        <span>{config.label}</span>
                      </Stack>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            <TextField
              label="Tiêu đề *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Hợp đồng thuê phòng A101"
              size="small"
              fullWidth
            />

            <FormControl fullWidth>
              <FormLabel>Phòng (tùy chọn)</FormLabel>
              <Select value={formData.roomId} onChange={(e) => setFormData({ ...formData, roomId: e.target.value })} size="small">
                <MenuItem value="">Không gắn phòng (dùng chung)</MenuItem>
                <MenuItem value="all" sx={{ color: 'primary.main', fontWeight: 600 }}>Tất cả phòng</MenuItem>
                {rooms.map(room => (
                  <MenuItem key={room.RoomID} value={room.RoomID}>
                    {room.RoomCode} - {room.BuildingName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Quyền truy cập</FormLabel>
              <Select value={formData.isPrivate} onChange={(e) => setFormData({ ...formData, isPrivate: e.target.value })} size="small">
                <MenuItem value={true}>Riêng tư (Chỉ chủ nhà)</MenuItem>
                <MenuItem value={false}>Công khai (Người thuê có thể xem)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <FormLabel sx={{ mb: 1, display: 'block' }}>File tài liệu *</FormLabel>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ py: 1.5, borderStyle: 'dashed' }}>
                {file ? file.name : 'Chọn file (PDF, DOCX, JPG, PNG - Max 10MB)'}
                <input type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
              </Button>
              {file && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  Kích thước: {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={uploading}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading}>
            {uploading ? 'Đang upload...' : 'Upload'}
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
    </>
  )
}

// Tab 1: Quản lý hợp đồng
function ContractTab() {
  const { notification, showSuccess, showError, showConfirm, hideNotification } = useNotification()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [viewDialog, setViewDialog] = useState({ open: false, contract: null })
  const [editDialog, setEditDialog] = useState({ open: false, contract: null })
  const [editForm, setEditForm] = useState({})
  const [contractFile, setContractFile] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchContracts()
  }, [selectedStatus])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)
      
      const response = await fetch(`${API_URL}/contracts?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setContracts(data.data || [])
      }
    } catch (error) {
      console.error('Fetch contracts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenView = (contract) => {
    setViewDialog({ open: true, contract })
  }

  const handleOpenEdit = (contract) => {
    setEditForm({
      startDate: contract.StartDate?.split('T')[0],
      endDate: contract.EndDate?.split('T')[0],
      depositAmount: contract.DepositAmount,
      monthlyRent: contract.MonthlyRent,
      paymentCycle: contract.PaymentCycle,
      renewalOption: contract.RenewalOption,
      status: contract.Status
    })
    setEditDialog({ open: true, contract })
    setContractFile(null)
  }

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData()
      Object.keys(editForm).forEach(key => {
        formData.append(key, editForm[key])
      })
      if (contractFile) {
        formData.append('contractFile', contractFile)
      }

      const response = await fetch(`${API_URL}/contracts/${editDialog.contract.ContractID}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', 'Đã cập nhật hợp đồng')
        setEditDialog({ open: false, contract: null })
        fetchContracts()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Update contract error:', error)
      showError('Lỗi!', error.message)
    }
  }

  const handleTerminate = async (contractId, roomCode) => {
    showConfirm(
      'Xác nhận chấm dứt hợp đồng',
      `Bạn chắc chắn muốn chấm dứt hợp đồng phòng ${roomCode}? Phòng sẽ được cập nhật về trạng thái còn trống.`,
      async () => {
        try {
          const response = await fetch(`${API_URL}/contracts/${contractId}/terminate`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) {
            showSuccess('Thành công!', 'Đã chấm dứt hợp đồng')
            fetchContracts()
          } else {
            showError('Lỗi!', data.message)
          }
        } catch (error) {
          console.error('Terminate contract error:', error)
          showError('Lỗi!', error.message)
        }
      }
    )
  }

  const handleDelete = async (contractId, roomCode) => {
    showConfirm(
      'Xác nhận xóa hợp đồng',
      `Bạn chắc chắn muốn xóa vĩnh viễn hợp đồng phòng ${roomCode}? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          const response = await fetch(`${API_URL}/contracts/${contractId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) {
            showSuccess('Thành công!', 'Đã xóa hợp đồng')
            fetchContracts()
          } else {
            showError('Lỗi!', data.message)
          }
        } catch (error) {
          console.error('Delete contract error:', error)
          showError('Lỗi!', error.message)
        }
      }
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getPaymentCycleLabel = (cycle) => {
    const labels = {
      monthly: 'Hàng tháng',
      quarterly: 'Hàng quý',
      'semi-annual': 'Nửa năm',
      annual: 'Hàng năm'
    }
    return labels[cycle] || cycle
  }

  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => c.Status === 'active').length,
    expiring: contracts.filter(c => c.Status === 'expiring_soon').length,
    expired: contracts.filter(c => c.Status === 'expired').length
  }

  const expiringContracts = contracts.filter(c => 
    c.Status === 'expiring_soon' && c.DaysRemaining <= 30
  ).sort((a, b) => a.DaysRemaining - b.DaysRemaining)

  return (
    <Box>
      {/* Alert for expiring contracts */}
      {expiringContracts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            ⚠️ Có {expiringContracts.length} hợp đồng sắp hết hạn
          </Typography>
          {expiringContracts.slice(0, 3).map(c => (
            <Typography key={c.ContractID} variant="body2">
              • Phòng {c.RoomCode} ({c.BuildingName}) - Còn {c.DaysRemaining} ngày
            </Typography>
          ))}
        </Alert>
      )}

      {/* Info about auto-deletion */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          📌 <strong>Lưu ý:</strong> Hợp đồng đã chấm dứt sẽ tự động bị xóa sau 1 tháng. 
          Bạn có thể xóa ngay lập tức nếu cần bằng cách nhấn nút Xóa.
        </Typography>
      </Alert>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#5E6AD2', color: 'white' }}>
            <Typography variant="caption">Tổng hợp đồng</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{contractStats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Đang thuê</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
              {contractStats.active}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sắp hết hạn</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
              {contractStats.expiring}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Đã hết hạn</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
              {contractStats.expired}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <FormLabel>Trạng thái</FormLabel>
                <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="active">Đang thuê</MenuItem>
                  <MenuItem value="expiring_soon">Sắp hết hạn</MenuItem>
                  <MenuItem value="expired">Đã hết hạn</MenuItem>
                  <MenuItem value="terminated">Đã chấm dứt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Danh sách hợp đồng ({contracts.length})
          </Typography>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Mã HĐ</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Người thuê</TableCell>
                <TableCell>Thời hạn</TableCell>
                <TableCell>Tiền thuê</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">Chưa có hợp đồng nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.ContractID} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {contract.ContractID}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{contract.RoomCode}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {contract.BuildingName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {contract.TenantName || 'Chưa có'}
                      </Typography>
                      {contract.TenantPhone && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {contract.TenantPhone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {formatDate(contract.StartDate)} - {formatDate(contract.EndDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatPrice(contract.MonthlyRent)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {getPaymentCycleLabel(contract.PaymentCycle)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={contract.Status} daysRemaining={contract.DaysRemaining} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenView(contract)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {contract.Status !== 'terminated' && contract.Status !== 'expired' && (
                          <>
                            <IconButton size="small" title="Sửa" onClick={() => handleOpenEdit(contract)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              sx={{ color: 'error.main' }} 
                              title="Chấm dứt"
                              onClick={() => handleTerminate(contract.ContractID, contract.RoomCode)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {contract.Status === 'terminated' && (
                          <IconButton 
                            size="small" 
                            sx={{ color: 'error.main' }} 
                            title="Xóa hợp đồng"
                            onClick={() => handleDelete(contract.ContractID, contract.RoomCode)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, contract: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Chi tiết hợp đồng</Typography>
          <IconButton size="small" onClick={() => setViewDialog({ open: false, contract: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.contract && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Mã hợp đồng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewDialog.contract.ContractID}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phòng</Typography>
                <Typography variant="body1">{viewDialog.contract.RoomCode} - {viewDialog.contract.BuildingName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Người thuê</Typography>
                <Typography variant="body1">{viewDialog.contract.TenantName || 'Chưa có'}</Typography>
                {viewDialog.contract.TenantPhone && (
                  <Typography variant="body2" color="text.secondary">{viewDialog.contract.TenantPhone}</Typography>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Ngày bắt đầu</Typography>
                  <Typography variant="body1">{formatDate(viewDialog.contract.StartDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Ngày kết thúc</Typography>
                  <Typography variant="body1">{formatDate(viewDialog.contract.EndDate)}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tiền cọc</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {formatPrice(viewDialog.contract.DepositAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tiền thuê/tháng</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatPrice(viewDialog.contract.MonthlyRent)}
                  </Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" color="text.secondary">Chu kỳ thanh toán</Typography>
                <Typography variant="body1">{getPaymentCycleLabel(viewDialog.contract.PaymentCycle)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Gia hạn</Typography>
                <Typography variant="body1">{viewDialog.contract.RenewalOption ? 'Cho phép' : 'Không cho phép'}</Typography>
              </Box>
              {viewDialog.contract.ContractFileURL && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => window.open(viewDialog.contract.ContractFileURL, '_blank')}
                    fullWidth
                  >
                    Xem file hợp đồng
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, contract: null })}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, contract: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Sửa hợp đồng</Typography>
          <IconButton size="small" onClick={() => setEditDialog({ open: false, contract: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Ngày bắt đầu"
                  type="date"
                  value={editForm.startDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Ngày kết thúc"
                  type="date"
                  value={editForm.endDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Tiền cọc"
                  type="number"
                  value={editForm.depositAmount || ''}
                  onChange={(e) => setEditForm({ ...editForm, depositAmount: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Tiền thuê/tháng"
                  type="number"
                  value={editForm.monthlyRent || ''}
                  onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <FormLabel>Chu kỳ thanh toán</FormLabel>
              <Select
                value={editForm.paymentCycle || 'monthly'}
                onChange={(e) => setEditForm({ ...editForm, paymentCycle: e.target.value })}
                size="small"
              >
                <MenuItem value="monthly">Hàng tháng</MenuItem>
                <MenuItem value="quarterly">Hàng quý</MenuItem>
                <MenuItem value="semi-annual">Nửa năm</MenuItem>
                <MenuItem value="annual">Hàng năm</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <FormLabel sx={{ mb: 1, display: 'block' }}>File hợp đồng mới (tùy chọn)</FormLabel>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {contractFile ? contractFile.name : 'Chọn file mới'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setContractFile(e.target.files[0])}
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, contract: null })}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
      />
    </Box>
  )
}

// Tab 2: Quản lý tài liệu
function DocumentTab() {
  const { notification, showSuccess, showError, showConfirm, hideNotification } = useNotification()
  const [documents, setDocuments] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [openUpload, setOpenUpload] = useState(false)
  const [editDialog, setEditDialog] = useState({ open: false, doc: null })
  const [editForm, setEditForm] = useState({ title: '', type: 'contract', roomId: '', isPrivate: true })
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchDocuments()
    fetchRooms()
  }, [selectedType, selectedRoom])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedRoom) params.append('roomId', selectedRoom)
      const response = await fetch(`${API_URL}/documents?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setDocuments(data.data || [])
    } catch (error) {
      console.error('Fetch documents error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      if (data.success) setRooms(data.data || [])
    } catch (error) {
      console.error('Fetch rooms error:', error)
    }
  }

  const handleDelete = async (documentId) => {
    showConfirm('Xác nhận xóa', 'Bạn chắc chắn muốn xóa tài liệu này?', async () => {
      try {
        const response = await fetch(`${API_URL}/documents/${documentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          showSuccess('Thành công!', 'Đã xóa tài liệu')
          fetchDocuments()
        } else {
          showError('Lỗi!', data.message)
        }
      } catch {
        showError('Lỗi!', 'Không thể xóa tài liệu')
      }
    })
  }

  const handleOpenEdit = (doc) => {
    setEditForm({
      title: doc.Title,
      type: doc.Type,
      roomId: doc.IsAllRooms ? 'all' : (doc.RoomID || ''),
      isPrivate: !!doc.IsPrivate
    })
    setEditDialog({ open: true, doc })
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/documents/${editDialog.doc.DocumentID}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (data.success) {
        showSuccess('Thành công!', 'Đã cập nhật tài liệu')
        setEditDialog({ open: false, doc: null })
        fetchDocuments()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch {
      showError('Lỗi!', 'Không thể cập nhật tài liệu')
    }
  }

  const handleDownload = async (fileUrl, title, fileType) => {
    try {
      const ext = fileType || fileUrl.split('.').pop().split('?')[0] || 'pdf'
      const res = await fetch(fileUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(fileUrl, '_blank')
    }
  }

  const [previewDialog, setPreviewDialog] = useState({ open: false, url: '', title: '', type: '' })

  const handlePreview = (doc) => {
    const fileType = doc.FileType?.toLowerCase() || ''
    const fileUrl = doc.FileURL
    
    if (fileType.includes('pdf') || fileUrl?.toLowerCase().includes('.pdf')) {
      setPreviewDialog({
        open: true,
        url: `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`,
        title: doc.Title,
        type: 'pdf'
      })
    } else if (fileType.includes('doc') || fileUrl?.toLowerCase().includes('.doc')) {
      setPreviewDialog({
        open: true,
        url: `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`,
        title: doc.Title,
        type: 'doc'
      })
    } else if (fileType.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(fileUrl)) {
      setPreviewDialog({
        open: true,
        url: fileUrl,
        title: doc.Title,
        type: 'image'
      })
    } else {
      window.open(fileUrl, '_blank')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <PdfIcon sx={{ color: '#E5484D' }} />
    if (fileType?.includes('doc')) return <DocIcon sx={{ color: '#0078D4' }} />
    return <FileIcon sx={{ color: '#8A8F98' }} />
  }

  const documentStats = {
    all: documents.length,
    contract: documents.filter(d => d.Type === 'contract').length,
    handover: documents.filter(d => d.Type === 'handover').length,
    rule: documents.filter(d => d.Type === 'rule').length,
    deposit: documents.filter(d => d.Type === 'deposit').length,
    receipt: documents.filter(d => d.Type === 'receipt').length,
    pricing: documents.filter(d => d.Type === 'pricing').length,
    pccc: documents.filter(d => d.Type === 'pccc').length,
    info: documents.filter(d => d.Type === 'info').length
  }

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#5E6AD2', color: 'white' }}>
            <Typography variant="caption">Tổng tài liệu</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{documentStats.all}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Hợp đồng</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{documentStats.contract}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Biên bản</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{documentStats.handover + documentStats.deposit}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Khác</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {documentStats.rule + documentStats.receipt + documentStats.pricing + documentStats.pccc + documentStats.info}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <FormLabel>Loại tài liệu</FormLabel>
                <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <MenuItem value="all">Tất cả ({documentStats.all})</MenuItem>
                  {Object.entries(DocumentTypeConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label} ({documentStats[key]})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <FormLabel>Phòng</FormLabel>
                <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                  <MenuItem value="">Tất cả phòng</MenuItem>
                  {rooms.map(room => (
                    <MenuItem key={room.RoomID} value={room.RoomID}>{room.RoomCode} - {room.BuildingName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button variant="contained" startIcon={<UploadIcon />} fullWidth onClick={() => setOpenUpload(true)}>
                Upload tài liệu
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Danh sách tài liệu ({documents.length})
          </Typography>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Tài liệu</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Kích thước</TableCell>
                <TableCell>Quyền truy cập</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">Chưa có tài liệu nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.DocumentID} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {getFileIcon(doc.FileType)}
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.Title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{doc.FileType?.toUpperCase()}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell><DocumentTypeChip type={doc.Type} /></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem', color: doc.RoomCode ? 'text.primary' : 'text.secondary' }}>
                        {doc.IsAllRooms ? 'Tất cả' : (doc.RoomCode || 'Dùng chung')}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.FileSize)}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.IsPrivate ? 'Riêng tư' : 'Công khai'}
                        size="small"
                        color={doc.IsPrivate ? 'default' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(doc.CreatedAt)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" variant="outlined"
                          onClick={() => handlePreview(doc)}
                          sx={{ fontSize: '0.75rem', px: 1.5, minWidth: 0 }}
                        >Xem</Button>
                        <Button size="small" variant="contained"
                          onClick={() => handleDownload(doc.FileURL, doc.Title, doc.FileType)}
                          sx={{ fontSize: '0.75rem', px: 1.5, minWidth: 0 }}
                        >Tải</Button>
                        <IconButton size="small" onClick={() => handleOpenEdit(doc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'error.main' }}
                          onClick={() => handleDelete(doc.DocumentID)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, doc: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Sửa tài liệu</Typography>
          <IconButton size="small" onClick={() => setEditDialog({ open: false, doc: null })}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Tiêu đề *"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              size="small" fullWidth
            />
            <FormControl fullWidth>
              <FormLabel>Loại tài liệu</FormLabel>
              <Select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} size="small">
                {Object.entries(DocumentTypeConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon sx={{ fontSize: '1.1rem', color: config.color }} />
                        <span>{config.label}</span>
                      </Stack>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Phòng</FormLabel>
              <Select value={editForm.roomId} onChange={(e) => setEditForm({ ...editForm, roomId: e.target.value })} size="small">
                <MenuItem value="">Không gắn phòng (dùng chung)</MenuItem>
                <MenuItem value="all" sx={{ color: 'primary.main', fontWeight: 600 }}>Tất cả phòng</MenuItem>
                {rooms.map(room => (
                  <MenuItem key={room.RoomID} value={room.RoomID}>
                    {room.RoomCode} - {room.BuildingName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Quyền truy cập</FormLabel>
              <Select value={editForm.isPrivate} onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.value })} size="small">
                <MenuItem value={true}>Riêng tư (Chỉ chủ nhà)</MenuItem>
                <MenuItem value={false}>Công khai (Người thuê có thể xem)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, doc: null })}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      <UploadDocumentDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        rooms={rooms}
        onUpload={fetchDocuments}
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, url: '', title: '', type: '' })}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{previewDialog.title}</Typography>
          <IconButton size="small" onClick={() => setPreviewDialog({ open: false, url: '', title: '', type: '' })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {previewDialog.type === 'image' ? (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', p: 2 }}>
              <img src={previewDialog.url} alt={previewDialog.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </Box>
          ) : (
            <iframe
              src={previewDialog.url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={previewDialog.title}
            />
          )}
        </DialogContent>
      </Dialog>

      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
      />
    </Box>
  )
}

// Main Component
export default function ContractManagementPage() {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minHeight: '56px'
            }
          }}
        >
          <Tab label="Quản lý hợp đồng" />
          <Tab label="Quản lý tài liệu" />
        </Tabs>
      </Card>

      {activeTab === 0 && <ContractTab />}
      {activeTab === 1 && <DocumentTab />}
    </Box>
  )
}
