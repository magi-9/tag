import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // We don't want to clear EVERYTHING if they were a spectator? 
        // But if they reached this, they were authenticated.
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Extract error message
    let errorMessage = 'Nastala chyba';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'object') {
        // Handle field validation errors from Django (e.g. { "email": ["error"] })
        const errors = Object.entries(error.response.data)
          .map(([key, value]) => {
            const field = key === 'non_field_errors' ? '' : `${key}: `;
            const msgs = Array.isArray(value) ? value.join(' ') : value;
            return `${field}${msgs}`;
          });
        if (errors.length > 0) {
          errorMessage = errors.join('\n');
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/users/token/', credentials),
  register: (data) => api.post('/users/register/', data),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/update_profile/', data),
  changePassword: (data) => api.post('/users/change_password/', data),
  subscribePush: (subscription) => api.post('/users/subscribe_push/', subscription)
};

// Game API
export const gameAPI = {
  getSettings: () => api.get('/game/settings/current/'),
  updateSettings: (id, data) => api.put(`/game/settings/${id}/`, data),

  getTags: (params) => api.get('/game/tags/', { params }),
  createTag: (data) => api.post('/game/tags/create_tag/', data),
  getCurrentHolder: () => api.get('/game/tags/current_holder/'),

  getLeaderboard: () => api.get('/game/leaderboard/'),

  getAchievements: (params) => api.get('/game/achievements/', { params }),
  recalculateAchievements: () => api.post('/game/achievements/recalculate/')
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users/', { params }),
  approveUser: (id) => api.post(`/users/${id}/approve/`),
  revokeApproval: (id) => api.post(`/users/${id}/revoke_approval/`),
  getPendingApprovals: () => api.get('/users/pending_approvals/'),
  getLeaderboard: () => api.get('/users/leaderboard/'),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`)
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
  getUnread: () => api.get('/notifications/unread/'),
  getUnreadCount: () => api.get('/notifications/unread_count/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
  sendNotification: (data) => api.post('/notifications/send_notification/', data)
};

export default api;
