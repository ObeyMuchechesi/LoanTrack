import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return setLoading(false);
    api
      .get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
