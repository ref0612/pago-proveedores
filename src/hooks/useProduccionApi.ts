import { useState } from 'react';

export interface Produccion {
  id?: number;
  decena: string;
  empresario: string;
  zona: string;
  totalRecorridos: number;
  porcentajeZona: number;
  monto: number;
  editable: boolean;
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/productions';

export function useProduccionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener producciones
  const fetchProducciones = async (): Promise<Produccion[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al obtener producciones');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar producción
  const saveProduccion = async (produccion: Produccion): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: produccion.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produccion),
      });
      if (!res.ok) throw new Error('Error al guardar producción');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchProducciones,
    saveProduccion,
    loading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { fetchProducciones, saveProduccion, loading, error } = useProduccionApi();
 *
 * useEffect(() => { fetchProducciones(); }, []);
 *
 * saveProduccion({...});
 */ 