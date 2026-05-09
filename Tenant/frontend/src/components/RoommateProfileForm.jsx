import { useState, useEffect } from 'react'

// ─── Design tokens (matching RoommateMatchingPage style) ───────────────────
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
  'Du lịch', 'Yoga', 'Chạy bộ', 'Nhiếp ảnh', 'Thiết kế', 'Lập trình',
  'Âm nhạc', 'Vẽ tranh', 'Nấu ăn', 'Phim ảnh', 'Sách', 'Công nghệ',
]

const DISTRICTS = [
  'Cầu Giấy', 'Đống Đa', 'Hà Đông', 'Hoàng Mai', 'Thanh Xuân',
  'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hai Bà Trưng', 'Ba Đình', 'Tây Hồ',
]

// ─── Components ─────────────────────────────────────────────────────────────

function FormSection({ title, subtitle, children }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 20, padding: '24px 26px', marginBottom: 20,
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: 0.3 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: C.surfaceUp, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.background = C.surface }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.surfaceUp }}
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, required, rows = 4 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: 0.3 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: C.surfaceUp, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 14, outline: 'none',
          resize: 'vertical', fontFamily: 'inherit',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.background = C.surface }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.surfaceUp }}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: 0.3 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: C.surfaceUp, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 14, outline: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: C.surface }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ChipSelector({ label, options, selected, onToggle, multiple = true }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12, letterSpacing: 0.3 }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const isSelected = multiple ? selected.includes(opt.id || opt) : selected === (opt.id || opt)
          return (
            <button
              key={opt.id || opt}
              type="button"
              onClick={() => onToggle(opt.id || opt)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                border: `1px solid ${isSelected ? C.accent : C.border}`,
                background: isSelected ? C.accentSoft : 'transparent',
                color: isSelected ? C.accent : C.muted,
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {opt.label || opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RangeSlider({ label, min, max, step, value, onChange, unit = '' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: 0.3 }}>{label}</label>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
          {value[0]}{unit} - {value[1]}{unit}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={e => onChange([+e.target.value, value[1]])}
          style={{ flex: 1, accentColor: C.accent }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={e => onChange([value[0], +e.target.value])}
          style={{ flex: 1, accentColor: C.accent }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RoommateProfileForm({ onSubmit, onCancel }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Thông tin cơ bản
    name: '',
    age: '',
    gender: 'any',
    occupation: '',
    university: '',
    bio: '',
    
    // Step 2: Sở thích & lối sống
    lifestyle: [],
    interests: [],
    sleepTime: '23:00',
    wakeTime: '07:00',
    cleanLevel: 3,
    noiseLevel: 2,
    
    // Step 3: Yêu cầu matching
    budget: [2, 6],
    locations: [],
    genderPreference: 'any',
    duration: 'long-term',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      onSubmit(formData)
    }
  }

  const progress = (step / 3) * 100

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: C.text,
      padding: '24px 20px',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, marginBottom: 12 }}>🏠</div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 8px',
            background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tạo hồ sơ tìm roommate
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
            Hoàn thành thông tin để tìm người ở ghép phù hợp
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Bước {step}/3</span>
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${C.accent}, ${C.green})`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Thông tin cơ bản */}
          {step === 1 && (
            <>
              <FormSection
                title="Thông tin cơ bản"
                subtitle="Giúp người khác hiểu về bạn"
              >
                <InputField
                  label="Họ và tên"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <InputField
                    label="Tuổi"
                    type="number"
                    value={formData.age}
                    onChange={e => updateField('age', e.target.value)}
                    placeholder="25"
                    min="18"
                    max="60"
                    required
                  />
                  <SelectField
                    label="Giới tính"
                    value={formData.gender}
                    onChange={e => updateField('gender', e.target.value)}
                    options={[
                      { value: 'Nam', label: 'Nam' },
                      { value: 'Nữ', label: 'Nữ' },
                      { value: 'any', label: 'Khác' },
                    ]}
                    required
                  />
                </div>

                <InputField
                  label="Nghề nghiệp"
                  value={formData.occupation}
                  onChange={e => updateField('occupation', e.target.value)}
                  placeholder="Sinh viên / Nhân viên văn phòng / Freelancer..."
                  required
                />

                <InputField
                  label="Trường / Công ty"
                  value={formData.university}
                  onChange={e => updateField('university', e.target.value)}
                  placeholder="ĐH Bách Khoa / FPT Software..."
                />

                <TextArea
                  label="Giới thiệu bản thân"
                  value={formData.bio}
                  onChange={e => updateField('bio', e.target.value)}
                  placeholder="Mình là người thích yên tĩnh, sạch sẽ. Thường xuyên đi làm sớm về muộn..."
                  required
                  rows={4}
                />
              </FormSection>
            </>
          )}

          {/* Step 2: Sở thích & lối sống */}
          {step === 2 && (
            <>
              <FormSection
                title="Lối sống & thói quen"
                subtitle="Giúp tìm người có lối sống tương đồng"
              >
                <ChipSelector
                  label="Phong cách sống"
                  options={LIFESTYLE_OPTIONS}
                  selected={formData.lifestyle}
                  onToggle={val => toggleArrayField('lifestyle', val)}
                />

                <ChipSelector
                  label="Sở thích"
                  options={INTEREST_SUGGESTIONS}
                  selected={formData.interests}
                  onToggle={val => toggleArrayField('interests', val)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
                      Giờ đi ngủ
                    </label>
                    <input
                      type="time"
                      value={formData.sleepTime}
                      onChange={e => updateField('sleepTime', e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        background: C.surfaceUp, border: `1px solid ${C.border}`,
                        color: C.text, fontSize: 14, outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
                      Giờ thức dậy
                    </label>
                    <input
                      type="time"
                      value={formData.wakeTime}
                      onChange={e => updateField('wakeTime', e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        background: C.surfaceUp, border: `1px solid ${C.border}`,
                        color: C.text, fontSize: 14, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                    Mức độ sạch sẽ: {'★'.repeat(formData.cleanLevel)}{'☆'.repeat(5 - formData.cleanLevel)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.cleanLevel}
                    onChange={e => updateField('cleanLevel', +e.target.value)}
                    style={{ width: '100%', accentColor: C.green }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                    Mức độ ồn ào: {'★'.repeat(formData.noiseLevel)}{'☆'.repeat(5 - formData.noiseLevel)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.noiseLevel}
                    onChange={e => updateField('noiseLevel', +e.target.value)}
                    style={{ width: '100%', accentColor: C.gold }}
                  />
                </div>
              </FormSection>
            </>
          )}

          {/* Step 3: Yêu cầu matching */}
          {step === 3 && (
            <>
              <FormSection
                title="Yêu cầu tìm kiếm"
                subtitle="Tiêu chí để tìm roommate phù hợp"
              >
                <RangeSlider
                  label="Ngân sách (triệu/tháng)"
                  min={1}
                  max={15}
                  step={0.5}
                  value={formData.budget}
                  onChange={val => updateField('budget', val)}
                  unit="tr"
                />

                <ChipSelector
                  label="Khu vực mong muốn"
                  options={DISTRICTS}
                  selected={formData.locations}
                  onToggle={val => toggleArrayField('locations', val)}
                />

                <SelectField
                  label="Giới tính roommate"
                  value={formData.genderPreference}
                  onChange={e => updateField('genderPreference', e.target.value)}
                  options={[
                    { value: 'any', label: 'Không quan tâm' },
                    { value: 'Nam', label: 'Nam' },
                    { value: 'Nữ', label: 'Nữ' },
                  ]}
                />

                <SelectField
                  label="Thời gian ở"
                  value={formData.duration}
                  onChange={e => updateField('duration', e.target.value)}
                  options={[
                    { value: 'short-term', label: 'Ngắn hạn (1-3 tháng)' },
                    { value: 'long-term', label: 'Dài hạn (3+ tháng)' },
                    { value: 'flexible', label: 'Linh hoạt' },
                  ]}
                />
              </FormSection>
            </>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12,
                  background: C.surfaceUp, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                ← Quay lại
              </button>
            )}
            <button
              type="submit"
              style={{
                flex: 2, padding: '14px', borderRadius: 12,
                background: `linear-gradient(135deg, ${C.accent}, #9b8ef8)`,
                border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', boxShadow: `0 8px 24px ${C.accentGlow}`,
                transition: 'all 0.2s',
              }}
            >
              {step === 3 ? '✨ Bắt đầu tìm kiếm' : 'Tiếp tục →'}
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                width: '100%', padding: '12px', marginTop: 12,
                background: 'transparent', border: 'none',
                color: C.muted, fontSize: 13, cursor: 'pointer',
              }}
            >
              Hủy bỏ
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
