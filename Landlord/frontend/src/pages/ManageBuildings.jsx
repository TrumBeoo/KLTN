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
  Grid,
  Stack,
  IconButton,
  Typography,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material'

const BuildingForm = ({ open, onClose, building = null, onSubmit }) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [formData, setFormData] = useState({
    buildingName: '',
    address: '',
    district: '',
    ward: '',
    floors: '',
    numberRooms: ''
  })
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

  useEffect(() => {
    if (open) {
      fetchDistricts()
    }
    if (building) {
      setFormData({
        buildingName: building.BuildingName || '',
        address: building.Address || '',
        district: building.District || '',
        ward: building.Ward || '',
        floors: building.Floors || '',
        numberRooms: building.NumberRooms || ''
      })
      if (building.District) {
        fetchWards(building.District)
      }
    } else {
      setFormData({
        buildingName: '',
        address: '',
        district: '',
        ward: '',
        floors: '',
        numberRooms: ''
      })
    }
  }, [building, open])

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_URL}/locations/districts`)
      const data = await response.json()
      if (data.success) {
        setDistricts(data.data || [])
      }
    } catch (error) {
      console.error('Fetch districts error:', error)
    }
  }

  const fetchWards = async (district) => {
    try {
      const response = await fetch(`${API_URL}/locations/wards/${encodeURIComponent(district)}`)
      const data = await response.json()
      if (data.success) {
        setWards(data.data || [])
      }
    } catch (error) {
      console.error('Fetch wards error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'district') {
      setFormData(prev => ({ ...prev, ward: '' }))
      setWards([])
      if (value) {
        fetchWards(value)
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.buildingName || !formData.address) {
      showError('Lỗi!', 'Vui lòng nhập đầy đủ thông tin bắt buộc')
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {building ? 'Sửa tòa nhà' : 'Thêm tòa nhà mới'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Tên tòa nhà *"
            name="buildingName"
            value={formData.buildingName}
            onChange={handleChange}
            placeholder="VD: Tòa A, Chung cư mini..."
            size="small"
            fullWidth
          />

          <TextField
            label="Địa chỉ *"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: 123 Đường ABC"
            size="small"
            fullWidth
          />

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                select
                label="Quận/Huyện"
                name="district"
                value={formData.district}
                onChange={handleChange}
                size="small"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Phường/Xã"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                size="small"
                fullWidth
                disabled={!formData.district}
                SelectProps={{ native: true }}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                label="Số tầng"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                type="number"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số phòng"
                name="numberRooms"
                value={formData.numberRooms}
                onChange={handleChange}
                type="number"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu tòa nhà'}
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

export default function ManageBuildings() {
  const { notification, showSuccess, showError, showConfirm, hideNotification } = useNotification()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/buildings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setBuildings(data.data || [])
      }
    } catch (error) {
      console.error('Fetch buildings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBuilding = async (formData) => {
    try {
      const method = selectedBuilding ? 'PUT' : 'POST'
      const url = selectedBuilding ? `${API_URL}/buildings/${selectedBuilding.BuildingID}` : `${API_URL}/buildings`

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
        fetchBuildings()
      } else {
        showError('Lỗi!', data.message)
      }
    } catch (error) {
      console.error('Submit building error:', error)
      showError('Lỗi!', error.message)
    }
  }

  const handleDeleteBuilding = async (buildingId) => {
    showConfirm('Xác nhận xóa', 'Bạn chắc chắn muốn xóa tòa nhà này?', async () => {
      try {
        const response = await fetch(`${API_URL}/buildings/${buildingId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          showSuccess('Thành công!', data.message)
          fetchBuildings()
        } else {
          showError('Lỗi!', data.message)
        }
      } catch (error) {
        console.error('Delete building error:', error)
        showError('Lỗi!', error.message)
      }
    })
  }

  const handleOpenDialog = (building = null) => {
    setSelectedBuilding(building)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedBuilding(null)
  }

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tổng tòa nhà', value: buildings.length.toString() }
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

      {/* Table */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Danh sách tòa nhà ({buildings.length})
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Thêm tòa nhà
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Tên tòa nhà</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Quận/Huyện</TableCell>
                <TableCell>Phường/Xã</TableCell>
                <TableCell>Số tầng</TableCell>
                <TableCell>Số phòng</TableCell>
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
              ) : buildings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography>Không có tòa nhà nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                buildings.map((building) => (
                  <TableRow key={building.BuildingID} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{building.BuildingName}</TableCell>
                    <TableCell>{building.Address}</TableCell>
                    <TableCell>{building.District}</TableCell>
                    <TableCell>{building.Ward}</TableCell>
                    <TableCell>{building.Floors}</TableCell>
                    <TableCell>{building.NumberRooms}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" title="Sửa" onClick={() => handleOpenDialog(building)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'error.main' }} title="Xóa" onClick={() => handleDeleteBuilding(building.BuildingID)}>
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

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Tổng số {buildings.length} tòa nhà
          </Typography>
        </Box>
      </Card>

      <BuildingForm open={openDialog} onClose={handleCloseDialog} building={selectedBuilding} onSubmit={handleSubmitBuilding} />
      
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
