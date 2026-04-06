import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { normalizeRole } from '../utils/roles';

export const AuthContext = createContext();

const toStoredUser = (user, roleOverride) => {
  if (!user) return null;

  return {
    id: user.id || user._id,
    _id: user._id || user.id,
    username: user.username,
    role: normalizeRole(roleOverride || user.role),
    isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(toStoredUser(parsed, parsed.role));
      }
    } catch (e) {
      console.error('Error parsing stored user', e);
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const storedUser = toStoredUser(res.data.user, res.data.user.role);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(storedUser));
      setToken(res.data.token);
      setUser(storedUser);
    }
    return res.data;
  };

  const register = async (username, password, role) => {
    const res = await api.post('/auth/register', { username, password, role: normalizeRole(role) });

    if (res.data.success) {
      const storedUser = toStoredUser(res.data.user, res.data.user.role);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(storedUser));
      setToken(res.data.token);
      setUser(storedUser);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
