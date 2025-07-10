import React, { useState, useEffect } from 'react';
import { productionsApi } from '../../services/api';

interface ProduccionAprobada {
  id: number;
  decena: string;
  total: number;
  entrepreneur: { nombre: string };
  validado: boolean;
  comentarios: string;
}

function generarOpcionesDecenas(): string[] {
  const opciones: string[] = [];
  const ahora = new Date();
  for (let i = 0; i < 12; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    opciones.push(`1${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`2${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`3${mes.toString().padStart(2, '0')}${año}`);
  }
  return opciones;
}

function getNombreMesDecena(decenaStr: string): string {
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  const fecha = new Date(año, mes - 1, 1);
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function getDecenaActual(): string {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const año = ahora.getFullYear();
  const dia = ahora.getDate();
  let decena = 1;
  if (dia > 20) decena = 3;
  else if (dia > 10) decena = 2;
  return `${decena}${mes.toString().padStart(2, '0')}${año}`;
}

export default function LiquidacionPagos() {
  const [liquidaciones, setLiquidaciones] = useState<ProduccionAprobada[]>([]);
  const [pago, setPago] = useState({ fechaPago: '', medioPago: '', comprobante: '' });
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [decenaSeleccionada, setDecenaSeleccionada] = useState<string>(getDecenaActual());

  useEffect(() => {
    cargarProduccionesAprobadas();
  }, []);

  const cargarProduccionesAprobadas = async () => {
    setLoading(true);
    try {
      // Obtener solo producciones validadas/aprobadas
      const data = await productionsApi.getAprobadas();
      setLiquidaciones(data);
    } catch (err) {
      setLiquidaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por decena seleccionada y solo aprobadas
  const liquidacionesFiltradas = liquidaciones.filter(l => l.decena === decenaSeleccionada && l.validado === true);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Liquidación y Pagos</h1>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtrar por Decena</h3>
        <select
          value={decenaSeleccionada}
          onChange={e => setDecenaSeleccionada(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {generarOpcionesDecenas().map(decena => {
            const decenaNum = decena.charAt(0);
            const nombreMesAño = getNombreMesDecena(decena);
            return (
              <option key={decena} value={decena}>
                {decenaNum}ª Decena {nombreMesAño}
              </option>
            );
          })}
        </select>
      </div>
      {loading && <div className="mb-4 text-blue-600">Cargando liquidaciones aprobadas...</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {liquidacionesFiltradas.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.decena}</td>
                <td className="p-2">{l.entrepreneur?.nombre || '-'}</td>
                <td className="p-2">${l.total?.toLocaleString() ?? 0}</td>
                <td className="p-2">
                  <button className="bg-blue-600 text-white px-2 py-1 rounded">Registrar Pago</button>
                </td>
              </tr>
            ))}
            {liquidacionesFiltradas.length === 0 && !loading && (
              <tr><td colSpan={4} className="text-center text-gray-400 p-4">No hay liquidaciones aprobadas para mostrar en esta decena.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 