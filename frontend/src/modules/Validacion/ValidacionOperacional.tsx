import { useValidacionApi, Validacion } from '../../hooks/useValidacionApi';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

// Utilidad para generar decenas (1, 2, 3) de los últimos 12 meses
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

function getNombreDecena(decenaStr: string): string {
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  const decena = decenaStr.charAt(0);
  const fecha = new Date(año, mes - 1, 1);
  const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return `Decena ${decena} de ${nombreMes}`;
}

// Utilidad para obtener la decena actual y el formato de fechas igual que en otras pestañas
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
    const ultimoDia = new Date(año, mes, 0).getDate();
    diaFin = ultimoDia;
  }
  const desde = `${año}-${mes.toString().padStart(2, '0')}-${diaInicio.toString().padStart(2, '0')}`;
  const hasta = `${año}-${mes.toString().padStart(2, '0')}-${diaFin.toString().padStart(2, '0')}`;
  return { desde, hasta };
}

export default function ValidacionOperacional() {
  const { fetchValidaciones, validar } = useValidacionApi();
  const { user, canEditValidated } = useAuth();
  const [validaciones, setValidaciones] = useState<Validacion[]>([]);
  // Inicializar selectores igual que en otras pestañas
  const [decenaSeleccionada, setDecenaSeleccionada] = useState<string>(getDecenaActual());
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Estado de comentarios por fila
  const [comentarios, setComentarios] = useState<{ [id: string]: string }>({});

  // Actualizar fechas cuando cambia la decena seleccionada
  useEffect(() => {
    if (decenaSeleccionada) {
      const { desde, hasta } = getFechasDecena(decenaSeleccionada);
      setFechaDesde(desde);
      setFechaHasta(hasta);
    }
  }, [decenaSeleccionada]);

  useEffect(() => {
    let isMounted = true;
    // Incluir producciones aprobadas para que se mantengan visibles
    fetchValidaciones(decenaSeleccionada, true).then(data => {
      if (isMounted) setValidaciones(data);
    }).catch(err => {
      if (isMounted) setFetchError('No tienes permisos para ver las validaciones o el servidor no está disponible.');
    });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [decenaSeleccionada]);

  // Filtrar por decena y fechas
  const validacionesFiltradas = validaciones.filter(v => {
    let pasa = true;
    if (decenaSeleccionada && v.decena !== decenaSeleccionada) pasa = false;
    // Usar v.fecha si existe, si no, usar v.decena
    const fechaComparar = (v as any).fecha || v.decena;
    if (fechaDesde && new Date(fechaComparar) < new Date(fechaDesde)) pasa = false;
    if (fechaHasta && new Date(fechaComparar) > new Date(fechaHasta)) pasa = false;
    return pasa;
  });

  const gananciaTotal = validacionesFiltradas.reduce((acc, v) => acc + v.total, 0);

  const handleAprobar = async (i: number) => {
    const v = validacionesFiltradas[i];
    if (!v || !v.id) return;
    
    // Verificar permisos
    if (v.validado && !canEditValidated()) {
      alert('Solo los administradores pueden cambiar el estado de producciones ya validadas.');
      return;
    }
    
    const comentarioFila = comentarios[String(v.id)] || '';
    const success = await validar(v.id, true, comentarioFila);
    if (success) {
      // Actualizar el estado local en lugar de recargar
      setValidaciones(prev => prev.map(prod => 
        prod.id === v.id 
          ? { ...prod, validado: true, comentarios: comentarioFila }
          : prod
      ));
      setComentarios(prev => ({ ...prev, [String(v.id)]: '' }));
    }
  };

  const handleRechazar = async (i: number) => {
    const v = validacionesFiltradas[i];
    if (!v || !v.id) return;
    
    // Verificar permisos
    if (v.validado && !canEditValidated()) {
      alert('Solo los administradores pueden cambiar el estado de producciones ya validadas.');
      return;
    }
    
    const comentarioFila = comentarios[String(v.id)] || '';
    const success = await validar(v.id, false, comentarioFila);
    if (success) {
      // Actualizar el estado local en lugar de recargar
      setValidaciones(prev => prev.map(prod => 
        prod.id === v.id 
          ? { ...prod, validado: false, comentarios: comentarioFila }
          : prod
      ));
      setComentarios(prev => ({ ...prev, [String(v.id)]: '' }));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Validación Operacional</h1>
      
      {/* Información del usuario actual */}
      {user && (
        <div className="mb-4 p-3 bg-blue-50 rounded border">
          <span className="text-sm text-blue-700">
            Usuario: <strong>{user.nombre}</strong> | 
            Rol: <strong>{user.rol}</strong>
            {canEditValidated() && <span className="text-green-600"> (Puede editar validaciones)</span>}
          </span>
        </div>
      )}
      
      {fetchError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {fetchError}
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Decena</label>
          <select
            className="border rounded px-2 py-1"
            value={decenaSeleccionada}
            onChange={e => setDecenaSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {generarOpcionesDecenas().map(decena => (
              <option key={decena} value={decena}>{getNombreDecena(decena)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Desde</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hasta</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-6">
        <span className="text-lg font-semibold text-blue-700">Ganancia total a depositar: </span>
        <span className="text-2xl font-bold text-green-700">${gananciaTotal.toLocaleString()}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Ganancia</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Comentarios</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {validacionesFiltradas.map((v, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{v.decena}</td>
                <td className="p-2">{v.entrepreneur?.nombre || '-'}</td>
                <td className="p-2">${v.total?.toLocaleString() ?? 0}</td>
                <td className="p-2">
                  {v.validado ? <span className="text-green-600 font-semibold">Aprobado</span> : <span className="text-yellow-600 font-semibold">Pendiente</span>}
                </td>
                <td className="p-2">
                  <input
                    className={`border p-1 text-xs ${v.validado && !canEditValidated() ? 'bg-gray-100' : ''}`}
                    placeholder="Comentarios"
                    value={v.id ? comentarios[String(v.id)] || v.comentarios || '' : ''}
                    onChange={e => v.id && setComentarios(prev => ({ ...prev, [String(v.id)]: e.target.value }))}
                    disabled={v.validado && !canEditValidated()}
                  />
                </td>
                <td className="p-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        className={`px-2 py-1 rounded ${
                          v.validado && !canEditValidated() 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        onClick={() => handleAprobar(i)}
                        disabled={v.validado && !canEditValidated()}
                        title={v.validado && !canEditValidated() ? 'Solo administradores pueden cambiar el estado' : 'Aprobar producción'}
                      >
                        Aprobar
                      </button>
                      <button 
                        className={`px-2 py-1 rounded ${
                          v.validado && !canEditValidated() 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => handleRechazar(i)}
                        disabled={v.validado && !canEditValidated()}
                        title={v.validado && !canEditValidated() ? 'Solo administradores pueden cambiar el estado' : 'Rechazar producción'}
                      >
                        Rechazar
                      </button>
                    </div>
                    {v.validado && !canEditValidated() && (
                      <span className="text-xs text-gray-500">Solo ADMIN puede editar</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {validacionesFiltradas.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 p-4">No hay producciones para validar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500">* Tras aprobar o rechazar, la edición queda bloqueada.</div>
    </div>
  );
} 