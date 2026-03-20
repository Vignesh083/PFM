import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:9006' : 'https://pfm-q2kz.onrender.com',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
