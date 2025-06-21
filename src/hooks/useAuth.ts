'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { ApiClient } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await ApiClient.getUserProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refresh: checkAuthStatus,
  };
}