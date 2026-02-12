import { useState } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Grid,
  TextField,
  Slider,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const MatchCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  height: 500,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}))

const MatchScore = styled(Box)(({ theme, score }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : '#F59E0B',
  color: 'white',
  borderRadius: '50%',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  fontWeight: 700,
  fontSize: '1.25rem',
  boxShadow: theme.shadows[4],
  zIndex: 10,
}))

const PreferenceCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1.5),
}))

const mockMatches = [
  {
    id: 1,
    name: 'Linh Đặng',
    age: 24,
    avatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
    score: 92,
    budget: [3, 6],
    districts: ['Q1', 'Q3'],
    occupation: 'Designer',
    gender: 'Nữ',
    bio: 'Yêu thích thiết kế, yoga và cà phê',
    habits: {
      sleepSchedule: 'early',
      cleanliness: 5,
      smoking: false,
      pets: false,
      cooking: true,
      quiet: true,
    },
    matchReasons: ['Cùng yêu thích thiết kế', 'Sạch sẽ', 'Không hút thuốc'],
  },
  {
    id: 2,
    name: 'Minh Anh',
    age: 23,
    avatar: 'https://i.pravatar.cc/150?img=2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    score: 85,
    budget: [2.5, 5],
    districts: ['Q1', 'Q2'],
    occupation: 'Developer',
    gender: 'Nữ',
    bio: 'Lập trình viên, thích chơi game',
    habits: {
      sleepSchedule: 'late',
      cleanliness: 4,
      smoking: false,
      pets: true,
      cooking: false,
      quiet: false,
    },
    matchReasons: ['Cùng khu vực', 'Ngân sách tương đồng'],
  },
  {
    id: 3,
    name: 'Hương Giang',
    age: 25,
    avatar: 'https://i.pravatar.cc/150?img=3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop',
    score: 78,
    budget: [4, 7],
    districts: ['Q3', 'Q5'],
    occupation: 'Marketing',
    gender: 'Nữ',
    bio: 'Yêu thích du lịch và ẩm thực',
    habits: {
      sleepSchedule: 'early',
      cleanliness: 4,
      smoking: false,
      pets: false,
      cooking: true,
      quiet: false,
    },
    matchReasons: ['Cùng sở thích du lịch', 'Thích nấu ăn'],
  },
]

