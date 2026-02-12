const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  getCurrentUser: () =>
    apiCall('/auth/me', {
      method: 'GET',
    }),

  changePassword: (newPassword) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
};

export default apiCall;
