import { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const T = {
  blue: '#006ce4',
  text: '#1a1a1a',
  muted: '#595959',
  bg: '#f2f4f8',
  white: '#ffffff',
  border: '#d4d6d9',
  motion: '120ms',
}

function SectionHeader({ children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{children}</Typography>
    </Box>
  )
}

const defaultAmenities = [
  {
    icon: '🌳',
    title: 'Gần công viên',
    desc: 'Công viên, khu vui chơi',
    rooms: 0,
    color: '#2e7d32',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80',
    amenityType: 'park',
  },
  {
    icon: '🏪',
    title: 'Gần siêu thị',
    desc: 'Circle K, Mini Stop, VinMart',
    rooms: 0,
    color: '#008234',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80',
    amenityType: 'supermarket',
  },
  {
    icon: '🏥',
    title: 'Gần bệnh viện',
    desc: 'Phòng khám, bệnh viện',
    rooms: 0,
    color: '#c8102e',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    amenityType: 'hospital',
  },
  {
    icon: '🍜',
    title: 'Gần chợ/quán ăn',
    desc: 'Chợ, khu ẩm thực',
    rooms: 0,
    color: '#f5a623',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    amenityType: 'market',
  },
  {
    icon: '💪',
    title: 'Gần gym/thể thao',
    desc: 'Phòng gym, sân thể thao',
    rooms: 0,
    color: T.blue,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    amenityType: 'gym',
  },
  {
    icon: '☕',
    title: 'Gần cafe/coworking',
    desc: 'Quán cafe, không gian làm việc',
    rooms: 0,
    color: '#5d4037',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    amenityType: 'cafe',
  },
]

export default function NearbyAmenities() {
  const navigate = useNavigate()
  const [amenities, setAmenities] = useState(defaultAmenities)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetchAmenitiesData()
  }, [])

  const fetchAmenitiesData = async () => {
    try {
      setLoading(true)
      // Lấy nhiều loại POI cùng lúc
      const types = ['park', 'supermarket', 'hospital', 'market', 'gym', 'bank', 'cafe', 'mall', 'school', 'university']
      const promises = types.map(type => 
        fetch(`${API_URL}/locations/pois?type=${type}`).then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      const allPOIs = results.flatMap(data => data.success && data.data ? data.data : [])
      
      const amenityMap = {
        'park': { icon: '🌳', title: 'Gần công viên', desc: 'Công viên, khu vui chơi', color: '#2e7d32', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80' },
        'supermarket': { icon: '🏪', title: 'Gần siêu thị', desc: 'Circle K, Mini Stop, VinMart', color: '#008234', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80' },
        'hospital': { icon: '🏥', title: 'Gần bệnh viện', desc: 'Phòng khám, bệnh viện', color: '#c8102e', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80' },
        'market': { icon: '🍜', title: 'Gần chợ/quán ăn', desc: 'Chợ, khu ẩm thực', color: '#f5a623', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
        'gym': { icon: '💪', title: 'Gần gym/thể thao', desc: 'Phòng gym, sân thể thao', color: T.blue, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
        'bank': { icon: '🏦', title: 'Gần ngân hàng', desc: 'ATM, chi nhánh ngân hàng', color: '#6a1b9a', image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&q=80' },
        'cafe': { icon: '☕', title: 'Gần cafe/coworking', desc: 'Quán cafe, không gian làm việc', color: '#5d4037', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' },
        'mall': { icon: '🛍️', title: 'Gần trung tâm thương mại', desc: 'TTTM, siêu thị lớn', color: '#e91e63', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80' },
        'school': { icon: '🏫', title: 'Gần trường học', desc: 'Trường tiểu học, THCS, THPT', color: '#ff6f00', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80' },
        'university': { icon: '🎓', title: 'Gần trường đại học', desc: 'Đại học, cao đẳng', color: '#1976d2', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80' },
      }

      // Nhóm POI theo type và lấy POI có nhiều phòng nhất của mỗi type
      const groupedByType = {}
      allPOIs.forEach(poi => {
        const type = poi.POIType?.toLowerCase() || 'supermarket'
        if (!groupedByType[type] || poi.RoomCount > groupedByType[type].RoomCount) {
          groupedByType[type] = poi
        }
      })
      
      // Tạo danh sách amenities từ dữ liệu thực tế
      const mappedData = Object.values(groupedByType)
        .filter(amenity => amenity.RoomCount > 0)
        .map(amenity => {
          const amenityType = amenity.POIType?.toLowerCase() || 'supermarket'
          const amenityInfo = amenityMap[amenityType] || amenityMap['supermarket']
          
          return {
            ...amenityInfo,
            rooms: amenity.RoomCount || 0,
            poiId: amenity.POIID,
            amenityType: amenityType,
          }
        })
        .sort((a, b) => b.rooms - a.rooms)
        .slice(0, 6)
      
      // Nếu có dữ liệu thực, dùng dữ liệu thực, nếu không dùng mặc định
      if (mappedData.length > 0) {
        setAmenities(mappedData)
      } else {
        // Hiển thị các tiện ích mặc định với rooms = 0 để user biết có các loại này
        setAmenities(defaultAmenities)
      }
    } catch (error) {
      console.error('Error fetching amenities:', error)
      // Nếu lỗi, hiển thị mặc định
      setAmenities(defaultAmenities)
    } finally {
      setLoading(false)
    }
  }

  const handleAmenityClick = (amenity) => {
    navigate(`/listings?poi=${amenity.poiId || amenity.title}&type=amenity&amenityType=${amenity.amenityType}`)
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg" component="section" aria-labelledby="amenities-heading">
        <SectionHeader>
          <span id="amenities-heading">Tiện ích xung quanh</span>
        </SectionHeader>
        <Typography variant="body2" sx={{ color: T.muted, mb: 3, mt: -1, fontSize: '0.857rem' }}>
          Tìm phòng theo tiện ích sinh hoạt hàng ngày · Thuận tiện cho cuộc sống
        </Typography>

        <Grid container spacing={2}>
          {amenities.map((item, i) => (
            <Grid item xs={6} md={4} key={i}>
              <Box
                onClick={() => handleAmenityClick(item)}
                tabIndex={0}
                role="article"
                aria-label={`${item.title} - ${item.rooms} phòng`}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleAmenityClick(item)}
                sx={{
                  position: 'relative',
                  height: { xs: 180, md: 200 },
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `1px solid ${T.border}`,
                  transition: `all ${T.motion} ease`,
                  '&:hover': {
                    boxShadow: 'rgba(26,26,26,0.24) 0px 8px 24px',
                    transform: 'translateY(-4px)',
                  },
                  '&:hover .amenity-img': { transform: 'scale(1.08)' },
                  '&:focus-visible': {
                    outline: `2px solid ${T.blue}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                <Box
                  className="amenity-img"
                  component="img"
                  src={item.image}
                  alt={item.title}
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
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.714rem',
                    boxShadow: 'rgba(0,0,0,0.15) 0px 2px 8px',
                  }}
                >
                  {item.icon}
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: '12px 14px',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: T.white,
                      mb: 0.25,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.786rem',
                      color: 'rgba(255,255,255,0.85)',
                      mb: 0.75,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.desc}
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: T.white,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.786rem',
                        fontWeight: 600,
                        color: T.white,
                      }}
                    >
                      {item.rooms} phòng
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#fff9e6',
            borderRadius: '8px',
            border: '1px solid #febb0220',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ fontSize: '1.286rem', flexShrink: 0, mt: 0.25 }}>💡</Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.857rem', color: T.text, mb: 0.5 }}>
                Mẹo chọn phòng theo tiện ích
              </Typography>
              <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.6 }}>
                Ưu tiên chọn phòng gần siêu thị và chợ để mua sắm hàng ngày · Gần bệnh viện/phòng khám giúp an tâm khi cần khám chữa bệnh · Khu vực có nhiều quán ăn tiết kiệm thời gian nấu nướng · Gym và cafe phù hợp với người trẻ năng động
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
