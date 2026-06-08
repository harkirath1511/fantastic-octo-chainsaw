import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cookie is sent automatically — just check if session is valid
    getMe()
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  },[]);

  const saveAuth = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutApi().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
