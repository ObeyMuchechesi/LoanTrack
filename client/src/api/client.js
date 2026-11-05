import axios from 'axios';
import { refreshShareCode } from '../utils/share.js';

export const UNAUTHORIZED_EVENT = 'loantrack:unauthorized';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) {
    // Dedicated header first: some hosting proxies override `Authorization`
    // with their own share-link credentials.
    cfg.headers['X-LoanTrack-Token'] = t;
    cfg.headers.Authorization = `Bearer ${t}`;
  }

  const code = refreshShareCode();
  if (code && !(cfg.params && 'sharecode' in cfg.params)) {
    cfg.params = { ...cfg.params, sharecode: code };
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    const url = e.config?.url || '';
    // A failed login must NOT clear the session or reload the page: the Login
    // component needs the response so it can show "Invalid credentials".
    if (e.response?.status === 401 && !url.startsWith('/auth/login')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(e);
  }
);

export default api;
