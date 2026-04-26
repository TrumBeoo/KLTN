/**
 * ListingPage — Booking.com style redesign
 *
 * Layout: left column (cards) + right sticky (map + sidebar)
 * Card: horizontal image + content — Booking.com hotel-list pattern
 * Tokens: same as theme.js
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTop } from '../hooks/useScrollToTop'
import SecondaryMenu from '../components/SecondaryMenu'
import RoomMap from '../components/RoomMap'
import {
  Box, Container, Grid, Button, Typography, Stack, IconButton,
  Skeleton, Chip, Tooltip, Pagination,
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
  Sort as SortIcon,
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
  shadow1: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
  motion:  '120ms',
}

// ─── Styled ──────────────────────────────────────────────────────────────

/** Horizontal listing card — Booking.com hotel-card style */
const ListingCard = styled(Box)({
  backgroundColor: T.white,
  borderRadius: '8px',
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow1,
  overflow: 'hidden',
  cursor: 'pointer',
  display: 'flex',
  transition: `box-shadow ${T.motion} ease`,
  '&:hover': { boxShadow: 'rgba(26,26,26,0.24) 0px 4px 16px' },
  '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
})

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
    <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, display: 'flex', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" width={220} height={160} animation="wave" sx={{ flexShrink: 0 }} />
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

  const [favorites, setFavorites] = useState({})
  const [listings, setListings]   = useState([])
  const [mapRooms, setMapRooms]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [page, setPage]           = useState(1)
  const PER_PAGE = 8

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/rooms`)
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
            image: imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_URL.replace('/api', '')}${imgUrl}`) : null,
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
        setMapRooms(formatted.filter(r => r.latitude && r.longitude).map(r => ({
          id: r.id, title: r.title, price: r.price, latitude: r.latitude, longitude: r.longitude,
        })))
      } else setError('Không thể tải danh sách phòng')
    } catch { setError('Lỗi kết nối server') }
    finally { setLoading(false) }
  }

  const parseAmenities = d => {
    if (!d) return []
    try { return typeof d === 'string' ? JSON.parse(d) : Array.isArray(d) ? d : [] }
    catch { return [] }
  }

  const toggleFav = (id, e) => { e?.stopPropagation(); setFavorites(prev => ({ ...prev, [id]: !prev[id] })) }
  const fmt = p => Math.floor(parseFloat(p)).toLocaleString('vi-VN')

  const paginated = listings.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(listings.length / PER_PAGE)
  const latestListings = [...listings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)

  return (
    <Box sx={{ backgroundColor: T.bg, minHeight: '100vh' }}>
      <SecondaryMenu onCategoryChange={() => {}} onDistrictChange={() => {}} />

      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>
              <Box component="span" sx={{ color: T.blue }}>{listings.length}</Box>
              &nbsp;phòng tại Hà Nội
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small" startIcon={<SortIcon sx={{ fontSize: 16 }} />}
                sx={{ color: T.text, border: `1px solid ${T.border}`, borderRadius: '4px', fontSize: '0.857rem', '&:hover': { borderColor: T.text } }}
              >
                Sắp xếp
              </Button>
              <Button
                size="small" startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
                sx={{ color: T.blue, border: `1px solid ${T.blue}`, borderRadius: '4px', fontSize: '0.857rem', fontWeight: 600, backgroundColor: T.blueLt, '&:hover': { backgroundColor: '#d0e8ff' } }}
              >
                Bộ lọc
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
            {/* ─── Left: listings ─────────────────────────────────────────── */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={2}>
                {loading
                  ? [1,2,3,4,5].map(i => <SkeletonCard key={i} />)
                  : paginated.length === 0
                    ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ color: T.muted }}>Không có phòng nào</Typography>
                      </Box>
                    )
                    : paginated.map(listing => (
                        <ListingCard
                          key={listing.id}
                          onClick={() => navigate(`/room/${listing.id}`)}
                          tabIndex={0} role="article"
                          aria-label={`${listing.title}, ${fmt(listing.price)}đ/tháng, ${statusLabel[listing.status]}`}
                          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/room/${listing.id}`)}
                        >
                          {/* Image */}
                          <Box sx={{ width: 260, height: 250, position: 'relative', flexShrink: 0, backgroundColor: T.bg }}>
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
                              aria-label={favorites[listing.id] ? 'Bỏ lưu' : 'Lưu phòng'}
                              sx={{
                                position: 'absolute', top: 8, right: 8,
                                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                                color: favorites[listing.id] ? T.blue : '#595959', p: '4px',
                                '&:hover': { backgroundColor: T.white, color: T.blue },
                                '&:focus-visible': { outline: `2px solid ${T.blue}`, outlineOffset: '2px' },
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
                          <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            {/* Title row */}
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                              <Typography sx={{
                                fontWeight: 700, fontSize: '0.957rem', color: T.blue,
                                flex: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                '&:hover': { textDecoration: 'underline' },
                              }}>
                                {listing.title}
                              </Typography>
                              {/* Score */}
                              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                                <Box sx={{ textAlign: 'right' }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 'auto' }}>
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.143rem', color: T.text }}>
                                  {fmt(listing.price)}đ
                                </Typography>
                                <Typography sx={{ fontSize: '0.786rem', color: T.muted }}>mỗi tháng</Typography>
                              </Box>
                              <Button
                                size="small" variant="contained" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                                onClick={e => { e.stopPropagation(); navigate(`/room/${listing.id}`) }}
                                aria-label={`Xem chi tiết ${listing.title}`}
                                sx={{
                                  backgroundColor: T.blue, borderRadius: '4px', fontWeight: 700,
                                  fontSize: '0.857rem', px: 2, py: 0.75,
                                  '&:hover': { backgroundColor: T.blueDk },
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

            {/* ─── Right sidebar ───────────────────────────────────────────── */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Map */}
                <Box sx={{
                  borderRadius: '8px', overflow: 'hidden', height: 320,
                  border: `1px solid ${T.border}`, boxShadow: T.shadow1,
                }}>
                  {mapRooms.length > 0 ? (
                    <RoomMap rooms={mapRooms} onMarkerClick={r => navigate(`/room/${r.id}`)} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: T.bg }}>
                      <Typography sx={{ color: T.muted, fontSize: '0.857rem' }}>Không có tọa độ</Typography>
                    </Box>
                  )}
                </Box>

                {/* Latest listings sidebar */}
                <Box sx={{ backgroundColor: T.white, borderRadius: '8px', border: `1px solid ${T.border}`, boxShadow: T.shadow1, p: 2 }}>
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
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}