export default function RoommateMatchingPage() {
  useScrollToTop()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [favorites, setFavorites] = useState([])
  const [openProfile, setOpenProfile] = useState(false)
  const [openPreferences, setOpenPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    budget: [2, 8],
    districts: [],
    sleepSchedule: 'any',
    cleanliness: 3,
    smoking: false,
    pets: false,
  })

  const currentMatch = mockMatches[currentIndex]

  const handleNext = () => {
    if (currentIndex < mockMatches.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleLike = () => {
    setFavorites([...favorites, currentMatch.id])
    handleNext()
  }

  const handlePass = () => {
    handleNext()
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Tìm bạn ở ghép hoàn hảo
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            AI sẽ giúp bạn tìm bạn ở ghép phù hợp nhất dựa trên sở thích và thói quen
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Main Card */}
          <Grid item xs={12} md={8}>
            {currentMatch && (
              <Box sx={{ position: 'relative' }}>
                <MatchCard>
                  <CardMedia
                    component="img"
                    image={currentMatch.image}
                    alt={currentMatch.name}
                    sx={{ height: 300, objectFit: 'cover' }}
                  />
                  <MatchScore score={currentMatch.score}>
                    <Box>{currentMatch.score}%</Box>
                    <TrendingUpIcon sx={{ fontSize: '1rem' }} />
                  </MatchScore>

                  <CardContent sx={{ pb: 2 }}>
                    <Stack spacing={2}>
                      {/* Name & Basic Info */}
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {currentMatch.name}, {currentMatch.age}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip
                            icon={<WorkIcon />}
                            label={currentMatch.occupation}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<LocationIcon />}
                            label={currentMatch.districts.join(', ')}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>

                      {/* Bio */}
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {currentMatch.bio}
                      </Typography>

                      {/* Match Reasons */}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mb: 1, display: 'block' }}>
                          ✨ Lý do phù hợp
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {currentMatch.matchReasons.map((reason, idx) => (
                            <Chip
                              key={idx}
                              label={reason}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* Habits Preview */}
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {!currentMatch.habits.smoking && (
                          <Chip label="🚭 Không hút thuốc" size="small" />
                        )}
                        {!currentMatch.habits.pets && (
                          <Chip label="🐾 Không nuôi thú cưng" size="small" />
                        )}
                        {currentMatch.habits.cooking && (
                          <Chip label="👨‍🍳 Thích nấu ăn" size="small" />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </MatchCard>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handlePass}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    <CloseIcon sx={{ mr: 1 }} />
                    Bỏ qua
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setOpenProfile(true)}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={handleLike}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    <FavoriteIcon sx={{ mr: 1 }} />
                    Thích
                  </Button>
                </Stack>

                {/* Progress */}
                <Box sx={{ mt: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(currentIndex / mockMatches.length) * 100}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    {currentIndex + 1} / {mockMatches.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Preferences */}
            <PreferenceCard sx={{ mb: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tiêu chí của bạn
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setOpenPreferences(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Chỉnh sửa
                  </Button>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Ngân sách
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {preferences.budget[0]} - {preferences.budget[1]} triệu/tháng
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Khu vực
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {preferences.districts.length > 0 ? preferences.districts.join(', ') : 'Tất cả'}
                  </Typography>
                </Box>
              </Stack>
            </PreferenceCard>

            {/* Favorites */}
            <PreferenceCard>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ❤️ Yêu thích ({favorites.length})
                </Typography>
                {favorites.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Chưa có ai được yêu thích
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {mockMatches
                      .filter((m) => favorites.includes(m.id))
                      .map((match) => (
                        <Box
                          key={match.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                          }}
                        >
                          <Avatar src={match.avatar} sx={{ width: 32, height: 32 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {match.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {match.score}% phù hợp
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                  </Stack>
                )}
              </Stack>
            </PreferenceCard>
          </Grid>
        </Grid>
      </Container>

      {/* Profile Dialog */}
      <Dialog open={openProfile} onClose={() => setOpenProfile(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Hồ sơ chi tiết</Typography>
          <IconButton onClick={() => setOpenProfile(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentMatch && (
            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={currentMatch.avatar}
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                />
                <Typography variant="h6">{currentMatch.name}, {currentMatch.age}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {currentMatch.occupation}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Thông tin cơ bản
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Ngân sách:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentMatch.budget[0]} - {currentMatch.budget[1]} triệu
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Khu vực:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentMatch.districts.join(', ')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Thói quen
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Lịch ngủ:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentMatch.habits.sleepSchedule === 'early' ? 'Sớm' : 'Muộn'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Sạch sẽ:</Typography>
                    <Box>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            fontSize: '1rem',
                            color: i < currentMatch.habits.cleanliness ? '#F59E0B' : '#E5E7EB',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfile(false)}>Đóng</Button>
          <Button variant="contained" color="error" startIcon={<FavoriteIcon />}>
            Thích
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog open={openPreferences} onClose={() => setOpenPreferences(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa tiêu chí</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Ngân sách (triệu/tháng)
              </Typography>
              <Slider
                value={preferences.budget}
                onChange={(e, newValue) => setPreferences({ ...preferences, budget: newValue })}
                min={1}
                max={15}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Mức độ sạch sẽ
              </Typography>
              <Slider
                value={preferences.cleanliness}
                onChange={(e, newValue) => setPreferences({ ...preferences, cleanliness: newValue })}
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.smoking}
                  onChange={(e) => setPreferences({ ...preferences, smoking: e.target.checked })}
                />
              }
              label="Chấp nhận người hút thuốc"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.pets}
                  onChange={(e) => setPreferences({ ...preferences, pets: e.target.checked })}
                />
              }
              label="Chấp nhận nuôi thú cưng"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreferences(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenPreferences(false)}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
