import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginResponse } from '../types';

interface AuthContextType {
  token: string | null;
  tokenType: string | null;
  email: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (authData: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [tokenType, setTokenType] = useState<string | null>(localStorage.getItem('tokenType'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setToken(null);
    setTokenType(null);
    setEmail(null);
    setRole(null);
  };

  const login = (authData: LoginResponse) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('tokenType', authData.tokenType);
    localStorage.setItem('email', authData.email);
    localStorage.setItem('role', authData.role);
    setToken(authData.token);
    setTokenType(authData.tokenType);
    setEmail(authData.email);
    setRole(authData.role);
  };

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        tokenType,
        email,
        role,
        isAuthenticated: !!token,
        login,
        logout,
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
