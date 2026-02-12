import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      darker: '#1E40AF',
      light: '#3B82F6',
      lighter: '#60A5FA',
      subtle: '#DBEAFE',
    },
    accent: {
      main: '#22C55E',
      dark: '#16A34A',
    },
    favorite: {
      main: '#F43F5E',
      dark: '#E11D48',
    },
    status: {
      available: '#22C55E',
      booking: '#2563EB',
      rented: '#EF4444',
      maintenance: '#F59E0B',
      expiring: '#F97316',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 1px 3px rgba(0, 0, 0, 0.06)',
    '0 2px 8px rgba(0, 0, 0, 0.08)',
    '0 4px 16px rgba(0, 0, 0, 0.1)',
    '0 8px 32px rgba(0, 0, 0, 0.12)',
    '0 20px 50px rgba(0, 0, 0, 0.15)',
    ...Array(24).fill('0 20px 50px rgba(0, 0, 0, 0.15)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          transition: 'all 200ms ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default theme;
