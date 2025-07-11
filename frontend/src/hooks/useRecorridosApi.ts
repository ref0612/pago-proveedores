import { useState } from 'react';

export interface Recorrido {
  fecha: string;
  origen: string;
  destino: string;
  horario: string;
  tipologia: string;
  zona: string;
  empresario: string;
  kilometraje?: number;
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/routes';

export function useRecorridosApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener recorridos
  const fetchRecorridos = async (): Promise<Recorrido[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?page=0&size=1000`);
      if (!res.ok) throw new Error('Error al obtener recorridos');
      const data = await res.json();
      return data.content || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear recorridos (uno o varios)
  const createRecorridos = async (recorridos: Recorrido[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recorridos),
      });
      if (!res.ok) throw new Error('Error al crear recorridos');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchRecorridos,
    createRecorridos,
    loading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { fetchRecorridos, createRecorridos, loading, error } = useRecorridosApi();
 *
 * useEffect(() => { fetchRecorridos(); }, []);
 *
 * createRecorridos([{...}, {...}]);
 */ 