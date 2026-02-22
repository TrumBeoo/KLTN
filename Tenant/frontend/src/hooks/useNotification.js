import { useState } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showNotification = (type, title, message) => {
    setNotification({
      open: true,
      type,
      title,
      message
    })
  }

  const showSuccess = (title, message) => {
    showNotification('success', title, message)
  }

  const showError = (title, message) => {
    showNotification('error', title, message)
  }

  const showInfo = (title, message) => {
    showNotification('info', title, message)
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    hideNotification
  }
}