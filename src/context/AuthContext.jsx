import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: set token in localStorage and default header
  function setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.Authorization;
    }
  }

  // Rehydrate user on mount if token exists
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token');

      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        try {
          const res = await api.get('/auth/profile');
          const profileUser = res?.data?.data ?? res?.data?.user ?? res?.data;
          setUser(profileUser || null);
        } catch (e) {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  async function login(credentials) {
    const data = await authService.login(credentials);
    // extract token (server returns token at `data.data.token`)
    const token = data?.token ?? null;
    if (token) setToken(token);
    // fetch user info
    try {
      const res = await api.get('/auth/profile');
      const profileUser = res?.data?.data;
      setUser(profileUser || null);
      return { user: profileUser || null, token };  
    } catch (e) {
      // profile fetch failed — clear token and propagate error so caller knows
      setToken(null);
      throw e;
    }
  }

  async function register(credentials) {
    const data = await authService.register(credentials);
    const token = data?.token ?? null;
    if (token) setToken(token);
    try {
      const res = await api.get('/auth/profile');
      const profileUser = res?.data?.data ?? res?.data?.user ?? res?.data;
      setUser(profileUser || null);
      return { user: profileUser || null, token };
    } catch (e) {
      setToken(null);
      throw e;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    // optional: redirect handled by caller
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;