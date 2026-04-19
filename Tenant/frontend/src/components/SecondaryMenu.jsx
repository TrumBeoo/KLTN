import { useState } from 'react'
import { Box, Button, Menu, MenuItem, Stack, Typography, IconButton } from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const MenuContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e8e8e8',
  position: 'sticky',
  height: 35,
  top: 80,
  zIndex: 99,
  overflowX: 'auto',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none',
})

const CategoryButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'isActive',
})(({ isActive }) => ({
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#222222' : '#6a6a6a',
  padding: '4px 12px',
  borderRadius: '16px',
  backgroundColor: isActive ? '#f7f7f7' : 'transparent',
  border: isActive ? '1.5px solid #222222' : '1px solid transparent',
  whiteSpace: 'nowrap',
  minWidth: 'auto',
  height: 28,
  flexShrink: 0,
  '&:hover': {
    backgroundColor: '#f7f7f7',
    color: '#222222',
    border: '1px solid #c1c1c1',
  },
  transition: 'all 150ms ease',
}))

const DistrictButton = styled(Button)({
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#222222',
  padding: '4px 12px',
  borderRadius: '16px',
  border: '1px solid #c1c1c1',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  height: 28,
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#f7f7f7',
    border: '1px solid #222222',
  },
  transition: 'all 150ms ease',
})

const districts = [
  'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy',
  'Tây Hồ', 'Long Biên', 'Hà Đông', 'Thanh Xuân', 'Hoàng Mai',
  'Nam Từ Liêm', 'Bắc Từ Liêm', 'Gia Lâm',
]

const categories = [
  { id: 'all', label: '✦ Tất cả' },
  { id: 'premium', label: '⭐ Cao cấp' },
  { id: 'mini', label: '🏢 Chung cư mini' },
  { id: 'duplex', label: '🏠 Duplex' },
  { id: 'cheap', label: '💰 Giá rẻ' },
  { id: 'studio', label: '🛏 Studio' },
  { id: 'share', label: '👥 Ở ghép' },
]

export default function SecondaryMenu({ onCategoryChange, onDistrictChange }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [districtAnchor, setDistrictAnchor] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)

  const handleCategoryClick = (id) => {
    setActiveCategory(id)
    onCategoryChange?.(id)
  }

  const handleDistrictSelect = (d) => {
    setSelectedDistrict(d === selectedDistrict ? null : d)
    onDistrictChange?.(d)
    setDistrictAnchor(null)
  }

  return (
    <MenuContainer>
      <Stack
        direction="row"
        spacing={1}
        sx={{ px: { xs: 2, md: 4 }, py: 0.5, alignItems: 'center', justifyContent: 'center', minWidth: 'max-content' }}
      >
        {categories.map(cat => (
          <CategoryButton
            key={cat.id}
            isActive={activeCategory === cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            disableRipple
          >
            {cat.label}
          </CategoryButton>
        ))}

        {/* Separator */}
        {/* <Box sx={{ width: 1, height: 28, backgroundColor: '#e8e8e8', flexShrink: 0 }} /> */}

        {/* District Dropdown */}
        <DistrictButton
          endIcon={<ExpandMoreIcon sx={{ fontSize: '1rem', transition: 'transform 200ms', transform: districtAnchor ? 'rotate(180deg)' : 'none' }} />}
          onClick={e => setDistrictAnchor(e.currentTarget)}
          sx={{ borderColor: selectedDistrict ? '#222222' : '#c1c1c1', fontWeight: selectedDistrict ? 600 : 500 }}
        >
          {selectedDistrict || 'Khu vực'}
        </DistrictButton>

        <Menu
          anchorEl={districtAnchor}
          open={!!districtAnchor}
          onClose={() => setDistrictAnchor(null)}
          PaperProps={{
            sx: {
              maxHeight: 280, width: 200, borderRadius: '12px', mt: 0.5,
              boxShadow: 'rgba(0,0,0,0.20) 0px 12px 40px',
              border: '1px solid #e8e8e8',
              py: 0.5,
            }
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => handleDistrictSelect(null)}
            sx={{ fontSize: '0.875rem', fontWeight: selectedDistrict === null ? 600 : 400, color: '#222222', py: 1.25 }}
          >
            Tất cả khu vực
          </MenuItem>
          {districts.map(d => (
            <MenuItem
              key={d}
              onClick={() => handleDistrictSelect(d)}
              selected={selectedDistrict === d}
              sx={{ fontSize: '0.875rem', color: '#222222', py: 1.25, '&.Mui-selected': { backgroundColor: '#f7f7f7', fontWeight: 600 } }}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </MenuContainer>
  )
}