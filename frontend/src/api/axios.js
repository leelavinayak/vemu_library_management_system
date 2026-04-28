import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://vemu-library-management-system-ni7c.onrender.com';

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Add a request interceptor to include the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default instance;
