import React, { useState, useEffect } from 'react';

interface Trip {
  id: number;
  origin: string;
  destination: string;
  companyName: string;
  branchRevenue?: number;
  roadRevenue?: number;
  manualIncome?: string | number;
  totalIngresos: number;
  travelDate?: string; // Campo de fecha del viaje
}

interface Route {
  id: number;
  origen: string;
  destino: string;
  kilometraje: number;
  zona: { id: number; nombre: string; porcentaje: number };
}

interface Zone {
  id: number;
  nombre: string;
  porcentaje: number;
}

// Función para normalizar strings (minúsculas, sin tildes, sin espacios extra)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .replace(/\s+/g, ' ')
    .trim();
}

// Función para obtener la decena actual
function getDecenaActual(): string {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
  const año = ahora.getFullYear();
  const dia = ahora.getDate();
  
  // Determinar qué decena estamos
  let decena = 1;
  if (dia > 20) decena = 3;
  else if (dia > 10) decena = 2;
  
  return `${decena}${mes.toString().padStart(2, '0')}${año}`;
}

// Función para obtener fechas de una decena
function getFechasDecena(decenaStr: string): { desde: string; hasta: string } {
  const decena = parseInt(decenaStr.charAt(0));
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  
  let diaInicio = 1;
  let diaFin = 10;
  
  if (decena === 2) {
    diaInicio = 11;
    diaFin = 20;
  } else if (decena === 3) {
    diaInicio = 21;
    // Obtener el último día del mes (0 significa último día del mes anterior)
    const ultimoDia = new Date(año, mes, 0).getDate();
    diaFin = ultimoDia;
  }
  
  const desde = `${año}-${mes.toString().padStart(2, '0')}-${diaInicio.toString().padStart(2, '0')}`;
  const hasta = `${año}-${mes.toString().padStart(2, '0')}-${diaFin.toString().padStart(2, '0')}`;
  
  return { desde, hasta };
}

