import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStyles } from '@mui/material'
import App from './App'
import theme from './theme'

const globalStyles = (
  <GlobalStyles
    styles={{
      '*': {
        boxSizing: 'border-box',
      },
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        overflowX: 'hidden',
      },
      '#root': {
        width: '100%',
        overflowX: 'hidden',
      },
      'img': {
        maxWidth: '100%',
        height: 'auto',
      },
    }}
  />
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {globalStyles}
    <App />
  </ThemeProvider>,
)
