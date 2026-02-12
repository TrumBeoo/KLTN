import { useState, useEffect } from 'react'
import { Fab } from '@mui/material'
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return isVisible ? (
    <Fab
      onClick={scrollToTop}
      size="medium"
      sx={{
        position: 'fixed',
        bottom: 30,
        right: 33,
        zIndex: 1000,
      }}
      color="primary"
      aria-label="scroll to top"
    >
      <KeyboardArrowUpIcon />
    </Fab>
  ) : null
}
