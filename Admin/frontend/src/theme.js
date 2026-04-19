import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#533afd',
      dark: '#4434d4',
      darker: '#2e2b8c',
      light: '#665efd',
      lighter: '#b9b9f9',
      subtle: 'rgba(83,58,253,0.08)'
    },
    secondary: {
      main: '#64748d',
      dark: '#273951',
      light: '#8A8F98',
      subtle: 'rgba(100,116,141,0.08)'
    },
    success: {
      main: '#15be53',
      text: '#108c3d',
      light: 'rgba(21,190,83,0.2)',
      border: 'rgba(21,190,83,0.4)'
    },
    error: {
      main: '#ea2261',
      light: 'rgba(234,34,97,0.2)',
      border: 'rgba(234,34,97,0.4)'
    },
    warning: {
      main: '#9b6829',
      light: 'rgba(155,104,41,0.2)',
      border: 'rgba(155,104,41,0.4)'
    },
    info: {
      main: '#2874ad',
      light: 'rgba(40,116,173,0.2)',
      border: 'rgba(43,145,223,0.2)'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      subtle: '#f6f9fc'
    },
    text: {
      primary: '#061b31',
      secondary: '#64748d',
      disabled: '#8A8F98',
      label: '#273951'
    },
    divider: '#e5edf5'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFeatureSettings: '"ss01"',
    h1: {
      fontWeight: 300,
      fontSize: '3rem',
      letterSpacing: '-1.4px',
      lineHeight: 1.03,
      color: '#061b31'
    },
    h2: {
      fontWeight: 300,
      fontSize: '2rem',
      letterSpacing: '-0.64px',
      lineHeight: 1.10,
      color: '#061b31'
    },
    h3: {
      fontWeight: 300,
      fontSize: '1.63rem',
      letterSpacing: '-0.26px',
      lineHeight: 1.12,
      color: '#061b31'
    },
    h4: {
      fontWeight: 300,
      fontSize: '1.38rem',
      letterSpacing: '-0.22px',
      lineHeight: 1.10,
      color: '#061b31'
    },
    h5: {
      fontWeight: 300,
      fontSize: '1.13rem',
      lineHeight: 1.40,
      color: '#061b31'
    },
    h6: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.40,
      color: '#061b31'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 300,
      lineHeight: 1.40,
      color: '#061b31'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 300,
      lineHeight: 1.40,
      color: '#64748d'
    },
    caption: {
      fontSize: '0.8125rem',
      fontWeight: 300,
      lineHeight: 1.33,
      color: '#64748d'
    },
    button: {
      fontWeight: 400,
      fontSize: '1rem',
      letterSpacing: 'normal',
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 4
  },
  spacing: 8,
  shadows: [
    'none',
    'rgba(50,50,93,0.25) 0px 2px 5px -1px, rgba(0,0,0,0.1) 0px 1px 3px -1px',
    'rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.1) 0px 3px 7px -3px',
    'rgba(50,50,93,0.25) 0px 13px 27px -5px, rgba(0,0,0,0.1) 0px 8px 16px -8px',
    'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px',
    'rgba(23,23,23,0.08) 0px 15px 35px 0px',
    'rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px',
    ...Array(18).fill('rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px')
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFeatureSettings: '"ss01"'
        },
        body: {
          backgroundColor: '#ffffff',
          fontFeatureSettings: '"ss01"'
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(100,116,141,0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(100,116,141,0.3)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
          borderRadius: '4px',
          fontSize: '1rem',
          padding: '8px 16px',
          transition: 'all 0.15s ease',
          fontFeatureSettings: '"ss01"'
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        containedPrimary: {
          backgroundColor: '#533afd',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#4434d4'
          }
        },
        outlined: {
          borderColor: '#b9b9f9',
          color: '#533afd',
          '&:hover': {
            backgroundColor: 'rgba(83,58,253,0.05)',
            borderColor: '#533afd'
          }
        },
        text: {
          color: '#533afd',
          '&:hover': {
            backgroundColor: 'rgba(83,58,253,0.05)'
          }
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.875rem'
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '1rem'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          border: '1px solid #e5edf5',
          boxShadow: 'rgba(50,50,93,0.25) 0px 2px 5px -1px, rgba(0,0,0,0.1) 0px 1px 3px -1px',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 'rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.1) 0px 3px 7px -3px'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 300,
            backgroundColor: '#ffffff',
            fontFeatureSettings: '"ss01"',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#533afd'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#533afd',
              borderWidth: '1px'
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e5edf5'
          },
          '& .MuiInputLabel-root': {
            color: '#273951',
            fontSize: '0.875rem',
            fontWeight: 400
          },
          '& .MuiInputBase-input': {
            fontFeatureSettings: '"ss01"'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f6f9fc',
          fontWeight: 400,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#64748d',
          borderBottom: '1px solid #e5edf5',
          padding: '12px 16px',
          lineHeight: 1.5,
          fontFeatureSettings: '"ss01"'
        },
        body: {
          fontSize: '0.875rem',
          fontWeight: 300,
          color: '#061b31',
          borderBottom: '1px solid #e5edf5',
          padding: '14px 16px',
          lineHeight: 1.5,
          fontFeatureSettings: '"ss01"'
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
            backgroundColor: '#f6f9fc',
            transition: 'background-color 0.1s ease'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 400,
          fontSize: '0.75rem',
          height: '22px',
          fontFeatureSettings: '"ss01"'
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
          borderRadius: '6px',
          border: '1px solid #e5edf5',
          boxShadow: 'rgba(50,50,93,0.25) 0px 2px 5px -1px, rgba(0,0,0,0.1) 0px 1px 3px -1px'
        },
        elevation0: {
          boxShadow: 'none'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e5edf5'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        },
        sizeSmall: {
          padding: '4px'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#061b31',
          fontSize: '0.75rem',
          fontWeight: 400,
          padding: '6px 10px',
          borderRadius: '4px',
          fontFeatureSettings: '"ss01"'
        },
        arrow: {
          color: '#061b31'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 300,
          fontFeatureSettings: '"ss01"'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          backgroundColor: '#e5edf5',
          height: '6px'
        },
        bar: {
          borderRadius: '4px',
          backgroundColor: '#533afd'
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(100,116,141,0.11)',
          borderRadius: '4px'
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#533afd'
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.625rem',
          fontWeight: 400,
          minWidth: '16px',
          height: '16px',
          padding: '0 4px',
          fontFeatureSettings: '"ss01"'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#533afd',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 400,
          fontFeatureSettings: '"ss01"'
        }
      }
    }
  }
})

export default theme
