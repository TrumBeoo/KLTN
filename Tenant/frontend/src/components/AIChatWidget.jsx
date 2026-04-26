/**
 * AIChatWidget — Booking.com style redesign
 *
 * Blue header (#006ce4), white body, clean borders.
 * font.size.base=14px, radius.xs=4px, motion=120ms.
 * WCAG 2.2 AA: focus-visible, aria-labels, keyboard nav.
 */

import { useState, useRef, useEffect } from 'react'
import {
  Box, IconButton, Typography, TextField, Stack,
  CircularProgress, Chip, Avatar, Tooltip, Paper,
} from '@mui/material'
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as SparkleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { styled, keyframes } from '@mui/material/styles'

const T = {
  blue:   '#006ce4',
  blueDk: '#003f8a',
  blueLt: '#e8f2ff',
  text:   '#1a1a1a',
  muted:  '#595959',
  bg:     '#f2f4f8',
  white:  '#ffffff',
  border: '#d4d6d9',
}

// ─── Animations ──────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
`

// ─── Styled ──────────────────────────────────────────────────────────────
const ChatWindow = styled(Paper)({
  width: 360,
  height: 520,
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: 'rgba(26,26,26,0.24) 0px 8px 32px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: T.white,
  border: `1px solid ${T.border}`,
  position: 'relative',
  zIndex: 10000,
})

const MessageBubble = styled(Box)(({ role }) => ({
  maxWidth: '80%',
  padding: '8px 12px',
  borderRadius: role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
  backgroundColor: role === 'user' ? T.blue : T.bg,
  color: role === 'user' ? T.white : T.text,
  fontSize: '0.857rem',
  lineHeight: 1.55,
  wordBreak: 'break-word',
  boxShadow: role === 'user'
    ? 'rgba(0,108,228,0.2) 0px 2px 6px'
    : 'rgba(26,26,26,0.08) 0px 1px 4px',
  animation: `${fadeUp} 200ms ease`,
  '& strong': { fontWeight: 700 },
}))

const TypingDot = styled(Box)(({ delay }) => ({
  width: 6, height: 6, borderRadius: '50%',
  backgroundColor: T.blue,
  animation: `${pulse} 1.2s ease-in-out ${delay} infinite`,
}))

const SuggestionChip = styled(Chip)({
  height: 26,
  fontSize: '0.786rem',
  fontWeight: 500,
  backgroundColor: T.blueLt,
  color: T.blue,
  border: `1px solid ${T.border}`,
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 120ms ease',
  '&:hover': { backgroundColor: '#d0e8ff', borderColor: T.blue },
})

const QUICK_PROMPTS = [
  'Phòng còn trống?',
  'Phòng giá rẻ nhất',
  'Gợi ý phòng cho tôi',
  'Lịch xem phòng',
]

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function AIChatWidget({ apiUrl = 'http://localhost:8000', onClose }) {
  const [input, setInput]             = useState('')
  const [messages, setMessages]       = useState([])
  const [loading, setLoading]         = useState(false)
  const [suggestions, setSuggestions] = useState(QUICK_PROMPTS)
  const [history, setHistory]         = useState([])
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome', role: 'assistant', timestamp: new Date(),
        text: '👋 Xin chào! Tôi là **Rentify AI**.\n\nTôi có thể giúp bạn:\n• Tìm kiếm phòng phù hợp\n• Xem thống kê và so sánh\n• Đặt lịch xem phòng\n\nBạn cần tìm gì?',
      }])
    }
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText) return

    const userMsg = { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setSuggestions([])

    const newHistory = [...history, { role: 'user', content: userText }]

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, conversation_history: newHistory.slice(-6) }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      const botMsg = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        text: data.reply || 'Xin lỗi, có lỗi xảy ra.', timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      setSuggestions(data.suggested_questions || [])
      setHistory([...newHistory, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant', timestamp: new Date(),
        text: '⚠️ Không thể kết nối AI server.\n\nVui lòng kiểm tra server đang chạy tại `localhost:8000`.',
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleReset = () => {
    setMessages([])
    setHistory([])
    setSuggestions(QUICK_PROMPTS)
    setTimeout(() => setMessages([{
      id: 'welcome-reset', role: 'assistant', timestamp: new Date(),
      text: '🔄 Cuộc trò chuyện mới bắt đầu!\n\nTôi có thể giúp gì cho bạn?',
    }]), 100)
  }

  return (
    <ChatWindow role="dialog" aria-label="Chat với Rentify AI" aria-modal="true">
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        backgroundColor: T.blue,
        display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0,
      }}>
        <Avatar sx={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <SparkleIcon sx={{ fontSize: 16, color: T.white }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: T.white, fontWeight: 700, fontSize: '0.929rem', lineHeight: 1.2 }}>
            Rentify AI
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#52c41a' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.786rem' }}>Online</Typography>
          </Box>
        </Box>
        <Tooltip title="Cuộc trò chuyện mới">
          <IconButton
            size="small" onClick={handleReset} aria-label="Làm mới cuộc trò chuyện"
            sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: T.white, backgroundColor: 'rgba(255,255,255,0.15)' },
              '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
            }}
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small" onClick={onClose} aria-label="Đóng chat"
          sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: T.white, backgroundColor: 'rgba(255,255,255,0.15)' },
            '&:focus-visible': { outline: '2px solid #febb02', outlineOffset: '2px' },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1, overflowY: 'auto', px: 2, py: 1.5,
          display: 'flex', flexDirection: 'column', gap: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: T.border, borderRadius: 2 },
        }}
        role="log"
        aria-label="Lịch sử trò chuyện"
        aria-live="polite"
      >
        {messages.map(msg => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: 0.75,
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar sx={{ width: 24, height: 24, bgcolor: T.blueLt, flexShrink: 0, mb: 0.25 }}>
                <BotIcon sx={{ fontSize: 14, color: T.blue }} />
              </Avatar>
            )}
            <MessageBubble
              role={msg.role}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              aria-label={msg.role === 'user' ? 'Tin nhắn của bạn' : 'Tin nhắn từ AI'}
            />
            {msg.role === 'user' && (
              <Avatar sx={{ width: 24, height: 24, bgcolor: T.blue, flexShrink: 0, mb: 0.25 }}>
                <PersonIcon sx={{ fontSize: 14, color: T.white }} />
              </Avatar>
            )}
          </Box>
        ))}

        {/* Typing indicator */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: T.blueLt, flexShrink: 0 }}>
              <BotIcon sx={{ fontSize: 14, color: T.blue }} />
            </Avatar>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              padding: '8px 12px', borderRadius: '2px 12px 12px 12px',
              backgroundColor: T.bg,
            }}>
              <TypingDot delay="0s" />
              <TypingDot delay="0.2s" />
              <TypingDot delay="0.4s" />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && !loading && (
        <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: '6px !important' }}>
            {suggestions.map((s, i) => (
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

      {/* Input */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: `1px solid ${T.border}`,
        backgroundColor: T.bg, flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            inputRef={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về phòng trọ..."
            multiline maxRows={3} fullWidth size="small"
            disabled={loading}
            aria-label="Nhập câu hỏi"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px', fontSize: '0.857rem',
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
              width: 36, height: 36, flexShrink: 0,
              backgroundColor: input.trim() ? T.blue : T.border,
              borderRadius: '4px',
              '&:hover': { backgroundColor: input.trim() ? T.blueDk : T.border },
              '&:disabled': { backgroundColor: T.border },
              '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
              transition: 'all 120ms ease',
            }}
          >
            {loading
              ? <CircularProgress size={14} sx={{ color: T.white }} />
              : <SendIcon sx={{ fontSize: 16, color: input.trim() ? T.white : '#8b8b8b' }} />
            }
          </IconButton>
        </Box>
      </Box>
    </ChatWindow>
  )
}