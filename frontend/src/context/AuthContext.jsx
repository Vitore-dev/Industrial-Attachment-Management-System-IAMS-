import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const formatAuthError = (data, fallback) => {
  if (!data || typeof data !== 'object') return fallback;
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;

  const message = Object.values(data)
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();

  return message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await loadCurrentUser();
      }
      setLoading(false);
    };

    initializeSession();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const loadCurrentUser = async () => {
    try {
      const data = await api.getCurrentUser();
      if (data?.id) {
        setUser(data);
        return data;
      }
    } catch (error) {
      // Fall through to clearing the local session.
    }

    clearSession();
    return null;
  };

  const startSession = async (data, fallbackError) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    const userData = await loadCurrentUser();
    if (userData) {
      return { success: true, role: userData.role };
    }

    return { success: false, error: fallbackError };
  };

  const login = async (username, password) => {
    try {
      const data = await api.login({ username, password });
      if (data.access) {
        return startSession(data, 'Login succeeded but loading your account failed');
      }

      return { success: false, error: formatAuthError(data, 'Login failed') };
    } catch (error) {
      return { success: false, error: 'Unable to reach the server' };
    }
  };

  const register = async (payload) => {
    try {
      const data = await api.register(payload);
      if (data.access) {
        return startSession(
          data,
          'Registration succeeded but loading your account failed'
        );
      }

      if (data?.role && data?.message) {
        return {
          success: true,
          role: data.role,
          requiresLogin: Boolean(data.requires_login),
          message: data.message,
        };
      }

      return {
        success: false,
        error: formatAuthError(data, 'Registration failed'),
      };
    } catch (error) {
      return { success: false, error: 'Unable to reach the server' };
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) {
        await api.logout(refresh);
      }
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
