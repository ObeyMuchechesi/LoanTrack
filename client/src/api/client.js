import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) {
    // Dedicated header first: some hosting proxies override `Authorization`
    // with their own share-link credentials.
    cfg.headers['X-LoanTrack-Token'] = t;
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(e);
  }
);

export default api;
