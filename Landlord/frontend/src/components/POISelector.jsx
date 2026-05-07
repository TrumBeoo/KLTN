import { useState, useEffect } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert
} from '@mui/material'
import { LocationOn as LocationIcon } from '@mui/icons-material'

export default function POISelector({ value = [], onChange, district }) {
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPOIs, setSelectedPOIs] = useState(value)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api'
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchPOIs()
  }, [district])

  useEffect(() => {
    setSelectedPOIs(value)
  }, [value])

  const fetchPOIs = async () => {
    try {
      setLoading(true)
      // Lấy toàn bộ POI từ database với room count
      const url = district 
        ? `${API_URL}/locations/pois?district=${encodeURIComponent(district)}`
        : `${API_URL}/locations/pois`
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        // Map dữ liệu từ endpoint mới
        const mappedPOIs = data.data.map(poi => ({
          POIID: poi.POIID,
          Name: poi.POIName,
          Address: poi.Address || '',
          TypeCode: poi.POIType || 'other',
          District: poi.District || '',
          RoomCount: poi.RoomCount || 0,
          AvgPrice: poi.AvgPrice || 0,
          ImageURL: poi.ImageURL || '',
        }))
        
        setPois(mappedPOIs)
      }
    } catch (error) {
      console.error('Fetch POIs error:', error)
      // Fallback: thử endpoint cũ
      try {
        const fallbackUrl = district 
          ? `${API_URL}/poi?district=${encodeURIComponent(district)}`
          : `${API_URL}/poi`
        
        const response = await fetch(fallbackUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        
        if (data.success) {
          setPois(data.data || [])
        }
      } catch (fallbackError) {
        console.error('Fallback fetch POIs error:', fallbackError)
        setPois([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const value = event.target.value
    setSelectedPOIs(typeof value === 'string' ? value.split(',') : value)
    onChange(typeof value === 'string' ? value.split(',') : value)
  }

  const getPoiLabel = (poiId) => {
    const poi = pois.find(p => p.POIID === poiId)
    return poi ? `${poi.Name} (${poi.TypeCode})` : poiId
  }

  const groupedPOIs = pois.reduce((acc, poi) => {
    const type = poi.TypeCode || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(poi)
    return acc
  }, {})

  const typeLabels = {
    university: '🎓 Trường đại học',
    metro: '🚇 Ga tàu điện',
    hospital: '🏥 Bệnh viện',
    mall: '🏪 Trung tâm thương mại',
    market: '🛒 Chợ',
    gym: '💪 Phòng gym',
    park: '🌳 Công viên',
    bank: '🏦 Ngân hàng',
    cafe: '☕ Quán cafe',
    supermarket: '🏬 Siêu thị',
    other: '📍 Khác'
  }

  return (
    <Box>
      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Đang tải dữ liệu POI từ database...
        </Alert>
      )}
      
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Chọn POI gần phòng</InputLabel>
        <Select
          multiple
          value={selectedPOIs}
          onChange={handleChange}
          input={<OutlinedInput label="Chọn POI gần phòng" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={getPoiLabel(value)} 
                  size="small"
                  icon={<LocationIcon sx={{ fontSize: 16 }} />}
                />
              ))}
            </Box>
          )}
        >
          {Object.keys(groupedPOIs).length === 0 && (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Đang tải...' : 'Không có POI nào'}
              </Typography>
            </MenuItem>
          )}
          
          {pois.length > 0 && (
            <MenuItem disabled sx={{ fontWeight: 700, backgroundColor: 'action.hover', py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                📊 Tổng: {pois.length} POI {district && `• Quận: ${district}`}
              </Typography>
            </MenuItem>
          )}
          
          {Object.entries(groupedPOIs).map(([type, typePOIs]) => [
            <MenuItem key={`header-${type}`} disabled sx={{ fontWeight: 700, backgroundColor: 'action.hover' }}>
              {typeLabels[type] || type} ({typePOIs.length})
            </MenuItem>,
            ...typePOIs.map((poi) => (
              <MenuItem key={poi.POIID} value={poi.POIID}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <LocationIcon sx={{ fontSize: 18, color: 'action.active' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{poi.Name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {poi.Address} {poi.RoomCount > 0 && `• ${poi.RoomCount} phòng`}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          ])}
        </Select>
      </FormControl>

      {selectedPOIs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            ✓ Đã chọn {selectedPOIs.length} POI. Phòng sẽ hiển thị trong các section: Gần trường ĐH, Gần tàu điện, Tiện ích xung quanh
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedPOIs.map(poiId => {
              const poi = pois.find(p => p.POIID === poiId)
              return poi ? (
                <Chip
                  key={poiId}
                  label={`${poi.Name} (${poi.RoomCount} phòng)`}
                  size="small"
                  variant="outlined"
                  icon={<LocationIcon sx={{ fontSize: 14 }} />}
                />
              ) : null
            })}
          </Box>
        </Box>
      )}
      
      {pois.length > 0 && (
        <Typography variant="caption" color="success.main" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
          ✅ Đã tải {pois.length} POI từ database
        </Typography>
      )}
    </Box>
  )
}
