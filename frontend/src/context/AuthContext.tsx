import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  user_id: number;
  email?: string;
  role: string;
  full_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (user: User & { accessToken?: string }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Configure axios auth from localStorage token if present
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      setAccessToken(stored);
      axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    }

    // On mount, check backend session (works with Authorization header too)
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/dashboard`, { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.user) setUser(res.data.user);
        else setUser(null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userWithToken: User & { accessToken?: string }) => {
    setUser(userWithToken);
    if (userWithToken.accessToken) {
      setAccessToken(userWithToken.accessToken);
      localStorage.setItem('accessToken', userWithToken.accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userWithToken.accessToken}`;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      // Optionally handle error
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 