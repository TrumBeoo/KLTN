import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const T = {
  blue: '#006ce4',
  blueDk: '#003f8a',
  blueLt: '#e8f2ff',
  text: '#1a1a1a',
  muted: '#595959',
  bg: '#f2f4f8',
  white: '#ffffff',
  border: '#d4d6d9',
  motion: '120ms',
}

export default function NearMetroStations() {
  const navigate = useNavigate()
  const [selectedMetroLine, setSelectedMetroLine] = useState('2A')
  const [metroStations, setMetroStations] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')

  useEffect(() => {
    fetchMetroStationsData()
  }, [selectedMetroLine])

  const fetchMetroStationsData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/locations/pois?type=metro`)
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        const defaultImages = [
          '/img/Cầu Giấy/z7762717375986_189a701f94bc6db440649e6ae10f4059.jpg',
          '/img/Cầu Giấy/z7761181202211_1d4cf52395f51622ea14b9ea9ef3840c.jpg',
          '/img/Tây Hồ - Hoàn Kiếm/z7760593030224_59d77a9c0fed1ebedc8dfbb72de51e7d.jpg',
          '/img/Thanh Xuân - Hà Đông - Thanh Trì/z7762870388592_c7ddea9a9ceebc2abe31bd982058be97.jpg',
          '/img/Hoàng Mai - Hai Bà Trưng/z7762439494359_6bb5b4cd682ecd0ca03ae2ed8a859c3c.jpg',
        ]
        
        // Filter stations by line based on POIID
        const filteredStations = data.data.filter(station => {
          const poiId = parseInt(station.POIID)
          if (selectedMetroLine === '2A') {
            // Tuyến 2A: POIID từ 00021 đến 00032 (Ga Cát Linh - Yên Nghĩa)
            return poiId >= 21 && poiId <= 32
          } else if (selectedMetroLine === '3') {
            // Tuyến 3: POIID từ 00033 đến 00044 (Ga Nhổn - Ga Hà Nội)
            return poiId >= 33 && poiId <= 44
          }
          return false
        })
        
        const mappedData = filteredStations.map((station, index) => ({
          name: station.POIName,
          line: `Tuyến ${selectedMetroLine}`,
          rooms: station.RoomCount || 0,
          priceAvg: station.AvgPrice?.toString() || '2500000',
          walkTime: '5-10 phút',
          badge: '🚇 Ga',
          badgeColor: '#008234',
          image: defaultImages[index % defaultImages.length],
          poiId: station.POIID,
        }))
        setMetroStations(mappedData)
      } else {
        setMetroStations([])
      }
    } catch (error) {
      console.error('Error fetching metro stations:', error)
      setMetroStations([])
    } finally {
      setLoading(false)
    }
  }

  const handleStationClick = (station) => {
    navigate(`/listings?poi=${station.poiId || station.name}&type=metro&line=${selectedMetroLine}`)
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg" component="section" aria-labelledby="metro-heading">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: T.text }}>Phòng gần tàu điện/Metro</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate('/listings?type=metro')}
              sx={{ color: T.blue, fontSize: '0.857rem', fontWeight: 600, p: 0 }}
            >
              Xem tất cả
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.857rem', color: T.muted, fontWeight: 500 }}>Chọn tuyến:</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setSelectedMetroLine('2A')}
              variant={selectedMetroLine === '2A' ? 'contained' : 'outlined'}
              size="small"
              aria-label="Tuyến 2A"
              sx={{
                borderRadius: '20px',
                fontSize: '0.857rem',
                fontWeight: 600,
                px: 2,
                backgroundColor: selectedMetroLine === '2A' ? T.blue : 'transparent',
                color: selectedMetroLine === '2A' ? T.white : T.blue,
                border: `1px solid ${T.blue}`,
                '&:hover': {
                  backgroundColor: selectedMetroLine === '2A' ? T.blueDk : T.blueLt,
                },
              }}
            >
              🚇 Tuyến 2A
            </Button>
            <Button
              onClick={() => setSelectedMetroLine('3')}
              variant={selectedMetroLine === '3' ? 'contained' : 'outlined'}
              size="small"
              aria-label="Tuyến 3"
              sx={{
                borderRadius: '20px',
                fontSize: '0.857rem',
                fontWeight: 600,
                px: 2,
                backgroundColor: selectedMetroLine === '3' ? T.blue : 'transparent',
                color: selectedMetroLine === '3' ? T.white : T.blue,
                border: `1px solid ${T.blue}`,
                '&:hover': {
                  backgroundColor: selectedMetroLine === '3' ? T.blueDk : T.blueLt,
                },
              }}
            >
              🚇 Tuyến 3
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ color: T.muted, mb: 3, mt: -1, fontSize: '0.857rem' }}>
          {selectedMetroLine === '2A' 
            ? 'Tuyến 2A Cát Linh - Hà Đông (12 ga) · 13km' 
            : 'Tuyến 3 Nhổn - Ga Hà Nội (12 ga) · 12.5km'
          } · Di chuyển nhanh · Tiết kiệm thời gian
        </Typography>

        <Box
          sx={{
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'visible',
            pb: 2,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-track': { backgroundColor: T.bg, borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: T.border, borderRadius: '3px', '&:hover': { backgroundColor: T.muted } },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
              minWidth: 'max-content',
              position: 'relative',
              pt: 3,
            }}
          >
            {metroStations.map((station, idx) => (
              <Box
                key={station.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  minWidth: 200,
                }}
              >
                {idx < metroStations.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      width: '100%',
                      height: 3,
                      background: `repeating-linear-gradient(to right, ${T.blue} 0px, ${T.blue} 8px, transparent 8px, transparent 16px)`,
                      zIndex: 0,
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: T.blue,
                    border: `4px solid ${T.white}`,
                    boxShadow: `0 0 0 2px ${T.blue}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ fontSize: '1rem' }}>🚇</Box>
                </Box>

                <Box
                  onClick={() => handleStationClick(station)}
                  tabIndex={0}
                  role="article"
                  aria-label={`${station.name} - ${station.rooms} phòng`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleStationClick(station)}
                  sx={{
                    width: 180,
                    backgroundColor: T.white,
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: `all ${T.motion} ease`,
                    '&:hover': {
                      boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
                      transform: 'translateY(-4px)',
                      borderColor: T.blue,
                    },
                    '&:hover .metro-img': { transform: 'scale(1.08)' },
                    '&:focus-visible': {
                      outline: `2px solid ${T.blue}`,
                      outlineOffset: '2px',
                    },
                  }}
                >
                  <Box sx={{ height: 100, position: 'relative', overflow: 'hidden', backgroundColor: T.bg }}>
                    <Box
                      className="metro-img"
                      component="img"
                      src={station.image}
                      alt={station.name}
                      loading="lazy"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 300ms ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: station.badgeColor,
                        color: T.white,
                        fontSize: '0.643rem',
                        fontWeight: 700,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '3px',
                      }}
                    >
                      {station.badge}
                    </Box>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.857rem',
                        color: T.text,
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {station.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.714rem',
                        color: T.muted,
                        mb: 1,
                      }}
                    >
                      {station.line}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                      <Box sx={{ fontSize: '0.857rem' }}>🚶</Box>
                      <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>
                        {station.walkTime}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 0.75,
                        borderTop: `1px solid ${T.border}`,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.714rem', color: T.muted }}>
                        {station.rooms} phòng
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.786rem',
                          fontWeight: 700,
                          color: T.blue,
                        }}
                      >
                        ~{fmt(station.priceAvg)}đ
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: T.blueLt,
            borderRadius: '8px',
            border: `1px solid ${T.blue}20`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ fontSize: '1.286rem', flexShrink: 0, mt: 0.25 }}>ℹ️</Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: T.text, mb: 0.5 }}>
                Lợi ích khi ở gần ga tàu điện
              </Typography>
              <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.6 }}>
                Tiết kiệm 30-45 phút di chuyển mỗi ngày · Tránh kẹt xe giờ cao điểm · An toàn và tiện lợi · Giá vé chỉ 8.000-15.000đ/lượt
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
