import axios from 'axios';

// In development, '/api' is proxied to the backend by Vite (see vite.config.js).
// In production, set VITE_API_URL to the backend's public URL, e.g. https://your-backend.up.railway.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
