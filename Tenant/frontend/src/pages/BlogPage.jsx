import { useState } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box, Container, Typography, Grid, CardMedia, Chip, Stack,
  TextField, InputAdornment, Button, Avatar,
} from '@mui/material'
import {
  Search as SearchIcon, AccessTime as ClockIcon, Visibility as EyeIcon,
  TrendingUp as TrendingIcon, Security as SecurityIcon, Home as HomeIcon,
  Gavel as GavelIcon, AttachMoney as MoneyIcon, LocationCity as CityIcon,
  CheckCircle as CheckIcon, ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const BlogCard = styled(Box)({
  cursor: 'pointer',
  '&:hover .blog-image': { transform: 'scale(1.04)' },
  '&:hover .blog-title': { color: '#4A90E2' },
})

const ImageBox = styled(Box)({
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#f2f2f2',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 400ms ease',
    display: 'block',
  },
})

const CategoryPill = styled(Box)(({ active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 18px',
  borderRadius: '20px',
  fontSize: '0.875rem',
  fontWeight: active ? 600 : 500,
  backgroundColor: active ? '#222222' : '#f7f7f7',
  color: active ? '#ffffff' : '#6a6a6a',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: active ? '#222222' : '#e8e8e8',
  transition: 'all 150ms ease',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: active ? '#222222' : '#f2f2f2',
    borderColor: active ? '#222222' : '#c1c1c1',
    color: active ? '#ffffff' : '#222222',
  },
}))

