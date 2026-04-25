import { useState, useMemo } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import {
  Box,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material'
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import PreferenceForm from '../components/PreferenceForm'
import SwipeCard from '../components/SwipeCard'
import { EmptyState, MatchSuccessScreen, MatchCardSkeleton } from '../components/MatchingStateComponents'
import { calculateMatchScore, filterMatchesByPreferences, rankMatches } from '../utils/matchingEngine'

// Styled Components
const SwipeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '9/14',
  minHeight: '500px',
  maxHeight: '720px',
  margin: '0 auto',

  [theme.breakpoints.down('md')]: {
    minHeight: '600px',
    aspectRatio: 'auto',
  },
}))

const ActionButtonsContainer = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
  zIndex: 20,

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
  },
}))

const DetailCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}))

const InfoBadgeStyle = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  background: 'linear-gradient(135deg, #10B98120 0%, #3B82F520 100%)',
  border: '1px solid #10B98140',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
}))

const PreferenceChip = styled(Chip)(({ theme }) => ({
  height: '32px',
  borderRadius: '20px',
  fontWeight: '500',
}))

// Mock Candidates Data for Testing
const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Linh Đặng',
    age: 24,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
    occupation: 'Designer',
    budget: [3, 6],
    locations: ['Q1', 'Q3'],
    bio: 'Yêu thích thiết kế, yoga và cà phê ☕',
    lifestyle: ['clean', 'quiet', 'early_bird', 'fitness'],
    interests: ['Yoga', 'Thiết kế', 'Cà phê'],
    duration: 'long-term',
  },
  {
    id: 2,
    name: 'Minh Anh',
    age: 23,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    occupation: 'Developer',
    budget: [2.5, 5],
    locations: ['Q1', 'Q2'],
    bio: 'Lập trình viên, yêu chơi game 🎮',
    lifestyle: ['social', 'night_owl', 'gaming'],
    interests: ['Lập trình', 'Công nghệ', 'Âm nhạc'],
    duration: 'long-term',
  },
  {
    id: 3,
    name: 'Hương Giang',
    age: 25,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop',
    occupation: 'Marketing',
    budget: [4, 7],
    locations: ['Q3', 'Q5'],
    bio: 'Yêu du lịch và ẩm thực ✈️',
    lifestyle: ['social', 'cooking', 'early_bird'],
    interests: ['Du lịch', 'Nấu ăn', 'Phim ảnh'],
    duration: 'long-term',
  },
  {
    id: 4,
    name: 'Thu Trang',
    age: 22,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop',
    occupation: 'Student',
    budget: [2, 4],
    locations: ['Q7', 'Bình Thạnh'],
    bio: 'Sinh viên, yêu nhiếp ảnh 📷',
    lifestyle: ['clean', 'quiet', 'social'],
    interests: ['Nhiếp ảnh', 'Du lịch', 'Vẽ tranh'],
    duration: 'long-term',
  },
  {
    id: 5,
    name: 'Vân Anh',
    age: 26,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=5',
    image: 'https://images.unsplash.com/photo-1502684457400-22d1a2b8b1fe?w=500&h=600&fit=crop',
    occupation: 'Accountant',
    budget: [5, 8],
    locations: ['Q1', 'Q4'],
    bio: 'Kế toán viên, yêu thể dục 💪',
    lifestyle: ['clean', 'early_bird', 'fitness', 'quiet'],
    interests: ['Chạy bộ', 'Yoga', 'Sách'],
    duration: 'long-term',
  },
  {
    id: 6,
    name: 'Hà Nhi',
    age: 24,
    gender: 'Nữ',
    avatar: 'https://i.pravatar.cc/150?img=6',
    image: 'https://images.unsplash.com/photo-1517841905240-5af0b2e5d6a0?w=500&h=600&fit=crop',
    occupation: 'Teacher',
    budget: [3, 5],
    locations: ['Q2', 'Q3'],
    bio: 'Giáo viên tiếng Anh, thích đọc sách 📚',
    lifestyle: ['clean', 'quiet', 'early_bird'],
    interests: ['Sách', 'Ngoại ngữ', 'Thiết kế'],
    duration: 'long-term',
  },
]

/**
 * RoommateMatchingPage Component
 * Complete matching UX with form -> swipe flow
 */
