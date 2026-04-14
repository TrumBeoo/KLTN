import { useState } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  })

  const showNotification = (type, title, message, onConfirm = null) => {
    setNotification({
      open: true,
      type,
      title,
      message,
      onConfirm
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

  const showConfirm = (title, message, onConfirm) => {
    showNotification('confirm', title, message, onConfirm)
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false, onConfirm: null }))
  }

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showConfirm,
    hideNotification
  }
}