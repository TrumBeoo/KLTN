import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Slider,
  Grid,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}))

export default function FilterModal({ open, onClose, onApply }) {
  const handleApply = () => {
    onApply()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Bộ lọc tìm kiếm</DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Location Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Khu vực
            </Typography>
            <Stack spacing={1}>
              <TextField
                select
                label="Quận"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="hcm">Ba Đình</option>
                <option value="hn">Cầu Giấy</option>
                <option value="dn">Tây Hồ</option>
              </TextField>
             
            </Stack>
          </FilterSection>

          {/* Price Range Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              💰 Khoảng giá (triệu VNĐ/tháng)
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Từ 2tr đến 10tr
                </Typography>
                <Slider
                  range
                  min={0}
                  max={20}
                  defaultValue={[2, 10]}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 20, label: '20tr+' },
                  ]}
                />
              </Box>
            </Stack>
          </FilterSection>

          {/* Area Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              📐 Diện tích (m²)
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Từ 20m² đến 50m²
                </Typography>
                <Slider
                  range
                  min={0}
                  max={100}
                  defaultValue={[20, 50]}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 100, label: '100+' },
                  ]}
                />
              </Box>
            </Stack>
          </FilterSection>

          {/* Room Type Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              🏠 Loại phòng
            </Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="Phòng khép kín" />
              <FormControlLabel control={<Checkbox />} label="Studio" />
              <FormControlLabel control={<Checkbox />} label="Ở ghép" />
              <FormControlLabel control={<Checkbox />} label="1 phòng ngủ + 1 khách" />
              <FormControlLabel control={<Checkbox />} label="Duplex" />
            </FormGroup>
          </FilterSection>

          {/* Amenities Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              ⭐ Tiện nghi
            </Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="📶 Wifi" />
              <FormControlLabel control={<Checkbox />} label="❄️ Điều hòa" />
              <FormControlLabel control={<Checkbox />} label="🚿 Nóng lạnh" />
              <FormControlLabel control={<Checkbox />} label="🧺 Máy giặt" />
              <FormControlLabel control={<Checkbox />} label="🏍️ Bãi đậu xe" />
              <FormControlLabel control={<Checkbox />} label="🔒 An ninh 24/7" />
            </FormGroup>
          </FilterSection>

          {/* Status Filter */}
          <FilterSection>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              ⭕ Trạng thái
            </Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Tất cả" />
              <FormControlLabel control={<Checkbox />} label="Trống" />
              <FormControlLabel control={<Checkbox />} label="Đang đặt lịch" />
              <FormControlLabel control={<Checkbox />} label="Sắp có" />
            </FormGroup>
          </FilterSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Xóa bộ lọc
        </Button>
        <Button onClick={handleApply} variant="contained">
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  )
}
