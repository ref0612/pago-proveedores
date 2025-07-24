import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
  activo: boolean;
  canViewTrips: boolean;
  canViewRecorridos: boolean;
  canViewProduccion: boolean;
  canViewValidacion: boolean;
  canViewLiquidacion: boolean;
  canViewReportes: boolean;
  canViewUsuarios: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeUsers: () => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
  reloadUser: () => Promise<void>;
  isAdmin: () => boolean;
  isValidador: () => boolean;
  canEditValidated: () => boolean;
}
  // Recarga el usuario actual desde la API y actualiza el contexto y localStorage
  const reloadUser = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (err) {
      // opcional: mostrar error
    }
  };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const isAdmin = () => user?.rol === 'ADMIN';
  const isValidador = () => user?.rol === 'VALIDADOR' || user?.rol === 'ADMIN';
  const canEditValidated = () => user?.rol === 'ADMIN';

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  const initializeUsers = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/api/users/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
      return response.ok;
    } catch (error) {
      console.error('Error al inicializar usuarios:', error);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // Recarga el usuario actual desde la API y actualiza el contexto y localStorage
  const reloadUser = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (err) {
      // opcional: mostrar error
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, initializeUsers, updateUser, reloadUser, isAdmin, isValidador, canEditValidated }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
} 