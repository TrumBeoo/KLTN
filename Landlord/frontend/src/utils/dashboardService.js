const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleAuthError = (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Authentication failed. Please login again.');
  }
};

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  // Get pending viewing schedules
  getPendingViewings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/pending-viewings`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error('Failed to fetch pending viewings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Pending viewings error:', error);
      throw error;
    }
  },

  // Get available rooms
  getAvailableRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/available-rooms`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error('Failed to fetch available rooms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Available rooms error:', error);
      throw error;
    }
  }
};