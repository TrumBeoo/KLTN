import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RoommateProfileForm from '../components/RoommateProfileForm'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: '#0f0f11',
  surface: '#17171a',
  surfaceUp: '#1e1e22',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  text: '#f0eff4',
  muted: '#8b8a94',
  subtle: '#4a4952',
  accent: '#7c6af7',
  accentSoft: 'rgba(124,106,247,0.15)',
  accentGlow: 'rgba(124,106,247,0.3)',
  green: '#34d399',
  greenSoft: 'rgba(52,211,153,0.12)',
  red: '#f87171',
  redSoft: 'rgba(248,113,113,0.12)',
  gold: '#fbbf24',
  goldSoft: 'rgba(251,191,36,0.12)',
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const CANDIDATES = [
  {
    id: 1, name: 'Linh Đặng', age: 24, gender: 'Nữ',
    occupation: 'UI/UX Designer · Freelance',
    university: 'ĐH Bách Khoa Hà Nội',
    district: 'Cầu Giấy', budget: [3, 6],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    tags: ['Yên tĩnh', 'Dậy sớm', 'Không hút thuốc', 'Nuôi mèo'],
    lifestyle: ['clean', 'quiet', 'early_bird'],
    bio: 'Mình thích không gian yên tĩnh để sáng tạo. Nấu ăn cuối tuần, dậy sớm mỗi ngày. Tìm bạn ghép ổn định dài hạn.',
    sleepTime: '22:30', wakeTime: '06:30', cleanLevel: 5, noiseLevel: 1,
    matchFactors: ['Cùng ngân sách', 'Đi ngủ sớm', 'Thích yên tĩnh', 'Cùng quận'],
    locations: ['Cầu Giấy', 'Nam Từ Liêm'], duration: 'long-term',
  },
  {
    id: 2, name: 'Minh Anh', age: 23, gender: 'Nam',
    occupation: 'Backend Developer · FPT',
    university: 'ĐH Công Nghệ HN',
    district: 'Đống Đa', budget: [2.5, 5],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    tags: ['Night owl', 'Lập trình', 'Thể thao', 'Không hút thuốc'],
    lifestyle: ['social', 'night_owl', 'fitness'],
    bio: 'Dev backend, thường làm việc muộn. Cuối tuần đá bóng hoặc gym. Cần nhà ở có chỗ để xe máy.',
    sleepTime: '01:00', wakeTime: '08:00', cleanLevel: 3, noiseLevel: 3,
    matchFactors: ['Ngân sách tương đương', 'Thích thể thao', 'Không hút thuốc'],
    locations: ['Đống Đa', 'Hà Đông'], duration: 'long-term',
  },
  {
    id: 3, name: 'Hương Giang', age: 25, gender: 'Nữ',
    occupation: 'Marketing Manager · Startup',
    university: 'ĐH Ngoại Thương',
    district: 'Hoàng Mai', budget: [4, 7],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop',
    tags: ['Du lịch', 'Nấu ăn', 'Cà phê', 'Yoga'],
    lifestyle: ['social', 'cooking', 'early_bird'],
    bio: 'Mình làm marketing cho startup công nghệ. Thích nấu ăn và chia sẻ bữa ăn cùng roommate. Du lịch mỗi tháng.',
    sleepTime: '23:00', wakeTime: '07:00', cleanLevel: 4, noiseLevel: 2,
    matchFactors: ['Thích nấu ăn', 'Dậy sớm', 'Cùng lĩnh vực sáng tạo'],
    locations: ['Hoàng Mai', 'Cầu Giấy'], duration: 'long-term',
  },
  {
    id: 4, name: 'Thu Trang', age: 22, gender: 'Nữ',
    occupation: 'Sinh viên Y4 · ĐH Y Hà Nội',
    university: 'ĐH Y Hà Nội',
    district: 'Đống Đa', budget: [2, 4],
    image: 'https://images.unsplash.com/photo-1517841905240-5af0b2e5d6a0?w=600&h=800&fit=crop',
    tags: ['Sinh viên', 'Yên tĩnh', 'Ít về nhà', 'Sạch sẽ'],
    lifestyle: ['clean', 'quiet'],
    bio: 'Sinh viên y4, lịch học kín. Hầu hết thời gian ở bệnh viện thực tập. Cần phòng yên tĩnh để ôn bài.',
    sleepTime: '23:30', wakeTime: '05:30', cleanLevel: 5, noiseLevel: 1,
    matchFactors: ['Rất sạch sẽ', 'Ít ở nhà', 'Yên tĩnh', 'Ngân sách hợp lý'],
    locations: ['Đống Đa', 'Hai Bà Trưng'], duration: 'long-term',
  },
  {
    id: 5, name: 'Vân Khánh', age: 26, gender: 'Nữ',
    occupation: 'Kế toán · Công ty nước ngoài',
    university: 'ĐH Kinh Tế Quốc Dân',
    district: 'Cầu Giấy', budget: [5, 8],
    image: 'https://images.unsplash.com/photo-1502684457400-22d1a2b8b1fe?w=600&h=800&fit=crop',
    tags: ['Gym', 'Đúng giờ', 'Sạch sẽ', 'Thực dụng'],
    lifestyle: ['clean', 'early_bird', 'fitness', 'quiet'],
    bio: 'Làm kế toán cho công ty Hàn Quốc. Sáng đi gym, tối về nấu ăn. Cần người ghép ổn định, không phức tạp.',
    sleepTime: '22:00', wakeTime: '05:45', cleanLevel: 5, noiseLevel: 2,
    matchFactors: ['Cùng quận', 'Dậy rất sớm', 'Gym buổi sáng', 'Rất ngăn nắp'],
    locations: ['Cầu Giấy', 'Nam Từ Liêm'], duration: 'long-term',
  },
]

