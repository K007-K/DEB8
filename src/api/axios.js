import axios from 'axios';

// Create axios instance with base configuration
const instance = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  // Remove withCredentials as we'll use token-based auth
  withCredentials: false
});

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url, 'with data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    // Prevent logout for password check requests
    const isPasswordCheck = error.config?.url?.includes('/api/rooms/') &&
      error.config?.url?.includes('/join') &&
      error.config?.data?.includes('"role":"check"');
    if (error.response?.status === 401 && !isPasswordCheck) {
      localStorage.removeItem('token');
      window.location.href = '/auth?mode=login';
    }
    return Promise.reject(error);
  }
);

export default instance; 