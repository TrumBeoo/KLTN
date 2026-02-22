import { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const MenuContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  padding: theme.spacing(1.5, 0),
  position: 'sticky',
  top: 64,
  zIndex: 99,
}))

const CategoryButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  padding: theme.spacing(0.75, 1.5),
  borderRadius: theme.spacing(0.5),
  backgroundColor: isActive ? theme.palette.primary.light + '20' : 'transparent',
  '&:hover': {
    backgroundColor: isActive ? theme.palette.primary.light + '30' : theme.palette.grey[50],
    color: theme.palette.primary.main,
  },
  transition: 'all 200ms ease',
}))

const DistrictButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.75, 1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.primary.main,
  },
  transition: 'all 200ms ease',
}))

const districts = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
  'Quận 11', 'Quận 12', 'Quận Tân Bình', 'Quận Tân Phú',
  'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận',
]

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'premium', label: 'Cao cấp' },
  { id: 'mini', label: 'Chung cư mini' },
  { id: 'duplex', label: 'Duplex' },
  { id: 'cheap', label: 'Giá rẻ' },
]

export default function SecondaryMenu({ onCategoryChange, onDistrictChange }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [districtAnchor, setDistrictAnchor] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState('Quận')

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)
    onCategoryChange?.(categoryId)
  }

  const handleDistrictOpen = (e) => {
    setDistrictAnchor(e.currentTarget)
  }

  const handleDistrictClose = () => {
    setDistrictAnchor(null)
  }

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district)
    onDistrictChange?.(district)
    handleDistrictClose()
  }

  return (
    <MenuContainer>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, px: { xs: 2, md: 3 } }}>
        {/* Category Buttons */}
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            isActive={activeCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.label}
          </CategoryButton>
        ))}

        {/* District Dropdown */}
        <Box sx={{ display: 'flex' }}>
          <DistrictButton
            onClick={handleDistrictOpen}
            endIcon={<ExpandMoreIcon sx={{ fontSize: '1.25rem' }} />}
          >
            {selectedDistrict}
          </DistrictButton>
            <Menu
              anchorEl={districtAnchor}
              open={!!districtAnchor}
              onClose={handleDistrictClose}
              PaperProps={{
                sx: {
                  maxHeight: 300,
                  width: 200,
                },
              }}
            >
              <MenuItem onClick={() => handleDistrictSelect('Quận')}>
                <Typography sx={{ fontWeight: 500 }}>Tất cả quận</Typography>
              </MenuItem>
              {districts.map((district) => (
                <MenuItem
                  key={district}
                  onClick={() => handleDistrictSelect(district)}
                  selected={selectedDistrict === district}
                >
                  {district}
                </MenuItem>
              ))}
            </Menu>
        </Box>
      </Stack>
    </MenuContainer>
  )
}
