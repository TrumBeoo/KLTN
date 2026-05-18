import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  Button,
  TextField,
  Divider,
  useTheme
} from '@mui/material'

const SettingsPage = () => {
  const theme = useTheme()
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveListings: false,
    requireLandlordVerification: true,
    maxListingsPerLandlord: 50,
    maxUploadSize: 10
  })

  const [saveStatus, setSaveStatus] = useState('')

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 1000)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Configure platform settings and preferences
        </Typography>
      </Box>

      {/* System Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            System Settings
          </Typography>

          <Stack spacing={3}>
            {/* Maintenance Mode */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Maintenance Mode
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Put the platform in maintenance mode
                </Typography>
              </Box>
              <Switch
                checked={settings.maintenanceMode}
                onChange={() => handleToggleSetting('maintenanceMode')}
              />
            </Box>

            <Divider />

            {/* Email Notifications */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Email Notifications
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Send email notifications for important events
                </Typography>
              </Box>
              <Switch
                checked={settings.emailNotifications}
                onChange={() => handleToggleSetting('emailNotifications')}
              />
            </Box>

            <Divider />

            {/* SMS Notifications */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  SMS Notifications
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Send SMS notifications for critical alerts
                </Typography>
              </Box>
              <Switch
                checked={settings.smsNotifications}
                onChange={() => handleToggleSetting('smsNotifications')}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Listing Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Listing Settings
          </Typography>

          <Stack spacing={3}>
            {/* Auto-Approve Listings */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Auto-Approve Listings
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Automatically approve listings from verified landlords
                </Typography>
              </Box>
              <Switch
                checked={settings.autoApproveListings}
                onChange={() => handleToggleSetting('autoApproveListings')}
              />
            </Box>

            <Divider />

            {/* Require Landlord Verification */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Require Landlord Verification
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Verify landlords before they can post listings
                </Typography>
              </Box>
              <Switch
                checked={settings.requireLandlordVerification}
                onChange={() => handleToggleSetting('requireLandlordVerification')}
              />
            </Box>

            <Divider />

            {/* Max Listings Per Landlord */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Max Listings Per Landlord
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Maximum number of active listings per landlord
                  </Typography>
                </Box>
                <TextField
                  type="number"
                  value={settings.maxListingsPerLandlord}
                  onChange={(e) => handleInputChange('maxListingsPerLandlord', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 1000 }}
                  sx={{ width: 100 }}
                  size="small"
                />
              </Box>
            </Box>

            <Divider />

            {/* Max Upload Size */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Max Upload Size (MB)
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Maximum file upload size for images and documents
                  </Typography>
                </Box>
                <TextField
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                  sx={{ width: 100 }}
                  size="small"
                />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* POI Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            POI (Point of Interest) Management
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Manage schools, hospitals, supermarkets, and other points of interest for the AI matching system
          </Typography>
          <Button variant="contained" size="small">
            Manage POIs
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          sx={{
            backgroundColor: saveStatus === 'saved' ? theme.palette.success.main : undefined
          }}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  )
}

export default SettingsPage
