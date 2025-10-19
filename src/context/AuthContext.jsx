import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await api.get('/api/auth/verify');
        console.log('Auth verification response:', response.data);
        
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          console.warn('No user data in verification response');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth state on unauthorized
          localStorage.removeItem('token');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password
      });
      console.log('Register response:', response.data);

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}