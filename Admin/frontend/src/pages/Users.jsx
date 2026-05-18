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
  Avatar,
  Button,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  Visibility as EyeIcon
} from '@mui/icons-material'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

const UsersPage = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filterRole, filterStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterRole !== 'all') params.append('role', filterRole)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`${API_URL}/users?${params}`)
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/suspend`, { method: 'POST' })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error suspending user:', error)
    }
  }

  const handleActivate = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/activate`, { method: 'POST' })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error activating user:', error)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setOpenDialog(true)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Landlord':
        return theme.palette.info
      case 'Tenant':
        return theme.palette.success
      case 'Admin':
        return theme.palette.warning
      default:
        return theme.palette.secondary
    }
  }

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error'
  }

  const filteredUsers = users.filter((user) =>
    user.Username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Users Management
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Manage platform users, roles, and permissions
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: '1.2rem', color: theme.palette.text.secondary }} />
              }}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
              <MenuItem value="Landlord">Landlord</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Block">Blocked</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
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
                  </TableRow>
                ))
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.AccountID} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: theme.palette.primary.light }}>
                          {user.Username?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.Username || 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {user.AccountID}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.Role}
                        size="small"
                        sx={{
                          backgroundColor: getRoleColor(user.Role).light,
                          color: getRoleColor(user.Role).main,
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.Status}
                        size="small"
                        color={getStatusColor(user.Status)}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(user.CreatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewUser(user)}>
                            <EyeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                          </IconButton>
                        </Tooltip>
                        {user.Status === 'Active' ? (
                          <Tooltip title="Suspend">
                            <IconButton size="small" onClick={() => handleSuspend(user.AccountID)}>
                              <BlockIcon sx={{ fontSize: '1rem', color: theme.palette.error.main }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate">
                            <IconButton size="small" onClick={() => handleActivate(user.AccountID)}>
                              <CheckIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: theme.palette.primary.light,
                      fontSize: '2rem'
                    }}
                  >
                    {selectedUser.Username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Username</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedUser.Username}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Account ID</Typography>
                  <Typography variant="body2">{selectedUser.AccountID}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Role</Typography>
                  <Chip
                    label={selectedUser.Role}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(selectedUser.Role).light,
                      color: getRoleColor(selectedUser.Role).main,
                      mt: 1
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Status</Typography>
                  <Chip
                    label={selectedUser.Status}
                    size="small"
                    color={getStatusColor(selectedUser.Status)}
                    sx={{ mt: 1 }}
                  />
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

export default UsersPage
