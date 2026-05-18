import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a0e27',
      light: '#1f2937',
      lighter: '#374151',
      subtle: 'rgba(10, 14, 39, 0.05)'
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      lighter: '#d1d5db'
    },
    success: {
      main: '#10b981',
      light: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    warning: {
      main: '#f59e0b',
      light: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    error: {
      main: '#ef4444',
      light: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    info: {
      main: '#3b82f6',
      light: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)'
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
      subtle: '#f3f4f6'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af'
    },
    divider: '#e5e7eb'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.2 },
    h2: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
    h5: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.4 },
    h6: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, color: '#6b7280' },
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.03em' },
    button: { fontWeight: 500, fontSize: '0.875rem', textTransform: 'none', letterSpacing: 'normal' }
  },
  shape: { borderRadius: 6 },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)')
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#fafbfc' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '6px',
          transition: 'all 0.15s ease',
          '&:hover': { transform: 'translateY(-1px)' }
        },
        containedPrimary: {
          backgroundColor: '#0a0e27',
          '&:hover': { backgroundColor: '#1f2937' }
        },
        outlined: {
          borderColor: '#d1d5db',
          '&:hover': { backgroundColor: '#f9fafb' }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0a0e27' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0a0e27', borderWidth: '1px' }
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f9fafb',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 16px'
        },
        body: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: '#1f2937',
          borderBottom: '1px solid #e5e7eb',
          padding: '14px 16px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb'
        }
      }
    }
  }
})

export default theme
