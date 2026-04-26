/**
 * Footer — Booking.com style redesign
 *
 * Booking.com footer: dark gray background, multi-column links,
 * bottom copyright bar, no social icons in primary area.
 * Tokens from UI_Design.md.
 */

import { Box, Container, Grid, Typography, Link, Stack, Divider, IconButton } from '@mui/material'
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material'

const T = {
  blue:   '#006ce4',
  text:   '#1a1a1a',
  muted:  '#595959',
  white:  '#ffffff',
  border: '#d4d6d9',
  bgDark: '#1a1a1a',
  bgMid:  '#333333',
  shadow1:'rgba(26,26,26,0.16) 0px 2px 8px 0px',
}

function FooterLink({ children, href = '#' }) {
  return (
    <Link
      href={href} underline="none"
      sx={{
        color: '#b2b2b2', fontSize: '0.857rem', lineHeight: 2,
        display: 'block',
        '&:hover': { color: T.white, textDecoration: 'underline' },
        transition: 'color 120ms ease',
      }}
    >
      {children}
    </Link>
  )
}

export default function Footer() {
  const cols = [
    {
      heading: 'Về Rentify',
      links: ['Giới thiệu', 'Đội ngũ', 'Tuyển dụng', 'Báo chí', 'Blog'],
    },
    {
      heading: 'Hỗ trợ',
      links: ['Câu hỏi thường gặp', 'Hướng dẫn sử dụng', 'Liên hệ hỗ trợ', 'Báo cáo sự cố'],
    },
    {
      heading: 'Pháp lý',
      links: ['Chính sách bảo mật', 'Điều khoản sử dụng', 'Chính sách cookie', 'Quy trình khiếu nại'],
    },
    {
      heading: 'Khám phá',
      links: ['Tin đăng mới nhất', 'Khu vực nổi bật', 'Cẩm nang thuê trọ', 'Mẹo hay'],
    },
  ]

  return (
    <Box
      component="footer"
      sx={{ backgroundColor: T.bgDark, color: T.white, pt: 5, pb: 0, mt: 'auto' }}
      role="contentinfo"
    >
      <Container maxWidth="lg">
        {/* ─── Logo + tagline ───────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Box sx={{
            width: 32, height: 32,
            backgroundImage: "url('/logo/5.png')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            borderRadius: '4px', flexShrink: 0,
          }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.white, letterSpacing: '-0.3px' }}>
              Rentify
            </Typography>
            <Typography sx={{ fontSize: '0.786rem', color: '#b2b2b2' }}>
              Tìm phòng trọ dễ dàng, nhanh chóng, đáng tin cậy
            </Typography>
          </Box>
        </Stack>

        {/* ─── Link columns ─────────────────────────────────────────────── */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {cols.map(col => (
            <Grid item xs={6} sm={3} key={col.heading}>
              <Typography
                sx={{
                  fontWeight: 700, fontSize: '0.857rem', color: T.white,
                  mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >
                {col.heading}
              </Typography>
              {col.links.map(link => <FooterLink key={link}>{link}</FooterLink>)}
            </Grid>
          ))}
        </Grid>

        {/* ─── Divider ─────────────────────────────────────────────────── */}
        <Divider sx={{ borderColor: '#333333', mb: 2.5 }} />

        {/* ─── Bottom bar ───────────────────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: T.bgDark,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.857rem', color: '#6b6b6b' }}>
            © 2026 Rentify, Inc. Tất cả quyền được bảo lưu.
          </Typography>

          {/* Social */}
          <Stack direction="row" spacing={1}>
            {[
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Twitter,  label: 'Twitter'  },
              { Icon: Instagram,label: 'Instagram' },
              { Icon: YouTube,  label: 'YouTube'  },
            ].map(({ Icon, label }) => (
              <IconButton
                key={label}
                size="small"
                aria-label={`Rentify trên ${label}`}
                sx={{
                  color: '#6b6b6b', p: '6px',
                  border: '1px solid #333333', borderRadius: '4px',
                  '&:hover': { color: T.white, borderColor: '#595959', backgroundColor: '#333333' },
                  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                  transition: 'all 120ms ease',
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </IconButton>
            ))}
          </Stack>

          {/* Legal links */}
          <Stack direction="row" spacing={2.5}>
            {['Quyền riêng tư', 'Điều khoản', 'Cookie', 'Sơ đồ trang web'].map(item => (
              <Link
                key={item} href="#" underline="none"
                sx={{
                  color: '#6b6b6b', fontSize: '0.857rem',
                  '&:hover': { color: T.white },
                  transition: 'color 120ms ease',
                }}
              >
                {item}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}