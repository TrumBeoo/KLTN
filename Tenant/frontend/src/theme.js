import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2',
      dark: '#2E5C8A',
      light: '#7AB8F5',
      subtle: '#E8F4FD',
    },
    secondary: {
      main: '#222222',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      subtle: '#f7f7f7',
    },
    text: {
      primary: '#222222',
      secondary: '#6a6a6a',
      disabled: 'rgba(0,0,0,0.24)',
    },
    grey: {
      50: '#f7f7f7',
      100: '#f2f2f2',
      200: '#e8e8e8',
      300: '#c1c1c1',
      400: '#929292',
      500: '#6a6a6a',
      600: '#3f3f3f',
      700: '#222222',
      800: '#1a1a1a',
      900: '#111111',
    },
    success: {
      main: '#5CB85C',
      light: '#e8f5e9',
    },
    warning: {
      main: '#F0AD4E',
      light: '#fff3e0',
    },
    error: {
      main: '#c13515',
      light: '#fce8e6',
    },
    info: {
      main: '#5BC0DE',
      light: '#e8f0fe',
    },
    divider: '#e8e8e8',
  },
  typography: {
    fontFamily: '"Circular", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.44px',
      color: '#222222',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.43,
      color: '#222222',
    },
    h3: {
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.18,
      letterSpacing: '-0.44px',
      color: '#222222',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.18px',
      color: '#222222',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#222222',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#222222',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#222222',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      color: '#6a6a6a',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.33,
      color: '#6a6a6a',
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'none',
      lineHeight: 1.25,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.25,
      color: '#222222',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.29,
      color: '#222222',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',
    'rgba(0,0,0,0.08) 0px 4px 12px',
    'rgba(0,0,0,0.12) 0px 6px 20px',
    'rgba(0,0,0,0.15) 0px 8px 28px',
    'rgba(0,0,0,0.20) 0px 12px 40px',
    'rgba(0,0,0,0.25) 0px 16px 56px',
    ...Array(18).fill('rgba(0,0,0,0.25) 0px 16px 56px'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          color: '#222222',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: '#f2f2f2',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '3px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
          fontSize: '1rem',
          lineHeight: 1.25,
          padding: '12px 24px',
          transition: 'all 150ms ease',
          '&:focus-visible': {
            outline: '2px solid #222222',
            outlineOffset: '2px',
          },
        },
        contained: {
          backgroundColor: '#4A90E2',
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2E5C8A',
            boxShadow: 'none',
            transform: 'none',
          },
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        containedSecondary: {
          backgroundColor: '#222222',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#3f3f3f',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#222222',
          color: '#222222',
          borderWidth: '1px',
          '&:hover': {
            borderColor: '#222222',
            backgroundColor: 'rgba(0,0,0,0.04)',
            boxShadow: 'none',
          },
        },
        text: {
          color: '#222222',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: 'none',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: 'none',
            transform: 'none',
          },
          transition: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#c1c1c1',
            },
            '&:hover fieldset': {
              borderColor: '#222222',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#222222',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#222222',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#222222',
          boxShadow: 'none',
          borderBottom: '1px solid #e8e8e8',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        outlined: {
          borderColor: '#c1c1c1',
          color: '#222222',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e8e8e8',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: 'rgba(0,0,0,0.20) 0px 12px 40px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#222222',
          '&:hover': {
            backgroundColor: '#f7f7f7',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#6a6a6a',
          '&.Mui-selected': {
            color: '#222222',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#222222',
          height: '2px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4A90E2',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f7f7f7',
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#4A90E2',
          color: '#ffffff',
          fontSize: '0.6875rem',
          fontWeight: 700,
          minWidth: '18px',
          height: '18px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#222222',
        },
        thumb: {
          backgroundColor: '#ffffff',
          border: '2px solid #222222',
          '&:hover': {
            boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
          },
        },
        track: {
          backgroundColor: '#222222',
        },
        rail: {
          backgroundColor: '#e8e8e8',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#c1c1c1',
          '&.Mui-checked': {
            color: '#222222',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#e8e8e8',
          borderRadius: '4px',
        },
        bar: {
          backgroundColor: '#4A90E2',
        },
      },
    },
  },
});

export default theme;