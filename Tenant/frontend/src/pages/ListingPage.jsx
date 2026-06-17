/**
 * ListingPage — Booking.com style redesign
 *
 * Layout: left column (cards) + right sticky (map + sidebar)
 * Card: horizontal image + content — Booking.com hotel-list pattern
 * Tokens: same as theme.js
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { buildImageUrl } from '../utils/image'
import SecondaryMenu from '../components/SecondaryMenu'
import RoomMap from '../components/RoomMap'
import SortMenu from '../components/SortMenu'
import FilterModal from '../components/FilterModal'
import {
  Box, Container, Grid, Button, Typography, Stack, IconButton,
  Skeleton, Chip, Tooltip, Pagination, Snackbar, Alert,
} from '@mui/material'
import {
  Star as StarIcon, LocationOn as LocationIcon,
  Straighten as RulerIcon,
  Wifi as WifiIcon, AcUnit as AcIcon,
  Security as ShieldIcon, DirectionsCar as CarIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  Visibility as EyeIcon, Group as GroupIcon,
  ImageNotSupported as NoImageIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterIcon,
  Tune as TuneIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

// ─── Tokens ──────────────────────────────────────────────────────────────
const T = {
  blue:    '#006ce4',
  blueDk:  '#003f8a',
  blueLt:  '#e8f2ff',
  text:    '#1a1a1a',
  muted:   '#595959',
  bg:      '#f2f4f8',
  white:   '#ffffff',
  border:  '#d4d6d9',
  yellow:  '#febb02',
  green:   '#008234',
  greenLt: '#e8f5ee',
  shadow1: '0px 4px 12px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.06)',
  shadow2: '0px 8px 20px rgba(0,0,0,0.12), 0px 2px 6px rgba(0,0,0,0.08)',
  motion:  '120ms',
}

// ─── Styled ──────────────────────────────────────────────────────────────

/** Horizontal listing card — Booking.com hotel-card style */
const ListingCard = styled(Box)(({ theme }) => ({
  backgroundColor: T.white,
  borderRadius: '16px',
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow1,
  overflow: 'hidden',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  transition: `box-shadow ${T.motion} ease, transform ${T.motion} ease`,
  '&:hover': { boxShadow: T.shadow2, transform: 'translateY(-2px)' },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}))

const ScoreBadge = styled(Box)({
  backgroundColor: '#003580',
  color: T.white, borderRadius: '4px 4px 4px 0',
  padding: '4px 8px',
  fontWeight: 700, fontSize: '0.929rem',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
})

const StatusBadge = styled(Box)(({ status }) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 8px', borderRadius: '4px',
  fontSize: '0.786rem', fontWeight: 600,
  backgroundColor:
    status === 'available' ? T.greenLt :
    status === 'pending'   ? '#fef6e8' :
    status === 'booked'    ? T.blueLt  : '#fde8eb',
  color:
    status === 'available' ? '#005a23' :
    status === 'pending'   ? '#a16100' :
    status === 'booked'    ? T.blue    : '#8b0d1f',
}))

function AmenityTag({ amenity }) {
  const map = {
    wifi: { icon: <WifiIcon sx={{ fontSize: 14 }} />, label: 'Wifi' },
    ac:   { icon: <AcIcon  sx={{ fontSize: 14 }} />, label: 'Điều hòa' },
    security: { icon: <ShieldIcon sx={{ fontSize: 14 }} />, label: 'An ninh' },
    parking:  { icon: <CarIcon sx={{ fontSize: 14 }} />, label: 'Đỗ xe' },
  }
  const entry = map[amenity]
  if (!entry) return null
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.25, borderRadius: '4px',
      backgroundColor: T.bg, color: T.muted, fontSize: '0.786rem',
    }}>
      {entry.icon}{entry.label}
    </Box>
  )
}

const statusLabel = { available: 'Còn trống', pending: 'Chờ duyệt', booked: 'Đã đặt lịch', rented: 'Đã thuê' }

function SkeletonCard() {
  return (
    <Box sx={{ 
      backgroundColor: T.white, 
      borderRadius: '16px', 
      border: `1px solid ${T.border}`,
      boxShadow: T.shadow1,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      overflow: 'hidden' 
    }}>
      <Skeleton 
        variant="rectangular" 
        sx={{ 
          width: { xs: '100%', md: 220 },
          height: { xs: 200, md: 160 },
          flexShrink: 0 
        }} 
        animation="wave" 
      />
      <Box sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="text" width="70%" height={22} />
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="30%" height={28} sx={{ mt: 1 }} />
      </Box>
    </Box>
  )
}

