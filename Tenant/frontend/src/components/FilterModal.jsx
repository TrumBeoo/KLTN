/**
 * FilterModal — Booking.com style redesign
 *
 * Clean white dialog, blue accents, 14px base font.
 * Sections separated by dividers (not colored backgrounds).
 * WCAG 2.2 AA.
 */

import { useState, useEffect } from 'react'
import {
  Dialog, Box, TextField, Button, Stack, FormGroup,
  FormControlLabel, Checkbox, Typography, Slider, Divider,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const T = {
  blue:   '#006ce4',
  blueLt: '#e8f2ff',
  text:   '#1a1a1a',
  muted:  '#595959',
  bg:     '#f2f4f8',
  white:  '#ffffff',
  border: '#d4d6d9',
}

function Section({ title, children, enabled, onToggle }) {
  return (
    <Box sx={{ py: 2.5, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: enabled ? 1.5 : 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text }}>{title}</Typography>
        {onToggle && (
          <Checkbox
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            size="small"
            sx={{
              color: T.border,
              '&.Mui-checked': { color: T.blue },
              '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
            }}
          />
        )}
      </Stack>
      {enabled && children}
    </Box>
  )
}

export default function FilterModal({ open, onClose, onApply, initialFilters }) {
  const [districts, setDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [priceRange, setPriceRange] = useState([2, 10])
  const [areaRange, setAreaRange]   = useState([20, 50])
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [selectedPOIs, setSelectedPOIs] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(['all'])
  const [pois, setPois] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [amenities, setAmenities] = useState([])
  
  // Checkbox states for enabling/disabling filters
  const [enableDistrict, setEnableDistrict] = useState(false)
  const [enablePrice, setEnablePrice] = useState(false)
  const [enableArea, setEnableArea] = useState(false)
  const [enableRoomType, setEnableRoomType] = useState(false)
  const [enableAmenities, setEnableAmenities] = useState(false)
  const [enablePOIs, setEnablePOIs] = useState(false)
  const [enableStatus, setEnableStatus] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (open) {
      fetchDistricts()
      fetchPOIs()
      fetchRoomTypes()
      fetchAmenities()
      loadInitialFilters()
    }
  }, [open, initialFilters])

  const loadInitialFilters = () => {
    if (!initialFilters) return

    // Load district
    if (initialFilters.district) {
      setSelectedDistrict(initialFilters.district)
      setEnableDistrict(true)
    }

    // Load price range
    if (initialFilters.minPrice || initialFilters.maxPrice) {
      const minPrice = initialFilters.minPrice ? initialFilters.minPrice / 1000000 : 2
      const maxPrice = initialFilters.maxPrice ? initialFilters.maxPrice / 1000000 : 10
      setPriceRange([minPrice, maxPrice])
      setEnablePrice(true)
    }

    // Load area range
    if (initialFilters.minArea || initialFilters.maxArea) {
      const minArea = initialFilters.minArea || 20
      const maxArea = initialFilters.maxArea || 50
      setAreaRange([minArea, maxArea])
      setEnableArea(true)
    }

    // Load room types
    if (initialFilters.roomTypes && initialFilters.roomTypes.length > 0) {
      setSelectedRoomTypes(initialFilters.roomTypes)
      setEnableRoomType(true)
    }

    // Load amenities
    if (initialFilters.amenities && initialFilters.amenities.length > 0) {
      setSelectedAmenities(initialFilters.amenities)
      setEnableAmenities(true)
    }

    // Load POIs
    if (initialFilters.pois && initialFilters.pois.length > 0) {
      setSelectedPOIs(initialFilters.pois)
      setEnablePOIs(true)
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/filters/room-types`)
      const data = await res.json()
      if (data.success) setRoomTypes(data.data || [])
    } catch {}
  }

  const fetchAmenities = async () => {
    try {
      const res = await fetch(`${API_URL}/filters/amenities`)
      const data = await res.json()
      if (data.success) setAmenities(data.data || [])
    } catch {}
  }

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${API_URL}/locations/districts`)
      const data = await res.json()
      if (data.success) setDistricts(data.data || [])
    } catch {}
  }

  const fetchPOIs = async () => {
    try {
      const types = ['park', 'supermarket', 'hospital', 'market', 'gym', 'bank', 'cafe', 'mall', 'school', 'university']
      const promises = types.map(type => 
        fetch(`${API_URL}/locations/pois?type=${type}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      const allPOIs = results.flatMap(data => data.success && data.data ? data.data : [])
      
      // Thêm label tiếng Việt cho mỗi POI
      const poiLabels = {
        'park': 'Công viên',
        'supermarket': 'Siêu thị',
        'hospital': 'Bệnh viện',
        'market': 'Chợ/Quán ăn',
        'gym': 'Gym/Thể thao',
        'bank': 'Ngân hàng',
        'cafe': 'Cafe/Coworking',
        'mall': 'Trung tâm thương mại',
        'school': 'Trường học',
        'university': 'Đại học',
      }
      
      const mappedPOIs = allPOIs.map(poi => ({
        ...poi,
        TypeLabel: poiLabels[poi.POIType?.toLowerCase()] || poi.POIType
      }))
      
      setPois(mappedPOIs.filter(p => p.RoomCount > 0).slice(0, 20))
    } catch {}
  }

  const handleApply = () => {
    const filters = {
      district: enableDistrict ? selectedDistrict : null,
      minPrice: enablePrice ? priceRange[0] * 1000000 : null,
      maxPrice: enablePrice ? priceRange[1] * 1000000 : null,
      minArea: enableArea ? areaRange[0] : null,
      maxArea: enableArea ? areaRange[1] : null,
      roomTypes: enableRoomType ? selectedRoomTypes : [],
      amenities: enableAmenities ? selectedAmenities : [],
      pois: enablePOIs ? selectedPOIs : [],
      status: enableStatus ? selectedStatus : [],
    }
    onApply?.(filters)
    onClose()
  }

  const handleReset = () => {
    setSelectedDistrict('')
    setPriceRange([2, 10])
    setAreaRange([20, 50])
    setSelectedRoomTypes([])
    setSelectedAmenities([])
    setSelectedPOIs([])
    setSelectedStatus(['all'])
    setEnableDistrict(false)
    setEnablePrice(false)
    setEnableArea(false)
    setEnableRoomType(false)
    setEnableAmenities(false)
    setEnablePOIs(false)
    setEnableStatus(false)
    
    // Apply reset immediately
    onApply?.({
      district: null,
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      roomTypes: [],
      amenities: [],
      pois: [],
      status: [],
    })
    onClose()
  }

  return (
    <Dialog
      open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '8px', maxHeight: '90vh', m: { xs: 1, sm: 2 } } }}
      aria-labelledby="filter-dialog-title"
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, py: 2, borderBottom: `1px solid ${T.border}`,
      }}>
        <Box sx={{ width: 32 }} />
        <Typography id="filter-dialog-title" sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text }}>
          Bộ lọc tìm kiếm
        </Typography>
        <IconButton
          size="small" onClick={onClose} aria-label="Đóng bộ lọc"
          sx={{
            color: T.text, width: 32, height: 32, borderRadius: '50%',
            '&:hover': { backgroundColor: T.bg },
            '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 0, overflowY: 'auto' }}>
        {/* District */}
        <Section title="Khu vực" enabled={enableDistrict} onToggle={setEnableDistrict}>
          <TextField
            select fullWidth size="small"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            aria-label="Chọn quận huyện"
            SelectProps={{ native: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px', fontSize: '0.857rem' } }}
          >
            <option value="">Tất cả khu vực</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </TextField>
        </Section>

        {/* Price */}
        <Section title="Khoảng giá (triệu VNĐ/tháng)" enabled={enablePrice} onToggle={setEnablePrice}>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted, mb: 2 }}>
            {priceRange[0]} triệu — {priceRange[1]} triệu
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_, v) => setPriceRange(v)}
            min={0} max={20} step={0.5}
            marks={[{ value: 0, label: '0' }, { value: 10, label: '10tr' }, { value: 20, label: '20tr+' }]}
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v}tr`}
            getAriaLabel={(index) => index === 0 ? 'Giá tối thiểu' : 'Giá tối đa'}
            sx={{
              color: T.blue,
              '& .MuiSlider-thumb': { backgroundColor: T.white, border: `2px solid ${T.blue}` },
              '& .MuiSlider-track': { border: 'none' },
              '& .MuiSlider-rail': { backgroundColor: T.border },
              '& .MuiSlider-markLabel': { fontSize: '0.786rem', color: T.muted },
            }}
          />
        </Section>

        {/* Area */}
        <Section title="Diện tích (m²)" enabled={enableArea} onToggle={setEnableArea}>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted, mb: 2 }}>
            {areaRange[0]}m² — {areaRange[1]}m²
          </Typography>
          <Slider
            value={areaRange}
            onChange={(_, v) => setAreaRange(v)}
            min={0} max={100}
            marks={[{ value: 0, label: '0' }, { value: 50, label: '50m²' }, { value: 100, label: '100+' }]}
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v}m²`}
            getAriaLabel={(index) => index === 0 ? 'Diện tích tối thiểu' : 'Diện tích tối đa'}
            sx={{
              color: T.blue,
              '& .MuiSlider-thumb': { backgroundColor: T.white, border: `2px solid ${T.blue}` },
              '& .MuiSlider-track': { border: 'none' },
              '& .MuiSlider-rail': { backgroundColor: T.border },
              '& .MuiSlider-markLabel': { fontSize: '0.786rem', color: T.muted },
            }}
          />
        </Section>

        {/* Room type */}
        <Section title="Loại phòng" enabled={enableRoomType} onToggle={setEnableRoomType}>
          <FormGroup>
            {roomTypes.map(type => (
              <FormControlLabel
                key={type.value}
                control={
                  <Checkbox 
                    size="small" 
                    checked={selectedRoomTypes.includes(type.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoomTypes([...selectedRoomTypes, type.value])
                      } else {
                        setSelectedRoomTypes(selectedRoomTypes.filter(t => t !== type.value))
                      }
                    }}
                    sx={{ color: T.border, '&.Mui-checked': { color: T.blue }, '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' } }} 
                  />
                }
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{type.label}</Typography>}
                sx={{ mb: 0.25, ml: 0 }}
              />
            ))}
          </FormGroup>
        </Section>

        {/* Amenities */}
        <Section title="Tiện nghi" enabled={enableAmenities} onToggle={setEnableAmenities}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {amenities.slice(0, 12).map(amenity => (
              <FormControlLabel
                key={amenity.value}
                control={
                  <Checkbox 
                    size="small" 
                    checked={selectedAmenities.includes(amenity.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAmenities([...selectedAmenities, amenity.value])
                      } else {
                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.value))
                      }
                    }}
                    sx={{ color: T.border, '&.Mui-checked': { color: T.blue } }} 
                  />
                }
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{amenity.label}</Typography>}
                sx={{ mb: 0.25, ml: 0 }}
              />
            ))}
          </Box>
        </Section>

        {/* Nearby Amenities */}
        <Section title="Tiện ích xung quanh" enabled={enablePOIs} onToggle={setEnablePOIs}>
          {pois.length > 0 ? (
            <FormGroup>
              {pois.slice(0, 10).map(poi => (
                <FormControlLabel
                  key={poi.POIID}
                  control={
                    <Checkbox 
                      size="small" 
                      checked={selectedPOIs.includes(poi.POIID)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPOIs([...selectedPOIs, poi.POIID])
                        } else {
                          setSelectedPOIs(selectedPOIs.filter(id => id !== poi.POIID))
                        }
                      }}
                      sx={{ color: T.border, '&.Mui-checked': { color: T.blue } }} 
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontSize: '0.929rem', color: T.text }}>
                        {poi.TypeLabel} - {poi.POIName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>
                        {poi.RoomCount} phòng
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 0.5, ml: 0, alignItems: 'flex-start' }}
                />
              ))}
            </FormGroup>
          ) : (
            <Typography sx={{ fontSize: '0.857rem', color: T.muted, fontStyle: 'italic' }}>
              Đang tải tiện ích...
            </Typography>
          )}
        </Section>

        {/* Status */}
        <Section title="Trạng thái phòng" enabled={enableStatus} onToggle={setEnableStatus}>
          <FormGroup>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'available', label: 'Còn trống' },
              { value: 'pending', label: 'Sắp có' },
            ].map(status => (
              <FormControlLabel
                key={status.value}
                control={
                  <Checkbox 
                    size="small" 
                    checked={selectedStatus.includes(status.value)}
                    onChange={(e) => {
                      if (status.value === 'all') {
                        setSelectedStatus(e.target.checked ? ['all'] : [])
                      } else {
                        let newStatus = selectedStatus.filter(s => s !== 'all')
                        if (e.target.checked) {
                          newStatus = [...newStatus, status.value]
                        } else {
                          newStatus = newStatus.filter(s => s !== status.value)
                        }
                        setSelectedStatus(newStatus.length === 0 ? ['all'] : newStatus)
                      }
                    }}
                    sx={{ color: T.border, '&.Mui-checked': { color: T.blue } }} 
                  />
                }
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{status.label}</Typography>}
                sx={{ mb: 0.25, ml: 0 }}
              />
            ))}
          </FormGroup>
        </Section>
      </Box>

      {/* Footer */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, py: 2, borderTop: `1px solid ${T.border}`,
      }}>
        <Button
          onClick={handleReset}
          aria-label="Xóa toàn bộ bộ lọc"
          sx={{
            color: T.text, fontSize: '0.857rem', fontWeight: 700,
            textDecoration: 'underline', p: 0,
            '&:hover': { backgroundColor: 'transparent', color: T.blue },
            '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
          }}
        >
          Xóa bộ lọc
        </Button>
        <Button
          onClick={handleApply} variant="contained"
          aria-label="Áp dụng bộ lọc"
          sx={{
            backgroundColor: T.blue, borderRadius: '4px',
            px: 3, py: 1.25, fontWeight: 700, fontSize: '0.929rem',
            '&:hover': { backgroundColor: T.blueDk },
            '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
          }}
        >
          Xem kết quả
        </Button>
      </Box>
    </Dialog>
  )
}