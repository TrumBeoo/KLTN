import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'

const T = {
  blue: '#006ce4',
  text: '#1a1a1a',
  muted: '#595959',
  white: '#ffffff',
  border: '#d4d6d9',
  motion: '120ms',
}

const TrendCard = styled(Box)({
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  border: `1px solid ${T.border}`,
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  '&:hover': {
    boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
    transform: 'translateY(-2px)',
  },
  '&:hover .trend-img': { transform: 'scale(1.04)' },
  '&:focus-visible': {
    outline: `2px solid ${T.blue}`,
    outlineOffset: '2px',
  },
})

function SectionHeader({ children, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{children}</Typography>
      {action}
    </Box>
  )
}

const defaultUniversities = [
  {
    name: 'ĐH Bách Khoa Hà Nội',
    distance: 'Trong bán kính 2km',
    rooms: 0,
    badge: '🎓 Sinh viên',
    badgeColor: '#008234',
    tag: 'Đi bộ 10-15 phút',
    tagColor: '#008234',
    priceFrom: '1.800.000',
    image: '/img/Cầu Giấy/z7760626402929_bc9c417f99cd46668914be0376940374.jpg',
  },
  {
    name: 'ĐH Ngoại Thương',
    distance: 'Dưới 1.5km',
    rooms: 0,
    badge: 'Phổ biến',
    badgeColor: T.blue,
    priceFrom: '2.200.000',
    image: '/img/Ba Đình - Đống Đa/z7760735760259_0c46655387c0005977fe8176c6151e84.jpg',
  },
  {
    name: 'ĐH Kinh Tế Quốc Dân',
    distance: 'Trong bán kính 1km',
    rooms: 0,
    badge: '⭐ Gần nhất',
    badgeColor: '#c8102e',
    priceFrom: '2.500.000',
    image: '/img/Cầu Giấy/z7761100948320_ddc5b92c5a7445a02f5327b048a91d02.jpg',
  },
  {
    name: 'ĐH FPT Hà Nội',
    rooms: 0,
    priceFrom: '2.000.000',
    tag: 'Gần khu công nghệ',
    tagColor: T.blue,
    image: '/img/Cầu Giấy/z7761850108357_81a2e18a911f0aa147bb47c9096f3a6f.jpg',
  },
  {
    name: 'ĐH Quốc Gia Hà Nội',
    rooms: 0,
    priceFrom: '1.900.000',
    tag: 'Khu vực Cầu Giấy',
    tagColor: T.muted,
    image: '/img/Cầu Giấy/z7762478969473_38ce8d20e5081dafcbeb69e5e36025ab.jpg',
  },
  {
    name: 'Học viện Ngân Hàng',
    rooms: 0,
    priceFrom: '2.300.000',
    tag: 'An ninh tốt',
    tagColor: '#c8102e',
    image: '/img/Ba Đình - Đống Đa/z7761862528900_997b8c7ce1c5159672dbd0df45cf3f71.jpg',
  },
]

export default function NearUniversities() {
  const navigate = useNavigate()
  const [universities, setUniversities] = useState(defaultUniversities)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetchUniversitiesData()
  }, [])

  const fetchUniversitiesData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/locations/pois?type=university`)
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        const mappedData = data.data.map((uni, index) => ({
          name: uni.POIName,
          distance: uni.Distance || 'Trong bán kính 2km',
          rooms: uni.RoomCount || 0,
          badge: uni.Badge || (index === 0 ? '🎓 Sinh viên' : 'Phổ biến'),
          badgeColor: uni.BadgeColor || (index === 0 ? '#008234' : T.blue),
          tag: uni.Tag || 'Đi bộ 10-15 phút',
          tagColor: uni.TagColor || '#008234',
          priceFrom: uni.AvgPrice?.toString() || '1.800.000',
          image: defaultUniversities[index]?.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
          poiId: uni.POIID,
        }))
        setUniversities(mappedData)
      }
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUniversityClick = (uni) => {
    navigate(`/listings?poi=${uni.poiId || uni.name}&type=university`)
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg" component="section" aria-labelledby="near-universities-heading">
        <SectionHeader
          action={
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate('/listings?type=university')}
              sx={{ color: T.blue, fontSize: '0.857rem', fontWeight: 600, p: 0 }}
            >
              Xem tất cả
            </Button>
          }
        >
          <span id="near-universities-heading">Phòng gần trường ĐH</span>
        </SectionHeader>
        <Typography variant="body2" sx={{ color: T.muted, mb: 2, mt: -1, fontSize: '0.857rem' }}>
          Tiện lợi cho sinh viên · Tiết kiệm thời gian di chuyển
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gridTemplateRows: 'auto',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <TrendCard
            sx={{ gridColumn: 1, gridRow: { md: '1 / 3' }, height: { xs: 220, md: 340 } }}
            onClick={() => handleUniversityClick(universities[0])}
            tabIndex={0}
            role="article"
            aria-label={`${universities[0].name} - ${universities[0].rooms} phòng`}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUniversityClick(universities[0])}
          >
            <Box
              className="trend-img"
              component="img"
              src={universities[0].image}
              alt={universities[0].name}
              loading="lazy"
              sx={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                transition: 'transform 300ms ease',
              }}
            />
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)',
            }} />
            <Box sx={{
              position: 'absolute', top: 12, left: 12,
              backgroundColor: universities[0].badgeColor,
              color: T.white, fontSize: '0.714rem', fontWeight: 700,
              px: 1, py: 0.25, borderRadius: '4px', letterSpacing: '0.03em',
            }}>
              {universities[0].badge}
            </Box>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '14px 16px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.286rem', color: T.white, lineHeight: 1.25, mb: 0.25 }}>
                {universities[0].name}
              </Typography>
              <Typography sx={{ fontSize: '0.857rem', color: 'rgba(255,255,255,0.85)' }}>
                {universities[0].distance} · {universities[0].rooms} phòng
              </Typography>
              {universities[0].tag && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: universities[0].tagColor, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {universities[0].tag}
                  </Typography>
                </Box>
              )}
            </Box>
          </TrendCard>

          <TrendCard
            sx={{ height: { xs: 160, md: 164 } }}
            onClick={() => handleUniversityClick(universities[1])}
            tabIndex={0}
            role="article"
            aria-label={`${universities[1].name} - ${universities[1].rooms} phòng`}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUniversityClick(universities[1])}
          >
            <Box
              className="trend-img"
              component="img"
              src={universities[1].image}
              alt={universities[1].name}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
            <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: universities[1].badgeColor, color: T.white, fontSize: '0.714rem', fontWeight: 700, px: 1, py: 0.25, borderRadius: '4px' }}>
              {universities[1].badge}
            </Box>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{universities[1].name}</Typography>
              <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>{universities[1].distance} · {universities[1].rooms} phòng</Typography>
            </Box>
          </TrendCard>

          <TrendCard
            sx={{ height: { xs: 160, md: 164 } }}
            onClick={() => handleUniversityClick(universities[2])}
            tabIndex={0}
            role="article"
            aria-label={`${universities[2].name} - ${universities[2].rooms} phòng`}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUniversityClick(universities[2])}
          >
            <Box
              className="trend-img"
              component="img"
              src={universities[2].image}
              alt={universities[2].name}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
            <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: universities[2].badgeColor, color: T.white, fontSize: '0.714rem', fontWeight: 700, px: 1, py: 0.25, borderRadius: '4px' }}>
              {universities[2].badge}
            </Box>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{universities[2].name}</Typography>
              <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>{universities[2].distance} · {universities[2].rooms} phòng</Typography>
            </Box>
          </TrendCard>
        </Box>

        <Grid container spacing={1.5}>
          {universities.slice(3, 6).map(d => (
            <Grid item xs={12} sm={4} key={d.name}>
              <TrendCard
                sx={{ height: { xs: 160, md: 164 } }}
                onClick={() => handleUniversityClick(d)}
                tabIndex={0}
                role="article"
                aria-label={`${d.name} - từ ${d.priceFrom}đ/tháng`}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUniversityClick(d)}
              >
                <Box
                  className="trend-img"
                  component="img"
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '10px 14px' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.white, lineHeight: 1.2 }}>{d.name}</Typography>
                  <Typography sx={{ fontSize: '0.786rem', color: 'rgba(255,255,255,0.85)' }}>
                    {d.rooms} phòng · từ {d.priceFrom}đ/tháng
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: d.tagColor, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.714rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{d.tag}</Typography>
                  </Box>
                </Box>
              </TrendCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
