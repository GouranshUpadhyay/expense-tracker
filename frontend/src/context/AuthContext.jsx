import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      setToken(res.data.token);
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        currency: res.data.currency || 'USD'
      };
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, currency = 'USD') => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, currency });
      setToken(res.data.token);
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        currency: res.data.currency || currency
      };
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      const res = await API.put('/auth/currency', { currency: newCurrency });
      setUser((prevUser) => ({
        ...prevUser,
        currency: res.data.currency
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update currency preference.'
      };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateCurrency, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