export default function RoommateMatchingPage() {
  useScrollToTop()

  // State Management
  const [flowStep, setFlowStep] = useState('form') // 'form' | 'matching' | 'profile'
  const [preferences, setPreferences] = useState(null)
  const [filteredMatches, setFilteredMatches] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [favorites, setFavorites] = useState([])
  const [lastLikedMatch, setLastLikedMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [openProfileDialog, setOpenProfileDialog] = useState(false)

  // Get current match with calculated score
  const currentMatch = useMemo(() => {
    if (filteredMatches.length === 0) return null
    const match = filteredMatches[currentIndex]
    if (!match.matchData) {
      match.matchData = calculateMatchScore(preferences, match)
    }
    return match
  }, [currentIndex, filteredMatches, preferences])

  // Handle Form Submission
  const handleFormSubmit = async (userPreferences) => {
    setIsLoading(true)
    setPreferences(userPreferences)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Filter and rank candidates
    const filtered = filterMatchesByPreferences(MOCK_CANDIDATES, userPreferences)
    const ranked = rankMatches(filtered, userPreferences)

    setFilteredMatches(ranked)
    setCurrentIndex(0)
    setIsLoading(false)

    if (ranked.length > 0) {
      setFlowStep('matching')
    } else {
      setFlowStep('empty-state')
    }
  }

  // Swipe Handlers
  const handleSwipeRight = () => {
    if (!currentMatch) return

    setFavorites([...favorites, currentMatch.id])
    setLastLikedMatch(currentMatch)
    setFlowStep('match-success')
  }

  const handleSwipeLeft = () => {
    if (currentIndex < filteredMatches.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setFlowStep('empty-state')
    }
  }

  const handleContinueMatching = () => {
    if (currentIndex < filteredMatches.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlowStep('matching')
    } else {
      setFlowStep('empty-state')
    }
  }

  const handleBackToForm = () => {
    setFlowStep('form')
    setPreferences(null)
    setFilteredMatches([])
    setCurrentIndex(0)
    setFavorites([])
  }

  // Render States
  if (flowStep === 'form') {
    return <PreferenceForm onSubmit={handleFormSubmit} isLoading={isLoading} />
  }

  if (flowStep === 'empty-state') {
    return (
      <EmptyState onAdjustFilters={() => setFlowStep('form')} onBack={handleBackToForm} />
    )
  }

  if (flowStep === 'match-success') {
    return (
      <MatchSuccessScreen
        matchName={lastLikedMatch?.name}
        score={lastLikedMatch?.matchData?.score}
        onContinue={handleContinueMatching}
        onViewProfile={() => {
          setOpenProfileDialog(true)
          setFlowStep('matching')
        }}
      />
    )
  }

  if (flowStep === 'matching') {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="md">
          {/* Header with Back Button */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              mb: 3,
              justifyContent: 'space-between',
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToForm}
              sx={{ textTransform: 'none' }}
            >
              Quay lại
            </Button>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {currentIndex + 1} / {filteredMatches.length} người
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(currentIndex / filteredMatches.length) * 100}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
            <Box sx={{ width: '80px' }} />
          </Stack>

          <Grid container spacing={3}>
            {/* Swipe Card Container */}
            <Grid item xs={12} md={8}>
              {isLoading ? (
                <SwipeContainer>
                  <MatchCardSkeleton />
                </SwipeContainer>
              ) : currentMatch ? (
                <Box sx={{ position: 'relative' }}>
                  <SwipeContainer>
                    <SwipeCard
                      match={currentMatch}
                      index={0}
                      isActive={true}
                      onSwipeRight={handleSwipeRight}
                      onSwipeLeft={handleSwipeLeft}
                      onTap={() => setOpenProfileDialog(true)}
                      zIndex={10}
                    />
                    {filteredMatches[currentIndex + 1] && (
                      <SwipeCard
                        match={filteredMatches[currentIndex + 1]}
                        index={1}
                        isActive={false}
                        zIndex={9}
                      />
                    )}
                    {filteredMatches[currentIndex + 2] && (
                      <SwipeCard
                        match={filteredMatches[currentIndex + 2]}
                        index={2}
                        isActive={false}
                        zIndex={8}
                      />
                    )}
                  </SwipeContainer>

                  {/* Action Buttons */}
                  <ActionButtonsContainer direction="row">
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleSwipeLeft}
                      startIcon={<CloseIcon />}
                      sx={{
                        flex: 1,
                        maxWidth: '100px',
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      Bỏ qua
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      onClick={handleSwipeRight}
                      startIcon={<FavoriteIcon />}
                      sx={{
                        flex: 1,
                        maxWidth: '100px',
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      Thích
                    </Button>
                  </ActionButtonsContainer>
                </Box>
              ) : (
                <SwipeContainer />
              )}
            </Grid>

            {/* Sidebar - Desktop Only */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              {currentMatch && (
                <Stack spacing={2}>
                  {/* Match Details Card */}
                  <DetailCard>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {currentMatch.name}, {currentMatch.age}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {currentMatch.occupation}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              color: 'text.secondary',
                            }}
                          >
                            {currentMatch.bio}
                          </Typography>
                        </Box>

                        {/* Match Score & Reasons */}
                        <InfoBadgeStyle>
                          <Stack spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: 'success.main' }}
                            >
                              ✨ Độ phù hợp: {currentMatch.matchData.score}%
                            </Typography>
                            {currentMatch.matchData.reasons.map((reason, idx) => (
                              <Typography key={idx} variant="caption" sx={{ color: 'text.secondary' }}>
                                • {reason}
                              </Typography>
                            ))}
                          </Stack>
                        </InfoBadgeStyle>

                        {/* Info Chips */}
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                          <PreferenceChip
                            label={`${currentMatch.budget[0]}-${currentMatch.budget[1]}M`}
                            size="small"
                            variant="outlined"
                          />
                          <PreferenceChip
                            label={currentMatch.locations[0]}
                            size="small"
                            variant="outlined"
                          />
                          <PreferenceChip
                            label={currentMatch.duration === 'long-term' ? 'Dài hạn' : 'Ngắn hạn'}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {/* Lifestyle Tags */}
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            Lối sống
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                            {currentMatch.lifestyle.map((item) => (
                              <Chip
                                key={item}
                                label={item}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </DetailCard>

                  {/* Favorites Summary */}
                  <DetailCard>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ❤️ Yêu thích ({favorites.length})
                        </Typography>
                        {favorites.length === 0 ? (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Chưa yêu thích ai
                          </Typography>
                        ) : (
                          <Stack spacing={1} sx={{ maxHeight: '300px', overflow: 'auto' }}>
                            {filteredMatches
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
                                  <Avatar
                                    src={match.avatar}
                                    sx={{ width: 32, height: 32 }}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {match.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      {match.matchData.score}% phù hợp
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </DetailCard>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Profile Detail Dialog */}
        <Dialog
          open={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Hồ sơ chi tiết</Typography>
            <IconButton onClick={() => setOpenProfileDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {currentMatch && (
              <Stack spacing={3} sx={{ py: 2 }}>
                {/* Avatar & Basic */}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={currentMatch.avatar}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {currentMatch.name}, {currentMatch.age}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {currentMatch.occupation}
                  </Typography>
                  <Chip label={`${currentMatch.matchData.score}% phù hợp`} color="success" />
                </Box>

                {/* Bio */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Giới thiệu
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentMatch.bio}
                  </Typography>
                </Box>

                {/* Match Reasons */}
                {currentMatch.matchData.reasons.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      ✨ Lý do phù hợp
                    </Typography>
                    <Stack spacing={1}>
                      {currentMatch.matchData.reasons.map((reason, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: 'text.secondary' }}>
                          • {reason}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Details */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Thông tin chi tiết
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Ngân sách/tháng
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentMatch.budget[0]} - {currentMatch.budget[1]}M VND
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Khu vực
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentMatch.locations.join(', ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Thời gian ở
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentMatch.duration === 'long-term' ? 'Dài hạn' : 'Ngắn hạn'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Lifestyle */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Lối sống
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {currentMatch.lifestyle.map((item) => (
                      <Chip key={item} label={item} size="small" />
                    ))}
                  </Stack>
                </Box>

                {/* Interests */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Sở thích
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {currentMatch.interests.map((item) => (
                      <Chip key={item} label={item} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Đóng</Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<FavoriteIcon />}
              onClick={() => {
                handleSwipeRight()
                setOpenProfileDialog(false)
              }}
            >
              Thích
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
}