export default function BlogPage() {
  useScrollToTop()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Tất cả', icon: <HomeIcon sx={{ fontSize: '0.875rem' }} /> },
    { id: 'security', label: 'Tránh lừa đảo', icon: <SecurityIcon sx={{ fontSize: '0.875rem' }} /> },
    { id: 'experience', label: 'Kinh nghiệm', icon: <CheckIcon sx={{ fontSize: '0.875rem' }} /> },
    { id: 'legal', label: 'Pháp lý', icon: <GavelIcon sx={{ fontSize: '0.875rem' }} /> },
    { id: 'finance', label: 'Tài chính', icon: <MoneyIcon sx={{ fontSize: '0.875rem' }} /> },
    { id: 'location', label: 'Khu vực', icon: <CityIcon sx={{ fontSize: '0.875rem' }} /> },
  ]

  const allPosts = [
    { id: 1, title: '10 Dấu hiệu nhận biết phòng trọ lừa đảo tại Hà Nội', excerpt: 'Hướng dẫn chi tiết cách phát hiện và tránh các chiêu trò lừa đảo phổ biến khi thuê phòng trọ...', category: 'security', categoryLabel: 'Tránh lừa đảo', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800', author: 'Nguyễn Văn A', date: '15/12/2024', readTime: '5 phút', views: 1234 },
    { id: 2, title: 'Kinh nghiệm thuê phòng trọ cho sinh viên mới tại Hà Nội', excerpt: 'Chia sẻ những kinh nghiệm thực tế giúp sinh viên tìm được phòng trọ phù hợp với ngân sách...', category: 'experience', categoryLabel: 'Kinh nghiệm', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', author: 'Trần Thị B', date: '14/12/2024', readTime: '7 phút', views: 2156 },
    { id: 3, title: 'Hợp đồng thuê phòng: Những điều cần lưu ý', excerpt: 'Phân tích chi tiết các điều khoản quan trọng trong hợp đồng thuê phòng để bảo vệ quyền lợi...', category: 'legal', categoryLabel: 'Pháp lý', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', author: 'Luật sư Lê C', date: '13/12/2024', readTime: '10 phút', views: 987 },
    { id: 4, title: 'So sánh giá phòng trọ các quận tại Hà Nội 2024', excerpt: 'Bảng giá chi tiết và phân tích xu hướng giá phòng trọ tại các quận phổ biến...', category: 'finance', categoryLabel: 'Tài chính', image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800', author: 'Phạm Văn D', date: '12/12/2024', readTime: '6 phút', views: 1543 },
    { id: 5, title: 'Top 5 khu vực thuê trọ tốt nhất gần các trường đại học', excerpt: 'Đánh giá chi tiết về các khu vực thuê trọ phù hợp cho sinh viên gần trường...', category: 'location', categoryLabel: 'Khu vực', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', author: 'Hoàng Thị E', date: '11/12/2024', readTime: '8 phút', views: 1876 },
    { id: 6, title: 'Checklist đầy đủ khi đi xem phòng trọ', excerpt: 'Danh sách kiểm tra chi tiết giúp bạn không bỏ sót bất kỳ điều gì khi xem phòng...', category: 'experience', categoryLabel: 'Kinh nghiệm', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', author: 'Vũ Văn F', date: '10/12/2024', readTime: '5 phút', views: 2341 },
  ]

  const filteredPosts = selectedCategory === 'all' ? allPosts : allPosts.filter(p => p.category === selectedCategory)
  const featured = allPosts.slice(0, 3)

  return (
    <Box sx={{ backgroundColor: '#ffffff' }}>
      {/* Hero */}
      <Box sx={{ backgroundColor: '#f7f7f7', borderBottom: '1px solid #e8e8e8', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' }, color: '#222222', mb: 1.5, letterSpacing: '-0.44px' }}>
            Blog & Kinh nghiệm thuê phòng
          </Typography>
          <Typography variant="body1" sx={{ color: '#6a6a6a', mb: 5, fontSize: '1.0625rem' }}>
            Chia sẻ kiến thức, kinh nghiệm và mẹo hay khi thuê phòng trọ
          </Typography>
          <Box sx={{ maxWidth: 520, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài viết..."
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#929292' }} /></InputAdornment>,
                sx: { borderRadius: '40px', backgroundColor: '#ffffff', fontSize: '0.9375rem' },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '40px', '& fieldset': { borderColor: '#e8e8e8' }, '&:hover fieldset': { borderColor: '#c1c1c1' } } }}
            />
          </Box>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 4, overflowX: 'auto' }}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
          {categories.map(cat => (
            <CategoryPill key={cat.id} active={selectedCategory === cat.id ? 1 : 0} onClick={() => setSelectedCategory(cat.id)}>
              {cat.icon}
              {cat.label}
            </CategoryPill>
          ))}
        </Stack>
      </Container>

      {/* Featured Posts */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <TrendingIcon sx={{ color: '#4A90E2' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#222222' }}>Bài viết nổi bật</Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Big featured post */}
          <Grid item xs={12} md={6}>
            <BlogCard onClick={() => {}}>
              <ImageBox sx={{ height: 280, mb: 2 }}>
                <img className="blog-image" src={featured[0].image} alt={featured[0].title} />
              </ImageBox>
              <Box sx={{ display: 'inline-flex', backgroundColor: '#E8F4FD', color: '#4A90E2', px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '0.8125rem', fontWeight: 600, mb: 1.5 }}>
                {featured[0].categoryLabel}
              </Box>
              <Typography className="blog-title" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#222222', mb: 1, lineHeight: 1.4, transition: 'color 150ms' }}>
                {featured[0].title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 2, lineHeight: 1.6 }}>{featured[0].excerpt}</Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', backgroundColor: '#4A90E2' }}>{featured[0].author.charAt(0)}</Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#222222' }}>{featured[0].author}</Typography>
                    <Typography variant="caption" sx={{ color: '#929292' }}>{featured[0].date}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ClockIcon sx={{ fontSize: '0.875rem', color: '#929292' }} />
                    <Typography variant="caption" sx={{ color: '#929292' }}>{featured[0].readTime}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <EyeIcon sx={{ fontSize: '0.875rem', color: '#929292' }} />
                    <Typography variant="caption" sx={{ color: '#929292' }}>{featured[0].views.toLocaleString()}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </BlogCard>
          </Grid>

          {/* Two smaller posts */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {featured.slice(1).map(post => (
                <BlogCard key={post.id} onClick={() => {}}>
                  <Stack direction="row" spacing={2.5}>
                    <ImageBox sx={{ width: 140, height: 120, flexShrink: 0 }}>
                      <img className="blog-image" src={post.image} alt={post.title} />
                    </ImageBox>
                    <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
                      <Box sx={{ display: 'inline-flex', backgroundColor: '#f7f7f7', color: '#6a6a6a', px: 1.25, py: 0.25, borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, mb: 1 }}>
                        {post.categoryLabel}
                      </Box>
                      <Typography className="blog-title" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#222222', mb: 1, lineHeight: 1.4, transition: 'color 150ms', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <ClockIcon sx={{ fontSize: '0.8125rem', color: '#929292' }} />
                          <Typography variant="caption" sx={{ color: '#929292' }}>{post.readTime}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <EyeIcon sx={{ fontSize: '0.8125rem', color: '#929292' }} />
                          <Typography variant="caption" sx={{ color: '#929292' }}>{post.views.toLocaleString()}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#929292' }}>{post.date}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </BlogCard>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* All Posts */}
      <Box sx={{ backgroundColor: '#f7f7f7', py: 6 }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#222222', mb: 4 }}>
            {selectedCategory === 'all' ? 'Tất cả bài viết' : `Bài viết: ${categories.find(c => c.id === selectedCategory)?.label}`}
          </Typography>
          <Grid container spacing={3}>
            {filteredPosts.map(post => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <BlogCard onClick={() => {}}>
                  <Box sx={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8', height: '100%', '&:hover': { boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px' }, transition: 'box-shadow 200ms ease' }}>
                    <ImageBox sx={{ height: 200 }}>
                      <img className="blog-image" src={post.image} alt={post.title} />
                    </ImageBox>
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'inline-flex', backgroundColor: '#E8F4FD', color: '#4A90E2', px: 1.25, py: 0.25, borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, mb: 1.5 }}>
                        {post.categoryLabel}
                      </Box>
                      <Typography className="blog-title" sx={{ fontWeight: 600, fontSize: '1rem', color: '#222222', mb: 1, lineHeight: 1.45, transition: 'color 150ms', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.6 }}>
                        {post.excerpt}
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.6875rem', backgroundColor: '#4A90E2' }}>{post.author.charAt(0)}</Avatar>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6a6a6a' }}>{post.date}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <ClockIcon sx={{ fontSize: '0.8125rem', color: '#929292' }} />
                            <Typography variant="caption" sx={{ color: '#929292' }}>{post.readTime}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <EyeIcon sx={{ fontSize: '0.8125rem', color: '#929292' }} />
                            <Typography variant="caption" sx={{ color: '#929292' }}>{post.views.toLocaleString()}</Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                </BlogCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ backgroundColor: '#ffffff', py: 8, borderTop: '1px solid #e8e8e8' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#222222', mb: 1.5 }}>
            Bạn có kinh nghiệm muốn chia sẻ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#6a6a6a', mb: 4, lineHeight: 1.7 }}>
            Hãy chia sẻ câu chuyện và kinh nghiệm của bạn để giúp đỡ cộng đồng người thuê phòng
          </Typography>
          <Button
            variant="contained" size="large" endIcon={<ArrowForwardIcon />}
            sx={{ backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#2E5C8A' }, borderRadius: '8px', px: 4, py: 1.75, fontWeight: 600, fontSize: '1rem' }}
          >
            Gửi bài viết
          </Button>
        </Container>
      </Box>
    </Box>
  )
}