import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  Stack,
  Typography,
  Chip,
  Grid,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Schedule as ScheduleIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import SuggestionInput from './SuggestionInput'

const FormCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}))

const LifestyleChip = styled(Chip)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  borderWidth: 2,
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    borderColor: theme.palette.primary.main,
  }),
}))

const LIFESTYLE_OPTIONS = [
  { id: 'clean', label: '🧹 Sạch sẽ', emoji: '🧹' },
  { id: 'quiet', label: '🤫 Yên tĩnh', emoji: '🤫' },
  { id: 'social', label: '👥 Thích giao lưu', emoji: '👥' },
  { id: 'early_bird', label: '🌅 Thức sớm', emoji: '🌅' },
  { id: 'night_owl', label: '🌙 Thích khuya', emoji: '🌙' },
  { id: 'fitness', label: '💪 Thích tập luyện', emoji: '💪' },
  { id: 'cooking', label: '👨‍🍳 Yêu nấu ăn', emoji: '👨‍🍳' },
  { id: 'gaming', label: '🎮 Yêu chơi game', emoji: '🎮' },
]

const INTEREST_SUGGESTIONS = [
  'Du lịch',
  'Yoga',
  'Chạy bộ',
  'Nhiếp ảnh',
  'Thiết kế',
  'Lập trình',
  'Âm nhạc',
  'Vẽ tranh',
  'Nấu ăn',
  'Phim ảnh',
  'Sách',
  'Công nghệ',
]

/**
 * PreferenceForm Component
 * Collects user matching preferences with smart inputs and real-time feedback
 */
