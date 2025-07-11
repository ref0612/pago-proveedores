import { useState } from 'react';
import { useAuth } from './useAuth';

export interface Validacion {
  id?: number;
  decena: string;
  total: number;
  validado: boolean;
  comentarios: string;
  entrepreneur: { nombre: string };
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/productions/pendientes';

export function useValidacionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Obtener validaciones
  const fetchValidaciones = async (decena?: string, includeValidated: boolean = true): Promise<Validacion[]> => {
    setLoading(true);
    setError(null);
    try {
      const url = decena ? `${API_URL}?decena=${decena}&includeValidated=${includeValidated}` : `${API_URL}?includeValidated=${includeValidated}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener validaciones');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Aprobar o rechazar validación (ahora acepta estatus)
  const validar = async (id: number, estatus: string, comentarios: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user?.email || '',
        },
        body: JSON.stringify({ estatus, comentarios }),
      });
      if (!res.ok) throw new Error('Error al validar producción');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchValidaciones,
    validar,
    loading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { fetchValidaciones, validar, loading, error } = useValidacionApi();
 *
 * useEffect(() => { fetchValidaciones(); }, []);
 *
 * validar(id, true, 'Aprobado sin observaciones');
 */ 