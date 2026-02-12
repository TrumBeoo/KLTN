import { useState } from 'react'
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Stack,
  IconButton,
  Chip,
  Typography,
  Pagination,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as EyeIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

const StatusBadge = ({ status }) => {
  const statusConfig = {
    available: { label: 'Trống', color: 'success' },
    rented: { label: 'Đã thuê', color: 'error' },
    viewing: { label: 'Đã đặt lịch', color: 'info' },
    maintenance: { label: 'Bảo trì', color: 'warning' }
  }
  const config = statusConfig[status] || statusConfig.available
  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />
}

const RoomForm = ({ open, onClose, room = null }) => {
  const [formData, setFormData] = useState(room || {
    building: '',
    code: '',
    type: '',
    area: '',
    price: '',
    maxPeople: '',
    amenities: [],
    description: ''
  })

  const amenitiesList = [
    { value: 'wifi', label: 'Wifi' },
    { value: 'ac', label: 'Điều hòa' },
    { value: 'heater', label: 'Nóng lạnh' },
    { value: 'washer', label: 'Máy giặt' },
    { value: 'fridge', label: 'Tủ lạnh' },
    { value: 'tv', label: 'Ti vi' },
    { value: 'balcony', label: 'Ban công' },
    { value: 'parking', label: 'Bãi xe' },
    { value: 'security', label: 'Bảo vệ 24/7' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = () => {
    console.log('Form data:', formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{room ? 'Sửa phòng' : 'Thêm phòng mới'}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>Tòa nhà *</FormLabel>
            <Select
              name="building"
              value={formData.building}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="">Chọn tòa</MenuItem>
              <MenuItem value="A">Tòa A</MenuItem>
              <MenuItem value="B">Tòa B</MenuItem>
              <MenuItem value="C">Tòa C</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Mã phòng *"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="VD: A-101"
            size="small"
            fullWidth
          />

          <FormControl fullWidth>
            <FormLabel>Loại phòng *</FormLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="">Chọn loại phòng</MenuItem>
              <MenuItem value="studio">Studio</MenuItem>
              <MenuItem value="1bed">1 phòng ngủ</MenuItem>
              <MenuItem value="2bed">2 phòng ngủ</MenuItem>
              <MenuItem value="duplex">Duplex</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                label="Diện tích (m²) *"
                name="area"
                value={formData.area}
                onChange={handleChange}
                type="number"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giá thuê (VND) *"
                name="price"
                value={formData.price}
                onChange={handleChange}
                type="number"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Số người tối đa *"
            name="maxPeople"
            value={formData.maxPeople}
            onChange={handleChange}
            type="number"
            size="small"
            fullWidth
          />

          <Box>
            <FormLabel sx={{ mb: 1, display: 'block' }}>Tiện nghi</FormLabel>
            <FormGroup>
              <Grid container>
                {amenitiesList.map(amenity => (
                  <Grid item xs={6} key={amenity.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.amenities.includes(amenity.value)}
                          onChange={() => handleAmenityChange(amenity.value)}
                        />
                      }
                      label={amenity.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </Box>

          <TextField
            label="Mô tả phòng"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          Lưu phòng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function ManageRooms() {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [filters, setFilters] = useState({
    building: '',
    status: '',
    type: '',
    sort: 'newest'
  })

  const rooms = [
    { code: 'A-101', building: 'Tòa A', type: 'Studio', area: '25m²', price: '5.500.000đ', people: '2 người', status: 'available', updated: '2 ngày trước' },
    { code: 'A-102', building: 'Tòa A', type: '1 phòng ngủ', area: '35m²', price: '7.000.000đ', people: '2 người', status: 'rented', updated: '1 tuần trước' },
    { code: 'B-201', building: 'Tòa B', type: 'Studio', area: '22m²', price: '4.800.000đ', people: '2 người', status: 'viewing', updated: '3 ngày trước' },
    { code: 'B-202', building: 'Tòa B', type: '2 phòng ngủ', area: '50m²', price: '10.000.000đ', people: '4 người', status: 'rented', updated: '2 tuần trước' },
    { code: 'C-301', building: 'Tòa C', type: 'Duplex', area: '65m²', price: '15.000.000đ', people: '4 người', status: 'available', updated: '1 ngày trước' }
  ]

  const handleOpenDialog = (room = null) => {
    setSelectedRoom(room)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedRoom(null)
  }

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tổng phòng', value: '24' },
          { label: 'Trống', value: '8' },
          { label: 'Đã thuê', value: '14' },
          { label: 'Đặt lịch', value: '2' },
          { label: 'Bảo trì', value: '0' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
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
                <FormLabel>Chung cư</FormLabel>
                <Select
                  value={filters.building}
                  onChange={(e) => setFilters({ ...filters, building: e.target.value })}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="A">Tòa A</MenuItem>
                  <MenuItem value="B">Tòa B</MenuItem>
                  <MenuItem value="C">Tòa C</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <FormLabel>Trạng thái</FormLabel>
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
                <FormLabel>Loại phòng</FormLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="1bed">1 phòng ngủ</MenuItem>
                  <MenuItem value="2bed">2 phòng ngủ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} fullWidth>
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Danh sách phòng ({rooms.length})
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
              Xuất Excel
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Thêm phòng
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Mã phòng</TableCell>
                <TableCell>Tòa</TableCell>
                <TableCell>Loại phòng</TableCell>
                <TableCell>Diện tích</TableCell>
                <TableCell>Giá thuê</TableCell>
                <TableCell>Số người</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.code} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{room.code}</TableCell>
                  <TableCell>{room.building}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.area}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{room.price}</TableCell>
                  <TableCell>{room.people}</TableCell>
                  <TableCell>
                    <StatusBadge status={room.status} />
                  </TableCell>
                  <TableCell>{room.updated}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" title="Xem">
                        <EyeIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Sửa" onClick={() => handleOpenDialog(room)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} title="Xóa">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Hiển thị 1-5 trong tổng số {rooms.length} phòng
          </Typography>
          <Pagination count={5} />
        </Box>
      </Card>

      <RoomForm open={openDialog} onClose={handleCloseDialog} room={selectedRoom} />
    </Box>
  )
}
