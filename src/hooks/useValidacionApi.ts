import { useState } from 'react';

export interface Validacion {
  id?: number;
  decena: string;
  empresario: string;
  total: number;
  validado: boolean;
  comentarios: string;
  bloqueado: boolean;
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/validations';

export function useValidacionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener validaciones
  const fetchValidaciones = async (): Promise<Validacion[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al obtener validaciones');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Aprobar o rechazar validación
  const validar = async (id: number, aprobado: boolean, comentarios: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprobado, comentarios }),
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