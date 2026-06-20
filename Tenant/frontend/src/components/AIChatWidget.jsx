/**
 * AIChatWidget â€” Hybrid Chat + Agent
 *
 * Architecture (Human-in-the-loop):
 *   AI detects intent â†’ collects info â†’ builds payload
 *   â†’ renders BookingCard inside chat (user sees & confirms)
 *   â†’ user clicks [XĂ¡c nháº­n] â†’ Frontend calls Tenant backend API
 *   â†’ Backend validates + creates booking + notifies landlord
 *
 * AI NEVER creates bookings directly. Backend is the execution engine.
 *
 * Design: Booking.com-inspired (#006ce4), clean, conversational.
 * Booking card: Airbnb-style compact confirmation with status timeline.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, IconButton, Typography, TextField, Stack,
  CircularProgress, Chip, Avatar, Tooltip, Paper, Button,
  Collapse, Alert,
} from '@mui/material'
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as SparkleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorIcon,
  HourglassEmpty as PendingIcon,
  NavigateNext as ArrowIcon,
} from '@mui/icons-material'
import { styled, keyframes } from '@mui/material/styles'

// â”€â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const T = {
  blue:    '#006ce4',
  blueDk:  '#003f8a',
  blueLt:  '#e8f2ff',
  text:    '#1a1a1a',
  muted:   '#595959',
  bg:      '#f2f4f8',
  white:   '#ffffff',
  border:  '#d4d6d9',
  green:   '#008234',
  greenLt: '#e8f5ee',
  yellow:  '#febb02',
  red:     '#c8102e',
  redLt:   '#fde8eb',
  orange:  '#f5a623',
  orangeLt:'#fef6e8',
}

const WELCOME_TEXT = '👋 Xin chào! Tôi là **Ren** từ Rentify.\n\nTôi có thể giúp bạn:\n• Tìm kiếm phòng phù hợp\n• Đặt lịch xem phòng ngay trong chat\n• Tư vấn khu vực, giá cả'
const WELCOME_ANON_TEXT = `${WELCOME_TEXT}\n\n⚠️ **Lưu ý:** Đăng nhập để lưu lịch sử chat và đặt lịch xem phòng!`
const WELCOME_AUTH_TEXT = `${WELCOME_TEXT}\n\nBạn cần tìm gì hôm nay?`

// â”€â”€â”€ Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`
const successPop = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
`
const cardSlide = keyframes`
  from { opacity: 0; transform: translateY(14px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

// â”€â”€â”€ Styled components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 380,
  height: 560,
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 16px 48px rgba(0,108,228,0.18), 0 4px 16px rgba(26,26,26,0.12)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: T.white,
  border: `1px solid ${T.border}`,
  position: 'relative',
  zIndex: 10000,
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 40px)',
    maxWidth: 380,
    height: 'calc(100vh - 120px)',
    maxHeight: 560,
  },
}))

const MessageBubble = styled(Box)(({ role }) => ({
  maxWidth: '82%',
  padding: '9px 13px',
  borderRadius: role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
  backgroundColor: role === 'user' ? T.blue : T.bg,
  color: role === 'user' ? T.white : T.text,
  fontSize: '0.857rem',
  lineHeight: 1.6,
  wordBreak: 'break-word',
  boxShadow: role === 'user'
    ? '0 2px 8px rgba(0,108,228,0.25)'
    : '0 1px 4px rgba(26,26,26,0.07)',
  animation: `${fadeUp} 220ms ease`,
  '& strong, & b': { fontWeight: 700 },
  '& a': { color: role === 'user' ? '#b3d4ff' : T.blue, textDecoration: 'underline' },
}))

const TypingDot = styled(Box)(({ delay = '0s' }) => ({
  width: 7, height: 7, borderRadius: '50%',
  backgroundColor: T.blue,
  animation: `${pulse} 1.3s ease-in-out ${delay} infinite`,
}))

const SuggestionChip = styled(Chip)({
  height: 27,
  fontSize: '0.786rem',
  fontWeight: 600,
  backgroundColor: T.blueLt,
  color: T.blue,
  border: `1px solid rgba(0,108,228,0.2)`,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 150ms ease',
  '&:hover': { backgroundColor: '#d0e8ff', borderColor: T.blue, transform: 'translateY(-1px)' },
})

// â”€â”€â”€ BookingCard component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Renders inline inside the chat conversation.
 * NO modal popups â€” everything stays conversational.
 *
 * States:
 *   idle        â†’ show info + [XĂ¡c nháº­n] + [Há»§y]
 *   confirming  â†’ loading spinner while calling backend
 *   success     â†’ success animation + schedule ID
 *   error       â†’ error message + [Thá»­ láº¡i]
 *   cancelled   â†’ soft cancelled state
 */
