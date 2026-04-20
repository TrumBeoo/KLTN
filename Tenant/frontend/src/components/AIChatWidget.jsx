import { useState, useRef, useEffect } from 'react'
import {
  Box, IconButton, Typography, TextField, Stack,
  CircularProgress, Chip, Avatar, Tooltip, Paper
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

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`
const floatBounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
`

// ─── Styled Components ─────────────────────────────────────────────────────────
const ChatWindow = styled(Paper)({
  width: 380,
  height: 560,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 24px 64px rgba(74,144,226,0.22), 0 4px 20px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(74,144,226,0.15)',
})

const MessageBubble = styled(Box)(({ role }) => ({
  maxWidth: '82%',
  padding: '10px 14px',
  borderRadius: role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
  backgroundColor: role === 'user' ? '#4A90E2' : '#F0F4FF',
  color: role === 'user' ? '#ffffff' : '#1a1a2e',
  fontSize: '0.875rem',
  lineHeight: 1.55,
  wordBreak: 'break-word',
  boxShadow: role === 'user'
    ? '0 2px 8px rgba(74,144,226,0.25)'
    : '0 1px 4px rgba(0,0,0,0.06)',
  animation: `${fadeSlideUp} 0.25s ease`,
  '& strong': { fontWeight: 700 },
  '& br': { display: 'block', marginBottom: 4 },
}))

const TypingDot = styled(Box)(({ delay }) => ({
  width: 7,
  height: 7,
  borderRadius: '50%',
  backgroundColor: '#4A90E2',
  animation: `${pulse} 1.2s ease-in-out ${delay} infinite`,
}))

const SuggestionChip = styled(Chip)({
  height: 28,
  fontSize: '0.78rem',
  fontWeight: 500,
  backgroundColor: 'rgba(74,144,226,0.08)',
  color: '#2E5C8A',
  border: '1px solid rgba(74,144,226,0.2)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(74,144,226,0.15)',
    borderColor: '#4A90E2',
    transform: 'translateY(-1px)',
  },
})

// ─── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  '📊 Thống kê tổng quan',
  '🏠 Phòng còn trống',
  '💰 Phòng giá rẻ nhất',
  '🗓️ Lịch xem phòng',
]

// ─── Format message text ──────────────────────────────────────────────────────
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AIChatWidget({ apiUrl = 'http://localhost:8000', onClose }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(QUICK_PROMPTS)
  const [history, setHistory] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: '👋 Xin chào! Tôi là **AI trợ lý Rentify**.\n\nTôi có thể giúp bạn:\n• 🏠 Tìm kiếm phòng phù hợp\n• 📊 Xem thống kê tổng quan\n• 🗓️ Quản lý lịch xem phòng\n• 💡 Gợi ý phòng thông minh\n\nBạn muốn biết gì hôm nay?',
        timestamp: new Date()
      }])
    }
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setSuggestions([])

    // Update history for context
    const newHistory = [
      ...history,
      { role: 'user', content: userText }
    ]

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversation_history: newHistory.slice(-6)
        })
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || 'Xin lỗi, có lỗi xảy ra.',
        intent: data.intent,
        roomData: data.data,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setSuggestions(data.suggested_questions || [])
      setHistory([
        ...newHistory,
        { role: 'assistant', content: data.reply }
      ])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: '⚠️ Không thể kết nối đến AI server.\n\nVui lòng kiểm tra:\n• Server đang chạy tại `localhost:8000`\n• File `.env` đã cấu hình đúng',
        timestamp: new Date()
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleReset = () => {
    setMessages([])
    setHistory([])
    setSuggestions(QUICK_PROMPTS)
    setTimeout(() => {
      setMessages([{
        id: 'welcome-reset',
        role: 'assistant',
        text: '🔄 Cuộc trò chuyện đã được đặt lại!\n\nTôi có thể giúp gì cho bạn?',
        timestamp: new Date()
      }])
    }, 100)
  }

  return (
    <ChatWindow>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.75,
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        display: 'flex', alignItems: 'center', gap: 1.5,
        flexShrink: 0
      }}>
        <Avatar sx={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <SparkleIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>
            Rentify AI
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ADE80' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
              Llama3 • Online
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Cuộc trò chuyện mới">
          <IconButton size="small" onClick={handleReset} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

        {/* Messages */}
        <Box sx={{
          flex: 1, overflowY: 'auto', px: 2, py: 1.5,
          display: 'flex', flexDirection: 'column', gap: 1.25,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(74,144,226,0.2)', borderRadius: 2 },
        }}>
          {messages.map(msg => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 1
              }}
            >
              {msg.role === 'assistant' && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#E8F0FD', flexShrink: 0, mb: 0.25 }}>
                  <BotIcon sx={{ fontSize: 16, color: '#4A90E2' }} />
                </Avatar>
              )}
              <MessageBubble
                role={msg.role}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
              {msg.role === 'user' && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#4A90E2', flexShrink: 0, mb: 0.25 }}>
                  <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
                </Avatar>
              )}
            </Box>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#E8F0FD', flexShrink: 0 }}>
                <BotIcon sx={{ fontSize: 16, color: '#4A90E2' }} />
              </Avatar>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                padding: '10px 14px',
                borderRadius: '4px 18px 18px 18px',
                backgroundColor: '#F0F4FF',
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
          <Box sx={{ px: 2, pb: 1, pt: 0.5, flexShrink: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: '6px !important' }}>
              {suggestions.map((s, i) => (
                <SuggestionChip
                  key={i}
                  label={s}
                  size="small"
                  onClick={() => sendMessage(s)}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Input */}
        <Box sx={{
          px: 2, py: 1.5, borderTop: '1px solid rgba(74,144,226,0.1)',
          backgroundColor: '#FAFBFF', flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về phòng trọ..."
              multiline
              maxRows={3}
              fullWidth
              size="small"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: 'rgba(74,144,226,0.25)' },
                  '&:hover fieldset': { borderColor: '#4A90E2' },
                  '&.Mui-focused fieldset': { borderColor: '#4A90E2', borderWidth: 1.5 },
                }
              }}
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              sx={{
                width: 40, height: 40, flexShrink: 0,
                backgroundColor: input.trim() ? '#4A90E2' : 'rgba(74,144,226,0.1)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#357ABD', transform: 'scale(1.05)' },
                '&:disabled': { backgroundColor: 'rgba(74,144,226,0.08)' }
              }}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ color: '#4A90E2' }} />
              ) : (
                <SendIcon sx={{ fontSize: 18, color: input.trim() ? '#fff' : 'rgba(74,144,226,0.4)' }} />
              )}
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: '0.68rem', color: '#aaa', textAlign: 'center', mt: 0.75 }}>
           
          </Typography>
        </Box>
      </ChatWindow>
  
  )
}