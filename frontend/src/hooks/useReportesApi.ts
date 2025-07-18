import { useState } from 'react';
import { apiGet } from '../services/api';

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

export function useReporteGlobalSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/reports/global-summary?desde=${desde}&hasta=${hasta}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el resumen global');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchSummary };
}

export function useReporteEmpresarioDetallado() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresario = async (empresarioId: number, desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/reports/empresario-detallado?empresarioId=${empresarioId}&desde=${desde}&hasta=${hasta}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el reporte detallado');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchEmpresario };
}

export function useReporteZonaDetallada() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZona = async (zona: string, desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/reports/zona-detallada?zona=${encodeURIComponent(zona)}&desde=${desde}&hasta=${hasta}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el reporte de zona');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchZona };
}

export function useReporteProduccionLiquidaciones() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduccion = async (empresarioId: number | null, desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/reports/produccion-liquidaciones?desde=${desde}&hasta=${hasta}`;
      if (empresarioId) url += `&empresarioId=${empresarioId}`;
      const res = await apiGet(url);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el reporte de producción/liquidaciones');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchProduccion };
}

export function useReporteValidacionesAprobaciones() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValidaciones = async (empresarioId: number | null, zona: string, desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/reports/validaciones-aprobaciones?desde=${desde}&hasta=${hasta}`;
      if (empresarioId) url += `&empresarioId=${empresarioId}`;
      if (zona) url += `&zona=${encodeURIComponent(zona)}`;
      const res = await apiGet(url);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el reporte de validaciones/aprobaciones');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchValidaciones };
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