/**
 * BlogPage — Booking.com style redesign
 *
 * Clean white + blue accent. Card-based post grid.
 * No gradient/gimmick — functional, accessible.
 */

import { useState } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, Container, Typography, Grid, Stack,
  TextField, InputAdornment, Button, Avatar, Chip,
} from '@mui/material'
import {
  Search as SearchIcon, AccessTime as ClockIcon, Visibility as EyeIcon,
  Security as SecurityIcon, Home as HomeIcon, Gavel as GavelIcon,
  AttachMoney as MoneyIcon, LocationCity as CityIcon,
  CheckCircle as CheckIcon, ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const T = {
  blue:   '#006ce4', blueDk: '#003f8a', blueLt: '#e8f2ff',
  text:   '#1a1a1a', muted:  '#595959', bg: '#f2f4f8',
  white:  '#ffffff', border: '#d4d6d9', yellow: '#febb02',
  shadow1:'rgba(26,26,26,0.16) 0px 2px 8px 0px',
}

const BlogCard = styled(Box)({
  backgroundColor: T.white,
  borderRadius: '8px',
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow1,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `box-shadow 120ms ease, transform 120ms ease`,
  '&:hover': { boxShadow: 'rgba(26,26,26,0.24) 0px 4px 16px', transform: 'translateY(-2px)' },
  '&:hover .blog-img': { transform: 'scale(1.04)' },
  '&:hover .blog-title': { color: T.blue },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
})

const CatPill = styled(Box)(({ active }) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 14px', borderRadius: '4px',
  fontSize: '0.857rem',
  fontWeight: active ? 700 : 400,
  backgroundColor: active ? T.blue : T.white,
  color: active ? T.white : T.muted,
  border: `1px solid ${active ? T.blue : T.border}`,
  cursor: 'pointer', whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: active ? T.blueDk : T.bg,
    color: active ? T.white : T.text,
    borderColor: active ? T.blueDk : '#8b8b8b',
  },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
  transition: 'all 120ms ease',
}))

const CategoryBadge = ({ label }) => (
  <Box sx={{
    display: 'inline-flex', px: 1, py: 0.25, borderRadius: '4px',
    backgroundColor: T.blueLt, color: T.blue,
    fontSize: '0.786rem', fontWeight: 700,
    mb: 1,
  }}>
    {label}
  </Box>
)

