import axios from 'axios';

const api = axios.create({
  // Prefer VITE_API_URL from env, otherwise default to localhost:5000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);  

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Do not perform a hard redirect here. Let callers and AuthContext
      // handle navigation so login/register flows can react appropriately.
    }
    return Promise.reject(error);
  }
);

export default api;
