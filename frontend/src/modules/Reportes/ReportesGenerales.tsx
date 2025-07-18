import React, { useState } from 'react';
import { useReporteGlobalSummary, useReporteEmpresarioDetallado, useReporteZonaDetallada, useReporteProduccionLiquidaciones, useReporteValidacionesAprobaciones } from '../../hooks/useReportesApi';
import { getAllEntrepreneurs, getAllZones } from '../../services/api';

const REPORTES = [
  { key: 'global', label: 'Resumen Global' },
  { key: 'empresario', label: 'Detallado por Empresario' },
  { key: 'zona', label: 'Detallado por Zona' },
  { key: 'auditoria', label: 'Auditoría de Cambios' },
];

export default function ReportesGenerales() {
  const [tipoReporte, setTipoReporte] = useState('global');
  // Filtros globales
  const [desde, setDesde] = useState('2024-07-01');
  const [hasta, setHasta] = useState('2024-07-10');
  // Empresario
  const [empresarioId, setEmpresarioId] = useState<number>(0);
  const [empresariosList, setEmpresariosList] = useState<{ id: number; nombre: string }[]>([]);
  // Zona
  const [zona, setZona] = useState('');
  const [zonasList, setZonasList] = useState<string[]>([]);
  // Decenas dinámicas para el año actual
  const currentYear = new Date().getFullYear();
  const decenasList = [
    { label: `1ª Decena Julio ${currentYear}`, desde: `${currentYear}-07-01`, hasta: `${currentYear}-07-10` },
    { label: `2ª Decena Julio ${currentYear}`, desde: `${currentYear}-07-11`, hasta: `${currentYear}-07-20` },
    { label: `3ª Decena Julio ${currentYear}`, desde: `${currentYear}-07-21`, hasta: `${currentYear}-07-31` },
  ];
  const [decena, setDecena] = useState('');

  // Estado para paginación de viajes detallados
  const [paginaViajes, setPaginaViajes] = useState(1);
  const viajesPorPagina = 20;
  // Estado para paginación de detalle por zona
  const [paginaZona, setPaginaZona] = useState(1);
  const filasPorPaginaZona = 20;

  // Cargar empresarios y zonas reales al montar
  React.useEffect(() => {
    getAllEntrepreneurs().then((data) => {
      // El backend devuelve {id, nombre, ...}
      setEmpresariosList(data.map((e: any) => ({ id: e.id, nombre: e.nombre })));
    });
    getAllZones().then((data) => {
      // El backend devuelve {id, nombre, ...}
      setZonasList(data.map((z: any) => z.nombre));
    });
  }, []);

  // Hooks de reportes
  const { data, loading, error, fetchSummary } = useReporteGlobalSummary();
  const { data: dataEmp, loading: loadingEmp, error: errorEmp, fetchEmpresario } = useReporteEmpresarioDetallado();
  const { data: dataZona, loading: loadingZona, error: errorZona, fetchZona } = useReporteZonaDetallada();
  const { data: dataProd, loading: loadingProd, error: errorProd, fetchProduccion } = useReporteProduccionLiquidaciones();
  const { data: dataValid, loading: loadingValid, error: errorValid, fetchValidaciones } = useReporteValidacionesAprobaciones();

  // Handlers
  const handleBuscarResumen = () => fetchSummary(desde, hasta);
  const handleBuscarEmpresario = () => {
    fetchEmpresario(empresarioId, desde, hasta);
  };
  const handleBuscarZona = () => {
    if (!zona) {
      // Mostrar todas las zonas: llamar a cada zona y combinar resultados, o pedir al backend endpoint para todas
      // Por ahora, mostrar mensaje
      alert('Selecciona una zona específica para ver el detalle, o implementa endpoint para todas.');
    } else {
      fetchZona(zona, desde, hasta);
    }
  };
  const handleBuscarProduccion = () => fetchProduccion(empresarioId || null, desde, hasta);
  const handleBuscarValidaciones = () => fetchValidaciones(empresarioId || null, zona, desde, hasta);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      {/* Selector de decena y fechas global para todos los reportes */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-600">Decena</label>
          <select
            className="border rounded px-2 py-2 w-[160px] h-[38px]"
            value={decena}
            onChange={e => {
              setDecena(e.target.value);
              const found = decenasList.find(d => d.label === e.target.value);
              if (found) {
                setDesde(found.desde);
                setHasta(found.hasta);
              }
            }}
          >
            <option value="">Seleccionar decena</option>
            {decenasList.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border rounded px-2 py-1" />
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <label className="font-semibold">Tipo de Reporte:</label>
        <select className="border p-2" value={tipoReporte} onChange={e => setTipoReporte(e.target.value)}>
          {REPORTES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </div>
      {/* Filtros y visualización dinámica */}
      {tipoReporte === 'global' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-end gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleBuscarResumen} disabled={loading || !desde || !hasta}>
            {loading ? 'Cargando...' : 'Buscar Resumen'}
          </button>
          {error && <span className="text-red-600 text-sm ml-4">{error}</span>}
          {data && (
            <div className="flex flex-wrap gap-6 ml-6">
              <div className="text-center">
                <div className="text-xs text-gray-500">Recorridos</div>
                <div className="text-xl font-bold">{data.totalRecorridos}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Ingresos</div>
                <div className="text-xl font-bold">${data.totalIngresos?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Empresarios</div>
                <div className="text-xl font-bold">{data.totalEmpresarios}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Zonas</div>
                <div className="text-xl font-bold">{data.totalZonas}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {tipoReporte === 'empresario' && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-bold mb-2">Reporte Detallado por Empresario</h2>
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <select className="border p-2" value={empresarioId} onChange={e => setEmpresarioId(Number(e.target.value))}>
              <option value={0}>Todos los empresarios</option>
              {empresariosList.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleBuscarEmpresario} disabled={loadingEmp || !desde || !hasta}>
              {loadingEmp ? 'Cargando...' : 'Buscar'}
            </button>
            {errorEmp && <span className="text-red-600 text-sm ml-4">{errorEmp}</span>}
          </div>
          {dataEmp && !dataEmp.error && (
            <div>
              <div className="mb-2 font-semibold">Empresario: <span className="text-blue-700">{dataEmp.empresario}</span></div>
              {/* Tabla de viajes detallados con paginación */}
              {Array.isArray(dataEmp.viajes) && dataEmp.viajes.length > 0 && (
                <div className="overflow-x-auto mb-6">
                  <h3 className="font-bold mb-1">Detalle de Viajes</h3>
                  {(() => {
                    // Ordenar por fecha ascendente antes de paginar
                    const viajesOrdenados = [...dataEmp.viajes].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
                    const mostrarColEmpresario = empresarioId === 0;
                    return (
                      <>
                        <table className="min-w-full bg-gray-50 rounded">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2">Fecha</th>
                              {mostrarColEmpresario && <th className="p-2">Empresario</th>}
                              <th className="p-2">Origen</th>
                              <th className="p-2">Destino</th>
                              <th className="p-2">Salida</th>
                              <th className="p-2">Nro Bus</th>
                              <th className="p-2">Zona</th>
                              <th className="p-2">Producción Total</th>
                              <th className="p-2">Ganancia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viajesOrdenados.slice((paginaViajes-1)*viajesPorPagina, paginaViajes*viajesPorPagina).map((v: any, i: number) => (
                              <tr key={i}>
                                <td className="p-2">{v.fecha}</td>
                                {mostrarColEmpresario && <td className="p-2">{v.empresario}</td>}
                                <td className="p-2">{v.origen}</td>
                                <td className="p-2">{v.destino}</td>
                                <td className="p-2">{v.salida}</td>
                                <td className="p-2">{v.nroBus}</td>
                                <td className="p-2">{v.zona || '-'}</td>
                                <td className="p-2">${v.produccionTotal?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                <td className="p-2">{v.ganancia !== null && v.ganancia !== undefined ? `$${v.ganancia.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Controles de paginación */}
                        <div className="flex justify-center items-center gap-2 mt-2">
                          <button className="px-2 py-1 border rounded" onClick={() => setPaginaViajes(p => Math.max(1, p-1))} disabled={paginaViajes === 1}>Anterior</button>
                          <span>Página {paginaViajes} de {Math.ceil(dataEmp.viajes.length / viajesPorPagina)}</span>
                          <button className="px-2 py-1 border rounded" onClick={() => setPaginaViajes(p => Math.min(Math.ceil(dataEmp.viajes.length / viajesPorPagina), p+1))} disabled={paginaViajes === Math.ceil(dataEmp.viajes.length / viajesPorPagina)}>Siguiente</button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {dataEmp && dataEmp.error && (
            <div className="text-red-600 text-sm mt-2">{dataEmp.error}</div>
          )}
        </div>
      )}

      {/* Aquí irán las secciones de los otros reportes, con sus filtros y visualización */}
      {tipoReporte === 'zona' && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-bold mb-2">Reporte Detallado por Zona</h2>
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <select className="border p-2" value={zona} onChange={e => setZona(e.target.value)}>
              <option value="">Todas las zonas</option>
              {zonasList.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleBuscarZona} disabled={loadingZona || !desde || !hasta}>
              {loadingZona ? 'Cargando...' : 'Buscar'}
            </button>
            {errorZona && <span className="text-red-600 text-sm ml-4">{errorZona}</span>}
          </div>
          {dataZona && Array.isArray(dataZona.detalle) && dataZona.detalle.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <h3 className="font-bold mb-1">Detalle por Empresario</h3>
              {(() => {
                // Ordenar por fecha ascendente y luego por empresario
                const detalleOrdenado = [...dataZona.detalle].sort((a, b) => {
                  const fa = new Date(a.fecha).getTime();
                  const fb = new Date(b.fecha).getTime();
                  if (fa !== fb) return fa - fb;
                  return a.empresario.localeCompare(b.empresario);
                });
                return (
                  <>
                    <table className="min-w-full bg-gray-50 rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2">Fecha</th>
                          <th className="p-2">Zona</th>
                          <th className="p-2">Empresario</th>
                          <th className="p-2">Servicios</th>
                          <th className="p-2">Buses</th>
                          <th className="p-2">Producción Total</th>
                          <th className="p-2">% Zona</th>
                          <th className="p-2">Ganancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleOrdenado.slice((paginaZona-1)*filasPorPaginaZona, paginaZona*filasPorPaginaZona).map((fila: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2">{fila.fecha}</td>
                            <td className="p-2">{fila.zona}</td>
                            <td className="p-2">{fila.empresario}</td>
                            <td className="p-2">{fila.cantidadServicios}</td>
                            <td className="p-2">{fila.cantidadBuses}</td>
                            <td className="p-2">${fila.produccionTotal?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="p-2">{fila.porcentajeZona !== null && fila.porcentajeZona !== undefined ? `${fila.porcentajeZona}%` : '-'}</td>
                            <td className="p-2">{fila.ganancia !== null && fila.ganancia !== undefined ? `$${fila.ganancia.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Controles de paginación */}
                    <div className="flex justify-center items-center gap-2 mt-2">
                      <button className="px-2 py-1 border rounded" onClick={() => setPaginaZona(p => Math.max(1, p-1))} disabled={paginaZona === 1}>Anterior</button>
                      <span>Página {paginaZona} de {Math.ceil(dataZona.detalle.length / filasPorPaginaZona)}</span>
                      <button className="px-2 py-1 border rounded" onClick={() => setPaginaZona(p => Math.min(Math.ceil(dataZona.detalle.length / filasPorPaginaZona), p+1))} disabled={paginaZona === Math.ceil(dataZona.detalle.length / filasPorPaginaZona)}>Siguiente</button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          {dataZona && (!Array.isArray(dataZona.detalle) || dataZona.detalle.length === 0) && (
            <div className="text-gray-500 mt-4">No hay datos para mostrar.</div>
          )}
        </div>
      )}
      {tipoReporte === 'auditoria' && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-bold mb-2">Auditoría de Cambios</h2>
          <div className="text-gray-400">(Próximamente...)</div>
        </div>
      )}
    </div>
  );
} 