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

function Section({ title, children }) {
  return (
    <Box sx={{ py: 2.5, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5 }}>{title}</Typography>
      {children}
    </Box>
  )
}

export default function FilterModal({ open, onClose, onApply }) {
  const [districts, setDistricts] = useState([])
  const [priceRange, setPriceRange] = useState([2, 10])
  const [areaRange, setAreaRange]   = useState([20, 50])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (open) fetchDistricts()
  }, [open])

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${API_URL}/locations/districts`)
      const data = await res.json()
      if (data.success) setDistricts(data.data || [])
    } catch {}
  }

  const handleApply = () => { onApply?.(); onClose() }

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
        <Section title="Khu vực">
          <TextField
            select fullWidth size="small"
            aria-label="Chọn quận huyện"
            SelectProps={{ native: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px', fontSize: '0.857rem' } }}
          >
            <option value="">Tất cả khu vực</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </TextField>
        </Section>

        {/* Price */}
        <Section title="Khoảng giá (triệu VNĐ/tháng)">
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
            aria-label="Khoảng giá"
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
        <Section title="Diện tích (m²)">
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
            aria-label="Diện tích"
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
        <Section title="Loại phòng">
          <FormGroup>
            {['Phòng khép kín', 'Studio', 'Ở ghép', '1 phòng ngủ + phòng khách', 'Duplex', 'Chung cư mini'].map(t => (
              <FormControlLabel
                key={t}
                control={<Checkbox size="small" sx={{ color: T.border, '&.Mui-checked': { color: T.blue }, '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' } }} />}
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{t}</Typography>}
                sx={{ mb: 0.25, ml: 0 }}
              />
            ))}
          </FormGroup>
        </Section>

        {/* Amenities */}
        <Section title="Tiện nghi">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {['Wifi', 'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Bãi đậu xe', 'An ninh 24/7'].map(item => (
              <FormControlLabel
                key={item}
                control={<Checkbox size="small" sx={{ color: T.border, '&.Mui-checked': { color: T.blue } }} />}
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{item}</Typography>}
                sx={{ mb: 0.25, ml: 0 }}
              />
            ))}
          </Box>
        </Section>

        {/* Status */}
        <Section title="Trạng thái phòng">
          <FormGroup>
            {[['Tất cả', true], ['Còn trống', false], ['Sắp có', false]].map(([label, checked]) => (
              <FormControlLabel
                key={label}
                control={<Checkbox defaultChecked={checked} size="small" sx={{ color: T.border, '&.Mui-checked': { color: T.blue } }} />}
                label={<Typography sx={{ fontSize: '0.929rem', color: T.text }}>{label}</Typography>}
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
          onClick={onClose}
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