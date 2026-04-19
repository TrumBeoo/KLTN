import { Box, Container, Grid, Typography, Link, Stack, IconButton, Divider } from '@mui/material'
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material'

export default function Footer() {
  return (
    <Box sx={{ backgroundColor: '#f7f7f7', borderTop: '1px solid #e8e8e8', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Về Rentify
            </Typography>
            <Stack spacing={1.5}>
              {['Giới thiệu', 'Liên hệ', 'Tuyển dụng', 'Blog'].map(item => (
                <Link key={item} href="#" underline="none" sx={{ color: '#6a6a6a', fontSize: '0.875rem', '&:hover': { color: '#222222' }, transition: 'color 150ms' }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={1.5}>
              {['Câu hỏi thường gặp', 'Hướng dẫn sử dụng', 'Chính sách bảo mật', 'Điều khoản sử dụng'].map(item => (
                <Link key={item} href="#" underline="none" sx={{ color: '#6a6a6a', fontSize: '0.875rem', '&:hover': { color: '#222222' }, transition: 'color 150ms' }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Khám phá
            </Typography>
            <Stack spacing={1.5}>
              {['Tin tức', 'Sự kiện', 'Cẩm nang thuê trọ', 'Mẹo hay'].map(item => (
                <Link key={item} href="#" underline="none" sx={{ color: '#6a6a6a', fontSize: '0.875rem', '&:hover': { color: '#222222' }, transition: 'color 150ms' }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kết nối
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              {[Facebook, Twitter, Instagram, YouTube].map((Icon, i) => (
                <IconButton key={i} size="small" sx={{ color: '#6a6a6a', '&:hover': { color: '#222222', backgroundColor: '#e8e8e8' }, borderRadius: '50%', p: 1 }}>
                  <Icon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
              ))}
            </Stack>
            <Typography variant="body2" sx={{ color: '#6a6a6a', lineHeight: 1.6 }}>
              Theo dõi chúng tôi để cập nhật tin tức mới nhất về thị trường phòng trọ
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3, borderColor: '#e8e8e8' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
            © 2026 Rentify, Inc.
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Quyền riêng tư', 'Điều khoản', 'Sơ đồ trang web'].map(item => (
              <Link key={item} href="#" underline="none" sx={{ color: '#6a6a6a', fontSize: '0.8125rem', '&:hover': { color: '#222222' } }}>
                {item}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}