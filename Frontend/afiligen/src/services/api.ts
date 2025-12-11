import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const unprotectedRoutes = ['/auth/register', '/auth/login'];

api.interceptors.request.use(
  (config) => {
    const url = config.url;
    if (!url) return config;

    const isProtected = !unprotectedRoutes.includes(url);

    if (isProtected) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
