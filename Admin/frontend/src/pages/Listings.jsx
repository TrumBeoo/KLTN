import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as EyeIcon,
  Search as SearchIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

const ListingsPage = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDistrict, setFilterDistrict] = useState('all')
  const [selectedListing, setSelectedListing] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const districts = ['all', 'Ba Đình', 'Thanh Xuân', 'Cầu Giấy', 'Hoàn Kiếm', 'Tây Hồ', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai']

  useEffect(() => {
    fetchListings()
  }, [filterStatus, filterDistrict])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterDistrict !== 'all') params.append('district', filterDistrict)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`${API_URL}/listings?${params}`)
      const data = await res.json()
      if (data.success) setListings(data.data)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/listings/${id}/approve`, { method: 'POST' })
      if (res.ok) fetchListings()
    } catch (error) {
      console.error('Error approving listing:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/listings/${id}/reject`, { method: 'POST' })
      if (res.ok) fetchListings()
    } catch (error) {
      console.error('Error rejecting listing:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`${API_URL}/listings/${id}`, { method: 'DELETE' })
      if (res.ok) fetchListings()
    } catch (error) {
      console.error('Error deleting listing:', error)
    }
  }

  const handleViewListing = (listing) => {
    setSelectedListing(listing)
    setOpenDialog(true)
  }

  const getStatusColor = (status, draftStatus) => {
    if (draftStatus === 'draft') {
      return { bg: theme.palette.warning.light, color: theme.palette.warning.main, label: 'Pending' }
    }
    switch (status) {
      case 'available':
        return { bg: theme.palette.success.light, color: theme.palette.success.main, label: 'Available' }
      case 'rented':
        return { bg: theme.palette.info.light, color: theme.palette.info.main, label: 'Rented' }
      case 'maintenance':
        return { bg: theme.palette.error.light, color: theme.palette.error.main, label: 'Maintenance' }
      default:
        return { bg: theme.palette.secondary.light, color: theme.palette.secondary.main, label: status }
    }
  }

  const filteredListings = listings.filter((listing) =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.landlord?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Listings Management
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Approve, reject, or manage property listings
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchListings()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: '1.2rem', color: theme.palette.text.secondary }} />
              }}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="rented">Rented</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
            <TextField
              select
              label="District"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {districts.map((district) => (
                <MenuItem key={district} value={district}>
                  {district === 'all' ? 'All Districts' : district}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                <TableCell sx={{ fontWeight: 600 }}>Listing</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Landlord</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredListings.map((listing) => {
                  const statusConfig = getStatusColor(listing.status, listing.DraftStatus)
                  return (
                    <TableRow key={listing.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {listing.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {listing.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{listing.landlord}</TableCell>
                      <TableCell>{listing.district || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {listing.price?.toLocaleString()}đ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewListing(listing)}>
                              <EyeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                            </IconButton>
                          </Tooltip>
                          {listing.DraftStatus === 'draft' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  onClick={() => handleApprove(listing.id)}
                                  sx={{
                                    color: theme.palette.success.main,
                                    '&:hover': { backgroundColor: theme.palette.success.light }
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReject(listing.id)}
                                  sx={{
                                    color: theme.palette.error.main,
                                    '&:hover': { backgroundColor: theme.palette.error.light }
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(listing.id)}>
                              <DeleteIcon sx={{ fontSize: '1rem', color: theme.palette.error.main }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Listing Details</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Title</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedListing.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Landlord</Typography>
                  <Typography variant="body2">{selectedListing.landlord}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Location</Typography>
                  <Typography variant="body2">{selectedListing.district}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedListing.price?.toLocaleString()}đ
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ListingsPage
