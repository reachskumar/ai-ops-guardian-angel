import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import aiServicesAPI from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  orgId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('im_token');
    const userJson = localStorage.getItem('im_user');
    if (token) {
      aiServicesAPI.setToken(token);
    }
    if (userJson) {
      try {
        const u = JSON.parse(userJson) as User;
        setUser(u);
      } catch {}
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await aiServicesAPI.login(email, password);
      if (!resp.success || !resp.data) {
        throw new Error(resp.error || 'Login failed');
      }
      const { token, user: backendUser } = resp.data;
      if (!token) throw new Error('No token received');
      aiServicesAPI.setToken(token);
      localStorage.setItem('im_token', token);
      const mappedUser: User = {
        id: backendUser?.id || backendUser?.email || 'user',
        email: backendUser?.email || email,
        name: backendUser?.name || email,
        role: backendUser?.role || 'user',
        tenantId: (backendUser as any)?.tenant_id,
        orgId: (backendUser as any)?.org_id,
      };
      setUser(mappedUser);
      localStorage.setItem('im_user', JSON.stringify(mappedUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('im_token');
    localStorage.removeItem('im_user');
    aiServicesAPI.setToken('');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 