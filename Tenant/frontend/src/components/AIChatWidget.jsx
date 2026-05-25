/**
 * AIChatWidget — Hybrid Chat + Agent
 *
 * Architecture (Human-in-the-loop):
 *   AI detects intent → collects info → builds payload
 *   → renders BookingCard inside chat (user sees & confirms)
 *   → user clicks [Xác nhận] → Frontend calls Tenant backend API
 *   → Backend validates + creates booking + notifies landlord
 *
 * AI NEVER creates bookings directly. Backend is the execution engine.
 *
 * Design: Booking.com-inspired (#006ce4), clean, conversational.
 * Booking card: Airbnb-style compact confirmation with status timeline.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
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

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Animations ───────────────────────────────────────────────────────────────
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

// ─── Styled components ────────────────────────────────────────────────────────
const ChatWindow = styled(Paper)({
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
})

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

// ─── BookingCard component ─────────────────────────────────────────────────────
/**
 * Renders inline inside the chat conversation.
 * NO modal popups — everything stays conversational.
 *
 * States:
 *   idle        → show info + [Xác nhận] + [Hủy]
 *   confirming  → loading spinner while calling backend
 *   success     → success animation + schedule ID
 *   error       → error message + [Thử lại]
 *   cancelled   → soft cancelled state
 */
