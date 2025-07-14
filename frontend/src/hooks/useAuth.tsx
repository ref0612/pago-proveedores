import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import { useAuth } from './AuthContext';

export { useAuth } from './AuthContext';
export type { User } from './AuthContext';

// Contexto de notificaciones global
export interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: string;
  referenciaId?: number;
}

interface NotificacionesContextType {
  notificaciones: Notificacion[];
  setNotificaciones: React.Dispatch<React.SetStateAction<Notificacion[]>>;
  recargarNotificaciones: () => void;
}

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined);

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const recargarNotificaciones = async () => {
    if (!user) return;
    try {
      const res = await apiGet(`/notificaciones/${user.rol}`);
      setNotificaciones(res);
    } catch (e) {
      setNotificaciones([]);
    }
  };

  useEffect(() => {
    recargarNotificaciones();
    // eslint-disable-next-line
  }, [user]);

  return (
    <NotificacionesContext.Provider value={{ notificaciones, setNotificaciones, recargarNotificaciones }}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  return ctx;
} 