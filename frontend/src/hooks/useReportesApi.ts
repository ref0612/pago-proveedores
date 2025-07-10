import { useState } from 'react';

export interface Reporte {
  decena: string;
  zona: string;
  empresario: string;
  recorridos: number;
  monto: number;
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/reports';

export function useReportesApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener reportes filtrados
  const fetchReportes = async (filtros: { decena?: string; zona?: string; empresario?: string }): Promise<Reporte[]> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros as any).toString();
      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Error al obtener reportes');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Exportar reporte (placeholder)
  const exportarReporte = async (tipo: 'pdf' | 'excel', filtros: { decena?: string; zona?: string; empresario?: string }) => {
    // Aquí deberías llamar al endpoint real de exportación y descargar el archivo
    alert(`Exportando reporte a ${tipo.toUpperCase()} (integración real pendiente)`);
  };

  return {
    fetchReportes,
    exportarReporte,
    loading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { fetchReportes, exportarReporte, loading, error } = useReportesApi();
 *
 * useEffect(() => { fetchReportes({ decena: '2024-07-01 al 2024-07-10' }); }, []);
 *
 * exportarReporte('pdf', { zona: 'JB' });
 */ 