function BookingCard({ card, userId, authToken, tenantBackendUrl, onResult }) {
  const [status, setStatus]       = useState('idle')   // idle | confirming | success | error | cancelled
  const [errorMsg, setErrorMsg]   = useState('')
  const [scheduleId, setScheduleId] = useState(null)

  const {
    room_code,
    room_info = {},
    viewing_date,
    viewing_date_display,
    viewing_time,
    api_endpoint,
  } = card

  const fmt = p => p ? Math.floor(parseFloat(p)).toLocaleString('vi-VN') : null
  const price = fmt(room_info.price)
  // Remove /api suffix if present to avoid duplication
  const BACKEND_URL = (tenantBackendUrl || 'http://localhost:5000/api').replace(/\/api$/, '')

  // ── User clicks "Xác nhận đặt lịch" ──────────────────────────────────────
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
        // Actually we just need roomId — fetch from tenant backend
      } catch (_) {}

      // Step 2: Call Tenant backend to create the schedule
      // The backend validates: slot availability, no duplicate, room status, etc.
      const endpoint = `${BACKEND_URL}/api${api_endpoint || '/viewing-schedule/schedule'}`
      
      console.log('[BookingCard] Calling endpoint:', endpoint)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          roomId: room_code,   // backend resolves RoomID from this
          date:   viewing_date,
          time:   viewing_time,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setScheduleId(data.scheduleId || data.ScheduleID || 'SCH-OK')
        setStatus('success')
        onResult?.({ type: 'success', scheduleId: data.scheduleId, card })
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

  // ── Card container styles by state ────────────────────────────────────────
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
        {/* ── Header bar ──────────────────────────────────────────────── */}
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

        {/* ── Room info ────────────────────────────────────────────────── */}
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

          {/* ── Date/Time details ──────────────────────────────────────── */}
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

          {/* ── Status timeline ────────────────────────────────────────── */}
          {status === 'idle' && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.714rem', color: T.muted, mb: 0.75 }}>
                Sau khi xác nhận:
              </Typography>
              <Stack spacing={0.5}>
                {[
                  { icon: '✅', label: 'Lịch được ghi nhận ngay lập tức' },
                  { icon: '🔔', label: 'Chủ nhà nhận thông báo' },
                  { icon: '⏱', label: 'Xác nhận trong vòng 15–30 phút' },
                ].map((step, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
                    <Typography sx={{ fontSize: '0.857rem', lineHeight: 1 }}>{step.icon}</Typography>
                    <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{step.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* ── Success state ─────────────────────────────────────────── */}
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

          {/* ── Error state ───────────────────────────────────────────── */}
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

          {/* ── Cancelled state ───────────────────────────────────────── */}
          {status === 'cancelled' && (
            <Box sx={{ textAlign: 'center', py: 0.75 }}>
              <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>
                Bạn đã hủy xác nhận lịch này.
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Action buttons ───────────────────────────────────────────── */}
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

        {/* ── Confirming state ─────────────────────────────────────────── */}
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

        {/* ── Footer note ──────────────────────────────────────────────── */}
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

// ─── SlotPicker — inline slot selection chips ─────────────────────────────────
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

// ─── formatMessage — markdown-lite + room code links ─────────────────────────
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

  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code style="background:#f2f4f8;padding:1px 5px;border-radius:3px;font-size:0.857em;font-family:monospace">$1</code>')
    .replace(/\n/g,            '<br/>')

  // Link room codes in text
  if (roomData && Array.isArray(roomData)) {
    const codes = new Set(roomData.map(r => r.RoomCode).filter(Boolean))
    codes.forEach(code => {
      const regex = new RegExp(`\\b(${code})\\b`, 'g')
      html = html.replace(regex, `<a href="/room/${code}" class="room-link" data-code="${code}">${code}</a>`)
    })
  }
  // Also auto-link any ROM##### pattern
  html = html.replace(/\b(ROM\d{5,})\b(?![^<]*>)/g,
    `<a href="/room/$1" class="room-link" data-code="$1">$1</a>`)

  return html
}

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Phòng còn trống?',
  'Phòng giá rẻ nhất',
  'Gợi ý phòng cho tôi',
  'Đặt lịch xem phòng',
]

// ─── Main AIChatWidget ────────────────────────────────────────────────────────
export default function AIChatWidget({
  apiUrl          = 'http://localhost:8000',
  tenantBackendUrl = 'http://localhost:5000/api',
  onClose,
  userId    = null,
  authToken = null,
}) {
  const [input, setInput]               = useState('')
  const [messages, setMessages]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [suggestions, setSuggestions]   = useState(QUICK_PROMPTS)
  const [history, setHistory]           = useState([])
  const [sessionId, setSessionId]       = useState(null)
  const [pendingSlots, setPendingSlots] = useState(null) // { slots, message_id }
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // ── On mount ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setMessages([{
      id: 'welcome', role: 'assistant', timestamp: new Date(),
      text: '👋 Xin chào! Tôi là **Ren** từ Rentify.\n\nTôi có thể giúp bạn:\n• Tìm kiếm phòng phù hợp\n• Đặt lịch xem phòng ngay trong chat\n• Tư vấn khu vực, giá cả\n\nBạn cần tìm gì hôm nay?',
    }])
    setTimeout(() => inputRef.current?.focus(), 350)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, pendingSlots])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setMessages([])
    setHistory([])
    setSuggestions(QUICK_PROMPTS)
    setSessionId(null)
    setPendingSlots(null)
    setTimeout(() => setMessages([{
      id: 'reset', role: 'assistant', timestamp: new Date(),
      text: '🔄 Cuộc trò chuyện mới! Mình có thể giúp gì cho bạn?',
    }]), 80)
  }

  // ── Booking card result callback ────────────────────────────────────────────
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

  // ── Slot selected from SlotPicker ────────────────────────────────────────────
  const handleSlotSelect = useCallback((slot) => {
    setPendingSlots(null)
    sendMessage(slot)
  }, [])

  // ── Core send function ────────────────────────────────────────────────────
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

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:               userText,
          conversation_history:  newHistory.slice(-8),
          user_id:               userId,
          session_id:            sessionId,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      // Persist session
      if (data.session_id && !sessionId) setSessionId(data.session_id)

      const botMsgId = `a-${Date.now()}`

      // ── If AI returned a booking_card → add it as a special message ──
      if (data.booking_card) {
        const cardMsg = {
          id: botMsgId, role: 'assistant', timestamp: new Date(),
          text: data.reply || 'Kiểm tra thông tin và xác nhận nhé! 👇',
          data: data.data,
          intent: data.intent,
          booking_card: data.booking_card,            // ← structured payload
          booking_state: data.booking_state,
        }
        setMessages(prev => [...prev, cardMsg])
        setSuggestions([])
      }
      // ── If AI shows available slots → render SlotPicker ──────────────
      else if (data.booking_state === 'awaiting_slot_selection' && data.available_slots?.length > 0) {
        const slotMsg = {
          id: botMsgId, role: 'assistant', timestamp: new Date(),
          text: data.reply,
          data: data.data,
          intent: data.intent,
          booking_state: data.booking_state,
        }
        setMessages(prev => [...prev, slotMsg])
        setPendingSlots({ slots: data.available_slots, msgId: botMsgId })
        setSuggestions([])
      }
      // ── Normal message ─────────────────────────────────────────────────
      else {
        const botMsg = {
          id: botMsgId, role: 'assistant', timestamp: new Date(),
          text: data.reply || 'Xin lỗi, có lỗi xảy ra.',
          data: data.data,
          intent: data.intent,
        }
        setMessages(prev => [...prev, botMsg])
        setSuggestions(data.suggested_questions || [])
      }

      setHistory([...newHistory, { role: 'assistant', content: data.reply || '' }])

    } catch (err) {
      console.error('[AIChatWidget] Error:', err)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'assistant', timestamp: new Date(),
        text: '⚠️ Không thể kết nối. Vui lòng kiểm tra server và thử lại.',
      }])
    } finally {
      setLoading(false)
    }
  }, [input, history, userId, sessionId, apiUrl])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleRoomLinkClick = (e) => {
    const link = e.target.closest('.room-link')
    if (link) {
      e.preventDefault()
      const code = link.getAttribute('data-code')
      if (code) window.open(`/room/${code}`, '_blank')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{RoomCodeStyles}</style>
      <ChatWindow role="dialog" aria-label="Chat với Ren AI" aria-modal="true">

        {/* ── Header ─────────────────────────────────────────────────────── */}
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

        {/* ── Messages ───────────────────────────────────────────────────── */}
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

              {/* BookingCard — rendered below the AI message bubble */}
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

              {/* SlotPicker — rendered after the slot-suggestion message */}
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

        {/* ── Suggestion chips ────────────────────────────────────────────── */}
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

        {/* ── Input bar ───────────────────────────────────────────────────── */}
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