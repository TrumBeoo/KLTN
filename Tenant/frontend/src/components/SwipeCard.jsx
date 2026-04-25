import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Rating,
  Avatar,
  Tooltip,
  Button,
} from '@mui/material'
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const SwipeCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  perspective: '1000px',
}))

const SwipeCardElement = styled(Card)(({ theme }) => ({
  cursor: 'grab',
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '24px',
  overflow: 'hidden',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[8],
  transition: 'transform 200ms ease, box-shadow 200ms ease',
  userSelect: 'none',
  touchAction: 'none',

  '&:hover': {
    boxShadow: theme.shadows[12],
  },

  '&:active': {
    cursor: 'grabbing',
  },
}))

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
  zIndex: 5,
  pointerEvents: 'none',
}))

const MatchScoreBadge = styled(Box)(({ theme, score }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor:
    score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : '#F59E0B',
  color: 'white',
  borderRadius: '50%',
  width: 64,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  fontWeight: 700,
  fontSize: '1.5rem',
  boxShadow: theme.shadows[6],
  zIndex: 10,
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.8,
    },
  },
}))

const InfoBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: 'text.primary',
  borderRadius: '12px',
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontWeight: 600,
  fontSize: '0.875rem',
  zIndex: 10,
  boxShadow: theme.shadows[2],
}))

/**
 * SwipeCard Component
 * Tinder-style card with drag/swipe interaction
 */
export const SwipeCard = ({
  match,
  index = 0,
  isActive = false,
  onSwipeRight,
  onSwipeLeft,
  onTap,
  zIndex,
  sx = {},
}) => {
  const cardRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [transform, setTransform] = useState({ x: 0, y: 0, rotate: 0 })
  const [swipeDirection, setSwipeDirection] = useState(null)

  const SWIPE_THRESHOLD = 100
  const MAX_ROTATION = 20

  useEffect(() => {
    if (!isActive) return

    const handleMouseDown = (e) => {
      if (e.button !== 0) return // Only left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const progress = Math.min(distance / SWIPE_THRESHOLD, 1)
      const rotation = (deltaX / SWIPE_THRESHOLD) * MAX_ROTATION

      setTransform({
        x: deltaX,
        y: deltaY,
        rotate: rotation,
      })

      setSwipeDirection(deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : null)
    }

    const handleMouseUp = (e) => {
      if (!isDragging) return
      setIsDragging(false)

      const distance = Math.sqrt(
        transform.x * transform.x + transform.y * transform.y
      )

      if (distance > SWIPE_THRESHOLD) {
        if (transform.x > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        setTransform({ x: 0, y: 0, rotate: 0 })
        setSwipeDirection(null)
      }
    }

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX, y: touch.clientY })
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y

      const rotation = (deltaX / SWIPE_THRESHOLD) * MAX_ROTATION
      setTransform({
        x: deltaX,
        y: deltaY,
        rotate: rotation,
      })
      setSwipeDirection(deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : null)
    }

    const handleTouchEnd = (e) => {
      if (!isDragging) return
      setIsDragging(false)

      const distance = Math.sqrt(
        transform.x * transform.x + transform.y * transform.y
      )

      if (distance > SWIPE_THRESHOLD) {
        if (transform.x > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        setTransform({ x: 0, y: 0, rotate: 0 })
        setSwipeDirection(null)
      }
    }

    const element = cardRef.current
    if (!element) return

    element.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragStart, transform, isActive, onSwipeRight, onSwipeLeft])

  return (
    <SwipeCardContainer
      ref={cardRef}
      sx={{
        zIndex: zIndex,
        ...sx,
      }}
    >
      <SwipeCardElement
        sx={{
          transform: isActive
            ? `translateX(${transform.x}px) translateY(${transform.y}px) rotate(${transform.rotate}deg)`
            : `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
          opacity: index > 1 ? 0 : 1,
          pointerEvents: isActive ? 'auto' : 'none',
          transition: isDragging ? 'none' : 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => {
          if (!isDragging) onTap?.()
        }}
      >
        {/* Image Section */}
        <Box sx={{ position: 'relative', height: '65%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={match.image}
            alt={match.name}
            sx={{
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 300ms ease',
              '&:hover': {
                transform: isDragging ? 'scale(1)' : 'scale(1.05)',
              },
            }}
          />

          {/* Gradient Overlay */}
          <GradientOverlay />

          {/* Match Score Badge */}
          <MatchScoreBadge score={match.matchData.score}>
            <Box>{match.matchData.score}%</Box>
            <TrendingUpIcon sx={{ fontSize: '0.9rem' }} />
          </MatchScoreBadge>

          {/* Swipe Direction Indicator */}
          {swipeDirection === 'right' && (
            <InfoBadge
              sx={{
                left: 16,
                background: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
              }}
            >
              <FavoriteIcon sx={{ fontSize: '1.2rem' }} />
              THÍCH
            </InfoBadge>
          )}
          {swipeDirection === 'left' && (
            <InfoBadge
              sx={{
                left: 16,
                background: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
              }}
            >
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
              BỎ QUA
            </InfoBadge>
          )}
        </Box>

        {/* Content Section */}
        <CardContent
          sx={{
            height: '35%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
            overflow: 'hidden',
          }}
        >
          {/* Name & Basic */}
          <Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {match.name}, {match.age}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {match.occupation}
              </Typography>
            </Box>

            {/* Bio Preview */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {match.bio}
            </Typography>
          </Box>

          {/* Info Chips */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              overflow: 'hidden',
              '& > *': {
                flexShrink: 0,
              },
            }}
          >
            <Chip
              size="small"
              label={`${match.budget[0]}-${match.budget[1]}M`}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip
              size="small"
              label={match.districts[0] || 'Toàn thành'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        </CardContent>
      </SwipeCardElement>
    </SwipeCardContainer>
  )
}

export default SwipeCard