// Función para generar opciones de decenas (últimos 12 meses)
function generarOpcionesDecenas(): string[] {
  const opciones: string[] = [];
  const ahora = new Date();
  
  for (let i = 0; i < 12; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    
    // Agregar las 3 decenas del mes
    opciones.push(`1${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`2${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`3${mes.toString().padStart(2, '0')}${año}`);
  }
  
  return opciones;
}

// Función para obtener el nombre del mes y año de una decena
function getNombreMesDecena(decenaStr: string): string {
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  const fecha = new Date(año, mes - 1, 1); // mes - 1 porque getMonth() devuelve 0-11
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

const CalculoProduccion: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [detalleEmpresario, setDetalleEmpresario] = useState<string | null>(null);
  const [decenaSeleccionada, setDecenaSeleccionada] = useState<string>(getDecenaActual());
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.json())
      .then(data => {
        // Calcular totalIngresos para cada viaje
        const tripsWithTotal = data.map((v: any) => {
          const branch = Number(v.branchRevenue) || 0;
          const road = Number(v.roadRevenue) || 0;
          // manualIncome puede ser string, intenta convertir a número
          let manual = 0;
          if (v.manualIncome !== undefined && v.manualIncome !== null && v.manualIncome !== '') {
            manual = Number(String(v.manualIncome).replace(/[^\d.\-]/g, '')) || 0;
          }
          return {
            ...v,
            totalIngresos: branch + road + manual,
          };
        });
        setTrips(tripsWithTotal);
      });
    fetch('/api/zones')
      .then(res => res.json())
      .then(data => setZones(data));
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setRoutes(data));
  }, []);

  // Actualizar fechas cuando cambia la decena seleccionada
  useEffect(() => {
    if (decenaSeleccionada) {
      const { desde, hasta } = getFechasDecena(decenaSeleccionada);
      setFechaDesde(desde);
      setFechaHasta(hasta);
    }
  }, [decenaSeleccionada]);

  // Filtrar viajes por fecha
  const tripsFiltrados = trips.filter(v => {
    if (!v.travelDate) return true; // Si no hay fecha, incluir
    
    const fechaViaje = new Date(v.travelDate);
    // Normalizar la fecha del viaje a solo fecha (sin hora)
    const fechaViajeNormalizada = new Date(fechaViaje.getFullYear(), fechaViaje.getMonth(), fechaViaje.getDate());
    
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      if (fechaViajeNormalizada < desde) return false;
    }
    
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      if (fechaViajeNormalizada > hasta) return false;
    }
    
    return true;
  });

  // Validar que la fecha "hasta" sea mayor o igual que "desde"
  const fechaValida = !fechaDesde || !fechaHasta || new Date(fechaDesde) <= new Date(fechaHasta);
  const mensajeError = fechaDesde && fechaHasta && !fechaValida 
    ? 'La fecha "Hasta" debe ser mayor o igual que la fecha "Desde"' 
    : '';

  // Agrupar viajes por empresa
  const empresarios = Array.from(new Set(tripsFiltrados.map(v => v.companyName)));

  // Buscar zona por origen/destino
  const getZonaPorTramo = (origen: string, destino: string): Zone | null => {
    const normOrigen = normalize(origen);
    const normDestino = normalize(destino);
    for (const route of routes) {
      const rOrig = normalize(route.origen);
      const rDest = normalize(route.destino);
      if (
        (rOrig === normOrigen && rDest === normDestino) ||
        (rOrig === normDestino && rDest === normOrigen)
      ) {
        return route.zona;
      }
    }
    return null;
  };

  // Calcular resumen por empresario
  const resumen = empresarios.map(emp => {
    const viajesEmp = tripsFiltrados.filter(v => v.companyName === emp);
    let totalServicios = 0;
    let totalIngresos = 0;
    let totalGanancia = 0;
    viajesEmp.forEach(v => {
      const zona = getZonaPorTramo(v.origin, v.destination);
      const porcentaje = zona ? zona.porcentaje : 0;
      totalServicios++;
      totalIngresos += v.totalIngresos;
      totalGanancia += v.totalIngresos * (porcentaje / 100);
    });
    return { emp, totalServicios, totalIngresos, totalGanancia };
  });

  // Detalle por zona para un empresario
  const getDetallePorZona = (empresario: string) => {
    const viajesEmp = tripsFiltrados.filter(v => v.companyName === empresario);
    const zonasMap: { [zonaId: number]: { zona: Zone, servicios: number, ingresos: number, ganancia: number } } = {};
    viajesEmp.forEach(v => {
      const zona = getZonaPorTramo(v.origin, v.destination);
      if (zona) {
        if (!zonasMap[zona.id]) {
          zonasMap[zona.id] = { zona, servicios: 0, ingresos: 0, ganancia: 0 };
        }
        zonasMap[zona.id].servicios++;
        zonasMap[zona.id].ingresos += v.totalIngresos;
        zonasMap[zona.id].ganancia += v.totalIngresos * (zona.porcentaje / 100);
      }
    });
    return Object.values(zonasMap);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Producción por Empresario</h1>
      
      {/* Filtros de fecha */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtros por Decena</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Decena:
          </label>
          <select
            value={decenaSeleccionada}
            onChange={(e) => setDecenaSeleccionada(e.target.value)}
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
        <div className="text-sm text-gray-600 mb-3">
          <strong>Período seleccionado:</strong> {fechaDesde && fechaHasta ? 
            `${new Date(fechaDesde).toLocaleDateString()} - ${new Date(fechaHasta).toLocaleDateString()}` : 
            'No seleccionado'
          }
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde:
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !fechaValida ? 'border-red-500' : 'border-gray-300'
              }`}
              max={fechaHasta || undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta:
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !fechaValida ? 'border-red-500' : 'border-gray-300'
              }`}
              min={fechaDesde || undefined}
            />
          </div>
          <button
            onClick={() => {
              setDecenaSeleccionada(getDecenaActual());
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Ir a Decena Actual
          </button>
        </div>
        {mensajeError && (
          <p className="text-sm text-red-600 mt-2">{mensajeError}</p>
        )}
        {(fechaDesde || fechaHasta) && (
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {fechaValida ? tripsFiltrados.length : 0} de {trips.length} viajes
          </p>
        )}
      </div>

      <table className="min-w-full border divide-y divide-gray-200 text-sm mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Empresario</th>
            <th className="px-4 py-2 text-left">Servicios</th>
            <th className="px-4 py-2 text-left">Total Ingresos</th>
            <th className="px-4 py-2 text-left">Ganancia</th>
            <th className="px-4 py-2 text-left">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map(r => (
            <tr key={r.emp} className="border-b">
              <td className="px-4 py-2 font-medium">{r.emp}</td>
              <td className="px-4 py-2">{r.totalServicios}</td>
              <td className="px-4 py-2">${r.totalIngresos.toLocaleString()}</td>
              <td className="px-4 py-2">${r.totalGanancia.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => setDetalleEmpresario(r.emp)}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {detalleEmpresario && (
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Detalle de producción: {detalleEmpresario}</h2>
          <button className="mb-4 text-blue-600 underline" onClick={() => setDetalleEmpresario(null)}>
            Volver al resumen
          </button>
          <table className="min-w-full border divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Zona</th>
                <th className="px-4 py-2 text-left">% Zona</th>
                <th className="px-4 py-2 text-left">Servicios</th>
                <th className="px-4 py-2 text-left">Ingresos</th>
                <th className="px-4 py-2 text-left">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {getDetallePorZona(detalleEmpresario).map(z => (
                <tr key={z.zona.id}>
                  <td className="px-4 py-2">{z.zona.nombre}</td>
                  <td className="px-4 py-2">{z.zona.porcentaje}%</td>
                  <td className="px-4 py-2">{z.servicios}</td>
                  <td className="px-4 py-2">${z.ingresos.toLocaleString()}</td>
                  <td className="px-4 py-2">${z.ganancia.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CalculoProduccion; 