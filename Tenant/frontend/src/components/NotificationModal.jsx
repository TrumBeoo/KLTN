import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import { CheckCircle as SuccessIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material'

export default function NotificationModal({ open, onClose, type = 'info', title, message }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon sx={{ color: 'success.main', fontSize: '3rem' }} />
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: '3rem' }} />
      default:
        return <InfoIcon sx={{ color: 'info.main', fontSize: '3rem' }} />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'success.main'
      case 'error':
        return 'error.main'
      default:
        return 'info.main'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 2 }}>
          {getIcon()}
        </Box>
        {title && (
          <DialogTitle sx={{ p: 0, mb: 1, color: getColor(), fontWeight: 600 }}>
            {title}
          </DialogTitle>
        )}
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="contained" onClick={onClose} sx={{ minWidth: 100 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}