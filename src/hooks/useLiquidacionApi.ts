import { useState } from 'react';

export interface Liquidacion {
  id?: number;
  decena: string;
  empresario: string;
  monto: number;
  pagado: boolean;
  fechaPago?: string;
  medioPago?: string;
  comprobante?: string;
  alertaVencimiento: boolean;
}

// Cambia esta URL por la de tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/liquidations';

export function useLiquidacionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener liquidaciones
  const fetchLiquidaciones = async (): Promise<Liquidacion[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al obtener liquidaciones');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Registrar pago
  const registrarPago = async (id: number, pago: { fechaPago: string; medioPago: string; comprobante: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago),
      });
      if (!res.ok) throw new Error('Error al registrar pago');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchLiquidaciones,
    registrarPago,
    loading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { fetchLiquidaciones, registrarPago, loading, error } = useLiquidacionApi();
 *
 * useEffect(() => { fetchLiquidaciones(); }, []);
 *
 * registrarPago(id, { fechaPago: '2024-07-15', medioPago: 'Transferencia', comprobante: 'comprobante.pdf' });
 */ 