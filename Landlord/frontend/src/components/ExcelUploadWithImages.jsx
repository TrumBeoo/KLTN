import { useState, useEffect } from 'react'
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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from './NotificationModal'

export default function ExcelUploadWithImages() {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [activeStep, setActiveStep] = useState(0)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [uploadJobId, setUploadJobId] = useState(null)
  const [roomsData, setRoomsData] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [draftBatches, setDraftBatches] = useState([])
  const [showBatches, setShowBatches] = useState(false)
  const [buildings, setBuildings] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [filterStats, setFilterStats] = useState(null)
  const [buildingInfo, setBuildingInfo] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api'
  const token = localStorage.getItem('token')

  const steps = ['Upload Excel', 'Xem trước', 'Tạo phòng', 'Upload ảnh & Publish']

  useEffect(() => {
    loadDraftBatches()
    loadBuildings()
  }, [])

  const loadBuildings = async () => {
    try {
      const response = await fetch(`${API_URL}/buildings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setBuildings(data.data || [])
      }
    } catch (error) {
      console.error('Load buildings error:', error)
    }
  }

  const loadDraftBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/bulk/draft-batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setDraftBatches(data.data || [])
        setShowBatches(data.data && data.data.length > 0)
      }
    } catch (error) {
      console.error('Load draft batches error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBatchDetails = async (jobId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/bulk/batch/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        const { job, rooms } = data.data
        setUploadJobId(job.UploadJobID)
        
        // Khôi phục preview data từ UPLOAD_DETAIL
        const previewData = rooms.map(r => ({
          detailId: r.UploadDetailID,
          roomCode: r.RoomCode,
          title: r.Title,
          price: r.Price || 0,
          area: r.Area || 0,
          maxPeople: r.MaxPeople || 0,
          district: r.District || '',
          errors: []
        }))
        setPreview(previewData)
        
        const roomsPreview = rooms.map(r => ({
          detailId: r.UploadDetailID,
          roomId: r.RoomID,
          roomCode: r.RoomCode,
          title: r.Title,
          imageCount: r.ImageCount || 0,
          created: !!r.RoomID,
          published: !!r.ListingID
        }))
        setRoomsData(roomsPreview)
        setShowBatches(false)
        
        const allCreated = roomsPreview.every(r => r.created)
        setActiveStep(allCreated ? 3 : 2)
      }
    } catch (error) {
      console.error('Load batch details error:', error)
      showError('Lỗi!', 'Không thể tải thông tin batch')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      showError('Lỗi!', 'Vui lòng chọn file Excel (.xlsx, .xls)')
      return
    }

    if (!selectedBuilding) {
      showError('Lỗi!', 'Vui lòng chọn tòa nhà trước khi upload file')
      return
    }

    setFile(selectedFile)
    
    // Get building info first
    try {
      const infoResponse = await fetch(`${API_URL}/bulk/building-info/${selectedBuilding}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const infoData = await infoResponse.json()
      if (infoData.success) {
        setBuildingInfo(infoData.data)
      }
    } catch (error) {
      console.error('Get building info error:', error)
    }
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('buildingId', selectedBuilding)

    try {
      const response = await fetch(`${API_URL}/bulk/preview-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      
      if (data.success) {
        setUploadJobId(data.data.uploadJobId)
        setPreview(data.data.preview)
        setFilterStats(data.data.stats) // Lưu thống kê lọc
        setActiveStep(1)
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể xem trước dữ liệu')
    }
  }

  const handleNext = () => {
    // Nếu roomsData đã có (quay lại từ bước 3), giữ nguyên
    if (roomsData.length > 0) {
      setActiveStep(2)
      return
    }

    // Nếu chưa có, tạo mới từ preview
    const roomsPreview = preview.map(r => ({
      detailId: r.detailId,
      roomId: null,
      roomCode: r.roomCode,
      title: r.title,
      imageCount: 0,
      created: false,
      published: false
    }))
    setRoomsData(roomsPreview)
    setActiveStep(2)
  }

  const handleBackToPreview = () => {
    // Nếu preview rỗng, khôi phục từ roomsData
    if (preview.length === 0 && roomsData.length > 0) {
      const restoredPreview = roomsData.map(r => ({
        detailId: r.detailId,
        roomCode: r.roomCode,
        title: r.title,
        price: 0,
        area: 0,
        maxPeople: 0,
        district: '',
        errors: []
      }))
      setPreview(restoredPreview)
    }
    setActiveStep(1)
  }

  const handleImageUpload = async (room, files) => {
    if (!room.roomId) {
      showError('Lỗi!', 'Vui lòng tạo phòng trước khi upload ảnh')
      return
    }

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('images', file)
    })

    try {
      const response = await fetch(`${API_URL}/rooms/${room.roomId}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()

      if (data.success) {
        showSuccess('Thành công!', 'Đã tải ảnh lên')
        setRoomsData(prev => prev.map(r => 
          r.roomCode === room.roomCode ? { ...r, imageCount: (r.imageCount || 0) + files.length } : r
        ))
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể tải ảnh lên')
    }
  }

  const handleCreateRooms = async () => {
    if (!uploadJobId) {
      showError('Lỗi!', 'Không tìm thấy thông tin upload')
      return
    }

    setUploading(true)
    try {
      const createResponse = await fetch(`${API_URL}/bulk/bulk-create/${uploadJobId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const createData = await createResponse.json()

      if (!createData.success) {
        showError('Lỗi!', createData.message)
        setUploading(false)
        return
      }

      const updatedRooms = roomsData.map(room => {
        const createdRoom = createData.data.rooms.find(r => r.roomCode === room.roomCode)
        if (createdRoom) {
          return { ...room, roomId: createdRoom.roomId, detailId: createdRoom.detailId, created: true }
        }
        return room
      })
      setRoomsData(updatedRooms)
      showSuccess('Thành công!', `Đã tạo ${createData.data.successCount} phòng`)
    } catch (error) {
      showError('Lỗi!', 'Không thể tạo phòng')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateSingleRoom = async (room) => {
    if (!uploadJobId) {
      showError('Lỗi!', 'Không tìm thấy thông tin upload')
      return
    }

    setUploading(true)
    try {
      const createResponse = await fetch(`${API_URL}/bulk/create-single/${uploadJobId}/${room.detailId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const createData = await createResponse.json()

      if (!createData.success) {
        showError('Lỗi!', createData.message)
        setUploading(false)
        return
      }

      showSuccess('Thành công!', `Đã tạo phòng ${room.roomCode}`)
      setRoomsData(prev => prev.map(r => 
        r.roomCode === room.roomCode ? { ...r, roomId: createData.data.roomId, detailId: createData.data.detailId, created: true } : r
      ))
    } catch (error) {
      showError('Lỗi!', 'Không thể tạo phòng')
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async () => {
    if (!uploadJobId) {
      showError('Lỗi!', 'Không tìm thấy thông tin upload')
      return
    }

    setUploading(true)
    try {
      const response = await fetch(`${API_URL}/bulk/bulk-publish/${uploadJobId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        showSuccess('Thành công!', `Đã publish ${data.data.successCount} tin đăng`)
        setRoomsData(prev => prev.map(r => ({ ...r, published: true })))
        
        setTimeout(() => {
          handleCompleteAndReset()
        }, 1500)
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể publish')
    } finally {
      setUploading(false)
    }
  }

  const handlePublishSingle = async (room) => {
    if (!uploadJobId) {
      showError('Lỗi!', 'Không tìm thấy thông tin upload')
      return
    }

    setUploading(true)
    try {
      const response = await fetch(`${API_URL}/bulk/publish-single/${uploadJobId}/${room.detailId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        showSuccess('Thành công!', `Đã publish phòng ${room.roomCode}`)
        setRoomsData(prev => prev.map(r => 
          r.roomCode === room.roomCode ? { ...r, published: true } : r
        ))

        const allPublished = roomsData.every(r => r.roomCode === room.roomCode || r.published)
        if (allPublished) {
          setTimeout(() => {
            handleCompleteAndReset()
          }, 1500)
        }
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể publish')
    } finally {
      setUploading(false)
    }
  }

  const handleUnpublishSingle = async (room) => {
    if (!uploadJobId) {
      showError('Lỗi!', 'Không tìm thấy thông tin upload')
      return
    }

    setUploading(true)
    try {
      const response = await fetch(`${API_URL}/bulk/unpublish-single/${uploadJobId}/${room.detailId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        showSuccess('Thành công!', `Đã hủy publish phòng ${room.roomCode}`)
        setRoomsData(prev => prev.map(r => 
          r.roomCode === room.roomCode ? { ...r, published: false } : r
        ))
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      showError('Lỗi!', 'Không thể hủy publish')
    } finally {
      setUploading(false)
    }
  }

  const handleCompleteAndReset = async () => {
    if (uploadJobId) {
      try {
        await fetch(`${API_URL}/bulk/job/${uploadJobId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        showSuccess('Thành công!', 'Đã xóa job')
      } catch (error) {
        console.error('Delete job error:', error)
      }
    }
    resetState()
    loadDraftBatches()
  }

  const handleDeleteBatch = async (jobId) => {
    if (!confirm('Bạn có chắc muốn xóa batch này?')) return

    try {
      await fetch(`${API_URL}/bulk/job/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      showSuccess('Thành công!', 'Đã xóa batch')
      loadDraftBatches()
    } catch (error) {
      console.error('Delete batch error:', error)
      showError('Lỗi!', 'Không thể xóa batch')
    }
  }

  const resetState = () => {
    setFile(null)
    setPreview([])
    setRoomsData([])
    setUploadJobId(null)
    setActiveStep(0)
    setShowBatches(true)
    setSelectedBuilding('')
    setFilterStats(null)
    setBuildingInfo(null)
  }

  const getStatusIcon = (errors) => {
    if (!errors || errors.length === 0) return <CheckIcon color="success" />
    return <ErrorIcon color="error" />
  }

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : showBatches && draftBatches.length > 0 ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Các batch đang xử lý
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {draftBatches.length} batch chưa hoàn thành
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setShowBatches(false)}
            >
              Tạo batch mới
            </Button>
          </Box>

          <Stack spacing={2}>
            {draftBatches.map((batch) => (
              <Card key={batch.UploadJobID} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          📦 Upload ngày {new Date(batch.CreatedAt).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Chip 
                          label={`${batch.TotalRooms} phòng`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Stack>
                      
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>File:</strong> {batch.FileName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Bước:</strong> <Chip 
                            label="Tạo phòng" 
                            size="small" 
                            color="warning" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Đã publish:</strong> {batch.PublishedCount || 0} / {batch.TotalRooms}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Có ảnh:</strong> {batch.RoomsWithImages || 0} phòng
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteBatch(batch.UploadJobID)}
                      >
                        Xóa
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => loadBatchDetails(batch.UploadJobID)}
                      >
                        Tiếp tục
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      ) : (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                File Excel chỉ cần cột bắt buộc:
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                <strong>Bắt buộc:</strong> room_code (Mã phòng)
              </Typography>
              <Typography variant="caption" component="div">
                <strong>Tùy chọn:</strong> title, price, area, max_people, district, ward, address, room_type, floor_type, service, rules, description, furniture, amenities
              </Typography>
            </Alert>

            <FormControl fullWidth required>
              <InputLabel>Chọn tòa nhà</InputLabel>
              <Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                label="Chọn tòa nhà"
              >
                <MenuItem value="">
                  <em>-- Chọn tòa nhà --</em>
                </MenuItem>
                {buildings.map((building) => (
                  <MenuItem key={building.BuildingID} value={building.BuildingID}>
                    {building.BuildingName} - {building.Address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              disabled={!selectedBuilding}
              sx={{ py: 3, borderStyle: 'dashed' }}
            >
              {file ? file.name : selectedBuilding ? 'Chọn file Excel hoặc kéo thả vào đây' : 'Vui lòng chọn tòa nhà trước'}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={!selectedBuilding}
              />
            </Button>

            {selectedBuilding && (
              <Alert severity="success">
                <Typography variant="body2">
                  Đã chọn: <strong>{buildings.find(b => b.BuildingID === selectedBuilding)?.BuildingName}</strong>
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {activeStep === 1 && preview.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Preview dữ liệu ({preview.length} phòng)
                </Typography>
                {buildingInfo && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Tòa nhà: <strong>{buildingInfo.BuildingName}</strong> - Quận: <strong>{buildingInfo.District}</strong>
                  </Typography>
                )}
                {filterStats && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      📊 Tổng: {filterStats.totalRows} hàng
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      ⛔ Lọc: {filterStats.filteredRows} hàng (không khớp quận)
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ✅ Import: {filterStats.importRows} hàng (khớp quận)
                    </Typography>
                  </Stack>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button onClick={resetState} color="error">Hủy</Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={preview.every(r => !r.roomCode)}
                >
                  Tiếp
                </Button>
              </Stack>
            </Box>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>Mã phòng</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>Diện tích</TableCell>
                    <TableCell>Số người</TableCell>
                    <TableCell>Loại phòng</TableCell>
                    <TableCell>Loại sàn</TableCell>
                    <TableCell>Nội thất</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{ backgroundColor: row.errors?.length > 0 ? 'error.lighter' : 'inherit' }}
                    >
                      <TableCell sx={{ minWidth: 80 }}>{row.roomCode}</TableCell>
                      <TableCell sx={{ maxWidth: 150, minWidth: 100 }}>
                        <Typography variant="body2" noWrap>{row.title || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>{row.price?.toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell>{row.area} m²</TableCell>
                      <TableCell>{row.maxPeople}</TableCell>
                      <TableCell sx={{ maxWidth: 120 }}>
                        <Typography variant="body2" noWrap>{row.roomType || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 100 }}>
                        <Typography variant="body2" noWrap>{row.floorType || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography variant="body2" noWrap title={row.furniture}>{row.furniture || '-'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeStep === 2 && roomsData.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tạo phòng ({roomsData.length} phòng)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roomsData.filter(r => r.created).length} / {roomsData.length} đã tạo phòng
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button onClick={handleCompleteAndReset} color="error">Hủy</Button>
                <Button
                  variant="outlined"
                  onClick={handleBackToPreview}
                >
                  Quay lại
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCreateRooms}
                  disabled={uploading || roomsData.every(r => r.created)}
                >
                  {uploading ? 'Đang tạo...' : 'Tạo tất cả phòng'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(3)}
                  disabled={!roomsData.some(r => r.created)}
                >
                  Tiếp
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              {roomsData.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.roomCode}>
                  <Card sx={{ 
                    border: room.created ? '2px solid' : 'none',
                    borderColor: 'success.main',
                    opacity: room.created ? 0.8 : 1
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {room.roomCode}
                        </Typography>
                        {room.created && (
                          <Chip label="Đã tạo" color="success" size="small" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {room.title || 'Chưa có tiêu đề'}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleCreateSingleRoom(room)}
                        disabled={uploading || room.created}
                      >
                        {room.created ? 'Đã tạo' : 'Tạo phòng'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {activeStep === 3 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Upload ảnh và Publish tin đăng ({roomsData.length} phòng)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roomsData.filter(r => r.published).length} / {roomsData.length} đã publish
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button onClick={handleCompleteAndReset} color="error">Hủy</Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(2)}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  disabled={uploading || roomsData.every(r => r.published)}
                >
                  {uploading ? 'Đang publish...' : 'Publish tất cả'}
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              {roomsData.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.roomCode}>
                  <Card sx={{ 
                    border: room.published ? '2px solid' : 'none',
                    borderColor: 'success.main',
                    opacity: room.published ? 0.6 : 1
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {room.roomCode}
                        </Typography>
                        {room.published && (
                          <Chip label="Đã publish" color="success" size="small" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {room.title || 'Chưa có tiêu đề'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        📷 {room.imageCount || 0} ảnh
                      </Typography>
                      
                      <Stack spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          startIcon={<PhotoIcon />}
                          fullWidth
                          disabled={room.published}
                        >
                          Upload ảnh ({room.imageCount || 0})
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(room, e.target.files)}
                            disabled={room.published}
                          />
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PublishIcon />}
                          fullWidth
                          onClick={() => room.published ? handleUnpublishSingle(room) : handlePublishSingle(room)}
                          disabled={uploading}
                          color={room.published ? "error" : "primary"}
                        >
                          {room.published ? 'Hủy publish' : 'Publish'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {uploading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>
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
