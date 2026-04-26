import { createTheme } from '@mui/material/styles';

/**
 * Rentify Design System — Booking.com style
 * Tokens from UI_Design.md & UI_Skill.md
 *
 * Color palette:
 *   color.text.primary    = #1a1a1a
 *   color.text.secondary  = #006ce4   (Booking blue)
 *   color.text.tertiary   = #595959
 *   color.surface.muted   = #ffffff
 *   color.surface.base    = #000000
 *
 * Font:
 *   BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
 *   base: 14px / 400 / 20px line-height
 *
 * Spacing: 2 4 5 8 11 12 16 32 px
 * Radius: xs=4 sm=8 md=50 lg=9999
 * Shadow: rgba(26,26,26,0.16) 0 2px 8px 0  |  rgb(170,170,170) 0 0 3px
 * Motion: 120ms
 */

const BLUE   = '#006ce4';   // color.text.secondary (primary action)
const DARK   = '#1a1a1a';   // color.text.primary
const MID    = '#595959';   // color.text.tertiary
const LIGHT  = '#f2f4f8';   // subtle surface
const WHITE  = '#ffffff';
const BORDER = '#d4d6d9';   // light border

const theme = createTheme({
  palette: {
    primary: {
      main:    BLUE,
      dark:    '#003f8a',
      light:   '#4a9cf0',
      subtle:  '#e8f2ff',
      contrastText: WHITE,
    },
    secondary: {
      main: DARK,
      contrastText: WHITE,
    },
    background: {
      default: '#f2f4f8',
      paper:   WHITE,
      subtle:  LIGHT,
    },
    text: {
      primary:   DARK,
      secondary: MID,
      disabled:  'rgba(0,0,0,0.32)',
    },
    grey: {
      50:  '#f9fafb',
      100: '#f2f4f8',
      200: '#e7eaf0',
      300: '#d4d6d9',
      400: '#b2b2b2',
      500: '#959595',
      600: '#6b6b6b',
      700: '#595959',
      800: '#333333',
      900: '#1a1a1a',
    },
    success: {
      main:  '#008234',
      light: '#e8f5ee',
    },
    warning: {
      main:  '#f5a623',
      light: '#fef6e8',
    },
    error: {
      main:  '#c8102e',
      light: '#fde8eb',
    },
    info: {
      main:  BLUE,
      light: '#e8f2ff',
    },
    divider: BORDER,
  },

  typography: {
    fontFamily: 'BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,

    // Scale from MD: xs=14 sm=16 md=20 lg=23 xl=24
    h1: { fontSize: '1.714rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.3px', color: DARK },
    h2: { fontSize: '1.429rem', fontWeight: 700, lineHeight: 1.25, color: DARK },
    h3: { fontSize: '1.143rem', fontWeight: 600, lineHeight: 1.3,  color: DARK },
    h4: { fontSize: '1rem',     fontWeight: 600, lineHeight: 1.35, color: DARK },
    h5: { fontSize: '0.929rem', fontWeight: 600, lineHeight: 1.4,  color: DARK },
    h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.43, color: DARK },

    body1: { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.5,  color: DARK },
    body2: { fontSize: '0.857rem', fontWeight: 400, lineHeight: 1.43, color: MID  },
    caption:   { fontSize: '0.786rem', fontWeight: 400, lineHeight: 1.33, color: MID },
    overline:  { fontSize: '0.714rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.08em', textTransform: 'uppercase' },
    subtitle1: { fontSize: '0.929rem', fontWeight: 500, lineHeight: 1.35, color: DARK },
    subtitle2: { fontSize: '0.857rem', fontWeight: 500, lineHeight: 1.43, color: MID  },
    button:    { fontSize: '0.857rem', fontWeight: 600, textTransform: 'none', lineHeight: 1.43 },
  },

  shape: { borderRadius: 4 },  // radius.xs = 4px

  // Motion: 120ms instant
  transitions: {
    easing: { sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', standard: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    duration: { shortest: 120, shorter: 150, short: 200, standard: 250, complex: 300 },
  },

  shadows: [
    'none',
    'rgba(26,26,26,0.16) 0px 2px 8px 0px',           // shadow.1
    'rgb(170,170,170) 0px 0px 3px 0px',               // shadow.2
    'rgba(26,26,26,0.16) 0px 4px 16px 0px',
    'rgba(26,26,26,0.16) 0px 8px 24px 0px',
    'rgba(26,26,26,0.20) 0px 12px 40px 0px',
    'rgba(26,26,26,0.24) 0px 16px 56px 0px',
    ...Array(18).fill('rgba(26,26,26,0.24) 0px 16px 56px 0px'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#f2f4f8', color: DARK },
        '*': { boxSizing: 'border-box' },
        '::-webkit-scrollbar': { width: '6px', height: '6px' },
        '::-webkit-scrollbar-track': { background: LIGHT },
        '::-webkit-scrollbar-thumb': { background: BORDER, borderRadius: '3px' },
      },
    },

    // ─── Buttons ────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.857rem',
          lineHeight: 1.43,
          borderRadius: '4px',               // radius.xs
          padding: '10px 16px',
          transition: `all 120ms cubic-bezier(0.4,0,0.2,1)`,
          '&:focus-visible': {
            outline: `2px solid ${BLUE}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          backgroundColor: BLUE,
          color: WHITE,
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#0057b8', boxShadow: 'none' },
          '&:active': { backgroundColor: '#003f8a', transform: 'scale(0.98)' },
        },
        containedSecondary: {
          backgroundColor: DARK,
          color: WHITE,
          '&:hover': { backgroundColor: '#333333' },
        },
        outlined: {
          borderColor: DARK,
          borderWidth: '2px',
          color: DARK,
          padding: '8px 16px',
          '&:hover': { borderWidth: '2px', backgroundColor: LIGHT, borderColor: DARK },
        },
        outlinedPrimary: {
          borderColor: BLUE,
          borderWidth: '2px',
          color: BLUE,
          '&:hover': { borderWidth: '2px', backgroundColor: '#e8f2ff' },
        },
        text: {
          color: DARK,
          '&:hover': { backgroundColor: LIGHT },
        },
        sizeLarge:  { padding: '12px 20px', fontSize: '1rem' },
        sizeSmall:  { padding: '6px 12px',  fontSize: '0.786rem' },
      },
    },

    // ─── TextField ──────────────────────────────────────────────────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            fontSize: '0.857rem',
            backgroundColor: WHITE,
            '& fieldset': { borderColor: BORDER, borderWidth: '1px' },
            '&:hover fieldset': { borderColor: '#8b8b8b' },
            '&.Mui-focused fieldset': { borderColor: BLUE, borderWidth: '2px' },
          },
          '& .MuiInputLabel-root': { fontSize: '0.857rem', color: MID },
          '& .MuiInputLabel-root.Mui-focused': { color: BLUE },
        },
      },
    },

    // ─── Card ───────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',              // radius.sm
          border: `1px solid ${BORDER}`,
          boxShadow: 'rgba(26,26,26,0.16) 0px 2px 8px 0px',
          backgroundColor: WHITE,
          transition: 'box-shadow 120ms ease, transform 120ms ease',
        },
      },
    },

    // ─── AppBar / Navbar ────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: BLUE,
          color: WHITE,
          boxShadow: 'none',
          borderBottom: 'none',
        },
      },
    },

    // ─── Chip ───────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: '0.786rem',
          fontWeight: 600,
          height: '28px',
        },
        filled: { backgroundColor: '#e8f2ff', color: BLUE },
        outlined: { borderColor: BORDER, color: DARK, borderWidth: '1px' },
      },
    },

    // ─── Dialog ─────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          boxShadow: 'rgba(26,26,26,0.20) 0px 12px 40px',
        },
      },
    },

    // ─── MenuItem ───────────────────────────────────────────────────────────
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.857rem',
          color: DARK,
          '&:hover': { backgroundColor: LIGHT },
          '&.Mui-selected': { backgroundColor: '#e8f2ff', color: BLUE, fontWeight: 600 },
        },
      },
    },

    // ─── Tab ────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.857rem',
          color: MID,
          minHeight: '44px',
          '&.Mui-selected': { color: BLUE, fontWeight: 700 },
          '&:focus-visible': { outline: `2px solid ${BLUE}`, outlineOffset: '2px' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: BLUE, height: '3px', borderRadius: '3px 3px 0 0' },
      },
    },

    // ─── Avatar ─────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: { backgroundColor: '#e8f2ff', color: BLUE, fontWeight: 700, fontSize: '0.857rem' },
      },
    },

    // ─── Slider ─────────────────────────────────────────────────────────────
    MuiSlider: {
      styleOverrides: {
        root: { color: BLUE },
        thumb: {
          backgroundColor: WHITE,
          border: `2px solid ${BLUE}`,
          '&:hover': { boxShadow: 'rgba(0,108,228,0.16) 0px 0px 0px 8px' },
          '&.Mui-active': { boxShadow: 'rgba(0,108,228,0.24) 0px 0px 0px 12px' },
        },
        track: { backgroundColor: BLUE, border: 'none' },
        rail: { backgroundColor: BORDER },
        mark: { backgroundColor: BORDER },
        markLabel: { fontSize: '0.714rem', color: MID },
        valueLabel: { backgroundColor: DARK, fontSize: '0.714rem', borderRadius: '4px' },
      },
    },

    // ─── Checkbox ───────────────────────────────────────────────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: BORDER,
          '&.Mui-checked': { color: BLUE },
          '&:focus-visible': { outline: `2px solid ${BLUE}`, outlineOffset: '2px' },
        },
      },
    },

    // ─── Badge ──────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#c8102e',
          color: WHITE,
          fontSize: '0.643rem',
          fontWeight: 700,
          minWidth: '16px',
          height: '16px',
          padding: '0 4px',
        },
      },
    },

    // ─── Alert ──────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '4px', fontSize: '0.857rem' },
        standardInfo:    { backgroundColor: '#e8f2ff', color: '#003f8a' },
        standardSuccess: { backgroundColor: '#e8f5ee', color: '#005a23' },
        standardWarning: { backgroundColor: '#fef6e8', color: '#a16100' },
        standardError:   { backgroundColor: '#fde8eb', color: '#8b0d1f' },
      },
    },

    // ─── LinearProgress ─────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: BORDER, borderRadius: '4px' },
        bar:  { backgroundColor: BLUE },
      },
    },

    // ─── Accordion ──────────────────────────────────────────────────────────
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '4px !important',
          border: `1px solid ${BORDER}`,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: '0 0 8px 0' },
        },
      },
    },

    // ─── Divider ────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: { root: { borderColor: BORDER } },
    },
  },
});

export default theme;