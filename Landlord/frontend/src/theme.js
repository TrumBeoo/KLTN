import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0EA5E9',
      dark: '#0284C7',
      darker: '#0369A1',
      light: '#38BDF8',
      lighter: '#7DD3FC',
      subtle: '#E0F2FE'
    },
    secondary: {
      main: '#F59E0B',
      dark: '#D97706',
      light: '#FCD34D',
      subtle: '#FEF3C7'
    },
    success: {
      main: '#22C55E',
      light: '#DCFCE7'
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2'
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7'
    },
    info: {
      main: '#0EA5E9',
      light: '#DBEAFE'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8'
    },
    divider: '#E2E8F0'
  },
  typography: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    h1: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 800,
      fontSize: '2.25rem'
    },
    h2: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 700,
      fontSize: '1.875rem'
    },
    h3: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem'
    },
    h4: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 700,
      fontSize: '1.25rem'
    },
    h5: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    h6: {
      fontFamily: '"Manrope", sans-serif',
      fontWeight: 600,
      fontSize: '1rem'
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.04)',
    '0 1px 3px rgba(0, 0, 0, 0.06)',
    '0 4px 6px rgba(0, 0, 0, 0.07)',
    '0 10px 15px rgba(0, 0, 0, 0.08)',
    '0 20px 25px rgba(0, 0, 0, 0.1)',
    ...Array(19).fill('0 20px 25px rgba(0, 0, 0, 0.1)')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease'
        },
        contained: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.08)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F1F5F9',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }
    }
  }
})

export default theme
