import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, Button, Stack, FormGroup, FormControlLabel,
  Checkbox, Typography, Slider, Divider,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const Section = ({ title, children }) => (
  <Box sx={{ py: 3, borderBottom: '1px solid #e8e8e8', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222', mb: 2 }}>{title}</Typography>
    {children}
  </Box>
)

export default function FilterModal({ open, onClose, onApply }) {
  const handleApply = () => { onApply(); onClose() }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', maxHeight: '90vh', m: { xs: 2, sm: 3 } }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #e8e8e8' }}>
        <Box sx={{ width: 32 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#222222' }}>Bộ lọc</Typography>
        <Box
          onClick={onClose}
          sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', '&:hover': { backgroundColor: '#f2f2f2' } }}
        >
          <CloseIcon sx={{ fontSize: '1.125rem', color: '#222222' }} />
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Section title="📍 Khu vực">
          <TextField
            select
            label="Quận / Huyện"
            fullWidth
            size="small"
            SelectProps={{ native: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          >
            <option value="">Tất cả khu vực</option>
            <option value="badinh">Ba Đình</option>
            <option value="caugiay">Cầu Giấy</option>
            <option value="tayho">Tây Hồ</option>
            <option value="dongda">Đống Đa</option>
            <option value="haibatrung">Hai Bà Trưng</option>
            <option value="hadong">Hà Đông</option>
            <option value="thanxuan">Thanh Xuân</option>
          </TextField>
        </Section>

        <Section title="💰 Khoảng giá">
          <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 2 }}>Từ 2 triệu đến 10 triệu VNĐ/tháng</Typography>
          <Slider
            range
            min={0}
            max={20}
            defaultValue={[2, 10]}
            marks={[{ value: 0, label: '0' }, { value: 20, label: '20tr+' }]}
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v}tr`}
            sx={{ color: '#222222', '& .MuiSlider-thumb': { backgroundColor: '#fff', border: '2px solid #222222' } }}
          />
        </Section>

        <Section title="📐 Diện tích">
          <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 2 }}>Từ 20m² đến 50m²</Typography>
          <Slider
            range min={0} max={100}
            defaultValue={[20, 50]}
            marks={[{ value: 0, label: '0' }, { value: 100, label: '100+' }]}
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v}m²`}
            sx={{ color: '#222222', '& .MuiSlider-thumb': { backgroundColor: '#fff', border: '2px solid #222222' } }}
          />
        </Section>

        <Section title="🏠 Loại phòng">
          <FormGroup>
            {['Phòng khép kín', 'Studio', 'Ở ghép', '1 phòng ngủ + phòng khách', 'Duplex', 'Chung cư mini'].map(t => (
              <FormControlLabel
                key={t}
                control={<Checkbox sx={{ color: '#c1c1c1', '&.Mui-checked': { color: '#222222' } }} />}
                label={<Typography sx={{ fontSize: '0.9375rem', color: '#222222' }}>{t}</Typography>}
                sx={{ mb: 0.5, ml: 0 }}
              />
            ))}
          </FormGroup>
        </Section>

        <Section title="⭐ Tiện nghi">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[['📶 Wifi', '❄️ Điều hòa'], ['🚿 Nóng lạnh', '🧺 Máy giặt'], ['🏍️ Bãi đậu xe', '🔒 An ninh 24/7']].flat().map(item => (
              <FormControlLabel
                key={item}
                control={<Checkbox sx={{ color: '#c1c1c1', '&.Mui-checked': { color: '#222222' } }} />}
                label={<Typography sx={{ fontSize: '0.9375rem', color: '#222222' }}>{item}</Typography>}
                sx={{ mb: 0.5, ml: 0 }}
              />
            ))}
          </Box>
        </Section>

        <Section title="⭕ Trạng thái">
          <FormGroup>
            {[['Tất cả', true], ['Còn trống', false], ['Đang đặt lịch', false], ['Sắp có', false]].map(([label, checked]) => (
              <FormControlLabel
                key={label}
                control={<Checkbox defaultChecked={checked} sx={{ color: '#c1c1c1', '&.Mui-checked': { color: '#222222' } }} />}
                label={<Typography sx={{ fontSize: '0.9375rem', color: '#222222' }}>{label}</Typography>}
                sx={{ mb: 0.5, ml: 0 }}
              />
            ))}
          </FormGroup>
        </Section>
      </DialogContent>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderTop: '1px solid #e8e8e8' }}>
        <Button
          onClick={onClose}
          sx={{ color: '#222222', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'underline', p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
        >
          Xóa bộ lọc
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{ backgroundColor: '#222222', '&:hover': { backgroundColor: '#3f3f3f' }, borderRadius: '8px', px: 3, py: 1.25, fontWeight: 600, fontSize: '0.9375rem' }}
        >
          Áp dụng
        </Button>
      </Box>
    </Dialog>
  )
}