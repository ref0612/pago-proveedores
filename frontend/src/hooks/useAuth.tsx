import { useState, useEffect } from 'react';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
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

  return {
    user,
    loading,
    isAdmin,
    isValidador,
    canEditValidated,
    login,
    logout,
    initializeUsers,
  };
} 