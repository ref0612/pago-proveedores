import React, { useState, useEffect } from 'react';
import { tripsApi } from '../../services/api';
import { getAllZones, productionsApi } from '../../services/api';

interface Trip {
  id: number;
  origin: string;
  destination: string;
  companyName: string;
  branchRevenue?: number;
  roadRevenue?: number;
  manualIncome?: string | number;
  totalIngresos: number;
  travelDate?: string;
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

interface Production {
  id: number;
  decena: string;
  total: number;
  ganancia: number;
  validado: boolean;
  comentarios: string;
  entrepreneur: { nombre: string };
}

// Función para normalizar strings (idéntica a backend, compatible universalmente)
function normalize(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .toLowerCase()
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
  // Estados para edición de porcentaje de zona
  const [zonaEditando, setZonaEditando] = useState<number | null>(null);
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [producciones, setProducciones] = useState<Production[]>([]);
  const [detalleEmpresario, setDetalleEmpresario] = useState<string | null>(null);
  const [decenaSeleccionada, setDecenaSeleccionada] = useState<string>(getDecenaActual());
  const [generatingProductions, setGeneratingProductions] = useState<boolean>(false);
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [generationType, setGenerationType] = useState<'success' | 'error' | null>(null);
  const [loadingTrips, setLoadingTrips] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  // Carga inicial de datos solo al montar
  useEffect(() => {
    reloadAllData();
  }, []);

  // Función para recargar todos los datos (trips, zones, routes, producciones)
  const reloadAllData = async () => {
    await fetchTrips();
    const zs = await getAllZones();
    setZones(zs.map((z: Zone) => ({ ...z, nombre: normalize(z.nombre) })));
    const routesRes = await fetch('/api/routes?page=0&size=1000');
    const data = await routesRes.json();
    setRoutes((data.content || []).map((r: Route) => ({ ...r, origen: normalize(r.origen), destino: normalize(r.destino) })));
    const ps = await productionsApi.getAll();
    setProducciones(ps.map((p: Production) => ({
      ...p,
      entrepreneur: {
        ...p.entrepreneur,
        nombre: normalize(p.entrepreneur?.nombre || '')
      }
    })));
  };

  const fetchTrips = async () => {
    setLoadingTrips(true);
    setLoadingProgress('Iniciando carga de viajes...');
    
    try {
      console.log('Cargando todos los viajes para Producción...');
      const data = await tripsApi.getAllComplete();
      
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
      setLoadingProgress(`Carga completada: ${tripsWithTotal.length} viajes`);
      console.log(`Viajes cargados para Producción: ${tripsWithTotal.length}`);
    } catch (err) {
      console.error('Error fetching trips for Producción:', err);
      setLoadingProgress('Error al cargar viajes');
    } finally {
      setLoadingTrips(false);
      setTimeout(() => setLoadingProgress(''), 3000);
    }
  };

  // Función para generar producciones automáticamente
  const generateProductions = async (decena: string) => {
    setGeneratingProductions(true);
    setGenerationMessage('');
    setGenerationType(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/productions/generate?decena=${decena}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.generatedCount > 0) {
          setGenerationMessage(`✅ ${result.message}. Se generaron ${result.generatedCount} producciones para la decena ${result.decena}.`);
          setGenerationType('success');
          // Recargar producciones después de generar
          productionsApi.getAll().then(setProducciones);
        } else {
          setGenerationMessage('');
          setGenerationType(null);
        }
      } else {
        const error = await response.json();
        setGenerationMessage(`❌ Error: ${error.error || 'No se pudieron generar las producciones'}`);
        setGenerationType('error');
      }
    } catch (error) {
      setGenerationMessage(`❌ Error de conexión: ${error}`);
      setGenerationType('error');
    } finally {
      setGeneratingProductions(false);
    }
  };

  // Generar producciones automáticamente cuando se carga el componente
  useEffect(() => {
    if (trips.length > 0 && zones.length > 0 && routes.length > 0) {
      generateProductions(decenaSeleccionada);
    }
  }, [trips.length, zones.length, routes.length, decenaSeleccionada]);

  // Eliminar duplicados de fechaDesde y fechaHasta
  // Ya no se usan useState para fechaDesde y fechaHasta, solo las derivadas de la decena
  // const { desde: fechaDesde, hasta: fechaHasta } = getFechasDecena(decenaSeleccionada);

  // Filtrar viajes por decena seleccionada
  const { desde, hasta } = getFechasDecena(decenaSeleccionada);
  const viajesParaCalcular = trips.filter(v => {
    if (!v.travelDate) return false;
    const fechaViaje = v.travelDate.slice(0, 10); // formato YYYY-MM-DD
    return fechaViaje >= desde && fechaViaje <= hasta;
  });

  // DEBUG: Logs para depuración de filtro de fechas
  if (trips.length > 0) {
    const fueraDeRango = trips.filter(v => {
      if (!v.travelDate) return false;
      const fechaViaje = v.travelDate.slice(0, 10);
      return !(fechaViaje >= desde && fechaViaje <= hasta);
    });
    // Solo mostrar si hay decena seleccionada
    console.log('Decena seleccionada:', decenaSeleccionada, '| Rango:', desde, 'a', hasta);
    console.log('Total viajes:', trips.length, '| Viajes en decena:', viajesParaCalcular.length, '| Fuera de rango:', fueraDeRango.length);
    if (fueraDeRango.length > 0) {
      console.log('Fechas fuera de rango:', fueraDeRango.map(v => v.travelDate));
    }
    // Mostrar fechas límite presentes
    const fechasEnDecena = viajesParaCalcular
      .filter(v => v.travelDate)
      .map(v => v.travelDate!.slice(0, 10));
    if (fechasEnDecena.includes(desde)) {
      console.log('Incluye fecha de inicio:', desde);
    } else {
      console.warn('NO incluye fecha de inicio:', desde);
    }
    if (fechasEnDecena.includes(hasta)) {
      console.log('Incluye fecha de fin:', hasta);
    } else {
      console.warn('NO incluye fecha de fin:', hasta);
    }
  }

  // Validar que la fecha "hasta" sea mayor o igual que "desde"
  const fechaValida = true; // Ya no se usa fechaDesde y fechaHasta directamente
  const mensajeError = ''; // Ya no se usa fechaDesde y fechaHasta directamente

  // Usar todos los viajes para calcular por defecto
  // const viajesParaCalcular = trips; // This line is now redundant as viajesParaCalcular is defined above

  // Buscar zona por origen/destino
  const getZonaPorTramo = (origen: string, destino: string): Zone | null => {
    const normOrigen = normalize(origen);
    const normDestino = normalize(destino);
    for (const route of routes) {
      const rOrig = normalize(route.origen);
      const rDest = normalize(route.destino);
      // Comparar ambos sentidos, idéntico a backend
      if (
        (rOrig === normOrigen && rDest === normDestino) ||
        (rOrig === normDestino && rDest === normOrigen)
      ) {
        return route.zona;
      }
    }
    return null;
  };

  // Agrupar viajes por empresa usando normalización igual que backend
  const normalizarEmpresa = (nombre: string) => normalize(nombre);
  const empresasNormalizadas = Array.from(new Set(viajesParaCalcular
    .filter(v => v.companyName && v.companyName.trim() !== "")
    .map(v => normalizarEmpresa(v.companyName!))));

  // Mapear nombre normalizado a nombre original (para mostrar)
  const mapEmpresaOriginal = new Map<string, string>();
  viajesParaCalcular.forEach(v => {
    if (v.companyName && v.companyName.trim() !== "") {
      const norm = normalizarEmpresa(v.companyName);
      if (!mapEmpresaOriginal.has(norm)) {
        mapEmpresaOriginal.set(norm, v.companyName);
      }
    }
  });

  // Calcular resumen por empresario (desde viajes)
  const resumenCalculado = empresasNormalizadas.map(empNorm => {
    const viajesEmp = viajesParaCalcular.filter(v => normalizarEmpresa(v.companyName!) === empNorm);
    let totalServicios = 0;
    let totalIngresos = 0;
    let totalGanancia = 0;
    let sinZona = 0;
    let conZona = 0;
    const viajesSinZona: any[] = [];
    viajesEmp.forEach(v => {
      const zona = getZonaPorTramo(v.origin, v.destination);
      const porcentaje = zona ? zona.porcentaje : 0;
      totalServicios++;
      totalIngresos += v.totalIngresos;
      if (zona) {
        totalGanancia += v.totalIngresos * (porcentaje / 100);
        conZona++;
      } else {
        sinZona++;
        viajesSinZona.push({
          origin: v.origin,
          destination: v.destination,
          companyName: v.companyName,
          travelDate: v.travelDate
        });
      }
    });
    // LOG de depuración por empresa
    if (viajesSinZona.length > 0) {
      console.warn(`Viajes SIN zona para empresa ${mapEmpresaOriginal.get(empNorm) || empNorm}:`, viajesSinZona);
    }
    console.log(`Empresa: ${mapEmpresaOriginal.get(empNorm) || empNorm} | Total viajes: ${viajesEmp.length} | Con zona: ${conZona} | Sin zona: ${sinZona} | Ingresos: ${totalIngresos} | Ganancia calculada: ${totalGanancia}`);
    return { emp: mapEmpresaOriginal.get(empNorm) || empNorm, totalServicios, totalIngresos, totalGanancia, conZona, sinZona };
  });

  // Obtener producciones guardadas en BD para la decena seleccionada
  const produccionesFiltradas = producciones.filter(p => p.decena === decenaSeleccionada);
  const gananciaTotalBD = produccionesFiltradas.reduce((acc, p) => acc + (p.ganancia || 0), 0);

  // Combinar datos calculados con datos guardados
  const resumenCombinado = resumenCalculado.map(calc => {
    const prodBD = produccionesFiltradas.find(p => p.entrepreneur?.nombre === calc.emp);
    return {
      ...calc,
      gananciaBD: prodBD?.ganancia || 0,
      validado: prodBD?.validado || false,
      comentarios: prodBD?.comentarios || ''
    };
  });

  // Detalle por zona para un empresario
  const getDetallePorZona = (empresario: string) => {
    const viajesEmp = viajesParaCalcular.filter(v => v.companyName === empresario);
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
  // Manejar edición de porcentaje de zona
  const handleEditPorcentaje = (zonaId: number, porcentaje: number) => {
    setZonaEditando(zonaId);
    setNuevoPorcentaje(porcentaje.toString());
  };
  const handleSavePorcentaje = async (zonaId: number) => {
    const pct = parseFloat(nuevoPorcentaje);
    if (!isNaN(pct)) {
      setZones(zones.map(z => z.id === zonaId ? { ...z, porcentaje: pct } : z));
      setZonaEditando(null);
      // Recalcular y actualizar producciones en BD para la decena seleccionada
      await generateProductions(decenaSeleccionada);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Producción por Empresario</h1>
      
      {/* Selector de decena */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Ganancia por Decena</h3>
        <div className="mb-4 flex items-center gap-2">
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
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={reloadAllData}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* El resto de la tabla y cálculos usan la decenaSeleccionada para filtrar producciones y mostrar la ganancia correspondiente */}
      
      {/* Indicador de carga */}
      {loadingTrips && (
        <div className="mb-4 p-4 rounded border bg-blue-100 text-blue-700 border-blue-300">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              {loadingProgress}
          </div>
        </div>
      )}
      
      {/* Mensaje de generación de producciones */}
      {generationMessage && generationType === 'success' && (
        <div className="mb-4 p-4 rounded border bg-green-100 text-green-700 border-green-300">
          {generationMessage}
        </div>
      )}
      {generationMessage && generationType === 'error' && (
        <div className="mb-4 p-4 rounded border bg-red-100 text-red-700 border-red-300">
          {generationMessage}
        </div>
      )}
      
      {/* Resumen de ganancias limpio */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <span className="text-sm text-gray-600">Ganancia oficial (guardada en BD): </span>
          <span className="text-lg font-bold text-green-700" title="Este es el valor oficial que se paga">
            ${resumenCombinado.reduce((acc, r) => acc + r.gananciaBD, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">* La ganancia mostrada es la oficial para pago. Si hay diferencias, revisa los datos de viajes, zonas y vuelve a generar producciones.</div>
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
          {resumenCombinado.map(r => (
            <tr key={r.emp} className="border-b">
              <td className="px-4 py-2 font-medium">{r.emp}</td>
              <td className="px-4 py-2">{r.totalServicios}</td>
              <td className="px-4 py-2">${r.totalIngresos.toLocaleString()}</td>
              <td className="px-4 py-2 text-green-700 font-bold" title="Valor oficial para pago">${r.gananciaBD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
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