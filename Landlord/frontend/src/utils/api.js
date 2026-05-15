const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Kiểm tra lỗi 403 - Sai role
    if (response.status === 403) {
      console.error('403 Forbidden - Invalid role detected');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=' + encodeURIComponent('Bạn không có quyền truy cập. Vui lòng sử dụng tài khoản chủ nhà.');
      throw new Error('Forbidden - Invalid role');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const authAPI = {
  login: (username, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username, password, name, email, phone) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, email, phone }),
    }),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: (customToken) => {
    const token = customToken || localStorage.getItem('token');
    return apiCall('/auth/me', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  changePassword: (newPassword) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
};

export default apiCall;
