import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as EyeIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

const DashboardCard = ({ icon: Icon, label, value, trend, loading }) => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {value?.toLocaleString() || 0}
              </Typography>
            )}
            {trend && !loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: '1rem', color: theme.palette.error.main }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 600
                  }}
                >
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '8px',
              backgroundColor: theme.palette.primary.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Icon sx={{ fontSize: '1.5rem' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const AdminDashboard = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLandlords: 0,
    activeListings: 0,
    totalListings: 0
  })
  const [activities, setActivities] = useState([])
  const [pendingListings, setPendingListings] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, activitiesRes, listingsRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`),
        fetch(`${API_URL}/dashboard/activities`),
        fetch(`${API_URL}/dashboard/pending-listings`)
      ])

      const statsData = await statsRes.json()
      const activitiesData = await activitiesRes.json()
      const listingsData = await listingsRes.json()

      if (statsData.success) setStats(statsData.data)
      if (activitiesData.success) setActivities(activitiesData.data)
      if (listingsData.success) setPendingListings(listingsData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/listings/${id}/approve`, { method: 'POST' })
      if (res.ok) fetchDashboardData()
    } catch (error) {
      console.error('Error approving listing:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/listings/${id}/reject`, { method: 'POST' })
      if (res.ok) fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting listing:', error)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const statsCards = [
    { label: 'Total Users', value: stats.totalUsers, trend: 12, icon: PeopleIcon },
    { label: 'Total Landlords', value: stats.totalLandlords, trend: -2, icon: HomeIcon },
    { label: 'Active Listings', value: stats.activeListings, trend: 8, icon: HomeIcon },
    { label: 'Total Listings', value: stats.totalListings, trend: 5, icon: HomeIcon }
  ]

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Platform overview and key metrics
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <DashboardCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Activities
              </Typography>
              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '6px' }} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {activities.map((activity, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        p: 1.5,
                        backgroundColor: theme.palette.background.subtle,
                        borderRadius: '6px',
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.background.default,
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '6px',
                          backgroundColor: theme.palette.primary.light,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {activity.type === 'landlord_signup' ? <PeopleIcon /> : <HomeIcon />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {formatTimestamp(activity.timestamp)}
                          </Typography>
                          <Chip
                            label={activity.status}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              textTransform: 'capitalize',
                              backgroundColor: theme.palette.warning.light,
                              color: theme.palette.warning.main
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Pending Listings
                </Typography>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 500 }}>
                  View All
                </Button>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Listing</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Landlord</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingListings.slice(0, 5).map((listing) => (
                        <TableRow key={listing.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {listing.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                {listing.district}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{listing.landlord}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                title="Approve"
                                onClick={() => handleApprove(listing.id)}
                                sx={{
                                  color: theme.palette.success.main,
                                  '&:hover': { backgroundColor: theme.palette.success.light }
                                }}
                              >
                                <CheckIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Reject"
                                onClick={() => handleReject(listing.id)}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': { backgroundColor: theme.palette.error.light }
                                }}
                              >
                                <CloseIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                              <IconButton size="small" title="View">
                                <EyeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
