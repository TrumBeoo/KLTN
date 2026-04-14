import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Avatar,
} from '@mui/material'
import {
  Search as SearchIcon,
  AccessTime as ClockIcon,
  Visibility as EyeIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Home as HomeIcon,
  Gavel as GavelIcon,
  AttachMoney as MoneyIcon,
  LocationCity as CityIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
}))

const BlogCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 200ms ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}))

const CategoryChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}))

export default function BlogPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Tất cả', icon: <HomeIcon /> },
    { id: 'security', label: 'Tránh lừa đảo', icon: <SecurityIcon /> },
    { id: 'experience', label: 'Kinh nghiệm', icon: <CheckIcon /> },
    { id: 'legal', label: 'Pháp lý', icon: <GavelIcon /> },
    { id: 'finance', label: 'Tài chính', icon: <MoneyIcon /> },
    { id: 'location', label: 'Khu vực', icon: <CityIcon /> },
  ]

  const featuredPosts = [
    {
      id: 1,
      title: '10 Dấu hiệu nhận biết phòng trọ lừa đảo tại Hà Nội',
      excerpt: 'Hướng dẫn chi tiết cách phát hiện và tránh các chiêu trò lừa đảo phổ biến khi thuê phòng trọ...',
      category: 'security',
      categoryLabel: 'Tránh lừa đảo',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      author: 'Nguyễn Văn A',
      date: '15/12/2024',
      readTime: '5 phút đọc',
      views: 1234,
    },
    {
      id: 2,
      title: 'Kinh nghiệm thuê phòng trọ cho sinh viên mới tại Hà Nội',
      excerpt: 'Chia sẻ những kinh nghiệm thực tế giúp sinh viên tìm được phòng trọ phù hợp với ngân sách...',
      category: 'experience',
      categoryLabel: 'Kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      author: 'Trần Thị B',
      date: '14/12/2024',
      readTime: '7 phút đọc',
      views: 2156,
    },
    {
      id: 3,
      title: 'Hợp đồng thuê phòng: Những điều cần lưu ý',
      excerpt: 'Phân tích chi tiết các điều khoản quan trọng trong hợp đồng thuê phòng để bảo vệ quyền lợi...',
      category: 'legal',
      categoryLabel: 'Pháp lý',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      author: 'Luật sư Lê C',
      date: '13/12/2024',
      readTime: '10 phút đọc',
      views: 987,
    },
  ]

  const allPosts = [
    ...featuredPosts,
    {
      id: 4,
      title: 'So sánh giá phòng trọ các quận tại Hà Nội 2024',
      excerpt: 'Bảng giá chi tiết và phân tích xu hướng giá phòng trọ tại các quận phổ biến...',
      category: 'finance',
      categoryLabel: 'Tài chính',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800',
      author: 'Phạm Văn D',
      date: '12/12/2024',
      readTime: '6 phút đọc',
      views: 1543,
    },
    {
      id: 5,
      title: 'Top 5 khu vực thuê trọ tốt nhất gần các trường đại học',
      excerpt: 'Đánh giá chi tiết về các khu vực thuê trọ phù hợp cho sinh viên gần trường...',
      category: 'location',
      categoryLabel: 'Khu vực',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      author: 'Hoàng Thị E',
      date: '11/12/2024',
      readTime: '8 phút đọc',
      views: 1876,
    },
    {
      id: 6,
      title: 'Checklist đầy đủ khi đi xem phòng trọ',
      excerpt: 'Danh sách kiểm tra chi tiết giúp bạn không bỏ sót bất kỳ điều gì khi xem phòng...',
      category: 'experience',
      categoryLabel: 'Kinh nghiệm',
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      author: 'Vũ Văn F',
      date: '10/12/2024',
      readTime: '5 phút đọc',
      views: 2341,
    },
  ]

  const filteredPosts = selectedCategory === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === selectedCategory)

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ mb: 2, fontWeight: 700 }}>
            📚 Blog & Kinh nghiệm thuê phòng
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
            Chia sẻ kiến thức, kinh nghiệm và mẹo hay khi thuê phòng trọ
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài viết..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Box>
        </Container>
      </HeroSection>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              color={selectedCategory === cat.id ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </Stack>
      </Container>

      {/* Featured Posts */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
          <TrendingIcon sx={{ color: 'error.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Bài viết nổi bật
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {featuredPosts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <BlogCard>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                  />
                  <Chip
                    label={post.categoryLabel}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 2 }}
                  >
                    {post.excerpt}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <ClockIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {post.readTime}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <EyeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {post.views.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {post.author.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {post.author}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {post.date}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </BlogCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* All Posts */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          {selectedCategory === 'all' ? 'Tất cả bài viết' : `Bài viết về ${categories.find(c => c.id === selectedCategory)?.label}`}
        </Typography>

        <Grid container spacing={3}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <BlogCard>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={post.image}
                    alt={post.title}
                  />
                  <Chip
                    label={post.categoryLabel}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 2, fontSize: '0.875rem' }}
                  >
                    {post.excerpt}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <ClockIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {post.readTime}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <EyeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {post.views.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                      {post.author.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {post.author}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                        {post.date}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </BlogCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Bạn có kinh nghiệm muốn chia sẻ?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Hãy chia sẻ câu chuyện, kinh nghiệm của bạn để giúp đỡ cộng đồng người thuê nhé!
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Gửi bài viết
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