function BookingCard({ card, userId, authToken, tenantBackendUrl, onResult }) {
  const [status, setStatus]       = useState('idle')   // idle | confirming | success | error | cancelled
  const [errorMsg, setErrorMsg]   = useState('')
  const [scheduleId, setScheduleId] = useState(null)

  const {
    room_code,
    room_id,
    room_info = {},
    viewing_date,
    viewing_date_display,
    viewing_time,
    api_endpoint,
  } = card

  const fmt = p => p ? Math.floor(parseFloat(p)).toLocaleString('vi-VN') : null
  const price = fmt(room_info.price)
  const resolvedRoomId = room_id || null
  // Remove /api suffix if present to avoid duplication
  const BACKEND_URL = (tenantBackendUrl || 'http://localhost:5000/api').replace(/\/api$/, '')

  // â”€â”€ User clicks "XĂ¡c nháº­n Ä‘áº·t lá»‹ch" â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleConfirm = async () => {
    console.log('[BookingCard] Confirm clicked', { userId, authToken: authToken ? 'present' : 'missing' })
    
    if (!userId) {
      setErrorMsg('Bạn cần đăng nhập để đặt lịch. Vui lòng đăng nhập và thử lại.')
      setStatus('error')
      return
    }
    
    if (!authToken) {
      setErrorMsg('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      setStatus('error')
      return
    }

    setStatus('confirming')
    setErrorMsg('')

    try {
      // Step 1: Get RoomID from RoomCode via AI chat backend
      let roomId = null
      try {
        const slotRes = await fetch(
          `${BACKEND_URL.replace('/api', '')}:8000/booking/available-slots/${room_code}?date=${viewing_date}`,
          { method: 'GET' }
        )
        // Actually we just need roomId â€” fetch from tenant backend
      } catch (_) {}

      // Step 2: Call Tenant backend to create the schedule
      // The backend validates: slot availability, no duplicate, room status, etc.
      if (!resolvedRoomId && !room_code) {
        setErrorMsg('Không xác định được phòng để đặt lịch. Vui lòng thử lại.')
        setStatus('error')
        return
      }

      const endpoint = `${BACKEND_URL}/api${api_endpoint || '/viewing-schedule/schedule'}`
      
      console.log('[BookingCard] Calling endpoint:', endpoint)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          roomId: resolvedRoomId || room_code,
          date:   viewing_date,
          time:   viewing_time,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const nextScheduleId = data.scheduleId || data.ScheduleID || 'SCH-OK'
        setScheduleId(nextScheduleId)
        setStatus('success')
        window.dispatchEvent(new CustomEvent('viewing-schedule:changed', {
          detail: {
            scheduleId: nextScheduleId,
            roomId: resolvedRoomId,
            roomCode: room_code,
            status: 'Chờ duyệt',
            viewingDate: viewing_date,
            viewingTime: viewing_time,
          },
        }))
        localStorage.setItem('viewing_schedule_updated_at', String(Date.now()))
        onResult?.({ type: 'success', scheduleId: nextScheduleId, roomId: resolvedRoomId, roomCode: room_code, card })
      } else {
        setErrorMsg(data.message || 'Đặt lịch thất bại. Vui lòng thử lại.')
        setStatus('error')
        onResult?.({ type: 'error', message: data.message, card })
      }
    } catch (err) {
      console.error('[BookingCard] Error:', err)
      setErrorMsg('Lỗi kết nối tới server. Kiểm tra lại mạng và thử lại.')
      setStatus('error')
    }
  }

  const handleCancel = () => {
    setStatus('cancelled')
    onResult?.({ type: 'cancelled', card })
  }

  const handleRetry = () => {
    setStatus('idle')
    setErrorMsg('')
  }

  // â”€â”€ Card container styles by state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const borderColor = {
    idle:       T.blue,
    confirming: T.blue,
    success:    T.green,
    error:      T.red,
    cancelled:  T.border,
  }[status]

  return (
    <Box
      sx={{
        animation: `${cardSlide} 280ms cubic-bezier(0.34,1.56,0.64,1)`,
        maxWidth: '85%',
        mt: 0.5,
      }}
    >
      <Box
        sx={{
          borderRadius: '12px',
          border: `1.5px solid ${borderColor}`,
          overflow: 'hidden',
          backgroundColor: T.white,
          boxShadow: status === 'success'
            ? `0 4px 20px rgba(0,130,52,0.18)`
            : `0 2px 12px rgba(0,108,228,0.12)`,
          transition: 'border-color 300ms ease, box-shadow 300ms ease',
        }}
      >
        {/* â”€â”€ Header bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{
          background: status === 'success'
            ? `linear-gradient(135deg, ${T.green}, #00a040)`
            : status === 'cancelled'
            ? T.border
            : `linear-gradient(135deg, ${T.blue}, ${T.blueDk})`,
          px: 2, py: 1.25,
          display: 'flex', alignItems: 'center', gap: 1,
          transition: 'background 400ms ease',
        }}>
          <CalendarIcon sx={{ fontSize: 16, color: T.white }} />
          <Typography sx={{ fontSize: '0.786rem', fontWeight: 700, color: T.white, flex: 1, letterSpacing: '0.04em' }}>
            {status === 'success' ? 'ĐẶT LỊCH THÀNH CÔNG' :
             status === 'cancelled' ? 'ĐÃ HỦY' :
             'XÁC NHẬN ĐẶT LỊCH XEM PHÒNG'}
          </Typography>
          {status === 'idle' && (
            <Box sx={{
              fontSize: '0.643rem', fontWeight: 700, color: T.yellow,
              border: `1px solid ${T.yellow}`, borderRadius: '4px',
              px: 0.75, py: 0.25, letterSpacing: '0.06em',
            }}>
              CHỜ XÁC NHẬN
            </Box>
          )}
        </Box>

        {/* â”€â”€ Room info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{ px: 2, pt: 1.75, pb: 1 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '8px',
              backgroundColor: T.blueLt,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <HomeIcon sx={{ fontSize: 20, color: T.blue }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, lineHeight: 1.3, mb: 0.25 }}>
                {room_info.title || room_code}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {room_info.room_type && (
                  <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{room_info.room_type}</Typography>
                )}
                {room_info.area && (
                  <>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: T.border }} />
                    <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{room_info.area}m²</Typography>
                  </>
                )}
                {price && (
                  <>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: T.border }} />
                    <Typography sx={{ fontSize: '0.786rem', color: T.blue, fontWeight: 700 }}>{price}đ/tháng</Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* â”€â”€ Date/Time details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Box sx={{
            bgcolor: status === 'success' ? T.greenLt : T.blueLt,
            borderRadius: '8px', px: 1.5, py: 1.25,
            mb: 1.5,
            border: `1px solid ${status === 'success' ? 'rgba(0,130,52,0.2)' : 'rgba(0,108,228,0.15)'}`,
            transition: 'all 300ms ease',
          }}>
            <Stack direction="row" spacing={3}>
              <Stack spacing={0.25}>
                <Typography sx={{ fontSize: '0.643rem', color: T.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Ngày xem
                </Typography>
                <Typography sx={{ fontSize: '0.857rem', fontWeight: 700, color: T.text }}>
                  {viewing_date_display || viewing_date}
                </Typography>
              </Stack>
              <Box sx={{ width: 1, bgcolor: T.border }} />
              <Stack spacing={0.25}>
                <Typography sx={{ fontSize: '0.643rem', color: T.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Giờ xem
                </Typography>
                <Typography sx={{ fontSize: '0.857rem', fontWeight: 700, color: T.text }}>
                  🕐 {viewing_time}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* â”€â”€ Status timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {status === 'idle' && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.714rem', color: T.muted, mb: 0.75 }}>
                Sau khi xác nhận:
              </Typography>
              <Stack spacing={0.5}>
                {[
                  { icon: '✅', label: 'Lịch được ghi nhận ngay lập tức' },
                  { icon: '🔔', label: 'Chủ nhà nhận thông báo' },
                  { icon: '⏱', label: 'Xác nhận trong vòng 15-30 phút' },
                ].map((step, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
                    <Typography sx={{ fontSize: '0.857rem', lineHeight: 1 }}>{step.icon}</Typography>
                    <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{step.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* â”€â”€ Success state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {status === 'success' && (
            <Box sx={{
              textAlign: 'center', py: 1,
              animation: `${successPop} 500ms cubic-bezier(0.34,1.56,0.64,1)`,
            }}>
              <CheckCircleIcon sx={{ fontSize: 36, color: T.green, mb: 0.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.green, mb: 0.25 }}>
                Đặt lịch thành công! 🎉
              </Typography>
              <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>
                Chủ nhà sẽ liên hệ xác nhận sớm nhé.
              </Typography>
              {scheduleId && (
                <Typography sx={{ fontSize: '0.714rem', color: T.muted, mt: 0.5 }}>
                  Mã lịch: <Box component="span" sx={{ fontWeight: 700, color: T.blue }}>{scheduleId}</Box>
                </Typography>
              )}
            </Box>
          )}

          {/* â”€â”€ Error state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {status === 'error' && (
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="flex-start" spacing={0.75}
                sx={{ bgcolor: T.redLt, p: 1.25, borderRadius: '8px', border: `1px solid rgba(200,16,46,0.2)` }}>
                <ErrorIcon sx={{ fontSize: 16, color: T.red, mt: 0.125, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.786rem', color: T.red, lineHeight: 1.5 }}>
                  {errorMsg}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* â”€â”€ Cancelled state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {status === 'cancelled' && (
            <Box sx={{ textAlign: 'center', py: 0.75 }}>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
                Bạn đã hủy xác nhận lịch này.
              </Typography>
            </Box>
          )}
        </Box>

        {/* â”€â”€ Action buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {(status === 'idle' || status === 'error') && (
          <Box sx={{ px: 2, pb: 1.75, display: 'flex', gap: 1 }}>
            {status === 'error' ? (
              <>
                <Button
                  fullWidth variant="outlined" size="small"
                  onClick={handleCancel}
                  sx={{
                    borderColor: T.border, color: T.muted, borderRadius: '8px',
                    fontSize: '0.786rem', fontWeight: 600,
                    '&:hover': { borderColor: T.muted, bgcolor: T.bg },
                  }}
                >
                  Bỏ qua
                </Button>
                <Button
                  fullWidth variant="contained" size="small"
                  onClick={handleRetry}
                  sx={{
                    bgcolor: T.blue, borderRadius: '8px',
                    fontSize: '0.786rem', fontWeight: 700,
                    '&:hover': { bgcolor: T.blueDk },
                  }}
                >
                  Thử lại
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth variant="outlined" size="small"
                  onClick={handleCancel}
                  startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    borderColor: T.border, color: T.muted, borderRadius: '8px',
                    fontSize: '0.786rem', fontWeight: 600, flex: 0.65,
                    '&:hover': { borderColor: T.muted, bgcolor: T.bg },
                  }}
                >
                  Hủy
                </Button>
                <Button
                  fullWidth variant="contained" size="small"
                  onClick={handleConfirm}
                  startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    bgcolor: T.blue, borderRadius: '8px',
                    fontSize: '0.786rem', fontWeight: 700, flex: 1.35,
                    '&:hover': { bgcolor: T.blueDk },
                    boxShadow: '0 2px 8px rgba(0,108,228,0.35)',
                  }}
                >
                  Xác nhận đặt lịch
                </Button>
              </>
            )}
          </Box>
        )}

        {/* â”€â”€ Confirming state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {status === 'confirming' && (
          <Box sx={{ px: 2, pb: 1.75 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
              bgcolor: T.blueLt, borderRadius: '8px', py: 1.5,
              border: `1px solid rgba(0,108,228,0.2)`,
            }}>
              <CircularProgress size={16} sx={{ color: T.blue }} />
              <Typography sx={{ fontSize: '0.857rem', color: T.blue, fontWeight: 600 }}>
                Đang đặt lịch...
              </Typography>
            </Box>
          </Box>
        )}

        {/* â”€â”€ Footer note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {status === 'idle' && (
          <Box sx={{
            px: 2, pb: 1.25,
            borderTop: `1px solid ${T.bg}`,
            pt: 0.75,
          }}>
            <Typography sx={{ fontSize: '0.643rem', color: T.muted, textAlign: 'center', lineHeight: 1.4 }}>
              🔒 Thông tin liên hệ chủ nhà sẽ được cung cấp sau khi lịch được duyệt
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// â”€â”€â”€ SlotPicker â€” inline slot selection chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SlotPicker({ slots, onSelect }) {
  if (!slots || slots.length === 0) return null
  return (
    <Box sx={{
      maxWidth: '85%',
      animation: `${fadeUp} 220ms ease`,
    }}>
      <Box sx={{
        borderRadius: '12px', border: `1.5px solid ${T.border}`,
        overflow: 'hidden', backgroundColor: T.white,
        boxShadow: '0 2px 8px rgba(26,26,26,0.08)',
      }}>
        <Box sx={{ bgcolor: T.bg, px: 2, py: 1, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontSize: '0.786rem', fontWeight: 700, color: T.text, letterSpacing: '0.04em' }}>
            🕐 CHỌN KHUNG GIỜ
          </Typography>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {slots.map(slot => (
              <Box
                key={slot}
                onClick={() => onSelect(slot)}
                sx={{
                  px: 1.5, py: 0.75, borderRadius: '8px',
                  border: `1.5px solid ${T.blue}`,
                  backgroundColor: T.blueLt,
                  color: T.blue, fontSize: '0.857rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 150ms ease',
                  '&:hover': { bgcolor: T.blue, color: T.white, transform: 'translateY(-2px)' },
                }}
              >
                {slot}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// â”€â”€â”€ formatMessage â€” markdown-lite + room code links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RoomCodeStyles = `
  .room-link {
    color: #006ce4;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1.5px solid #006ce4;
    transition: all 120ms ease;
    cursor: pointer;
  }
  .room-link:hover {
    color: #003f8a;
    border-bottom-color: #003f8a;
    background-color: #e8f2ff;
    border-radius: 2px;
  }
`

function formatMessage(text, roomData = null) {
  if (!text) return ''

  const markdownLinks = []
  const protectedText = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^)\s]+)\)/g, (_, label, href) => {
    const token = `__MD_LINK_${markdownLinks.length}__`
    const isExternal = /^https?:\/\//.test(href)
    markdownLinks.push(
      `<a href="${href}" class="room-link" data-code="${label}"${isExternal ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`
    )
    return token
  })

  let html = protectedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code style="background:#f2f4f8;padding:1px 5px;border-radius:3px;font-size:0.857em;font-family:monospace">$1</code>')
    .replace(/\n/g,            '<br/>')

  // Link room codes in text
  if (roomData && Array.isArray(roomData)) {
    roomData.forEach(room => {
      const code = room.RoomCode
      const id = room.RoomID // Use RoomID if available
      if (code) {
        const regex = new RegExp(`\\b(${code})\\b`, 'g')
        // Use RoomID in href if available, otherwise fallback to code
        const href = id ? `/room/${id}` : `/room/${code}`
        html = html.replace(regex, `<a href="${href}" class="room-link" data-code="${code}" data-id="${id || ''}">${code}</a>`)
      }
    })
  }
  // Also auto-link any ROM##### pattern (will need to be resolved by click handler)
  html = html.replace(/\b(ROM\d{5,})\b(?![^<]*>)/g,
    `<a href="/room/$1" class="room-link" data-code="$1">$1</a>`)

  markdownLinks.forEach((linkHtml, index) => {
    html = html.replace(`__MD_LINK_${index}__`, linkHtml)
  })

  return html
}

// â”€â”€â”€ Quick prompts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const QUICK_PROMPTS = [
  'Phòng còn trống?',
  'Phòng giá rẻ nhất',
  'Gợi ý phòng cho tôi',
  'Đặt lịch xem phòng',
]

// â”€â”€â”€ Main AIChatWidget â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AIChatWidget({
  apiUrl          = 'http://localhost:8000',
  tenantBackendUrl = 'http://localhost:5000/api',
  onClose,
  userId    = null,
  authToken = null,
}) {
  const navigate = useNavigate()
  const [input, setInput]               = useState('')
  const [messages, setMessages]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [suggestions, setSuggestions]   = useState(QUICK_PROMPTS)
  const [history, setHistory]           = useState([])
  const [sessionId, setSessionId]       = useState(null) // KhĂ´ng lÆ°u vĂ o localStorage cho anonymous
  const [pendingSlots, setPendingSlots] = useState(null) // { slots, message_id }
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const startFreshSessionRef = useRef(false)

  // â”€â”€ LÆ°u sessionId vĂ o localStorage CHá»ˆ KHI Ä‘Ă£ Ä‘Äƒng nháº­p â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    // CHá»ˆ lÆ°u náº¿u user Ä‘Ă£ Ä‘Äƒng nháº­p (cĂ³ userId vĂ  authToken)
    if (userId && authToken && sessionId) {
      const storageKey = `ai_chat_session_${userId}`
      localStorage.setItem(storageKey, sessionId)
      console.log('[AIChatWidget] Session saved for user:', userId, 'sessionId:', sessionId)
    } else if (!userId || !authToken) {
      // KhĂ´ng cĂ³ userId hoáº·c authToken - khĂ´ng lÆ°u vĂ o localStorage
      // XĂ³a session cÅ© náº¿u cĂ³
      if (userId) {
        localStorage.removeItem(`ai_chat_session_${userId}`)
      }
    }
  }, [sessionId, userId, authToken])

  // â”€â”€ Load chat history CHá»ˆ KHI Ä‘Ă£ Ä‘Äƒng nháº­p â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const loadChatHistory = async () => {
      // KIá»‚M TRA CHáº¶T CHáº¼: Chá»‰ load khi Ä‘Ă£ Ä‘Äƒng nháº­p
      if (!userId || !authToken) {
        console.log('[AIChatWidget] No userId/authToken - skipping history load')
        // Hiá»‡n welcome message cho anonymous user
        setMessages([{
          id: 'welcome', role: 'assistant', timestamp: new Date(),
          text: WELCOME_ANON_TEXT,
        }])
        setTimeout(() => inputRef.current?.focus(), 350)
        return
      }

      // Kiá»ƒm tra sessionId tá»« localStorage cho user nĂ y
      const storageKey = `ai_chat_session_${userId}`
      const storedSessionId = localStorage.getItem(storageKey)
      
      if (storedSessionId && !sessionId) {
        console.log('[AIChatWidget] Found stored session for user:', userId)
        setSessionId(storedSessionId)
      }
      
      // Náº¿u cĂ³ sessionId (tá»« state hoáº·c localStorage), load history
      const targetSessionId = sessionId || storedSessionId
      if (!targetSessionId) {
        console.log('[AIChatWidget] No session to load - starting fresh')
        setMessages([{
          id: 'welcome', role: 'assistant', timestamp: new Date(),
          text: WELCOME_AUTH_TEXT,
        }])
        setTimeout(() => inputRef.current?.focus(), 350)
        return
      }
      
      try {
        console.log('[AIChatWidget] Loading history for session:', targetSessionId)
        const res = await fetch(`${apiUrl}/chat/session/${targetSessionId}`)
        
        if (!res.ok) {
          console.warn('[AIChatWidget] Failed to load session:', res.status)
          // XĂ³a sessionId khĂ´ng há»£p lá»‡
          localStorage.removeItem(storageKey)
          setSessionId(null)
          setMessages([{
            id: 'welcome', role: 'assistant', timestamp: new Date(),
            text: WELCOME_AUTH_TEXT,
          }])
          return
        }
        
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          // Convert DB messages to frontend format
          const loadedMessages = data.data.map(msg => ({
            id: msg.MessageID,
            role: msg.Role,
            text: msg.Content,
            timestamp: new Date(msg.CreatedAt),
            intent: msg.Intent,
            data: msg.ResponseData ? JSON.parse(msg.ResponseData) : null,
          }))
          
          setMessages(loadedMessages)
          
          // Rebuild history for AI context
          const loadedHistory = data.data.map(msg => ({
            role: msg.Role,
            content: msg.Content
          }))
          setHistory(loadedHistory)
          
          console.log('[AIChatWidget] Loaded', loadedMessages.length, 'messages from session:', targetSessionId)
        } else {
          console.log('[AIChatWidget] No messages in session')
          setMessages([{
            id: 'welcome', role: 'assistant', timestamp: new Date(),
            text: WELCOME_AUTH_TEXT,
          }])
        }
      } catch (err) {
        console.error('[AIChatWidget] Failed to load chat history:', err)
        // XĂ³a sessionId lá»—i
        localStorage.removeItem(storageKey)
        setSessionId(null)
        setMessages([{
          id: 'welcome', role: 'assistant', timestamp: new Date(),
          text: WELCOME_AUTH_TEXT,
        }])
      }
      
      setTimeout(() => inputRef.current?.focus(), 350)
    }
    
    loadChatHistory()
  }, [userId, authToken, apiUrl])

  // â”€â”€ On mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    // useEffect load history sáº½ xá»­ lĂ½ viá»‡c hiá»‡n thá»‹ welcome message
    // KhĂ´ng cáº§n lĂ m gĂ¬ á»Ÿ Ä‘Ă¢y
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, pendingSlots])

  // â”€â”€ Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleReset = () => {
    setMessages([])
    setHistory([])
    setSuggestions(QUICK_PROMPTS)
    setSessionId(null)
    setPendingSlots(null)
    startFreshSessionRef.current = true
    
    // XĂ³a localStorage cho user hiá»‡n táº¡i
    if (userId) {
      localStorage.removeItem(`ai_chat_session_${userId}`)
      console.log('[AIChatWidget] Cleared session for user:', userId)
    }
    
    setTimeout(() => setMessages([{
      id: 'reset', role: 'assistant', timestamp: new Date(),
      text: '🔄 Cuộc trò chuyện mới! Mình có thể giúp gì cho bạn?',
    }]), 80)
  }

  // â”€â”€ Booking card result callback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleBookingResult = useCallback((result) => {
    if (result.type === 'success') {
      const successMsg = {
        id: `booking-ok-${Date.now()}`, role: 'assistant', timestamp: new Date(),
        text: `✅ **Đặt lịch thành công!** Chủ nhà sẽ liên hệ xác nhận trong vòng 15–30 phút.\n\nBạn có thể xem chi tiết tại [Hồ sơ](/profile) → Lịch xem phòng.`,
      }
      setMessages(prev => [...prev, successMsg])
      setSuggestions(['Xem lịch đã đặt', 'Tìm phòng khác', 'Phòng gần đây'])
    } else if (result.type === 'cancelled') {
      const cancelMsg = {
        id: `booking-cancel-${Date.now()}`, role: 'assistant', timestamp: new Date(),
        text: 'Đã hủy. Bạn có muốn chọn thời gian khác hoặc tìm phòng khác không?',
      }
      setMessages(prev => [...prev, cancelMsg])
      setSuggestions(['Chọn thời gian khác', 'Tìm phòng khác', 'Phòng giá rẻ'])
    }
  }, [])

  // â”€â”€ Slot selected from SlotPicker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSlotSelect = useCallback((slot) => {
    setPendingSlots(null)
    sendMessage(slot)
  }, [])

  const upsertAssistantMessage = useCallback((messageId, patch) => {
    setMessages(prev => {
      const index = prev.findIndex(msg => msg.id === messageId)
      if (index === -1) {
        return [...prev, {
          id: messageId,
          role: 'assistant',
          timestamp: new Date(),
          ...patch,
        }]
      }

      const next = [...prev]
      next[index] = {
        ...next[index],
        ...patch,
      }
      return next
    })
  }, [])

  // â”€â”€ Core send function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText) return

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: userText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setSuggestions([])
    setPendingSlots(null)

    const newHistory = [...history, { role: 'user', content: userText }]
    const botMsgId = `a-${Date.now()}`
    const payload = {
      message: userText,
      conversation_history: newHistory.slice(-8),
      user_id: userId,
      session_id: sessionId,
      force_new_session: startFreshSessionRef.current,
    }

    const applyFinalResponse = (data, fallbackText = '') => {
      if (data.session_id && !sessionId) setSessionId(data.session_id)
      startFreshSessionRef.current = false

      const enrichedData = data.data

      if (data.booking_card) {
        upsertAssistantMessage(botMsgId, {
          text: data.reply || fallbackText || 'Kiểm tra thông tin và xác nhận nhé!',
          data: enrichedData,
          intent: data.intent,
          booking_card: data.booking_card,
          booking_state: data.booking_state,
          timestamp: new Date(),
        })
        setSuggestions([])
      } else if (data.booking_state === 'awaiting_slot_selection' && data.available_slots?.length > 0) {
        upsertAssistantMessage(botMsgId, {
          text: data.reply || fallbackText,
          data: enrichedData,
          intent: data.intent,
          booking_state: data.booking_state,
          timestamp: new Date(),
        })
        setPendingSlots({ slots: data.available_slots, msgId: botMsgId })
        setSuggestions([])
      } else {
        upsertAssistantMessage(botMsgId, {
          text: data.reply || fallbackText || 'Xin lỗi, có lỗi xảy ra.',
          data: enrichedData,
          intent: data.intent,
          timestamp: new Date(),
        })
        setSuggestions(data.suggested_questions || [])
      }

      setHistory([...newHistory, { role: 'assistant', content: data.reply || fallbackText || '' }])
    }

    const fallbackToNonStream = async () => {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      applyFinalResponse(data)
    }

    try {
      const streamRes = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
      })

      if (!streamRes.ok || !streamRes.body) {
        await fallbackToNonStream()
        return
      }

      const reader = streamRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamedText = ''
      let finalPayload = null

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const rawEvent of events) {
          const dataLine = rawEvent.split('\n').find(line => line.startsWith('data: '))
          if (!dataLine) continue

          const event = JSON.parse(dataLine.slice(6))

          if (event.type === 'meta') {
            if (event.session_id && !sessionId) setSessionId(event.session_id)
            continue
          }

          if (event.type === 'status') {
            upsertAssistantMessage(botMsgId, {
              text: event.content || 'Mình đang xử lý yêu cầu của bạn...',
              timestamp: new Date(),
            })
            continue
          }

          if (event.type === 'chunk') {
            streamedText += event.content || ''
            upsertAssistantMessage(botMsgId, {
              text: streamedText,
              timestamp: new Date(),
            })
            continue
          }

          if (event.type === 'final') {
            finalPayload = event
            applyFinalResponse(event, streamedText)
            break
          }

          if (event.type === 'error') {
            throw new Error(event.error || event.reply || 'Streaming failed')
          }
        }

        if (finalPayload) break
      }

      if (!finalPayload) {
        await fallbackToNonStream()
      }
    } catch (err) {
      console.error('[AIChatWidget] Error:', err)
      try {
        await fallbackToNonStream()
      } catch (fallbackErr) {
        console.error('[AIChatWidget] Fallback error:', fallbackErr)
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`, role: 'assistant', timestamp: new Date(),
          text: '⚠️ Không thể kết nối. Vui lòng kiểm tra server và thử lại.',
        }])
      }
    } finally {
      setLoading(false)
    }
  }, [input, history, userId, sessionId, apiUrl, upsertAssistantMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleRoomLinkClick = async (e) => {
    const link = e.target.closest('.room-link')
    if (link) {
      e.preventDefault()
      
      // Try to get RoomID from data-id attribute first
      const roomId = link.getAttribute('data-id')
      if (roomId && roomId !== '' && roomId !== 'undefined' && roomId !== 'null') {
        navigate(`/room/${roomId}`)
        onClose?.() 
        return
      }
      
      const code = link.getAttribute('data-code')

      // Last fallback: navigate with code (might fail with 404)
      if (code) {
        console.warn('[AIChatWidget] No RoomID found for code:', code)
        navigate(`/room/${code}`)
        onClose?.()
      }
    }
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <>
      <style>{RoomCodeStyles}</style>
      <ChatWindow role="dialog" aria-label="Chat với Ren AI" aria-modal="true">

        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{
          px: 2, py: 1.5,
          background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDk} 100%)`,
          display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,108,228,0.3)',
        }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>
            <SparkleIcon sx={{ fontSize: 18, color: T.white }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: T.white, fontWeight: 800, fontSize: '0.929rem', lineHeight: 1.2 }}>
              Ren · Rentify AI
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#52c41a',
                boxShadow: '0 0 6px #52c41a' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.714rem' }}>
                Trực tuyến · Có thể đặt lịch
              </Typography>
            </Stack>
          </Box>
          <Tooltip title="Cuộc trò chuyện mới">
            <IconButton size="small" onClick={handleReset} aria-label="Làm mới"
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: T.white, bgcolor: 'rgba(255,255,255,0.15)' } }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} aria-label="Đóng chat"
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: T.white, bgcolor: 'rgba(255,255,255,0.15)' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box
          sx={{
            flex: 1, overflowY: 'auto', px: 1.75, py: 1.5,
            display: 'flex', flexDirection: 'column', gap: 1.25,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: T.border, borderRadius: 2 },
            scrollBehavior: 'smooth',
          }}
          role="log" aria-label="Lịch sử chat" aria-live="polite"
        >
          {messages.map((msg, idx) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 0.5,
              }}
            >
              {/* Avatar row */}
              <Stack
                direction={msg.role === 'user' ? 'row-reverse' : 'row'}
                alignItems="flex-end"
                spacing={0.75}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ width: 26, height: 26, bgcolor: T.blueLt, flexShrink: 0, mb: 0.25 }}>
                    <BotIcon sx={{ fontSize: 14, color: T.blue }} />
                  </Avatar>
                )}
                {msg.role === 'user' && (
                  <Avatar sx={{ width: 26, height: 26, bgcolor: T.blue, flexShrink: 0, mb: 0.25 }}>
                    <PersonIcon sx={{ fontSize: 14, color: T.white }} />
                  </Avatar>
                )}

                <MessageBubble
                  role={msg.role}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text, msg.data) }}
                  onClick={handleRoomLinkClick}
                />
              </Stack>

              {/* BookingCard â€” rendered below the AI message bubble */}
              {msg.booking_card && (
                <Box sx={{ pl: 4, mt: 0.25 }}>
                  <BookingCard
                    card={msg.booking_card}
                    userId={userId}
                    authToken={authToken}
                    tenantBackendUrl={tenantBackendUrl}
                    onResult={handleBookingResult}
                  />
                </Box>
              )}

              {/* SlotPicker â€” rendered after the slot-suggestion message */}
              {pendingSlots && pendingSlots.msgId === msg.id && (
                <Box sx={{ pl: 4, mt: 0.25 }}>
                  <SlotPicker
                    slots={pendingSlots.slots}
                    onSelect={handleSlotSelect}
                  />
                </Box>
              )}
            </Box>
          ))}

          {/* Typing indicator */}
          {loading && (
            <Stack direction="row" alignItems="flex-end" spacing={0.75}>
              <Avatar sx={{ width: 26, height: 26, bgcolor: T.blueLt, flexShrink: 0 }}>
                <BotIcon sx={{ fontSize: 14, color: T.blue }} />
              </Avatar>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                px: 1.5, py: 1, borderRadius: '3px 12px 12px 12px',
                bgcolor: T.bg,
                boxShadow: '0 1px 4px rgba(26,26,26,0.07)',
              }}>
                <TypingDot delay="0s" />
                <TypingDot delay="0.2s" />
                <TypingDot delay="0.4s" />
              </Box>
            </Stack>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* â”€â”€ Suggestion chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {suggestions.length > 0 && !loading && (
          <Box sx={{ px: 1.75, pb: 0.75, flexShrink: 0 }}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '5px' }}>
              {suggestions.slice(0, 4).map((s, i) => (
                <SuggestionChip
                  key={i} label={s} size="small"
                  onClick={() => sendMessage(s)}
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && sendMessage(s)}
                  aria-label={`Gợi ý: ${s}`}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* â”€â”€ Input bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{
          px: 1.75, py: 1.25,
          borderTop: `1px solid ${T.border}`,
          bgcolor: '#fafbfc', flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-end' }}>
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về phòng, đặt lịch xem..."
              multiline maxRows={3} fullWidth size="small"
              disabled={loading}
              aria-label="Nhập câu hỏi"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', fontSize: '0.857rem',
                  backgroundColor: T.white,
                  '& fieldset': { borderColor: T.border },
                  '&:hover fieldset': { borderColor: '#8b8b8b' },
                  '&.Mui-focused fieldset': { borderColor: T.blue, borderWidth: '2px' },
                },
              }}
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Gửi tin nhắn"
              sx={{
                width: 38, height: 38, flexShrink: 0,
                bgcolor: input.trim() && !loading ? T.blue : T.border,
                borderRadius: '10px',
                '&:hover': { bgcolor: input.trim() ? T.blueDk : T.border },
                '&:disabled': { bgcolor: T.border },
                transition: 'all 150ms ease',
                boxShadow: input.trim() && !loading ? '0 2px 8px rgba(0,108,228,0.3)' : 'none',
              }}
            >
              {loading
                ? <CircularProgress size={15} sx={{ color: T.white }} />
                : <SendIcon sx={{ fontSize: 17, color: input.trim() ? T.white : '#8b8b8b' }} />
              }
            </IconButton>
          </Box>
        </Box>

      </ChatWindow>
    </>
  )
}


