import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, aiServicesAPI } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; password: string; name: string; organization: string }) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'microsoft' | 'github') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        aiServicesAPI.setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await aiServicesAPI.login(email, password);
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        aiServicesAPI.setToken(newToken);
        
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    organization: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await aiServicesAPI.register(userData);
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        aiServicesAPI.setToken(newToken);
        
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        
        return true;
      } else {
        console.error('Registration failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'microsoft' | 'github'): Promise<boolean> => {
    try {
      console.log(`🔐 Starting OAuth login with ${provider}...`);
      setIsLoading(true);
      
      // Get OAuth URL from backend
      const redirectUri = `${window.location.origin}/auth/callback`;
      console.log(`📡 Calling backend for OAuth URL with redirect: ${redirectUri}`);
      
      const response = await aiServicesAPI.getOAuthUrl(provider, redirectUri);
      console.log('📡 Backend response:', response);
      
      if (response.success && response.data) {
        console.log(`✅ OAuth URL received for ${provider}:`, response.data.authorization_url);
        
        // Store state for verification
        localStorage.setItem('oauth_state', response.data.state);
        localStorage.setItem('oauth_provider', provider);
        console.log('💾 Stored OAuth state and provider');
        
        // Redirect to OAuth provider
        console.log(`🔄 Redirecting to ${provider} OAuth...`);
        window.location.href = response.data.authorization_url;
        return true;
      } else {
        console.error('❌ OAuth URL generation failed:', response.error);
        alert(`OAuth login failed: ${response.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('❌ OAuth login error:', error);
      alert(`OAuth login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    aiServicesAPI.setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    loginWithOAuth,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 