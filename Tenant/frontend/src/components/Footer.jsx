import { Box, Container, Grid, Typography, Link, Stack, IconButton } from '@mui/material'
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const FooterBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.grey[100],
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  marginTop: 'auto',
}))

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.grey[300],
  textDecoration: 'none',
  transition: 'color 200ms ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

export default function Footer() {
  return (
    <FooterBox>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Về Rentify
            </Typography>
            <Stack spacing={1}>
              <FooterLink href="#">Giới thiệu</FooterLink>
              <FooterLink href="#">Liên hệ</FooterLink>
              <FooterLink href="#">Tuyển dụng</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={1}>
              <FooterLink href="#">Câu hỏi thường gặp</FooterLink>
              <FooterLink href="#">Hướng dẫn sử dụng</FooterLink>
              <FooterLink href="#">Chính sách bảo mật</FooterLink>
              <FooterLink href="#">Điều khoản sử dụng</FooterLink>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Liên kết
            </Typography>
            <Stack spacing={1}>
              <FooterLink href="#">Tin tức</FooterLink>
              <FooterLink href="#">Sự kiện</FooterLink>
              <FooterLink href="#">Cẩm nang thuê trọ</FooterLink>
              <FooterLink href="#">Mẹo hay</FooterLink>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Kết nối với chúng tôi
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <YouTube />
              </IconButton>
            </Stack>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Theo dõi chúng tôi để cập nhật tin tức mới nhất về thị trường phòng trọ
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.800', pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © 2026 Rentify. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </FooterBox>
  )
}
