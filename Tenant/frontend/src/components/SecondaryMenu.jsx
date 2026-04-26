/**
 * SecondaryMenu — Booking.com category strip
 *
 * Stays below the blue navbar (top: 60px).
 * White background, blue active indicator, 14px text.
 */

import { useState } from 'react'
import { Box, Button, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const T = {
  blue:   '#006ce4',
  blueLt: '#e8f2ff',
  text:   '#1a1a1a',
  muted:  '#595959',
  white:  '#ffffff',
  border: '#d4d6d9',
  bg:     '#f2f4f8',
  motion: '120ms',
}

const Strip = styled(Box)({
  backgroundColor: T.white,
  borderBottom: `1px solid ${T.border}`,
  position: 'sticky',
  top: 60,            // height of blue navbar
  zIndex: 99,
  overflowX: 'auto',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none',
})

const CatBtn = styled(Button, { shouldForwardProp: p => p !== 'isActive' })(
  ({ isActive }) => ({
    textTransform: 'none',
    fontSize: '0.857rem',
    fontWeight: isActive ? 700 : 400,
    color: isActive ? T.blue : T.muted,
    padding: '10px 16px',
    borderRadius: 0,
    minWidth: 'auto',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    borderBottom: isActive ? `3px solid ${T.blue}` : '3px solid transparent',
    '&:hover': {
      backgroundColor: T.bg,
      color: T.text,
      borderBottom: isActive ? `3px solid ${T.blue}` : `3px solid ${T.border}`,
    },
    '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '-2px' },
    transition: `all ${T.motion} ease`,
  })
)

const DistrictBtn = styled(Button)({
  textTransform: 'none',
  fontSize: '0.857rem',
  fontWeight: 400,
  color: T.text,
  padding: '6px 12px',
  borderRadius: '4px',
  border: `1px solid ${T.border}`,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  height: '32px',
  minWidth: 'auto',
  '&:hover': { backgroundColor: T.bg, borderColor: '#8b8b8b' },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
  transition: `all ${T.motion} ease`,
})

const districts = [
  'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy',
  'Tây Hồ', 'Long Biên', 'Hà Đông', 'Thanh Xuân', 'Hoàng Mai',
  'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm',
]

const categories = [
  { id: 'all',     label: 'Tất cả' },
  { id: 'premium', label: 'Cao cấp' },
  { id: 'mini',    label: 'Chung cư mini' },
  { id: 'duplex',  label: 'Duplex' },
  { id: 'cheap',   label: 'Giá rẻ' },
  { id: 'studio',  label: 'Studio' },
  { id: 'share',   label: 'Ở ghép' },
]

export default function SecondaryMenu({ onCategoryChange, onDistrictChange }) {
  const [active, setActive]             = useState('all')
  const [districtAnchor, setDistrictAnchor] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)

  const handleCat = id => { setActive(id); onCategoryChange?.(id) }
  const handleDistrict = d => {
    setSelectedDistrict(d === selectedDistrict ? null : d)
    onDistrictChange?.(d)
    setDistrictAnchor(null)
  }

  return (
    <Strip role="navigation" aria-label="Bộ lọc phân loại">
      <Stack
        direction="row"
        sx={{
          px: { xs: 2, md: 3 },
          alignItems: 'stretch',
          minWidth: 'max-content',
        }}
      >
        {categories.map(cat => (
          <CatBtn
            key={cat.id}
            isActive={active === cat.id}
            onClick={() => handleCat(cat.id)}
            disableRipple
            aria-current={active === cat.id ? 'true' : undefined}
          >
            {cat.label}
          </CatBtn>
        ))}

        {/* Separator */}
        <Box sx={{ width: 1, my: 1, backgroundColor: T.border, mx: 1, flexShrink: 0 }} />

        {/* District dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DistrictBtn
            endIcon={<ExpandMoreIcon sx={{
              fontSize: 16,
              transition: 'transform 200ms',
              transform: districtAnchor ? 'rotate(180deg)' : 'none',
            }} />}
            onClick={e => setDistrictAnchor(e.currentTarget)}
            aria-label="Chọn khu vực"
            aria-expanded={!!districtAnchor}
            sx={{
              borderColor: selectedDistrict ? T.blue : T.border,
              color: selectedDistrict ? T.blue : T.text,
              fontWeight: selectedDistrict ? 700 : 400,
              backgroundColor: selectedDistrict ? T.blueLt : 'transparent',
            }}
          >
            {selectedDistrict || 'Khu vực'}
          </DistrictBtn>
        </Box>

        <Menu
          anchorEl={districtAnchor}
          open={!!districtAnchor}
          onClose={() => setDistrictAnchor(null)}
          PaperProps={{
            sx: {
              maxHeight: 320, width: 200, borderRadius: '4px', mt: 0.5,
              boxShadow: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
              border: `1px solid ${T.border}`, py: 0.5,
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => handleDistrict(null)}
            sx={{
              fontSize: '0.857rem',
              fontWeight: !selectedDistrict ? 700 : 400,
              color: !selectedDistrict ? T.blue : T.text,
              py: 1,
            }}
          >
            Tất cả khu vực
          </MenuItem>
          {districts.map(d => (
            <MenuItem
              key={d}
              onClick={() => handleDistrict(d)}
              selected={selectedDistrict === d}
              sx={{
                fontSize: '0.857rem', color: T.text, py: 1,
                '&.Mui-selected': { backgroundColor: T.blueLt, color: T.blue, fontWeight: 700 },
                '&.Mui-selected:hover': { backgroundColor: '#d0e8ff' },
              }}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Strip>
  )
}