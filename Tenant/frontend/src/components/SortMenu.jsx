/**
 * SortMenu — Dropdown menu sắp xếp cho ListingPage
 * 
 * Thiết kế theo Booking.com style với các tùy chọn sắp xếp phổ biến
 */

import { useState } from 'react'
import {
  Button, Menu, MenuItem, Box, Typography, ListItemIcon,
} from '@mui/material'
import {
  Sort as SortIcon,
  KeyboardArrowDown as ArrowDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
} from '@mui/icons-material'

const T = {
  blue:   '#006ce4',
  blueDk: '#003f8a',
  text:   '#1a1a1a',
  muted:  '#595959',
  bg:     '#f2f4f8',
  white:  '#ffffff',
  border: '#d4d6d9',
}

const sortOptions = [
  { value: 'newest', label: 'Mới nhất', icon: <ScheduleIcon sx={{ fontSize: 16 }} /> },
  { value: 'oldest', label: 'Cũ nhất', icon: <ScheduleIcon sx={{ fontSize: 16 }} /> },
  { value: 'price-asc', label: 'Giá: Thấp → Cao', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
  { value: 'price-desc', label: 'Giá: Cao → Thấp', icon: <TrendingDownIcon sx={{ fontSize: 16 }} /> },
  { value: 'area-asc', label: 'Diện tích: Nhỏ → Lớn', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
  { value: 'area-desc', label: 'Diện tích: Lớn → Nhỏ', icon: <TrendingDownIcon sx={{ fontSize: 16 }} /> },
  { value: 'rating', label: 'Đánh giá cao nhất', icon: <StarIcon sx={{ fontSize: 16 }} /> },
  { value: 'views', label: 'Xem nhiều nhất', icon: <VisibilityIcon sx={{ fontSize: 16 }} /> },
]

export default function SortMenu({ currentSort = 'newest', onSortChange }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (value) => {
    onSortChange?.(value)
    handleClose()
  }

  const currentOption = sortOptions.find(opt => opt.value === currentSort) || sortOptions[0]

  return (
    <>
      <Button
        size="small"
        onClick={handleClick}
        endIcon={<ArrowDownIcon sx={{ fontSize: 16 }} />}
        aria-label="Sắp xếp danh sách phòng"
        aria-expanded={open}
        aria-haspopup="true"
        sx={{
          color: T.text,
          border: `1px solid ${T.border}`,
          borderRadius: '4px',
          fontSize: '0.857rem',
          fontWeight: 600,
          px: 1.5,
          py: 0.75,
          backgroundColor: open ? T.bg : T.white,
          '&:hover': {
            borderColor: T.text,
            backgroundColor: T.bg,
          },
          '&:focus-visible': {
            outline: `2px solid ${T.blue}`,
            outlineOffset: '2px',
          },
          transition: 'all 120ms ease',
        }}
      >
        <SortIcon sx={{ fontSize: 16, mr: 0.5 }} />
        {currentOption.label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 240,
            borderRadius: '4px',
            mt: 0.5,
            boxShadow: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
            border: `1px solid ${T.border}`,
            py: 0.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: T.text }}>
            Sắp xếp theo
          </Typography>
        </Box>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            selected={currentSort === option.value}
            sx={{
              py: 1.25,
              px: 2,
              fontSize: '0.857rem',
              color: currentSort === option.value ? T.blue : T.text,
              fontWeight: currentSort === option.value ? 700 : 400,
              backgroundColor: currentSort === option.value ? T.blueLt : 'transparent',
              '&:hover': {
                backgroundColor: currentSort === option.value ? T.blueLt : T.bg,
              },
              '&.Mui-selected': {
                backgroundColor: T.blueLt,
                '&:hover': {
                  backgroundColor: T.blueLt,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
              {option.icon}
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>{option.label}</Box>
            {currentSort === option.value && (
              <CheckIcon sx={{ fontSize: 16, color: T.blue, ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
