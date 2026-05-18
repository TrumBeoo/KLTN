import React, { useState } from 'react'
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
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  useTheme
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as EyeIcon,
  Search as SearchIcon
} from '@mui/icons-material'

const ReportsPage = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const reports = [
    {
      id: 'RPT001',
      type: 'fake_listing',
      reporter: 'Nguyễn Văn X',
      reported: 'Nguyễn Văn A',
      subject: 'Fake property listing - misleading images',
      description: 'The listing shows a luxury apartment but the actual property is much smaller',
      status: 'pending',
      priority: 'high',
      submittedAt: '2024-04-12',
      relatedItem: 'LST001'
    },
    {
      id: 'RPT002',
      type: 'spam',
      reporter: 'Trần Thị Y',
      reported: 'Trần Thị B',
      subject: 'Spam messages in chat',
      description: 'User sending repetitive messages with suspicious links',
      status: 'investigating',
      priority: 'medium',
      submittedAt: '2024-04-11',
      relatedItem: 'USR002'
    },
    {
      id: 'RPT003',
      type: 'scam',
      reporter: 'Phạm Văn Z',
      reported: 'Phạm Văn C',
      subject: 'Scam accusation - rental fraud',
      description: 'Collected deposit but did not return keys',
      status: 'resolved',
      priority: 'high',
      submittedAt: '2024-04-10',
      relatedItem: 'USR003'
    },
    {
      id: 'RPT004',
      type: 'inappropriate_content',
      reporter: 'Hoàng Thị W',
      reported: 'Hoàng Văn D',
      subject: 'Inappropriate language in listing description',
      description: 'Contains offensive language and discriminatory remarks',
      status: 'pending',
      priority: 'low',
      submittedAt: '2024-04-09',
      relatedItem: 'LST004'
    }
  ]

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedReport(null)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'fake_listing':
        return { bg: theme.palette.warning.light, color: theme.palette.warning.main, label: 'Fake Listing' }
      case 'spam':
        return { bg: theme.palette.info.light, color: theme.palette.info.main, label: 'Spam' }
      case 'scam':
        return { bg: theme.palette.error.light, color: theme.palette.error.main, label: 'Scam' }
      case 'inappropriate_content':
        return { bg: theme.palette.warning.light, color: theme.palette.warning.main, label: 'Inappropriate' }
      default:
        return { bg: theme.palette.secondary.light, color: theme.palette.secondary.main, label: type }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'investigating':
        return 'info'
      case 'resolved':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: theme.palette.error.light, color: theme.palette.error.main }
      case 'medium':
        return { bg: theme.palette.warning.light, color: theme.palette.warning.main }
      case 'low':
        return { bg: theme.palette.info.light, color: theme.palette.info.main }
      default:
        return { bg: theme.palette.secondary.light, color: theme.palette.secondary.main }
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Reports Management
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Review and manage user reports and violations
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: '1.2rem', color: theme.palette.text.secondary }} />
              }}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="fake_listing">Fake Listing</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="scam">Scam</MenuItem>
              <MenuItem value="inappropriate_content">Inappropriate</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                <TableCell sx={{ fontWeight: 600 }}>Report</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reported User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Priority
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => {
                const typeConfig = getTypeColor(report.type)
                const priorityConfig = getPriorityColor(report.priority)
                return (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {report.subject}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {report.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{report.reported}</TableCell>
                    <TableCell>
                      <Chip
                        label={typeConfig.label}
                        size="small"
                        sx={{
                          backgroundColor: typeConfig.bg,
                          color: typeConfig.color,
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status)}
                        variant="filled"
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          backgroundColor: priorityConfig.bg,
                          color: priorityConfig.color,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {report.priority}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{report.submittedAt}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewReport(report)}>
                            <EyeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                          </IconButton>
                        </Tooltip>
                        {report.status === 'pending' && (
                          <>
                            <Tooltip title="Resolve">
                              <IconButton
                                size="small"
                                sx={{
                                  color: theme.palette.success.main,
                                  '&:hover': { backgroundColor: theme.palette.success.light }
                                }}
                              >
                                <CheckIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dismiss">
                              <IconButton
                                size="small"
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Subject
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedReport.subject}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedReport.description}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Reporter
                    </Typography>
                    <Typography variant="body2">{selectedReport.reporter}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Reported User
                    </Typography>
                    <Typography variant="body2">{selectedReport.reported}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReportsPage
