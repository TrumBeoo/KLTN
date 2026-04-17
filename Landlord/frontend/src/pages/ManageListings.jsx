import { useState, useEffect } from 'react'
import { useNotification } from '../hooks/useNotification'
import NotificationModal from '../components/NotificationModal'
import ExcelUpload from '../components/ExcelUpload'
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
  Switch,
  FormControlLabel,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tabs,
  Tab
} from '@mui/material'
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon
} from '@mui/icons-material'

const StatusBadge = ({ status, isVisible }) => {
  if (!isVisible) {
    return <Chip label="Ẩn" color="default" variant="outlined" size="small" />
  }
  
  const statusConfig = {
    available: { label: 'Đang hiển thị', color: 'success' },
    rented: { label: 'Hết phòng', color: 'error' },
    viewing: { label: 'Đã đặt lịch', color: 'warning' },
    maintenance: { label: 'Bảo trì', color: 'info' }
  }
  const config = statusConfig[status] || statusConfig.available
  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />
}

const ListingForm = ({ open, onClose, listing = null, onSubmit }) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isVisible: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.Title || '',
        description: listing.Description || '',
        isVisible: listing.IsVisible || false
      })
    } else {
      setFormData({
        title: '',
        description: '',
        isVisible: true
      })
    }
  }, [listing, open])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showError('Lỗi!', 'Vui lòng nhập tiêu đề tin đăng')
      return
    }
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{listing ? 'Sửa tin đăng' : 'Tạo tin đăng mới'}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={3}>
          <TextField
            label="Tiêu đề tin đăng *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="VD: Phòng trọ cao cấp gần trường đại học"
            fullWidth
          />

          <TextField
            label="Mô tả chi tiết"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={6}
            placeholder="Mô tả chi tiết về phòng, vị trí, tiện nghi..."
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
              />
            }
            label="Hiển thị tin đăng"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu tin đăng'}
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

const ImageManagementDialog = ({ open, onClose, listing, onUpdateImages }) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (listing && open) {
      fetchImages()
    }
  }, [listing, open])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/listings/${listing.ListingID}/images`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setImages(data.data || [])
      }
    } catch (error) {
      console.error('Fetch images error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch(`${API_URL}/listings/${listing.ListingID}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', 'Tải ảnh lên thành công')
        fetchImages()
        onUpdateImages()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showError('Lỗi!', 'Không thể tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await fetch(`${API_URL}/listings/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', 'Xóa ảnh thành công')
        fetchImages()
        onUpdateImages()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      showError('Lỗi!', 'Không thể xóa ảnh')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Quản lý ảnh tin đăng</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Ảnh hiện tại ({images.length})</Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoIcon />}
              disabled={uploading}
            >
              {uploading ? 'Đang tải...' : 'Thêm ảnh'}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Đang tải ảnh...</Typography>
            </Box>
          ) : images.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Chưa có ảnh nào</Typography>
            </Box>
          ) : (
            <ImageList cols={3} gap={8}>
              {images.map((image) => (
                <ImageListItem key={image.ImageID}>
                  <img
                    src={image.ImageURL}
                    alt={`Ảnh ${image.ImageOrder}`}
                    loading="lazy"
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                  <ImageListItemBar
                    title={`Ảnh ${image.ImageOrder}`}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={() => handleDeleteImage(image.ImageID)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
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

export default function ManageListings() {
  const { notification, showSuccess, showError, showConfirm, hideNotification } = useNotification()
  const [activeTab, setActiveTab] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    visibility: ''
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.visibility) params.append('visibility', filters.visibility)

      const response = await fetch(`${API_URL}/listings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          setListings([])
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setListings(data.data || [])
      } else {
        setListings([])
      }
    } catch (error) {
      console.error('Fetch listings error:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitListing = async (formData) => {
    try {
      const method = selectedListing ? 'PUT' : 'POST'
      const url = selectedListing ? `${API_URL}/listings/${selectedListing.ListingID}` : `${API_URL}/listings`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', data.message)
        fetchListings()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Submit listing error:', error)
      showError('Lỗi!', error.message)
    }
  }

  const handleToggleVisibility = async (listingId, currentVisibility) => {
    try {
      const response = await fetch(`${API_URL}/listings/${listingId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: !currentVisibility })
      })
      const data = await response.json()
      if (data.success) {
        showSuccess('Thành công!', data.message)
        fetchListings()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Toggle visibility error:', error)
      showError('Lỗi!', error.message)
    }
  }

  const handleOpenDialog = (listing = null) => {
    setSelectedListing(listing)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedListing(null)
  }

  const handleOpenImageDialog = (listing) => {
    setSelectedListing(listing)
    setOpenImageDialog(true)
  }

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false)
    setSelectedListing(null)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <Box>
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Tạo tin đăng" />
          <Tab label="Tải lên Excel" />
        </Tabs>
      </Paper>

      {activeTab === 1 ? (
        <ExcelUpload />
      ) : (
        <>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tổng tin đăng', value: listings.length.toString() },
          { label: 'Đang hiển thị', value: listings.filter(l => l.IsVisible).length.toString() },
          { label: 'Đã ẩn', value: listings.filter(l => !l.IsVisible).length.toString() },
          { label: 'Hết phòng', value: listings.filter(l => l.RoomStatus === 'rented').length.toString() }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <FormLabel>Trạng thái phòng</FormLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="available">Trống</MenuItem>
                  <MenuItem value="rented">Đã thuê</MenuItem>
                  <MenuItem value="viewing">Đã đặt lịch</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <FormLabel>Hiển thị</FormLabel>
                <Select
                  value={filters.visibility}
                  onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="visible">Đang hiển thị</MenuItem>
                  <MenuItem value="hidden">Đã ẩn</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                fullWidth
                onClick={() => setFilters({ status: '', visibility: '' })}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Danh sách tin đăng ({listings.length})
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Tạo tin đăng
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Phòng liên kết</TableCell>
                <TableCell>Giá thuê</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hiển thị</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography>Đang tải...</Typography>
                  </TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography>Không có tin đăng nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.ListingID} hover>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {listing.Title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {listing.Description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {listing.RoomCode}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {listing.BuildingName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatPrice(listing.Price)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={listing.RoomStatus} isVisible={listing.IsVisible} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={listing.IsVisible}
                        onChange={() => handleToggleVisibility(listing.ListingID, listing.IsVisible)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(listing.UpdatedAt)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" title="Sửa nội dung" onClick={() => handleOpenDialog(listing)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Cập nhật ảnh" onClick={() => handleOpenImageDialog(listing)}>
                          <PhotoIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          title={listing.IsVisible ? "Ẩn tin đăng" : "Hiển thị tin đăng"}
                          onClick={() => handleToggleVisibility(listing.ListingID, listing.IsVisible)}
                        >
                          {listing.IsVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Tổng số {listings.length} tin đăng
          </Typography>
        </Box>
      </Card>

      <ListingForm 
        open={openDialog} 
        onClose={handleCloseDialog} 
        listing={selectedListing} 
        onSubmit={handleSubmitListing} 
      />

      <ImageManagementDialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        listing={selectedListing}
        onUpdateImages={fetchListings}
      />
      
      <NotificationModal
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
      />
        </>
      )}
    </Box>
  )
}