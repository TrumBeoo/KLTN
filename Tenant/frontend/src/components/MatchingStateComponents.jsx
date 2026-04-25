import { Box, Button, Container, Stack, Typography } from '@mui/material'
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const AnimatedIcon = styled(Box)(({ theme }) => ({
  animation: 'bounce 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
}))

/**
 * Empty State - No matches found
 */
export const EmptyState = ({ onAdjustFilters, onBack }) => (
  <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
    <AnimatedIcon sx={{ mb: 2 }}>
      <AutoAwesomeIcon sx={{ fontSize: '4rem', color: 'primary.main' }} />
    </AnimatedIcon>

    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
      Không tìm thấy phù hợp
    </Typography>
    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
      Có vẻ như không có ai phù hợp với tiêu chí của bạn lúc này. Hãy thử điều chỉnh lại để tìm thêm lựa chọn!
    </Typography>

    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'center' }}>
      <Button variant="outlined" onClick={onBack} sx={{ minWidth: 160 }}>
        ← Quay lại
      </Button>
      <Button
        variant="contained"
        onClick={onAdjustFilters}
        startIcon={<TrendingUpIcon />}
        sx={{ minWidth: 160 }}
      >
        Điều chỉnh tiêu chí
      </Button>
    </Stack>

    <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.subtle', borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: 'primary.main' }}>
        💡 Mẹo: Hãy mở rộng ngân sách hoặc khu vực để có thêm lựa chọn
      </Typography>
    </Box>
  </Container>
)

/**
 * Match Success Screen
 */
export const MatchSuccessScreen = ({ matchName, score, onContinue, onViewProfile }) => (
  <Container
    maxWidth="sm"
    sx={{
      py: 6,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    <Box
      sx={{
        position: 'relative',
        mb: 4,
        animation: 'scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        '@keyframes scaleIn': {
          from: { transform: 'scale(0.5)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
      }}
    >
      <CelebrationIcon sx={{ fontSize: '5rem', color: 'success.main' }} />
    </Box>

    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        mb: 1,
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      Tuyệt vời!
    </Typography>

    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
      Bạn vừa thích <strong>{matchName}</strong>
    </Typography>

    <Box
      sx={{
        display: 'inline-block',
        p: 2,
        bgcolor: 'success.light',
        borderRadius: 2,
        mb: 4,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <TrendingUpIcon sx={{ color: 'success.main', fontSize: '2rem' }} />
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Độ phù hợp
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
            {score}%
          </Typography>
        </Box>
      </Stack>
    </Box>

    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'center' }}>
      <Button
        variant="outlined"
        onClick={onContinue}
        sx={{ minWidth: 160 }}
      >
        ← Tiếp tục tìm kiếm
      </Button>
      <Button
        variant="contained"
        onClick={onViewProfile}
        sx={{ minWidth: 160 }}
      >
        Xem hồ sơ →
      </Button>
    </Stack>

    <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.subtle', borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: 'primary.main' }}>
        💡 Hãy gửi lời nhắn để có cơ hội ghép đôi hoàn hảo!
      </Typography>
    </Box>
  </Container>
)

/**
 * Loading Skeleton for Match Cards
 */
export const MatchCardSkeleton = () => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      bgcolor: 'grey.100',
      borderRadius: 3,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
    }}
  />
)
