import { useState } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from './NotificationModal'

export default function ExcelUpload() {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [uploading, setUploading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
  const token = localStorage.getItem('token')

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      showError('Lỗi!', 'Vui lòng chọn file Excel (.xlsx, .xls)')
      return
    }

    setFile(selectedFile)
    
    // Preview data
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API_URL}/listings/preview-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      
      if (data.success) {
        setPreview(data.data)
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể xem trước dữ liệu')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/listings/upload-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()

      if (data.success) {
        showSuccess('Thành công!', `Đã tạo ${data.data.successCount} tin đăng`)
        setFile(null)
        setPreview([])
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể tải lên file')
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (errors) => {
    if (!errors || errors.length === 0) return <CheckIcon color="success" />
    return <ErrorIcon color="error" />
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Tải lên file Excel
        </Typography>
        
        <Stack spacing={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ py: 3, borderStyle: 'dashed' }}
          >
            {file ? file.name : 'Chọn file Excel hoặc kéo thả vào đây'}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
          </Button>

          {file && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{file.name}</strong> - {preview.length} phòng
              </Typography>
            </Alert>
          )}
        </Stack>
      </Paper>

      {preview.length > 0 && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Xem trước dữ liệu ({preview.length} phòng)
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Mã phòng</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>Diện tích</TableCell>
                    <TableCell>Quận</TableCell>
                    <TableCell>Lỗi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{ 
                        backgroundColor: row.errors?.length > 0 ? 'error.lighter' : 'inherit'
                      }}
                    >
                      <TableCell>{getStatusIcon(row.errors)}</TableCell>
                      <TableCell>{row.roomCode}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.price?.toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell>{row.area} m²</TableCell>
                      <TableCell>{row.district}</TableCell>
                      <TableCell>
                        {row.errors?.map((err, i) => (
                          <Chip 
                            key={i} 
                            label={err} 
                            size="small" 
                            color="error" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setFile(null)
                setPreview([])
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || preview.some(r => r.errors?.length > 0)}
            >
              {uploading ? 'Đang đăng...' : 'Đăng tất cả'}
            </Button>
          </Box>

          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </>
      )}

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