const DISCOVER_ROOMS = [
  { id: 1, title: 'Studio hiện đại Cầu Giấy', district: 'Cầu Giấy', price: '4.5tr', match: 94, area: '28m²', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop', badge: 'Gần ĐH', tags: ['Điều hòa', 'Wifi', 'Thang máy'] },
  { id: 2, title: 'Phòng khép kín Đống Đa', district: 'Đống Đa', price: '3.2tr', match: 88, area: '22m²', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop', badge: 'Giá tốt', tags: ['Gác lửng', 'Ban công', 'Giữ xe'] },
  { id: 3, title: 'Ở ghép Thanh Xuân 2 người', district: 'Thanh Xuân', price: '2.8tr', match: 82, area: '35m²', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=280&fit=crop', badge: 'Ghép 2', tags: ['Full nội thất', 'Giờ tự do'] },
  { id: 4, title: 'Mini studio Nam Từ Liêm', district: 'Nam Từ Liêm', price: '3.8tr', match: 79, area: '24m²', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=280&fit=crop', badge: 'Mới đăng', tags: ['Điều hòa', 'Bếp riêng'] },
]

// ─── Matching engine ─────────────────────────────────────────────────────────
function getScore(prefs, candidate) {
  let s = 50
  const budgetOk = candidate.budget[0] <= prefs.budget[1] && candidate.budget[1] >= prefs.budget[0]
  if (budgetOk) s += 20
  if (prefs.locations.length === 0 || prefs.locations.some(l => candidate.locations.includes(l))) s += 15
  if (prefs.gender === 'any' || prefs.gender === candidate.gender) s += 10
  const ls = prefs.lifestyle.filter(x => candidate.lifestyle.includes(x)).length
  s += Math.min(ls * 4, 15)
  return Math.min(s, 99)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tag({ children, color = 'default' }) {
  const colors = {
    default: { bg: 'rgba(255,255,255,0.06)', color: C.muted },
    accent: { bg: C.accentSoft, color: C.accent },
    green: { bg: C.greenSoft, color: C.green },
    gold: { bg: C.goldSoft, color: C.gold },
  }
  const s = colors[color] || colors.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function CompatBar({ label, value, color = C.accent }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${value}%`, borderRadius: 2, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? C.green : score >= 70 ? C.accent : C.gold
  const glow = score >= 85 ? C.greenSoft : score >= 70 ? C.accentSoft : C.goldSoft
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      width: 64, height: 64, borderRadius: '50%',
      background: glow, border: `2px solid ${color}`,
      backdropFilter: 'blur(12px)',
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 9, color, opacity: 0.8, marginTop: 1 }}>MATCH</span>
    </div>
  )
}

// ─── Swipe Card ──────────────────────────────────────────────────────────────
function SwipeCardDeck({ candidates, onLike, onSkip, onSuperLike }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [exiting, setExiting] = useState(null) // 'left' | 'right' | 'up'
  const [imgIdx, setImgIdx] = useState(0)
  const startRef = useRef(null)
  const cardRef = useRef(null)

  const current = candidates[0]
  const next = candidates[1]
  const third = candidates[2]

  useEffect(() => { setImgIdx(0); setDrag({ x: 0, y: 0, active: false }); setExiting(null) }, [current?.id])

  if (!current) return null

  const rotation = drag.x / 18
  const opacity = Math.max(0, 1 - Math.abs(drag.x) / 400)
  const likeOpacity = Math.max(0, drag.x / 80)
  const nopeOpacity = Math.max(0, -drag.x / 80)
  const superOpacity = Math.max(0, -drag.y / 80)

  const handlePointerDown = (e) => {
    if (e.target.closest('[data-action]')) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setDrag(d => ({ ...d, active: true }))
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!startRef.current || !drag.active) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    setDrag({ x: dx, y: dy, active: true })
  }

  const handlePointerUp = () => {
    if (!startRef.current) return
    if (drag.x > 90) triggerExit('right')
    else if (drag.x < -90) triggerExit('left')
    else if (drag.y < -90) triggerExit('up')
    else setDrag({ x: 0, y: 0, active: false })
    startRef.current = null
  }

  const triggerExit = (dir) => {
    setExiting(dir)
    setTimeout(() => {
      setDrag({ x: 0, y: 0, active: false })
      setExiting(null)
      if (dir === 'right') onLike(current)
      else if (dir === 'left') onSkip(current)
      else if (dir === 'up') onSuperLike(current)
    }, 350)
  }

  const exitTransform = exiting === 'right' ? 'translateX(120%) rotate(25deg)' :
    exiting === 'left' ? 'translateX(-120%) rotate(-25deg)' :
      exiting === 'up' ? 'translateY(-120%) scale(0.8)' : null

  const cardTransform = exitTransform ||
    `translateX(${drag.x}px) translateY(${drag.y}px) rotate(${rotation}deg)`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Third card */}
      {third && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: 'scale(0.92) translateY(24px)',
          transition: 'transform 0.3s ease',
          borderRadius: 24, overflow: 'hidden',
          background: C.surfaceUp,
          filter: 'brightness(0.6)',
        }} />
      )}

      {/* Next card */}
      {next && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: 'scale(0.96) translateY(12px)',
          transition: 'transform 0.3s ease',
          borderRadius: 24, overflow: 'hidden',
          background: C.surface,
        }}>
          <img src={next.image} alt={next.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        </div>
      )}

      {/* Active card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute', inset: 0,
          transform: cardTransform,
          transition: drag.active ? 'none' : exiting ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          borderRadius: 24, overflow: 'hidden',
          cursor: drag.active ? 'grabbing' : 'grab',
          userSelect: 'none', touchAction: 'none',
          willChange: 'transform',
        }}
      >
        {/* Image */}
        <img src={current.image} alt={current.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />

        {/* Gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 70%, transparent 100%)',
        }} />

        {/* Score badge */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <ScoreBadge score={current._score || 88} />
        </div>

        {/* LIKE / NOPE / SUPER overlays */}
        <div style={{
          position: 'absolute', top: 40, left: 24,
          padding: '8px 18px', borderRadius: 8,
          border: `3px solid ${C.green}`, color: C.green,
          fontSize: 22, fontWeight: 800, letterSpacing: 2,
          opacity: likeOpacity, transform: 'rotate(-12deg)',
        }}>LIKE</div>
        <div style={{
          position: 'absolute', top: 40, right: 24,
          padding: '8px 18px', borderRadius: 8,
          border: `3px solid ${C.red}`, color: C.red,
          fontSize: 22, fontWeight: 800, letterSpacing: 2,
          opacity: nopeOpacity, transform: 'rotate(12deg)',
        }}>NOPE</div>
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          transform: 'translateX(-50%) rotate(-5deg)',
          padding: '8px 18px', borderRadius: 8,
          border: `3px solid ${C.gold}`, color: C.gold,
          fontSize: 20, fontWeight: 800, letterSpacing: 2,
          opacity: superOpacity,
        }}>SUPER</div>

        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px 24px' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{current.name}</span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>{current.age}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>{current.occupation}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span>📍</span>
              <span>{current.district}</span>
              <span style={{ margin: '0 4px' }}>·</span>
              <span>💰</span>
              <span>{current.budget[0]}–{current.budget[1]}tr/tháng</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {current.tags.slice(0, 4).map(t => (
              <span key={t} style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 11, fontWeight: 500,
                padding: '4px 10px', borderRadius: 20,
              }}>{t}</span>
            ))}
          </div>

          {/* Match highlights */}
          <div style={{
            background: 'rgba(124,106,247,0.18)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(124,106,247,0.25)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>ĐIỂM TƯƠNG ĐỒNG</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {current.matchFactors.slice(0, 3).map(f => (
                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ color: C.green }}>✓</span> {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Compatibility Panel ──────────────────────────────────────────────────────
function CompatibilityPanel({ match, score }) {
  if (!match) return null
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 20, padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Phân tích tương thích</span>
        <ScoreBadge score={score} />
      </div>

      <CompatBar label="Ngân sách" value={Math.min(90, 60 + Math.random() * 30 | 0)} />
      <CompatBar label="Lịch sinh hoạt" value={Math.min(95, 55 + Math.random() * 40 | 0)} color={C.green} />
      <CompatBar label="Phong cách sống" value={Math.min(88, 50 + Math.random() * 38 | 0)} color={C.gold} />
      <CompatBar label="Khu vực" value={Math.min(100, 70 + Math.random() * 30 | 0)} />

      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 16 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>ĐIỂM CHUNG</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {match.matchFactors.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: C.green }}>✓</span>
              <span style={{ fontSize: 12, color: C.text }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Ngủ', val: match.sleepTime },
            { label: 'Dậy', val: match.wakeTime },
            { label: 'Sạch sẽ', val: '★'.repeat(match.cleanLevel) },
            { label: 'Ồn ào', val: '★'.repeat(match.noiseLevel) },
          ].map(i => (
            <div key={i.label} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              padding: '8px 12px', border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{i.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{i.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Discover Card ────────────────────────────────────────────────────────────
function DiscoverCard({ room }) {
  const [liked, setLiked] = useState(false)
  return (
    <div style={{
      minWidth: 220, borderRadius: 16,
      background: C.surface, border: `1px solid ${C.border}`,
      overflow: 'hidden', flexShrink: 0,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ position: 'relative', height: 140 }}>
        <img src={room.image} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)' }} />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: C.accentSoft, backdropFilter: 'blur(8px)',
          border: `1px solid ${C.accentGlow}`,
          color: C.accent, fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 20,
        }}>{room.badge}</div>
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          color: room.match >= 90 ? C.green : room.match >= 80 ? C.accent : C.gold,
          fontSize: 11, fontWeight: 700,
          padding: '3px 8px', borderRadius: 20,
          border: `1px solid currentColor`,
        }}>{room.match}%</div>
        <button
          onClick={() => setLiked(!liked)}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: liked ? 'rgba(248,113,113,0.2)' : 'rgba(0,0,0,0.4)',
            border: `1px solid ${liked ? C.red : 'rgba(255,255,255,0.2)'}`,
            color: liked ? C.red : '#fff',
            width: 30, height: 30, borderRadius: '50%',
            cursor: 'pointer', fontSize: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >{liked ? '♥' : '♡'}</button>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3, lineHeight: 1.3 }}>{room.title}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>📍 {room.district} · {room.area}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{room.price}/tháng</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {room.tags.slice(0, 2).map(t => (
            <span key={t} style={{ fontSize: 10, color: C.muted, background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 10 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter Sheet ─────────────────────────────────────────────────────────────
function FilterSheet({ prefs, onChange, onClose }) {
  const districts = ['Cầu Giấy', 'Đống Đa', 'Hà Đông', 'Hoàng Mai', 'Thanh Xuân', 'Nam Từ Liêm', 'Hai Bà Trưng']
  const lifestyleOpts = [
    { id: 'quiet', label: '🤫 Yên tĩnh' }, { id: 'clean', label: '🧹 Sạch sẽ' },
    { id: 'early_bird', label: '🌅 Dậy sớm' }, { id: 'night_owl', label: '🌙 Night owl' },
    { id: 'social', label: '👥 Xã giao' }, { id: 'fitness', label: '💪 Thể thao' },
    { id: 'cooking', label: '👨‍🍳 Nấu ăn' },
  ]

  const toggleLoc = (d) => onChange({ ...prefs, locations: prefs.locations.includes(d) ? prefs.locations.filter(x => x !== d) : [...prefs.locations, d] })
  const toggleLS = (id) => onChange({ ...prefs, lifestyle: prefs.lifestyle.includes(id) ? prefs.lifestyle.filter(x => x !== id) : [...prefs.lifestyle, id] })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxHeight: '85vh', overflowY: 'auto',
        background: C.surface, borderRadius: '24px 24px 0 0',
        padding: '0 0 32px',
        border: `1px solid ${C.borderMid}`, borderBottom: 'none',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: C.surface }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.subtle, margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Bộ lọc</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: C.muted, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Budget */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 12 }}>NGÂN SÁCH (TRIỆU/THÁNG)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600, minWidth: 32 }}>{prefs.budget[0]}tr</span>
              <input type="range" min={1} max={15} value={prefs.budget[0]} step={0.5}
                onChange={e => onChange({ ...prefs, budget: [+e.target.value, prefs.budget[1]] })}
                style={{ flex: 1, accentColor: C.accent }} />
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600, minWidth: 32 }}>{prefs.budget[1]}tr</span>
              <input type="range" min={1} max={20} value={prefs.budget[1]} step={0.5}
                onChange={e => onChange({ ...prefs, budget: [prefs.budget[0], +e.target.value] })}
                style={{ flex: 1, accentColor: C.accent }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Khoảng {prefs.budget[0]} – {prefs.budget[1]} triệu VND/tháng</div>
          </div>

          {/* Gender */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 12 }}>GIỚI TÍNH</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['any', 'Tất cả'], ['Nam', 'Nam'], ['Nữ', 'Nữ']].map(([v, l]) => (
                <button key={v} onClick={() => onChange({ ...prefs, gender: v })}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${prefs.gender === v ? C.accent : C.border}`,
                    background: prefs.gender === v ? C.accentSoft : 'transparent',
                    color: prefs.gender === v ? C.accent : C.muted,
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 12 }}>KHU VỰC</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {districts.map(d => (
                <button key={d} onClick={() => toggleLoc(d)}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    border: `1px solid ${prefs.locations.includes(d) ? C.accent : C.border}`,
                    background: prefs.locations.includes(d) ? C.accentSoft : 'transparent',
                    color: prefs.locations.includes(d) ? C.accent : C.muted,
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>{d}</button>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 12 }}>LỐI SỐNG</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {lifestyleOpts.map(o => (
                <button key={o.id} onClick={() => toggleLS(o.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 20,
                    border: `1px solid ${prefs.lifestyle.includes(o.id) ? C.green : C.border}`,
                    background: prefs.lifestyle.includes(o.id) ? C.greenSoft : 'transparent',
                    color: prefs.lifestyle.includes(o.id) ? C.green : C.muted,
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>{o.label}</button>
              ))}
            </div>
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: C.accent, border: 'none',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: `0 0 20px ${C.accentGlow}`,
          }}>Áp dụng bộ lọc</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RoommateMatchingPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('match') // match | discover
  const [prefs, setPrefs] = useState({ budget: [2, 6], gender: 'any', locations: [], lifestyle: [] })
  const [showFilter, setShowFilter] = useState(false)
  const [queue, setQueue] = useState([])
  const [liked, setLiked] = useState([])
  const [skipped, setSkipped] = useState([])
  const [superLiked, setSuperLiked] = useState([])
  const [showMatch, setShowMatch] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [started, setStarted] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const scrollRef = useRef(null)

  // Check if user has profile on mount
  useEffect(() => {
    checkUserProfile()
  }, [])

  const checkUserProfile = async () => {
    try {
      // TODO: Replace with actual API call to check user profile
      // const response = await fetch('/api/tenant/profile')
      // const data = await response.json()
      // if (data.success && data.profile) {
      //   setHasProfile(true)
      //   setUserProfile(data.profile)
      // } else {
      //   setHasProfile(false)
      // }
      
      // For now, check localStorage
      const savedProfile = localStorage.getItem('roommateProfile')
      if (savedProfile) {
        setHasProfile(true)
        setUserProfile(JSON.parse(savedProfile))
      } else {
        setHasProfile(false)
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      setHasProfile(false)
    }
  }

  const handleProfileSubmit = async (profileData) => {
    try {
      // TODO: Replace with actual API call to save profile
      // const response = await fetch('/api/tenant/profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileData)
      // })
      // const data = await response.json()
      // if (data.success) {
      //   setHasProfile(true)
      //   setUserProfile(data.profile)
      //   setShowProfileForm(false)
      // }
      
      // For now, save to localStorage
      localStorage.setItem('roommateProfile', JSON.stringify(profileData))
      setHasProfile(true)
      setUserProfile(profileData)
      setShowProfileForm(false)
      
      // Update prefs from profile
      setPrefs({
        budget: profileData.budget,
        gender: profileData.genderPreference,
        locations: profileData.locations,
        lifestyle: profileData.lifestyle,
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.')
    }
  }

  useEffect(() => {
    const scored = CANDIDATES
      .map(c => ({ ...c, _score: getScore(prefs, c) }))
      .filter(c => c._score >= 50)
      .sort((a, b) => b._score - a._score)
    setQueue(scored)
  }, [prefs])

  const handleLike = (c) => {
    setLiked(p => [...p, c])
    setQueue(p => p.slice(1))
    setShowMatch(c)
    setTimeout(() => setShowMatch(null), 2200)
  }

  const handleSkip = (c) => {
    setSkipped(p => [...p, c])
    setQueue(p => p.slice(1))
  }

  const handleSuperLike = (c) => {
    setSuperLiked(p => [...p, c])
    setQueue(p => p.slice(1))
    setShowMatch({ ...c, isSuper: true })
    setTimeout(() => setShowMatch(null), 2200)
  }

  const current = queue[0]

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🏠</div>
          <div style={{ fontSize: 16, color: C.muted }}>Đang tải...</div>
        </div>
      </div>
    )
  }

  // ── Show profile form if user is logged in but doesn't have profile ──────
  if (user && (!hasProfile || showProfileForm)) {
    return (
      <RoommateProfileForm
        onSubmit={handleProfileSubmit}
        onCancel={showProfileForm ? () => setShowProfileForm(false) : null}
      />
    )
  }

  // ── Hero / onboarding ────────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {/* Animated blobs */}
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)', animation: 'blob 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', animation: 'blob 10s ease-in-out infinite 2s' }} />
        </div>
        <style>{`@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-20px) scale(1.05)} 66%{transform:translate(-15px,15px) scale(0.97)} } @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>

        <div style={{ textAlign: 'center', maxWidth: 500, position: 'relative' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🤝</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: -1, lineHeight: 1.1 }}>
            Tìm roommate<br />
            <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thật sự phù hợp</span>
          </h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, margin: '0 0 32px' }}>
            Swipe để kết nối với người có cùng lối sống, ngân sách và khu vực mong muốn.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              { icon: '✨', label: 'Matching engine phân tích 12+ tiêu chí' },
              { icon: '🔒', label: 'Hồ sơ xác minh, an toàn & đáng tin cậy' },
              { icon: '⚡', label: 'Kết nối trực tiếp, không qua trung gian' },
            ].map(f => (
              <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: C.text }}>{f.label}</span>
              </div>
            ))}
          </div>

          {!user ? (
            // Show login prompt for non-authenticated users
            <>
              <button onClick={() => navigate('/login', { state: { from: '/roommate' } })} style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${C.accent}, #9b8ef8)`,
                border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', boxShadow: `0 8px 32px ${C.accentGlow}`,
                letterSpacing: 0.3,
              }}>
                🔐 Đăng nhập để bắt đầu
              </button>
              <button onClick={() => navigate('/register')} style={{
                width: '100%', padding: '12px', marginTop: 12,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', borderRadius: 12,
              }}>
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </>
          ) : (
            // Show start button for authenticated users
            <>
              <button onClick={() => setStarted(true)} style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${C.accent}, #9b8ef8)`,
                border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', boxShadow: `0 8px 32px ${C.accentGlow}`,
                letterSpacing: 0.3,
              }}>
                Bắt đầu tìm kiếm →
              </button>
              <button onClick={() => setShowProfileForm(true)} style={{
                width: '100%', padding: '12px', marginTop: 12,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', borderRadius: 12,
              }}>
                ⚙️ Chỉnh sửa hồ sơ
              </button>
            </>
          )}
          <div style={{ marginTop: 12, fontSize: 12, color: C.subtle }}>Đã có {CANDIDATES.length} người đang tìm roommate tại Hà Nội</div>
        </div>
      </div>
    )
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes matchPop { 0%{opacity:0;transform:scale(0.7) translateY(20px)} 60%{transform:scale(1.05) translateY(0)} 100%{opacity:1;transform:scale(1)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) { .desktop-panel { display: none !important; } }
        @media (min-width: 769px) { .mobile-nav { display: none !important; } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(20px)', background: 'rgba(15,15,17,0.8)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏠</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>RoomMatch</span>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 3, gap: 2 }}>
            {[['match', '🔍 Ghép đôi'], ['discover', '🗺️ Khám phá']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 9, border: 'none',
                background: tab === t ? C.surfaceUp : 'transparent',
                color: tab === t ? C.text : C.muted,
                cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400,
                transition: 'all 0.2s',
              }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowFilter(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showFilter ? C.accentSoft : 'rgba(255,255,255,0.06)',
                border: `1px solid ${showFilter ? C.accent : C.border}`,
                color: showFilter ? C.accent : C.muted,
                padding: '7px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}>
                ⚡ Bộ lọc
                {(prefs.locations.length > 0 || prefs.lifestyle.length > 0) && (
                  <span style={{ background: C.accent, color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {prefs.locations.length + prefs.lifestyle.length}
                  </span>
                )}
              </button>
            </div>
            {liked.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.redSoft, border: `1px solid rgba(248,113,113,0.2)`, padding: '7px 12px', borderRadius: 10, fontSize: 13, color: C.red }}>
                ♥ {liked.length + superLiked.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match animation overlay */}
      {showMatch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', animation: 'matchPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{showMatch.isSuper ? '⭐' : '💜'}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {showMatch.isSuper ? 'Super Match!' : 'Đã thích!'}
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>{showMatch.name} · {showMatch._score}% phù hợp</div>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === 'match' ? (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* LEFT: Stats sidebar (desktop) */}
            <div className="desktop-panel" style={{ width: 240, flexShrink: 0 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 14 }}>PHIÊN NÀY</div>
                {[
                  { label: 'Đã xem', val: liked.length + skipped.length + superLiked.length, color: C.text },
                  { label: 'Đã thích', val: liked.length, color: C.red },
                  { label: 'Super like', val: superLiked.length, color: C.gold },
                  { label: 'Bỏ qua', val: skipped.length, color: C.muted },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {liked.length > 0 && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px' }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 14 }}>ĐÃ THÍCH</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...superLiked.map(c => ({ ...c, isSuper: true })), ...liked].slice(0, 5).map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                          <img src={c.image} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.isSuper ? C.gold : C.accent}` }} />
                          {c.isSuper && <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 10 }}>⭐</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>{c._score}% match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CENTER: Card deck */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: C.muted }}>
                  {queue.length > 0 ? `${queue.length} người phù hợp` : 'Hết danh sách'}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {CANDIDATES.slice(0, 5).map((_, i) => (
                    <div key={i} style={{ height: 3, width: 24, borderRadius: 2, background: i < (CANDIDATES.length - queue.length) ? C.accent : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>

              {/* Card */}
              <div style={{ height: 520, position: 'relative', marginBottom: 20 }}>
                {queue.length > 0 ? (
                  <SwipeCardDeck
                    candidates={queue}
                    onLike={handleLike}
                    onSkip={handleSkip}
                    onSuperLike={handleSuperLike}
                  />
                ) : (
                  <div style={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`,
                    textAlign: 'center', padding: 32,
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Đã xem hết rồi!</div>
                    <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Điều chỉnh bộ lọc để tìm thêm người phù hợp</div>
                    <button onClick={() => setShowFilter(true)} style={{
                      padding: '12px 24px', borderRadius: 12,
                      background: C.accent, border: 'none',
                      color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>Mở bộ lọc</button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {queue.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                  <button onClick={() => handleSkip(current)} style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: C.redSoft, border: `1px solid rgba(248,113,113,0.3)`,
                    color: C.red, fontSize: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s', boxShadow: `0 4px 16px rgba(248,113,113,0.2)`,
                  }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = ''}>
                    ✕
                  </button>
                  <button onClick={() => handleSuperLike(current)} style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: C.goldSoft, border: `1px solid rgba(251,191,36,0.3)`,
                    color: C.gold, fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s',
                  }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = ''}>
                    ⭐
                  </button>
                  <button onClick={() => handleLike(current)} style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: C.greenSoft, border: `1px solid rgba(52,211,153,0.3)`,
                    color: C.green, fontSize: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s', boxShadow: `0 4px 16px rgba(52,211,153,0.2)`,
                  }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = ''}>
                    ♥
                  </button>
                </div>
              )}

              {/* Swipe hint */}
              {queue.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: C.subtle }}>← Bỏ qua</span>
                  <span style={{ fontSize: 11, color: C.subtle }}>↑ Super</span>
                  <span style={{ fontSize: 11, color: C.subtle }}>Thích →</span>
                </div>
              )}
            </div>

            {/* RIGHT: Compatibility panel (desktop) */}
            <div className="desktop-panel" style={{ width: 280, flexShrink: 0 }}>
              {current ? (
                <>
                  <CompatibilityPanel match={current} score={current._score || 88} />
                  <div style={{ marginTop: 12 }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 16 }}>
                      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>GIỚI THIỆU</div>
                      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{current.bio}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Bắt đầu swipe để xem phân tích tương thích</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Discover tab ─────────────────────────────────────────────────── */
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
          {/* Hero banner */}
          <div style={{
            borderRadius: 24, background: `linear-gradient(135deg, ${C.accentSoft}, rgba(52,211,153,0.08))`,
            border: `1px solid ${C.accentGlow}`,
            padding: '28px 32px', marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Khám phá phòng gần bạn</div>
              <div style={{ fontSize: 14, color: C.muted }}>Lọc theo địa điểm, ngân sách và tiện nghi yêu thích</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ val: '10k+', label: 'Phòng' }, { val: '5k+', label: 'Người tìm' }, { val: '94%', label: 'Hài lòng' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {[
            { title: '✨ Phù hợp nhất với bạn', rooms: DISCOVER_ROOMS },
            { title: '🎓 Gần trường đại học', rooms: DISCOVER_ROOMS.slice(0, 3) },
            { title: '🚇 Gần metro', rooms: DISCOVER_ROOMS.slice(1, 4) },
            { title: '💰 Giá tốt', rooms: DISCOVER_ROOMS.slice(0, 3) },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{section.title}</h2>
                <button style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Xem tất cả →</button>
              </div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                {section.rooms.map(r => <DiscoverCard key={r.id} room={r} />)}
              </div>
            </div>
          ))}

          {/* Smart filter pills */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Lọc nhanh</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Dưới 3tr/tháng', 'Điều hòa', 'Wifi', 'Thang máy', 'Giờ tự do', 'Gác lửng', 'Ban công', 'Giữ xe', 'Khép kín', 'Có bếp'].map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter sheet */}
      {showFilter && <FilterSheet prefs={prefs} onChange={setPrefs} onClose={() => setShowFilter(false)} />}

      {/* Bottom nav (mobile) */}
      <div className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(15,15,17,0.95)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', padding: '8px 0 env(safe-area-inset-bottom)',
      }}>
        {[['match', '🔍', 'Ghép đôi'], ['discover', '🗺️', 'Khám phá'], ['filter', '⚡', 'Bộ lọc']].map(([t, icon, label]) => (
          <button key={t} onClick={() => t === 'filter' ? setShowFilter(true) : setTab(t)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 0',
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 10, color: tab === t ? C.accent : C.muted, fontWeight: tab === t ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}