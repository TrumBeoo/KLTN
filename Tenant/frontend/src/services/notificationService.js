const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class NotificationService {
  // Lấy danh sách thông báo
  async getNotifications(limit = 20, offset = 0) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    
    const data = await response.json()
    return {
      ...data,
      data: data.data?.map(notif => ({
        ...notif,
        Link: notif.Link || null
      })) || []
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count')
    }
    
    return response.json()
  }

  // Đánh dấu thông báo là đã đọc
  async markAsRead(notificationId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }
    
    return response.json()
  }

  // Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read')
    }
    
    return response.json()
  }

  // Xóa thông báo
  async deleteNotification(notificationId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete notification')
    }
    
    return response.json()
  }

  // Xóa tất cả thông báo
  async deleteAllNotifications() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete all notifications')
    }
    
    return response.json()
  }
}

export default new NotificationService()