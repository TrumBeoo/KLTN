import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#5E6AD2',
      dark: '#4F5ABF',
      darker: '#3D4799',
      light: '#7170FF',
      lighter: '#A8A8FF',
      subtle: 'rgba(94,106,210,0.08)'
    },
    secondary: {
      main: '#8A8F98',
      dark: '#62666D',
      light: '#D0D6E0',
      subtle: 'rgba(255,255,255,0.04)'
    },
    success: {
      main: '#27A644',
      light: 'rgba(39,166,68,0.12)',
      dark: '#1E8236'
    },
    error: {
      main: '#E5484D',
      light: 'rgba(229,72,77,0.12)',
      lighter: 'rgba(229,72,77,0.06)'
    },
    warning: {
      main: '#F59E0B',
      light: 'rgba(245,158,11,0.12)'
    },
    info: {
      main: '#0EA5E9',
      light: 'rgba(14,165,233,0.12)'
    },
    background: {
      default: '#F7F8F8',
      paper: '#FFFFFF',
      subtle: '#F3F4F5'
    },
    text: {
      primary: '#0F1011',
      secondary: '#62666D',
      disabled: '#8A8F98'
    },
    divider: '#E8EAED'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFeatureSettings: '"cv01", "ss03"',
    h1: {
      fontWeight: 590,
      fontSize: '2rem',
      letterSpacing: '-0.704px',
      lineHeight: 1.15
    },
    h2: {
      fontWeight: 590,
      fontSize: '1.5rem',
      letterSpacing: '-0.288px',
      lineHeight: 1.3
    },
    h3: {
      fontWeight: 590,
      fontSize: '1.25rem',
      letterSpacing: '-0.24px',
      lineHeight: 1.3
    },
    h4: {
      fontWeight: 510,
      fontSize: '1.125rem',
      letterSpacing: '-0.165px',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 510,
      fontSize: '1rem',
      lineHeight: 1.5
    },
    h6: {
      fontWeight: 510,
      fontSize: '0.9375rem',
      lineHeight: 1.5
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      letterSpacing: '-0.165px'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 510,
      letterSpacing: '0.01em'
    },
    button: {
      fontWeight: 510,
      fontSize: '0.875rem',
      letterSpacing: '-0.01em'
    }
  },
  shape: {
    borderRadius: 6
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
    '0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)',
    '0 25px 50px rgba(0,0,0,0.1)',
    ...Array(18).fill('0 25px 50px rgba(0,0,0,0.1)')
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFeatureSettings: '"cv01", "ss03"'
        },
        body: {
          backgroundColor: '#F7F8F8'
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px'
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '3px'
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.25)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 510,
          borderRadius: '6px',
          fontSize: '0.875rem',
          letterSpacing: '-0.01em',
          transition: 'all 0.15s ease',
          '&:active': {
            transform: 'scale(0.98)'
          }
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            filter: 'brightness(1.08)'
          }
        },
        outlined: {
          borderColor: '#D8DAE0',
          '&:hover': {
            borderColor: '#5E6AD2',
            backgroundColor: 'rgba(94,106,210,0.04)'
          }
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.8125rem'
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.9375rem'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #E8EAED',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: '#FFFFFF',
            transition: 'box-shadow 0.15s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5E6AD2'
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(94,106,210,0.12)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5E6AD2',
              borderWidth: '1px'
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D8DAE0'
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontSize: '0.875rem'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F7F8F8',
          fontWeight: 510,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#8A8F98',
          borderBottom: '1px solid #E8EAED',
          padding: '10px 16px'
        },
        body: {
          fontSize: '0.875rem',
          color: '#0F1011',
          borderBottom: '1px solid #F0F1F3',
          padding: '12px 16px'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0
          },
          '&.MuiTableRow-hover:hover': {
            backgroundColor: '#F7F8F8',
            transition: 'background-color 0.1s ease'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 510,
          fontSize: '0.75rem',
          height: '22px'
        },
        sizeSmall: {
          height: '20px',
          fontSize: '0.6875rem'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #E8EAED',
          boxShadow: 'none'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          border: '1px solid #E8EAED',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E8EAED'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          transition: 'all 0.15s ease',
          padding: '7px 10px'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.05)'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E8EAED',
          minHeight: 44
        },
        indicator: {
          backgroundColor: '#5E6AD2',
          height: '2px'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 510,
          fontSize: '0.875rem',
          minHeight: 44,
          padding: '8px 16px',
          letterSpacing: '-0.01em',
          color: '#8A8F98',
          '&.Mui-selected': {
            color: '#0F1011',
            fontWeight: 590
          }
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.625rem',
          fontWeight: 590,
          minWidth: '16px',
          height: '16px',
          padding: '0 4px'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontSize: '0.875rem'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
})

export default theme