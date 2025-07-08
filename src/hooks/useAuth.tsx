import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO' | null;

interface AuthContextType {
  user: string | null;
  role: UserRole;
  login: (user: string, role: UserRole, token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('user'));
  const [role, setRole] = useState<UserRole>(localStorage.getItem('role') as UserRole || null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = (user: string, role: UserRole, token: string) => {
    setUser(user);
    setRole(role);
    setToken(token);
    localStorage.setItem('user', user);
    localStorage.setItem('role', role || '');
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}; 