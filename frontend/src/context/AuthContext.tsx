import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/apiService';

interface User {
  id: string; // Changed to string to handle potential UUIDs or stringified Ints
  name: string;
  email: string;
  role: 'customer' | 'designer' | 'admin';
  avatar?: string;
  wallet_balance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'customer' | 'designer') => Promise<void>;
  logout: () => void;
  setAuthData: (user: User, token: string) => void;
  isAdmin: boolean;
  isDesigner: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await apiService.getCurrentUser();
          setUser(data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiService.login(email, password);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
  };

  const adminLogin = async (email: string, password: string) => {
    const data = await apiService.adminLogin(email, password);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: 'customer' | 'designer') => {
    const data = await apiService.register(name, email, password, role);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const setAuthData = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isDesigner = user?.role === 'designer' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        adminLogin,
        register,
        logout,
        setAuthData,
        isAdmin,
        isDesigner,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
