import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Select, MenuItem, FormControlLabel, Checkbox,
  Card, CardContent, Typography, Grid, Alert, CircularProgress, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const VEHICLE_TYPES = [
  { value: 'motorbike', label: '🛵 Xe máy' },
  { value: 'tricycle', label: '🛺 Xe ba gác' },
  { value: 'van', label: '🚐 Van' },
  { value: 'truck', label: '🚚 Xe tải' },
  { value: 'pickup', label: '🛻 Xe bán tải' }
];

export default function ProviderServiceForm({ onServiceCreated, categories = [] }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
    pricePerKm: '',
    freeDistanceKm: '0',
    maxDistanceKm: '',
    extraFloorPrice: '0',
    overtimePrice: '0',
    vehicleType: 'van',
    estimatedDuration: '',
    maxItems: '',
    features: [],
    isPopular: false,
    sortOrder: '0'
  });

  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/moving/provider/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setForm(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!form.categoryId || !form.name || !form.basePrice || !form.vehicleType || !form.estimatedDuration) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `/api/moving/provider/services/${editingId}`
        : '/api/moving/provider/services';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice),
          pricePerKm: parseFloat(form.pricePerKm),
          freeDistanceKm: parseFloat(form.freeDistanceKm),
          maxDistanceKm: form.maxDistanceKm ? parseFloat(form.maxDistanceKm) : null,
          extraFloorPrice: parseFloat(form.extraFloorPrice),
          overtimePrice: parseFloat(form.overtimePrice),
          estimatedDuration: parseInt(form.estimatedDuration),
          maxItems: form.maxItems ? parseInt(form.maxItems) : null,
          sortOrder: parseInt(form.sortOrder)
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(editingId ? 'Cập nhật dịch vụ thành công!' : 'Tạo dịch vụ thành công!');
        resetForm();
        fetchServices();
        if (onServiceCreated) onServiceCreated();
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi khi lưu dịch vụ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.ServiceID);
    setForm({
      categoryId: service.CategoryID,
      name: service.Name,
      description: service.Description || '',
      basePrice: service.BasePrice.toString(),
      pricePerKm: service.PricePerKm.toString(),
      freeDistanceKm: service.FreeDistanceKm.toString(),
      maxDistanceKm: service.MaxDistanceKm ? service.MaxDistanceKm.toString() : '',
      extraFloorPrice: service.ExtraFloorPrice.toString(),
      overtimePrice: service.OvertimePrice.toString(),
      vehicleType: service.VehicleType,
      estimatedDuration: service.EstimatedDuration.toString(),
      maxItems: service.MaxItems ? service.MaxItems.toString() : '',
      features: JSON.parse(service.Features || '[]'),
      isPopular: service.IsPopular,
      sortOrder: service.SortOrder.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa dịch vụ này?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/moving/provider/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Xóa dịch vụ thành công!');
        fetchServices();
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi khi xóa dịch vụ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      categoryId: '',
      name: '',
      description: '',
      basePrice: '',
      pricePerKm: '',
      freeDistanceKm: '0',
      maxDistanceKm: '',
      extraFloorPrice: '0',
      overtimePrice: '0',
      vehicleType: 'van',
      estimatedDuration: '',
      maxItems: '',
      features: [],
      isPopular: false,
      sortOrder: '0'
    });
    setFeatureInput('');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            {editingId ? '✏️ Chỉnh sửa dịch vụ' : '➕ Tạo dịch vụ mới'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Danh mục */}
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleInputChange}
                  displayEmpty
                >
                  <MenuItem value="">-- Chọn danh mục --</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.Icon} {cat.Name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Loại xe */}
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleInputChange}
                >
                  {VEHICLE_TYPES.map(v => (
                    <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* Tên dịch vụ */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên dịch vụ *"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Chuyển phòng trọ sinh viên"
                />
              </Grid>

              {/* Mô tả */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả dịch vụ"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder="Mô tả chi tiết về dịch vụ..."
                />
              </Grid>

              {/* Giá cơ bản */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Giá cơ bản (đ) *"
                  name="basePrice"
                  type="number"
                  value={form.basePrice}
                  onChange={handleInputChange}
                  inputProps={{ step: '1000' }}
                />
              </Grid>

              {/* Giá per km */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Giá mỗi km (đ) *"
                  name="pricePerKm"
                  type="number"
                  value={form.pricePerKm}
                  onChange={handleInputChange}
                  inputProps={{ step: '1000' }}
                />
              </Grid>

              {/* Km miễn phí */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Km miễn phí"
                  name="freeDistanceKm"
                  type="number"
                  value={form.freeDistanceKm}
                  onChange={handleInputChange}
                  inputProps={{ step: '0.1' }}
                />
              </Grid>

              {/* Km tối đa */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Km tối đa (để trống = không giới hạn)"
                  name="maxDistanceKm"
                  type="number"
                  value={form.maxDistanceKm}
                  onChange={handleInputChange}
                  inputProps={{ step: '0.1' }}
                />
              </Grid>

              {/* Phụ phí tầng */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phụ phí mỗi tầng (đ)"
                  name="extraFloorPrice"
                  type="number"
                  value={form.extraFloorPrice}
                  onChange={handleInputChange}
                  inputProps={{ step: '1000' }}
                />
              </Grid>

              {/* Phụ phí ngoài giờ */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phụ phí ngoài giờ (đ/giờ)"
                  name="overtimePrice"
                  type="number"
                  value={form.overtimePrice}
                  onChange={handleInputChange}
                  inputProps={{ step: '1000' }}
                />
              </Grid>

              {/* Thời gian ước tính */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thời gian ước tính (phút) *"
                  name="estimatedDuration"
                  type="number"
                  value={form.estimatedDuration}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Số kiện tối đa */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số kiện tối đa (để trống = không giới hạn)"
                  name="maxItems"
                  type="number"
                  value={form.maxItems}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Thứ tự sắp xếp */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thứ tự sắp xếp"
                  name="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Phổ biến */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPopular"
                      checked={form.isPopular}
                      onChange={handleInputChange}
                    />
                  }
                  label="Gắn nhãn 'Phổ biến nhất'"
                />
              </Grid>

              {/* Tính năng */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tính năng bao gồm
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Ví dụ: 2 nhân viên, Bảo hiểm..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddFeature}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Thêm
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {form.features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={feature}
                      onDelete={() => handleRemoveFeature(idx)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {editingId && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      resetForm();
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Hủy chỉnh sửa
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : (editingId ? <EditIcon /> : <AddIcon />)}
                >
                  {editingId ? 'Cập nhật' : 'Tạo dịch vụ'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Danh sách dịch vụ */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        📋 Danh sách dịch vụ của bạn ({services.length})
      </Typography>

      {loading && <CircularProgress />}

      {services.length === 0 ? (
        <Alert severity="info">Bạn chưa tạo dịch vụ nào. Hãy tạo dịch vụ đầu tiên!</Alert>
      ) : (
        <Grid container spacing={2}>
          {services.map(service => (
            <Grid item xs={12} key={service.ServiceID}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {service.Name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {service.Description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                        <Chip label={`${service.CategoryName}`} size="small" />
                        <Chip label={`${service.VehicleType}`} size="small" />
                        <Chip label={`${service.BasePrice.toLocaleString('vi-VN')}đ`} size="small" color="primary" />
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Thời gian: ~{service.EstimatedDuration} phút | Km miễn phí: {service.FreeDistanceKm}km
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(service)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(service.ServiceID)}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