export default function BlogPage() {
  useScrollToTop()
  const [selectedCat, setSelectedCat] = useState('all')
  const [search, setSearch] = useState('')

  const categories = [
    { id: 'all',        label: 'Tất cả',       icon: <HomeIcon sx={{ fontSize: 14 }} /> },
    { id: 'security',   label: 'Tránh lừa đảo', icon: <SecurityIcon sx={{ fontSize: 14 }} /> },
    { id: 'experience', label: 'Kinh nghiệm',   icon: <CheckIcon sx={{ fontSize: 14 }} /> },
    { id: 'legal',      label: 'Pháp lý',       icon: <GavelIcon sx={{ fontSize: 14 }} /> },
    { id: 'finance',    label: 'Tài chính',      icon: <MoneyIcon sx={{ fontSize: 14 }} /> },
    { id: 'location',   label: 'Khu vực',        icon: <CityIcon sx={{ fontSize: 14 }} /> },
  ]

  const allPosts = [
    { id:1, title:'10 Dấu hiệu nhận biết phòng trọ lừa đảo tại Hà Nội', excerpt:'Hướng dẫn chi tiết cách phát hiện và tránh các chiêu trò lừa đảo phổ biến khi thuê phòng trọ tại thành phố.', category:'security', categoryLabel:'Tránh lừa đảo', image:'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800', author:'Nguyễn Văn A', date:'15/12/2024', readTime:'5 phút', views:1234 },
    { id:2, title:'Kinh nghiệm thuê phòng trọ cho sinh viên mới tại Hà Nội', excerpt:'Chia sẻ kinh nghiệm thực tế giúp sinh viên tìm được phòng trọ phù hợp với ngân sách eo hẹp.', category:'experience', categoryLabel:'Kinh nghiệm', image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', author:'Trần Thị B', date:'14/12/2024', readTime:'7 phút', views:2156 },
    { id:3, title:'Hợp đồng thuê phòng: Những điều cần lưu ý để bảo vệ quyền lợi', excerpt:'Phân tích chi tiết các điều khoản quan trọng trong hợp đồng thuê phòng.', category:'legal', categoryLabel:'Pháp lý', image:'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', author:'Luật sư Lê C', date:'13/12/2024', readTime:'10 phút', views:987 },
    { id:4, title:'So sánh giá phòng trọ các quận tại Hà Nội 2024', excerpt:'Bảng giá chi tiết và phân tích xu hướng giá phòng trọ tại các quận phổ biến năm 2024.', category:'finance', categoryLabel:'Tài chính', image:'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800', author:'Phạm Văn D', date:'12/12/2024', readTime:'6 phút', views:1543 },
    { id:5, title:'Top 5 khu vực thuê trọ tốt nhất gần các trường đại học', excerpt:'Đánh giá chi tiết về các khu vực thuê trọ phù hợp cho sinh viên gần trường.', category:'location', categoryLabel:'Khu vực', image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', author:'Hoàng Thị E', date:'11/12/2024', readTime:'8 phút', views:1876 },
    { id:6, title:'Checklist đầy đủ khi đi xem phòng trọ — Đừng bỏ sót bất kỳ điều gì', excerpt:'Danh sách kiểm tra chi tiết giúp bạn không bỏ sót bất kỳ điều gì khi xem phòng.', category:'experience', categoryLabel:'Kinh nghiệm', image:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', author:'Vũ Văn F', date:'10/12/2024', readTime:'5 phút', views:2341 },
  ]

  const filtered = allPosts.filter(p =>
    (selectedCat === 'all' || p.category === selectedCat) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  )

  const featured = allPosts[0]

  return (
    <Box sx={{ backgroundColor: T.bg, minHeight: '100vh' }}>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, py: 4 }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.286rem', md: '1.714rem' }, color: T.text, mb: 0.5 }}>
            Blog & Kinh nghiệm thuê phòng
          </Typography>
          <Typography sx={{ fontSize: '0.929rem', color: T.muted, mb: 3 }}>
            Kiến thức, kinh nghiệm và mẹo hay cho người thuê phòng
          </Typography>
          <TextField
            fullWidth placeholder="Tìm kiếm bài viết..."
            value={search} onChange={e => setSearch(e.target.value)}
            inputProps={{ 'aria-label': 'Tìm kiếm bài viết' }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: T.muted }} /></InputAdornment>,
              sx: { borderRadius: '4px', fontSize: '0.857rem', backgroundColor: T.white, maxWidth: 480 },
            }}
            sx={{ maxWidth: 480, '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* ─── Categories ───────────────────────────────────────────────── */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5, flexWrap: 'nowrap' }} role="navigation" aria-label="Danh mục bài viết">
          {categories.map(cat => (
            <CatPill
              key={cat.id}
              active={selectedCat === cat.id ? 1 : 0}
              onClick={() => setSelectedCat(cat.id)}
              tabIndex={0}
              role="button"
              aria-pressed={selectedCat === cat.id}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedCat(cat.id)}
            >
              {cat.icon}{cat.label}
            </CatPill>
          ))}
        </Stack>

        {/* ─── Featured post (large) ────────────────────────────────────── */}
        {selectedCat === 'all' && !search && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 4, height: 18, backgroundColor: T.blue, borderRadius: '2px' }} />
              Bài viết nổi bật
            </Typography>
            <BlogCard
              tabIndex={0} role="article" aria-label={featured.title}
              onClick={() => {}} onKeyDown={e => e.key === 'Enter' && {}}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 200 }}>
                <Box sx={{ width: { xs: '100%', md: 360 }, height: { xs: 200, md: 'auto' }, flexShrink: 0, overflow: 'hidden' }}>
                  <Box
                    className="blog-img"
                    component="img" src={featured.image} alt={featured.title} loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
                  />
                </Box>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CategoryBadge label={featured.categoryLabel} />
                  <Typography className="blog-title" sx={{
                    fontWeight: 700, fontSize: '1.143rem', color: T.text,
                    mb: 1, lineHeight: 1.4, transition: 'color 120ms ease',
                  }}>
                    {featured.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.857rem', color: T.muted, mb: 2, lineHeight: 1.6 }}>{featured.excerpt}</Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.786rem', bgcolor: T.blue }}>{featured.author.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.857rem', fontWeight: 600, color: T.text }}>{featured.author}</Typography>
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{featured.date}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ClockIcon sx={{ fontSize: 14, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{featured.readTime}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EyeIcon sx={{ fontSize: 14, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{featured.views.toLocaleString()}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </BlogCard>
          </Box>
        )}

        {/* ─── Post grid ────────────────────────────────────────────────── */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 18, backgroundColor: T.blue, borderRadius: '2px' }} />
          {selectedCat === 'all' ? 'Tất cả bài viết' : categories.find(c => c.id === selectedCat)?.label}
          <Box component="span" sx={{ fontSize: '0.857rem', fontWeight: 400, color: T.muted }}>({filtered.length})</Box>
        </Typography>

        <Grid container spacing={2}>
          {filtered.map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <BlogCard
                tabIndex={0} role="article" aria-label={post.title}
                onClick={() => {}} onKeyDown={e => e.key === 'Enter' && {}}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Box sx={{ height: 180, overflow: 'hidden' }}>
                  <Box
                    className="blog-img"
                    component="img" src={post.image} alt={post.title} loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
                  />
                </Box>
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <CategoryBadge label={post.categoryLabel} />
                  <Typography className="blog-title" sx={{
                    fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1, lineHeight: 1.45,
                    transition: 'color 120ms ease',
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {post.title}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.857rem', color: T.muted, mb: 2, lineHeight: 1.6, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {post.excerpt}
                  </Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.643rem', bgcolor: T.blue }}>{post.author.charAt(0)}</Avatar>
                      <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{post.date}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.25}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ClockIcon sx={{ fontSize: 12, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{post.readTime}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EyeIcon sx={{ fontSize: 12, color: T.muted }} />
                        <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{post.views.toLocaleString()}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </BlogCard>
            </Grid>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: T.muted, fontSize: '0.929rem' }}>Không có bài viết nào phù hợp</Typography>
          </Box>
        )}
      </Container>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: T.white, py: 5, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.286rem', color: T.text, mb: 1 }}>
            Bạn có kinh nghiệm muốn chia sẻ?
          </Typography>
          <Typography sx={{ fontSize: '0.929rem', color: T.muted, mb: 3 }}>
            Giúp cộng đồng người thuê phòng bằng những chia sẻ thực tế
          </Typography>
          <Button
            variant="contained" endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            aria-label="Gửi bài viết"
            sx={{
              backgroundColor: T.blue, borderRadius: '4px',
              px: 4, py: 1.5, fontWeight: 700, fontSize: '0.929rem',
              '&:hover': { backgroundColor: T.blueDk },
              '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
            }}
          >
            Gửi bài viết
          </Button>
        </Container>
      </Box>
    </Box>
  )
}