export const PreferenceForm = ({ onSubmit, isLoading = false }) => {
  const [districts, setDistricts] = useState([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const [preferences, setPreferences] = useState({
    budget: [2, 8],
    locations: [],
    genderPreference: 'any',
    lifestyle: [],
    interests: [],
    duration: 'long-term',
  })

  const [matchCount, setMatchCount] = useState(null)

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_URL}/locations/districts`)
      const data = await response.json()
      if (data.success) {
        setDistricts(data.data || [])
      }
    } catch (error) {
      console.error('Fetch districts error:', error)
    }
  }

  const handleBudgetChange = (e, newValue) => {
    setPreferences({ ...preferences, budget: newValue })
    simulateMatchCount()
  }

  const handleLocationToggle = (location) => {
    setPreferences((prev) => {
      const newLocations = prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location]
      return { ...prev, locations: newLocations }
    })
    simulateMatchCount()
  }

  const handleLifestyleToggle = (lifestyle) => {
    setPreferences((prev) => {
      const newLifestyle = prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter((l) => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
      return { ...prev, lifestyle: newLifestyle }
    })
    simulateMatchCount()
  }

  const handleInterestsChange = (newInterests) => {
    setPreferences({ ...preferences, interests: newInterests })
    simulateMatchCount()
  }

  const simulateMatchCount = () => {
    setMatchCount(Math.floor(Math.random() * (25 - 8)) + 8)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(preferences)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tìm bạn ở ghép phù hợp
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Hãy cho chúng tôi biết sở thích của bạn để tìm người phù hợp nhất
        </Typography>
        {matchCount && (
          <Box
            sx={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #10B98120 0%, #3B82F520 100%)',
              border: '1px solid #10B98140',
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              ✨ Khoảng {matchCount} người phù hợp với tiêu chí của bạn
            </Typography>
          </Box>
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Section 1: Budget */}
          <FormCard>
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ngân sách hàng tháng
                  </Typography>
                </Box>

                <Box>
                  <Slider
                    value={preferences.budget}
                    onChange={handleBudgetChange}
                    min={1}
                    max={15}
                    step={0.5}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 1, label: '1M' },
                      { value: 5, label: '5M' },
                      { value: 10, label: '10M' },
                      { value: 15, label: '15M+' },
                    ]}
                    sx={{
                      '& .MuiSlider-valueLabelLabel': {
                        fontSize: '0.85rem',
                      },
                    }}
                    valueLabelFormat={(value) => `${value}M`}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                    {preferences.budget[0]} - {preferences.budget[1]} triệu VND/tháng
                  </Typography>
                </Box>

                {/* Quick Budget Suggestions */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block', mb: 1 }}>
                    ⚡ Gợi ý nhanh
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {[
                      { label: '2–3M (Bình dân)', value: [2, 3] },
                      { label: '3–5M (Trung bình)', value: [3, 5] },
                      { label: '5–10M (Thoải mái)', value: [5, 10] },
                    ].map((item) => (
                      <Chip
                        key={item.label}
                        label={item.label}
                        onClick={() => setPreferences({ ...preferences, budget: item.value })}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Chọn khoảng ngân sách để tìm người có nhu cầu tương đương
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Section 2: Location */}
          <FormCard>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Khu vực mong muốn
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Chọn một hoặc nhiều khu vực (nếu không chọn, sẽ tìm ở tất cả)
                </Typography>

                <Grid container spacing={1}>
                  {districts.map((district) => (
                    <Grid item xs={6} sm={4} key={district}>
                      <LifestyleChip
                        label={district}
                        onClick={() => handleLocationToggle(district)}
                        selected={preferences.locations.includes(district)}
                        variant="outlined"
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Chọn quận/huyện mong muốn
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Section 3: Gender Preference */}
          <FormCard>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteBorderIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Giới tính mong muốn
                  </Typography>
                </Box>

                <RadioGroup
                  value={preferences.genderPreference}
                  onChange={(e) => setPreferences({ ...preferences, genderPreference: e.target.value })}
                >
                  <FormControlLabel value="any" control={<Radio />} label="Không quan tâm" />
                  <FormControlLabel value="Nam" control={<Radio />} label="Nam" />
                  <FormControlLabel value="Nữ" control={<Radio />} label="Nữ" />
                </RadioGroup>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Tùy chọn này là không bắt buộc
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Section 4: Lifestyle */}
          <FormCard>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Lối sống và thói quen
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Chọn những đặc điểm mô tả lối sống của bạn
                </Typography>

                <Grid container spacing={1.5}>
                  {LIFESTYLE_OPTIONS.map((option) => (
                    <Grid item xs={6} sm={4} md={3} key={option.id}>
                      <LifestyleChip
                        label={option.label}
                        onClick={() => handleLifestyleToggle(option.id)}
                        selected={preferences.lifestyle.includes(option.id)}
                        variant="outlined"
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Càng cụ thể thì kết quả càng chính xác
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Section 5: Interests */}
          <FormCard>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sở thích và hoạt động yêu thích
                  </Typography>
                </Box>

                <SuggestionInput
                  label="Thêm sở thích"
                  placeholder="Gõ sở thích của bạn..."
                  suggestions={INTEREST_SUGGESTIONS}
                  quickSelect={INTEREST_SUGGESTIONS.slice(0, 5)}
                  value={preferences.interests}
                  onChange={handleInterestsChange}
                  onQuickSelect={(item) => {
                    if (!preferences.interests.includes(item)) {
                      handleInterestsChange([...preferences.interests, item])
                    }
                  }}
                  multiple={true}
                  helperText="Thêm các hoạt động bạn yêu thích, ví dụ: yoga, du lịch, nấu ăn..."
                  showCount={true}
                />

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Những người cùng sở thích dễ tìm được nhau hơn
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Section 6: Duration */}
          <FormCard>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Thời gian ở
                </Typography>

                <RadioGroup
                  value={preferences.duration}
                  onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
                >
                  <FormControlLabel value="short-term" control={<Radio />} label="Ngắn hạn (1-3 tháng)" />
                  <FormControlLabel value="long-term" control={<Radio />} label="Dài hạn (3+ tháng)" />
                  <FormControlLabel value="flexible" control={<Radio />} label="Linh hoạt" />
                </RadioGroup>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  💡 Giúp tìm người có mục đích tương đồng
                </Typography>
              </Stack>
            </CardContent>
          </FormCard>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
            }}
          >
            {isLoading ? 'Đang tìm kiếm...' : '✨ Bắt đầu tìm kiếm'}
          </Button>

          <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Có thể chỉnh sửa tiêu chí sau khi bắt đầu
          </Typography>
        </Stack>
      </form>
    </Container>
  )
}

export default PreferenceForm
