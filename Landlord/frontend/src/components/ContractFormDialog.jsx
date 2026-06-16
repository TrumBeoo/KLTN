import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import { Close as CloseIcon, Upload as UploadIcon } from '@mui/icons-material'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from './NotificationModal'

export default function ContractFormDialog({ open, onClose, roomId, roomCode, onSubmit }) {
  const { notification, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    contractDuration: 12,
    depositAmount: '',
    monthlyRent: '',
    paymentCycle: 'monthly',
    renewalOption: true,
    tenantId: ''
  })
  const [contractFile, setContractFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset form
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        contractDuration: 12,
        depositAmount: '',
        monthlyRent: '',
        paymentCycle: 'monthly',
        renewalOption: true,
        tenantId: ''
      })
      setContractFile(null)
    }
  }, [open])

  // Tính ngày kết thúc tự động khi thay đổi ngày bắt đầu hoặc thời gian hợp đồng
  useEffect(() => {
    if (formData.startDate && formData.contractDuration) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      
      // Cộng thêm số tháng hợp đồng
      endDate.setMonth(endDate.getMonth() + parseInt(formData.contractDuration))
      // Trừ đi 1 ngày để ngày kết thúc là ngày trước hôm hết hạn
      endDate.setDate(endDate.getDate() - 1)
      
      const endDateString = endDate.toISOString().split('T')[0]
      setFormData(prev => ({
        ...prev,
        endDate: endDateString
      }))
    }
  }, [formData.startDate, formData.contractDuration])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Nếu là ngày kết thúc được nhập thủ công, cho phép cập nhật
    // Nhưng thường sẽ tự động cập nhật từ useEffect
    if (name === 'endDate') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setContractFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate || !formData.depositAmount || !formData.monthlyRent) {
      showError('Lỗi!', 'Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('roomId', roomId)
      formDataToSend.append('startDate', formData.startDate)
      formDataToSend.append('endDate', formData.endDate)
      formDataToSend.append('contractDuration', formData.contractDuration)
      formDataToSend.append('depositAmount', formData.depositAmount)
      formDataToSend.append('monthlyRent', formData.monthlyRent)
      formDataToSend.append('paymentCycle', formData.paymentCycle)
      formDataToSend.append('renewalOption', formData.renewalOption)
      if (formData.tenantId) {
        formDataToSend.append('tenantId', formData.tenantId)
      }
      if (contractFile) {
        formDataToSend.append('contractFile', contractFile)
      }

      await onSubmit(formDataToSend)
      onClose()
    } catch (error) {
      console.error('Submit contract error:', error)
      showError('Lỗi!', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Tạo hợp đồng cho thuê - Phòng {roomCode}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Thời gian hợp đồng *</FormLabel>
                <Select
                  name="contractDuration"
                  value={formData.contractDuration}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value={1}>1 tháng</MenuItem>
                  <MenuItem value={3}>3 tháng</MenuItem>
                  <MenuItem value={6}>6 tháng</MenuItem>
                  <MenuItem value={12}>12 tháng (1 năm)</MenuItem>
                  <MenuItem value={24}>24 tháng (2 năm)</MenuItem>
                  <MenuItem value={36}>36 tháng (3 năm)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ngày bắt đầu *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Ngày kết thúc *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Tự động tính toán từ ngày bắt đầu"
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'action.hover'
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Thời gian còn lại"
                type="text"
                value={
                  formData.startDate && formData.endDate
                    ? `${Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} ngày`
                    : '-'
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'action.hover'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Tiền cọc (VND) *"
                name="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tiền thuê/tháng (VND) *"
                name="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <FormLabel>Chu kỳ thanh toán</FormLabel>
            <Select
              name="paymentCycle"
              value={formData.paymentCycle}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="quarterly">Hàng quý (3 tháng)</MenuItem>
              <MenuItem value="semi-annual">Nửa năm (6 tháng)</MenuItem>
              <MenuItem value="annual">Hàng năm (12 tháng)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Mã người thuê (tùy chọn)"
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            placeholder="VD: TEN00001"
            fullWidth
            helperText="Để trống nếu chưa có thông tin người thuê"
          />

          <FormControlLabel
            control={
              <Checkbox
                name="renewalOption"
                checked={formData.renewalOption}
                onChange={handleChange}
              />
            }
            label="Cho phép gia hạn hợp đồng"
          />

          <Box>
            <FormLabel sx={{ mb: 1, display: 'block' }}>File hợp đồng (PDF, DOC, DOCX)</FormLabel>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {contractFile ? contractFile.name : 'Chọn file hợp đồng'}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: 'info.main', display: 'block', mb: 1 }}>
              ✨ <strong>Tính năng thông minh:</strong> Hệ thống sẽ tự động tính ngày kết thúc dựa trên thời gian hợp đồng bạn chọn.
            </Typography>
            <Typography variant="caption" sx={{ color: 'info.main' }}>
              💡 <strong>Lưu ý:</strong> Hệ thống sẽ tự động gửi thông báo cho bạn khi hợp đồng còn 30, 14 và 7 ngày nữa là hết hạn.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo hợp đồng'}
        </Button>
      </DialogActions>
      
      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Dialog>
  )
}