// ─── Component ────────────────────────────────────────────────────────────
export default function ListingPage() {
  useScrollToTop()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [favorites, setFavorites] = useState({})
  const [favLoading, setFavLoading] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [listings, setListings]   = useState([])
  const [latestListings, setLatestListings] = useState([])
  const [roommateProfiles, setRoommateProfiles] = useState([])
  const [transportServices, setTransportServices] = useState([])
  const [mapRooms, setMapRooms]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [page, setPage]           = useState(1)
  const [totalListings, setTotalListings] = useState(0)
  const [poiName, setPoiName]     = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [sortBy, setSortBy]       = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)
  const [amenityName, setAmenityName] = useState('')
  const [roomTypeName, setRoomTypeName] = useState('')
  const PER_PAGE = 10

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const poiId = searchParams.get('poi')
  const poiType = searchParams.get('type')
  const district = searchParams.get('district')
  const searchDate = searchParams.get('date')
  const searchGuests = searchParams.get('guests')
  const maxPrice = searchParams.get('maxPrice')
  const minArea = searchParams.get('minArea')
  const maxArea = searchParams.get('maxArea')
  const amenity = searchParams.get('amenity')
  const roomTypeParam = searchParams.get('roomType')
  const nearUniversity = searchParams.get('nearUniversity')

  useEffect(() => {
    setPage(1)
  }, [poiId, district, maxPrice, minArea, maxArea, amenity, roomTypeParam, nearUniversity])

  useEffect(() => { 
    // Debounce fetch to avoid excessive API calls
    const timer = setTimeout(() => {
      fetchRooms();
    }, 300);
    return () => clearTimeout(timer);
  }, [poiId, district, selectedRoomType, selectedDistrict, maxPrice, minArea, maxArea, amenity, roomTypeParam, nearUniversity, page, sortBy])
  
  useEffect(() => { fetchLatestRooms(); fetchRoommateProfiles(); fetchTransportServices(); checkFavorites() }, [])
  
  useEffect(() => {
    if (poiId) {
      fetchPOIName()
    }
  }, [poiId])
  
  useEffect(() => {
    if (amenity) {
      fetchAmenityName()
    }
  }, [amenity])
  
  useEffect(() => {
    if (roomTypeParam) {
      fetchRoomTypeName()
    }
  }, [roomTypeParam])
  
  const fetchPOIName = async () => {
    try {
      const res = await fetch(`${API_URL}/locations/pois/${poiId}`)
      const data = await res.json()
      if (data.success && data.data) {
        setPoiName(data.data.POIName)
      }
    } catch (error) {
      console.error('Fetch POI name error:', error)
    }
  }

  const fetchAmenityName = async () => {
    try {
      const res = await fetch(`${API_URL}/filters/amenities`)
      const data = await res.json()
      if (data.success) {
        const amenityObj = data.data.find(a => a.value === amenity)
        if (amenityObj) {
          setAmenityName(amenityObj.label)
        }
      }
    } catch (error) {
      console.error('Fetch amenity name error:', error)
    }
  }

  const fetchRoomTypeName = async () => {
    try {
      const res = await fetch(`${API_URL}/filters/room-types`)
      const data = await res.json()
      if (data.success) {
        const roomTypeObj = data.data.find(rt => rt.value === roomTypeParam)
        if (roomTypeObj) {
          setRoomTypeName(roomTypeObj.label)
        }
      }
    } catch (error) {
      console.error('Fetch room type name error:', error)
    }
  }

  const fetchLatestRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms?limit=10&offset=0&sortBy=newest`)
      const data = await res.json()
      if (data.success) {
        const formatted = data.data.map(room => {
          const imgUrl = room.images?.[0]?.ImageURL
          return {
            id: room.RoomID,
            title: room.Title || `${room.RoomType} - ${room.RoomCode}`,
            location: room.BuildingAddress || 'Chưa cập nhật',
            price: room.Price?.toString() || '0',
            area: room.Area || 0,
            image: buildImageUrl(imgUrl, API_URL.replace('/api', ''), { width: 320, height: 240 }),
            createdAt: room.CreatedAt || room.created_at || new Date().toISOString(),
          }
        })
        setLatestListings(formatted)
      }
    } catch (error) {
      console.error('Fetch latest rooms error:', error)
    }
  }

  const fetchRoommateProfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/tenant/roommate-profiles?limit=5`)
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setRoommateProfiles(data.data)
      } else {
        // Mock data if no real data
        setRoommateProfiles([
          { TenantID: 'mock1', Name: 'Nguyễn Văn An', Age: 24, Gender: 'male', BudgetMin: 2000000, BudgetMax: 3000000, PreferredLocation: 'Cầu Giấy', AvatarURL: 'https://i.pravatar.cc/150?img=12' },
          { TenantID: 'mock2', Name: 'Trần Thị Bình', Age: 22, Gender: 'female', BudgetMin: 2500000, BudgetMax: 3500000, PreferredLocation: 'Đống Đa', AvatarURL: 'https://i.pravatar.cc/150?img=47' },
          { TenantID: 'mock3', Name: 'Lê Hoàng Cường', Age: 25, Gender: 'male', BudgetMin: 3000000, BudgetMax: 4000000, PreferredLocation: 'Hai Bà Trưng', AvatarURL: 'https://i.pravatar.cc/150?img=33' },
          { TenantID: 'mock4', Name: 'Phạm Thu Hà', Age: 23, Gender: 'female', BudgetMin: 2200000, BudgetMax: 3200000, PreferredLocation: 'Ba Đình', AvatarURL: 'https://i.pravatar.cc/150?img=45' },
          { TenantID: 'mock5', Name: 'Đỗ Minh Tuấn', Age: 26, Gender: 'male', BudgetMin: 2800000, BudgetMax: 3800000, PreferredLocation: 'Thanh Xuân', AvatarURL: 'https://i.pravatar.cc/150?img=15' },
        ])
      }
    } catch (error) {
      console.error('Fetch roommate profiles error:', error)
      // Mock data on error
      setRoommateProfiles([
        { TenantID: 'mock1', Name: 'Nguyễn Văn An', Age: 24, Gender: 'male', BudgetMin: 2000000, BudgetMax: 3000000, PreferredLocation: 'Cầu Giấy', AvatarURL: 'https://i.pravatar.cc/150?img=12' },
        { TenantID: 'mock2', Name: 'Trần Thị Bình', Age: 22, Gender: 'female', BudgetMin: 2500000, BudgetMax: 3500000, PreferredLocation: 'Đống Đa', AvatarURL: 'https://i.pravatar.cc/150?img=47' },
        { TenantID: 'mock3', Name: 'Lê Hoàng Cường', Age: 25, Gender: 'male', BudgetMin: 3000000, BudgetMax: 4000000, PreferredLocation: 'Hai Bà Trưng', AvatarURL: 'https://i.pravatar.cc/150?img=33' },
        { TenantID: 'mock4', Name: 'Phạm Thu Hà', Age: 23, Gender: 'female', BudgetMin: 2200000, BudgetMax: 3200000, PreferredLocation: 'Ba Đình', AvatarURL: 'https://i.pravatar.cc/150?img=45' },
        { TenantID: 'mock5', Name: 'Đỗ Minh Tuấn', Age: 26, Gender: 'male', BudgetMin: 2800000, BudgetMax: 3800000, PreferredLocation: 'Thanh Xuân', AvatarURL: 'https://i.pravatar.cc/150?img=15' },
      ])
    }
  }

  const fetchTransportServices = async () => {
    try {
      const res = await fetch(`${API_URL}/moving/services?limit=5`)
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setTransportServices(data.data)
      } else {
        // Mock data with vehicle icons
        setTransportServices([
          { ServiceID: 'mock1', Name: 'Chuyển phòng trọ mini', BasePrice: 150000, VehicleType: 'tricycle', Category: 'moving' },
          { ServiceID: 'mock2', Name: 'Chuyển nhà tiêu chuẩn', BasePrice: 350000, VehicleType: 'van', Category: 'moving' },
          { ServiceID: 'mock3', Name: 'Chuyển nhà VIP', BasePrice: 650000, VehicleType: 'truck', Category: 'moving' },
          { ServiceID: 'mock4', Name: 'Chuyển nhà gia đình', BasePrice: 500000, VehicleType: 'truck', Category: 'moving' },
          { ServiceID: 'mock5', Name: 'Chuyển đồ xe máy', BasePrice: 80000, VehicleType: 'motorbike', Category: 'moving' },
        ])
      }
    } catch (error) {
      console.error('Fetch transport services error:', error)
      // Mock data on error
      setTransportServices([
        { ServiceID: 'mock1', Name: 'Chuyển phòng trọ mini', BasePrice: 150000, VehicleType: 'tricycle', Category: 'moving' },
        { ServiceID: 'mock2', Name: 'Chuyển nhà tiêu chuẩn', BasePrice: 350000, VehicleType: 'van', Category: 'moving' },
        { ServiceID: 'mock3', Name: 'Chuyển nhà VIP', BasePrice: 650000, VehicleType: 'truck', Category: 'moving' },
        { ServiceID: 'mock4', Name: 'Chuyển nhà gia đình', BasePrice: 500000, VehicleType: 'truck', Category: 'moving' },
        { ServiceID: 'mock5', Name: 'Chuyển đồ xe máy', BasePrice: 80000, VehicleType: 'motorbike', Category: 'moving' },
      ])
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('limit', PER_PAGE.toString())
      params.append('offset', ((page - 1) * PER_PAGE).toString())
      params.append('sortBy', sortBy)
      
      if (poiId) {
        params.append('poi', poiId)
      }
      if (district || selectedDistrict) {
        params.append('district', selectedDistrict || district)
      }

      const effectiveRoomType = roomTypeParam || selectedRoomType
      if (effectiveRoomType && effectiveRoomType !== 'all') {
        params.append('roomType', effectiveRoomType)
      }

      if (maxPrice) {
        params.append('maxPrice', maxPrice)
      }

      if (minArea) {
        params.append('minArea', minArea)
      }

      if (maxArea) {
        params.append('maxArea', maxArea)
      }

      if (amenity) {
        params.append('amenity', amenity)
      }
      
      const res = await fetch(`${API_URL}/rooms?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        const formatted = data.data.map(room => {
          const imgUrl = room.images?.[0]?.ImageURL
          return {
            id: room.RoomID,
            title: room.Title || `${room.RoomType} - ${room.RoomCode}`,
            location: room.BuildingAddress || 'Chưa cập nhật',
            price: room.Price?.toString() || '0',
            area: room.Area || 0,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 80) + 5,
            image: buildImageUrl(imgUrl, API_URL.replace('/api', ''), { width: 520, height: 360 }),
            status: (room.DisplayStatus || room.Status) === 'available' ? 'available'
              : (room.DisplayStatus || room.Status) === 'pending_viewing' ? 'pending'
              : (room.DisplayStatus || room.Status) === 'viewing' ? 'booked' : 'rented',
            amenities: parseAmenities(room.Amenities),
            buildingName: room.BuildingName,
            maxPeople: room.MaxPeople,
            landlordName: room.LandlordName,
            views: Math.floor(Math.random() * 200) + 20,
            latitude: room.Latitude,
            longitude: room.Longitude,
            createdAt: room.CreatedAt || room.created_at || new Date().toISOString(),
          }
        })
        setListings(formatted)
        setTotalListings(data.total || formatted.length)
        setMapRooms(formatted.filter(r => r.latitude && r.longitude).map(r => ({
          id: r.id, title: r.title, price: r.price, latitude: r.latitude, longitude: r.longitude,
        })))
        checkFavorites()
      } else setError('Không thể tải danh sách phòng')
    } catch { setError('Lỗi kết nối server') }
    finally { setLoading(false) }
  }

  const parseAmenities = d => {
    if (!d) return []
    try { return typeof d === 'string' ? JSON.parse(d) : Array.isArray(d) ? d : [] }
    catch { return [] }
  }

  const checkFavorites = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch(`${API_URL}/tenant/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const favMap = {}
        data.data.forEach(fav => {
          favMap[fav.RoomID] = true
        })
        setFavorites(favMap)
      }
    } catch (err) {
      console.error('Check favorites error:', err)
    }
  }

  const toggleFav = async (id, e) => {
    e?.stopPropagation()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng đăng nhập để lưu phòng yêu thích', severity: 'warning' })
      setTimeout(() => navigate('/login'), 1500)
      return
    }
    
    setFavLoading(prev => ({ ...prev, [id]: true }))
    
    try {
      const isFav = favorites[id]
      
      if (isFav) {
        const res = await fetch(`${API_URL}/tenant/favorites/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setFavorites(prev => ({ ...prev, [id]: false }))
          setSnackbar({ open: true, message: '💔 Đã xóa khỏi danh sách yêu thích', severity: 'info' })
        }
      } else {
        const res = await fetch(`${API_URL}/tenant/favorites`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: id })
        })
        const data = await res.json()
        if (data.success) {
          setFavorites(prev => ({ ...prev, [id]: true }))
          setSnackbar({ open: true, message: '❤️ Đã thêm vào danh sách yêu thích', severity: 'success' })
        } else {
          setSnackbar({ open: true, message: data.message || 'Không thể thêm vào yêu thích', severity: 'error' })
        }
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi kết nối', severity: 'error' })
    } finally {
      setFavLoading(prev => ({ ...prev, [id]: false }))
    }
  }
  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')

  // Sắp xếp listings với useMemo để tránh tính toán lại mỗi render
  const totalPages = useMemo(() => 
    Math.ceil(totalListings / PER_PAGE),
    [totalListings]
  );

  // Count active filters on mount and when params change
  useEffect(() => {
    let count = 0
    if (maxPrice && maxPrice !== '20000000') count++ // Only count if not default max
    if (minArea && minArea !== '0') count++
    if (maxArea && maxArea !== '100') count++
    if (amenity) count++
    if (roomTypeParam) count++
    if (selectedDistrict || district) count++
    if (poiId) count++
    setActiveFilters(count)
  }, [maxPrice, minArea, maxArea, amenity, roomTypeParam, selectedDistrict, district, poiId])

  const handleRoomTypeChange = (roomType) => {
    setSelectedRoomType(roomType)
    setPage(1)
  }

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district)
    setPage(1)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(1)
  }

  const handleFilterApply = () => {
    // Count active filters
    let count = 0
    if (maxPrice) count++
    if (minArea || maxArea) count++
    if (amenity) count++
    if (roomTypeParam || selectedRoomType !== 'all') count++
    if (selectedDistrict || district) count++
    if (poiId) count++
    setActiveFilters(count)
    setFilterOpen(false)
  }

  return (
    <Box sx={{ backgroundColor: T.bg, minHeight: '100vh' }}>
      <SecondaryMenu onCategoryChange={handleRoomTypeChange} onDistrictChange={handleDistrictChange} />

      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>
              <Box component="span" sx={{ color: T.blue }}>{listings.length}</Box>
              &nbsp;phòng{selectedRoomType && selectedRoomType !== 'all' ? ` ${selectedRoomType}` : ''}
              {roomTypeParam && roomTypeName ? ` ${roomTypeName}` : ''}
              {maxPrice ? ` dưới ${fmt(maxPrice)}đ` : ''}
              {amenity && amenityName ? ` có ${amenityName}` : ''}
              {poiId && poiName ? ` gần ${poiName}` : 
               (selectedDistrict || district) ? ` tại ${selectedDistrict || district}` : 
               ' tại Hà Nội'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <SortMenu currentSort={sortBy} onSortChange={handleSortChange} />
              <Button
                size="small"
                onClick={() => setFilterOpen(true)}
                startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
                aria-label="Mở bộ lọc"
                sx={{
                  color: activeFilters > 0 ? T.white : T.blue,
                  border: `1px solid ${T.blue}`,
                  borderRadius: '4px',
                  fontSize: '0.857rem',
                  fontWeight: 600,
                  backgroundColor: activeFilters > 0 ? T.blue : T.blueLt,
                  px: 1.5,
                  py: 0.75,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: activeFilters > 0 ? T.blueDk : '#d0e8ff',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${T.blue}`,
                    outlineOffset: '2px',
                  },
                  transition: 'all 120ms ease',
                }}
              >
                Bộ lọc
                {activeFilters > 0 && (
                  <Chip
                    label={activeFilters}
                    size="small"
                    sx={{
                      ml: 0.75,
                      height: 18,
                      minWidth: 18,
                      fontSize: '0.714rem',
                      fontWeight: 700,
                      backgroundColor: T.white,
                      color: T.blue,
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                  />
                )}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#8b0d1f', mb: 2 }}>{error}</Typography>
            <Button variant="contained" onClick={fetchRooms} sx={{ backgroundColor: T.blue }}>Thử lại</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* ─── Right sidebar (mobile: on top, desktop: right side) ─────── */}
            <Grid item xs={12} lg={4} sx={{ order: { xs: 1, lg: 2 } }}>
              <Box sx={{ 
                position: { xs: 'static', lg: 'sticky' }, 
                top: { lg: 92 }, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1
              }}>
                {/* Map */}
                <Box sx={{
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  height: { xs: 280, sm: 320, lg: 320 },
                  border: `1px solid ${T.border}`, 
                  boxShadow: T.shadow1,
                }}>
                  {mapRooms.length > 0 ? (
                    <RoomMap rooms={mapRooms} onMarkerClick={r => navigate(`/room/${r.id}`)} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: T.bg }}>
                      <Typography sx={{ color: T.muted, fontSize: '0.857rem' }}>Không có tọa độ</Typography>
                    </Box>
                  )}
                </Box>

                {/* Latest listings sidebar - hidden on mobile */}
                <Box sx={{ 
                  backgroundColor: T.white, 
                  borderRadius: '16px', 
                  border: `1px solid ${T.border}`, 
                  boxShadow: T.shadow1, 
                  p: 2,
                  display: { xs: 'none', lg: 'block' }
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, pb: 1, borderBottom: `1px solid ${T.border}` }}>
                    Phòng mới đăng (10 tin)
                  </Typography>
                  <Stack spacing={0}>
                    {latestListings.map(listing => (
                      <Box
                        key={listing.id}
                        onClick={() => navigate(`/room/${listing.id}`)}
                        tabIndex={0} role="article"
                        aria-label={`${listing.title}`}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/room/${listing.id}`)}
                        sx={{
                          display: 'flex', gap: 1.5, py: 1.25,
                          borderBottom: `1px solid ${T.border}`,
                          cursor: 'pointer',
                          '&:last-child': { borderBottom: 'none', pb: 0 },
                          '&:hover .side-title': { color: T.blue, textDecoration: 'underline' },
                          '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px', borderRadius: '4px' },
                        }}
                      >
                        <Box sx={{ width: 64, height: 56, borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: T.bg }}>
                          {listing.image ? (
                            <Box component="img" src={listing.image} alt={listing.title}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <NoImageIcon sx={{ fontSize: 20, color: T.border }} />
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography className="side-title" sx={{
                            fontWeight: 600, fontSize: '0.857rem', color: T.text,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            transition: 'color 120ms ease',
                          }}>
                            {listing.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.857rem', color: T.blue, fontWeight: 700 }}>
                            {fmt(listing.price)}đ/tháng
                          </Typography>
                          <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>{listing.area}m²</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Roommate profiles panel */}
                {roommateProfiles.length > 0 && (
                  <Box sx={{ 
                    backgroundColor: T.white, 
                    borderRadius: '16px', 
                    border: `1px solid ${T.border}`, 
                    boxShadow: T.shadow1, 
                    p: 2,
                    display: { xs: 'none', lg: 'block' }
                  }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, pb: 1, borderBottom: `1px solid ${T.border}` }}>
                      Tìm người ở ghép
                    </Typography>
                    <Stack spacing={0}>
                      {roommateProfiles.slice(0, 5).map(profile => (
                        <Box
                          key={profile.TenantID}
                          onClick={() => navigate('/roommate')}
                          tabIndex={0}
                          sx={{
                            display: 'flex', gap: 1.5, py: 1.25,
                            borderBottom: `1px solid ${T.border}`,
                            cursor: 'pointer',
                            '&:last-child': { borderBottom: 'none', pb: 0 },
                            '&:hover': { backgroundColor: T.blueLt },
                            '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px', borderRadius: '4px' },
                          }}
                        >
                          <Box sx={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: T.blue }}>
                            {profile.AvatarURL ? (
                              <Box component="img" src={profile.AvatarURL} alt={profile.Name}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontWeight: 700, fontSize: '1.1rem' }}>
                                {profile.Name?.charAt(0) || 'T'}
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.857rem', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {profile.Name || 'Người dùng'} {profile.Age ? `• ${profile.Age} tuổi` : ''}
                            </Typography>
                            <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>
                              {profile.PreferredLocation || 'Hà Nội'} • {profile.BudgetMin && profile.BudgetMax ? `${fmt(profile.BudgetMin)}-${fmt(profile.BudgetMax)}đ` : 'Chưa cập nhật'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                    <Button 
                      fullWidth 
                      size="small" 
                      onClick={() => navigate('/roommate')}
                      sx={{ mt: 1.5, color: T.blue, fontWeight: 600, fontSize: '0.857rem' }}
                    >
                      Xem tất cả
                    </Button>
                  </Box>
                )}

                {/* Transport services panel */}
                {transportServices.length > 0 && (
                  <Box sx={{ 
                    backgroundColor: T.white, 
                    borderRadius: '16px', 
                    border: `1px solid ${T.border}`, 
                    boxShadow: T.shadow1, 
                    p: 2,
                    display: { xs: 'none', lg: 'block' }
                  }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, pb: 1, borderBottom: `1px solid ${T.border}` }}>
                      Dịch vụ vận chuyển
                    </Typography>
                    <Stack spacing={0}>
                      {transportServices.slice(0, 5).map(service => {
                        const vehicleIcons = {
                          motorbike: '🛻',
                          tricycle: '🛻',
                          van: '🚐',
                          truck: '🚚',
                          pickup: '🛻',
                        };
                        const icon = vehicleIcons[service.VehicleType] || '🚐';
                        
                        return (
                          <Box
                            key={service.ServiceID}
                            onClick={() => navigate('/moving-service')}
                            tabIndex={0}
                            sx={{
                              display: 'flex', gap: 1.5, py: 1.25,
                              borderBottom: `1px solid ${T.border}`,
                              cursor: 'pointer',
                              '&:last-child': { borderBottom: 'none', pb: 0 },
                              '&:hover': { backgroundColor: T.blueLt },
                              '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px', borderRadius: '4px' },
                            }}
                          >
                            <Box sx={{ width: 48, height: 48, borderRadius: '8px', backgroundColor: T.blueLt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '26px' }}>
                              {icon}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.857rem', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {service.Name || 'Dịch vụ vận chuyển'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.786rem', color: T.green, fontWeight: 700 }}>
                                Từ {fmt(service.BasePrice || 0)}đ
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                    <Button 
                      fullWidth 
                      size="small" 
                      onClick={() => navigate('/services')}
                      sx={{ mt: 1.5, color: T.blue, fontWeight: 600, fontSize: '0.857rem' }}
                    >
                      Xem tất cả dịch vụ
                    </Button>
                  </Box>
                )}

                {/* Blog/Tips panel */}
                <Box sx={{ 
                  backgroundColor: T.white, 
                  borderRadius: '16px', 
                  border: `1px solid ${T.border}`, 
                  boxShadow: T.shadow1, 
                  p: 2,
                  display: { xs: 'none', lg: 'block' }
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.929rem', color: T.text, mb: 1.5, pb: 1, borderBottom: `1px solid ${T.border}` }}>
                    Mẹo tìm phòng giá tốt
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: T.blueLt, border: `1px solid ${T.blue}20` }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.857rem', color: T.blueDk, mb: 0.5 }}>
                        💡 Tìm phòng cuối tháng
                      </Typography>
                      <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.5 }}>
                        Chủ nhà thường dễ thương lượng giá hơn vào cuối tháng khi muốn cho thuê nhanh.
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: T.greenLt, border: `1px solid ${T.green}20` }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.857rem', color: '#005a23', mb: 0.5 }}>
                        🔍 Khảo sát kỹ vị trí
                      </Typography>
                      <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.5 }}>
                        Kiểm tra khoảng cách đến trường/công ty, chợ, siêu thị và phương tiện công cộng.
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#fef6e8', border: '1px solid #febb0220' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.857rem', color: '#a16100', mb: 0.5 }}>
                        📋 Đọc kỹ hợp đồng
                      </Typography>
                      <Typography sx={{ fontSize: '0.786rem', color: T.muted, lineHeight: 1.5 }}>
                        Chú ý các điều khoản về tiền cọc, điện nước, và thời gian thuê tối thiểu.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* ─── Left: listings (mobile: below map, desktop: left side) ─── */}
            <Grid item xs={12} lg={8} sx={{ order: { xs: 2, lg: 1 } }}>
              <Stack spacing={2}>
                {loading
                  ? [1,2,3,4,5].map(i => <SkeletonCard key={i} />)
                  : listings.length === 0
                    ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ color: T.muted }}>Không có phòng nào</Typography>
                      </Box>
                    )
                    : listings.map(listing => (
                        <ListingCard
                          key={listing.id}
                          onClick={() => navigate(`/room/${listing.id}`)}
                          tabIndex={0} role="article"
                          aria-label={`${listing.title}, ${fmt(listing.price)}đ/tháng, ${statusLabel[listing.status]}`}
                          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/room/${listing.id}`)}
                        >
                          {/* Image */}
                          <Box sx={{ 
                            width: { xs: '100%', md: 260 }, 
                            height: { xs: 200, sm: 220, md: 250 }, 
                            position: 'relative', 
                            flexShrink: 0, 
                            backgroundColor: T.bg 
                          }}>
                            {listing.image ? (
                              <Box
                                component="img" src={listing.image} alt={listing.title} loading="lazy"
                                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                                  transition: 'transform 300ms ease',
                                  '&:hover': { transform: 'scale(1.04)' },
                                }}
                                onError={e => { e.target.style.display = 'none' }}
                              />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NoImageIcon sx={{ fontSize: 40, color: T.border }} />
                              </Box>
                            )}
                            {/* Fav */}
                            <IconButton
                              size="small"
                              onClick={e => toggleFav(listing.id, e)}
                              disabled={favLoading[listing.id]}
                              aria-label={favorites[listing.id] ? 'Bỏ lưu' : 'Lưu phòng'}
                              sx={{
                                position: 'absolute', top: 8, right: 8,
                                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                                color: favorites[listing.id] ? '#e91e63' : '#595959', p: '4px',
                                '&:hover': { backgroundColor: T.white, color: '#e91e63' },
                                '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                                '&:disabled': { opacity: 0.6 },
                              }}
                            >
                              {favorites[listing.id] ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                            {/* Views */}
                            <Box sx={{
                              position: 'absolute', bottom: 8, left: 8,
                              display: 'flex', alignItems: 'center', gap: 0.5,
                              backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: '4px',
                              px: 0.75, py: 0.25,
                            }}>
                              <EyeIcon sx={{ fontSize: 12, color: T.white }} />
                              <Typography sx={{ fontSize: '0.714rem', color: T.white, fontWeight: 600 }}>{listing.views}</Typography>
                            </Box>
                          </Box>

                          {/* Content */}
                          <Box sx={{ 
                            flex: 1, 
                            p: { xs: 1.5, sm: 2 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            minWidth: 0 
                          }}>
                            {/* Title row */}
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }} 
                              justifyContent="space-between" 
                              alignItems={{ xs: 'flex-start', sm: 'flex-start' }} 
                              sx={{ mb: 0.5, gap: { xs: 0.5, sm: 0 } }}
                            >
                              <Typography sx={{
                                fontWeight: 700, 
                                fontSize: { xs: '0.929rem', sm: '0.957rem' }, 
                                color: T.blue,
                                flex: 1, 
                                mr: { xs: 0, sm: 1 }, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                '&:hover': { textDecoration: 'underline' },
                              }}>
                                {listing.title}
                              </Typography>
                              {/* Score */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-end', 
                                gap: 0.5, 
                                flexShrink: 0 
                              }}>
                                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                  <Typography sx={{ fontSize: '0.714rem', color: T.muted, lineHeight: 1 }}>
                                    {listing.reviews} đánh giá
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>Rất tốt</Typography>
                                </Box>
                                <ScoreBadge>{listing.rating}</ScoreBadge>
                              </Box>
                            </Stack>

                            {/* Location */}
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                              <LocationIcon sx={{ fontSize: 14, color: T.muted }} />
                              <Typography sx={{ fontSize: '0.857rem', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {listing.buildingName || 'Chưa cập nhật'}
                              </Typography>
                            </Stack>

                            {/* Status */}
                            <StatusBadge status={listing.status} sx={{ mb: 1, alignSelf: 'flex-start' }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                              {statusLabel[listing.status]}
                            </StatusBadge>

                            {/* Specs */}
                            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <RulerIcon sx={{ fontSize: 14, color: T.muted }} />
                                <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>{listing.area}m²</Typography>
                              </Stack>
                              {listing.maxPeople && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <GroupIcon sx={{ fontSize: 14, color: T.muted }} />
                                  <Typography sx={{ fontSize: '0.857rem', color: T.muted }}>{listing.maxPeople} người</Typography>
                                </Stack>
                              )}
                            </Stack>

                            {/* Amenities */}
                            {listing.amenities.length > 0 && (
                              <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: 'wrap', gap: '4px !important' }}>
                                {listing.amenities.slice(0, 4).map(a => <AmenityTag key={a} amenity={a} />)}
                              </Stack>
                            )}

                            {/* Price + CTA */}
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'row', sm: 'row' },
                              alignItems: { xs: 'center', sm: 'flex-end' }, 
                              justifyContent: 'space-between', 
                              mt: 'auto',
                              gap: 1,
                            }}>
                              <Box>
                                <Typography sx={{ 
                                  fontWeight: 800, 
                                  fontSize: { xs: '1rem', sm: '1.143rem' }, 
                                  color: T.text 
                                }}>
                                  {fmt(listing.price)}đ
                                </Typography>
                                <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>mỗi tháng</Typography>
                              </Box>
                              <Button
                                size="small" 
                                variant="contained" 
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 14, display: { xs: 'none', sm: 'block' } }} />}
                                onClick={e => { e.stopPropagation(); navigate(`/room/${listing.id}`) }}
                                aria-label={`Xem chi tiết ${listing.title}`}
                                sx={{
                                  backgroundColor: T.blue, 
                                  borderRadius: '4px', 
                                  fontWeight: 700,
                                  fontSize: { xs: '0.786rem', sm: '0.857rem' }, 
                                  px: { xs: 1.5, sm: 2 }, 
                                  py: { xs: 0.5, sm: 0.75 },
                                  flexShrink: 0,
                                  transition: 'all 120ms ease',
                                  '&:hover': { backgroundColor: T.blueDk },
                                  '&:active': { transform: 'translateY(1px)' },
                                  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                                }}
                              >
                                Xem phòng
                              </Button>
                            </Box>
                          </Box>
                        </ListingCard>
                      ))
                }
              </Stack>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages} page={page}
                    onChange={(_, v) => { setPage(v); window.scrollTo(0, 0) }}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '4px', fontSize: '0.857rem',
                        '&.Mui-selected': { backgroundColor: T.blue, color: T.white, fontWeight: 700 },
                        '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        initialFilters={{
          district: selectedDistrict || district,
          minPrice: maxPrice ? 0 : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          minArea: minArea ? parseFloat(minArea) : null,
          maxArea: maxArea ? parseFloat(maxArea) : null,
          roomTypes: roomTypeParam ? [roomTypeParam] : [],
          amenities: amenity ? [amenity] : [],
          pois: poiId ? [poiId] : [],
        }}
        onApply={(filters) => {
          // Build query params from filters
          const params = new URLSearchParams()
          
          // Only add params if filter is enabled and has value
          if (filters.district) {
            params.set('district', filters.district)
          }
          
          if (filters.maxPrice) {
            params.set('maxPrice', filters.maxPrice)
          }
          
          if (filters.minArea) {
            params.set('minArea', filters.minArea)
          }
          
          if (filters.maxArea) {
            params.set('maxArea', filters.maxArea)
          }
          
          if (filters.roomTypes?.length > 0) {
            params.set('roomType', filters.roomTypes[0])
          }
          
          if (filters.amenities?.length > 0) {
            params.set('amenity', filters.amenities[0])
          }
          
          if (filters.pois?.length > 0) {
            params.set('poi', filters.pois[0])
          }
          
          // Update URL with new params
          navigate(`/listings?${params.toString()}`, { replace: true })
          setFilterOpen(false)
        }}
      />

      {/* Snackbar for favorite actions */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '0.929rem', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
