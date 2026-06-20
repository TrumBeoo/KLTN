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
    image: '/img/Cầu Giấy/z7760626468063_5cb2ea184a35fc2adb57844f4b7fa230.jpg',
    amenityType: 'park',
  },
  {
    icon: '🏪',
    title: 'Gần siêu thị',
    desc: 'Circle K, Mini Stop, VinMart',
    rooms: 0,
    color: '#008234',
    image: '/img/Giá rẻ/z7762798605785_b89a45f811ce22ce11335bdedafbffdd.jpg',
    amenityType: 'supermarket',
  },
  {
    icon: '🏥',
    title: 'Gần bệnh viện',
    desc: 'Phòng khám, bệnh viện',
    rooms: 0,
    color: '#c8102e',
    image: '/img/Ba Đình - Đống Đa/z7762061665410_de2fee60e85b25377b92a40ad33ad282.jpg',
    amenityType: 'hospital',
  },
  {
    icon: '🍜',
    title: 'Gần chợ/quán ăn',
    desc: 'Chợ, khu ẩm thực',
    rooms: 0,
    color: '#f5a623',
    image: '/img/Giá rẻ/z7762887143172_45965f8a16685168424256260c2120b1.jpg',
    amenityType: 'market',
  },
  {
    icon: '💪',
    title: 'Gần gym/thể thao',
    desc: 'Phòng gym, sân thể thao',
    rooms: 0,
    color: T.blue,
    image: '/img/Cầu Giấy/z7761883092648_588fe547f6958c4234329b01a46f9b2d.jpg',
    amenityType: 'gym',
  },
  {
    icon: '☕',
    title: 'Gần cafe/coworking',
    desc: 'Quán cafe, không gian làm việc',
    rooms: 0,
    color: '#5d4037',
    image: '/img/Tây Hồ - Hoàn Kiếm/z7760681822592_78e8cca1e2ef380bae77d983e7d9f798.jpg',
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
      
      const amenityMap = {
        'park': { icon: '🌳', title: 'Gần công viên', desc: 'Công viên, khu vui chơi', color: '#2e7d32', image: '/img/Cầu Giấy/z7760626468063_5cb2ea184a35fc2adb57844f4b7fa230.jpg' },
        'supermarket': { icon: '🏪', title: 'Gần siêu thị', desc: 'Circle K, Mini Stop, VinMart', color: '#008234', image: '/img/Giá rẻ/z7762798605785_b89a45f811ce22ce11335bdedafbffdd.jpg' },
        'hospital': { icon: '🏥', title: 'Gần bệnh viện', desc: 'Phòng khám, bệnh viện', color: '#c8102e', image: '/img/Ba Đình - Đống Đa/z7762061665410_de2fee60e85b25377b92a40ad33ad282.jpg' },
        'market': { icon: '🍜', title: 'Gần chợ/quán ăn', desc: 'Chợ, khu ẩm thực', color: '#f5a623', image: '/img/Giá rẻ/z7762887143172_45965f8a16685168424256260c2120b1.jpg' },
        'gym': { icon: '💪', title: 'Gần gym/thể thao', desc: 'Phòng gym, sân thể thao', color: T.blue, image: '/img/Cầu Giấy/z7761883092648_588fe547f6958c4234329b01a46f9b2d.jpg' },
        'bank': { icon: '🏦', title: 'Gần ngân hàng', desc: 'ATM, chi nhánh ngân hàng', color: '#6a1b9a', image: '/img/Ba Đình - Đống Đa/z7762090324944_e4088fcaa10c0a8b19a47c13cd88d1f7.jpg' },
        'cafe': { icon: '☕', title: 'Gần cafe/coworking', desc: 'Quán cafe, không gian làm việc', color: '#5d4037', image: '/img/Tây Hồ - Hoàn Kiếm/z7760681822592_78e8cca1e2ef380bae77d983e7d9f798.jpg' },
        'mall': { icon: '🛍️', title: 'Gần trung tâm thương mại', desc: 'TTTM, siêu thị lớn', color: '#e91e63', image: '/img/Cầu Giấy/z7762496456687_a8cd57a516d7c4ab2fdefed1d80e8980.jpg' },
        'university': { icon: '🎓', title: 'Gần trường đại học', desc: 'Đại học, cao đẳng', color: '#1976d2', image: '/img/Cầu Giấy/z7760626402929_bc9c417f99cd46668914be0376940374.jpg' },
        'metro': { icon: '🚇', title: 'Gần ga tàu điện', desc: 'Ga metro, tàu điện ngầm', color: '#ff9800', image: '/img/Cầu Giấy/z7762717375986_189a701f94bc6db440649e6ae10f4059.jpg' },
        'cinema': { icon: '🎥', title: 'Gần rạp phim', desc: 'Rạp chiếu phim, CGV, Lotte', color: '#9c27b0', image: '/img/Tây Hồ - Hoàn Kiếm/z7762094922161_f841b3254bc9eeb6dbdc313d9c0a7dfd.jpg' },
        'entertainment': { icon: '🎪', title: 'Gần khu vui chơi', desc: 'Khu giải trí, vui chơi', color: '#ff5722', image: '/img/Thanh Xuân - Hà Đông - Thanh Trì/z7762870388592_c7ddea9a9ceebc2abe31bd982058be97.jpg' },
        'landmark': { icon: '🏛️', title: 'Gần địa điểm nổi bật', desc: 'Di tích, địa điểm nổi tiếng', color: '#795548', image: '/img/Tây Hồ - Hoàn Kiếm/z7760593030224_59d77a9c0fed1ebedc8dfbb72de51e7d.jpg' },
        'museum': { icon: '🏛️', title: 'Gần bảo tàng', desc: 'Bảo tàng, triển lãm', color: '#607d8b', image: '/img/Tây Hồ - Hoàn Kiếm/z7762097117621_74ca7b797432b51bb94dedacf2dd96d0.jpg' },
        'restaurant': { icon: '🍴', title: 'Gần nhà hàng', desc: 'Nhà hàng, quán ăn', color: '#ff6f00', image: '/img/Hoàng Mai - Hai Bà Trưng/z7762445056364_8a5f2340e72f7f95258b096cc474a301.jpg' },
        'bus_station': { icon: '🚌', title: 'Gần bến xe', desc: 'Bến xe buýt, trạm xe', color: '#00897b', image: '/img/Cầu Giấy/z7761522449334_321cca0e694b9514bcd4046df52836d4.jpg' },
        'stadium': { icon: '🏟️', title: 'Gần sân vận động', desc: 'Sân bóng, sân thể thao', color: '#43a047', image: '/img/Thanh Xuân - Hà Đông - Thanh Trì/z7762871223405_94edb0b3a379db33bb64252eeed9d84f.jpg' },
        'theater': { icon: '🎭', title: 'Gần nhà hát', desc: 'Nhà hát, sân khấu', color: '#d32f2f', image: '/img/Tây Hồ - Hoàn Kiếm/z7763046401265_39c868115a3cbb726095927045bc7088.jpg' },
        'library': { icon: '📚', title: 'Gần thư viện', desc: 'Thư viện công cộng', color: '#5e35b1', image: '/img/Ba Đình - Đống Đa/z7761862528900_997b8c7ce1c5159672dbd0df45cf3f71.jpg' },
        'coworking': { icon: '💼', title: 'Gần không gian làm việc', desc: 'Coworking space, văn phòng', color: '#1565c0', image: '/img/Từ Liêm/z7762853540637_0259f49f5dbe572063e82c73581471e4.jpg' },
      }

      // Lấy tất cả POI types
      const types = Object.keys(amenityMap)
      const promises = types.map(type => 
        fetch(`${API_URL}/locations/pois?type=${type}`).then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      const allPOIs = results.flatMap(data => data.success && data.data ? data.data : [])

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
      
      if (mappedData.length > 0) {
        setAmenities(mappedData)
      } else {
        setAmenities(defaultAmenities)
      }
    } catch (error) {
      console.error('Error fetching amenities:', error)
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
