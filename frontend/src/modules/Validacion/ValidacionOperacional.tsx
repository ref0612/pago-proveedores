import { useValidacionApi, Validacion } from '../../hooks/useValidacionApi';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

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

  // Estados para el modal de cambio de estatus
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [nuevoEstatus, setNuevoEstatus] = useState<string>('');

  // Opciones de estatus
  const opcionesEstatus = [
    'PENDIENTE',
    'EN_REVISION',
    'APROBADO',
    'RECHAZADO',
  ];

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

  const handleAbrirModal = (i: number) => {
    setModalIndex(i);
    setNuevoEstatus(validacionesFiltradas[i]?.validado ? 'APROBADO' : 'PENDIENTE');
    setModalOpen(true);
  };

  const handleGuardarModal = async () => {
    if (modalIndex === null) return;
    const v = validacionesFiltradas[modalIndex];
    if (!v || !v.id) return;
    // Restricciones de rol
    if (v.validado && !canEditValidated()) {
      alert('Solo los administradores pueden cambiar el estado de producciones ya aprobadas.');
      return;
    }
    // Validar estatus permitido
    if (!canEditValidated() && v.validado && nuevoEstatus !== 'APROBADO') {
      alert('No puedes modificar una producción ya aprobada.');
      return;
    }
    if (!canEditValidated() && !['EN_REVISION', 'APROBADO', 'RECHAZADO'].includes(nuevoEstatus)) {
      alert('No tienes permiso para asignar este estatus.');
      return;
    }
    const comentarioFila = comentarios[String(v.id)] || '';
    const success = await validar(v.id, nuevoEstatus, comentarioFila);
    if (success) {
      setValidaciones(prev => prev.map(prod =>
        prod.id === v.id
          ? { ...prod, validado: nuevoEstatus === 'APROBADO', comentarios: comentarioFila }
          : prod
      ));
      setComentarios(prev => ({ ...prev, [String(v.id)]: '' }));
      setModalOpen(false);
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
                  <span>{v.comentarios || '-'}</span>
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleAbrirModal(i)}
                  >
                    Cambiar estado
                  </button>
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

      {/* Modal de cambio de estatus */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cambiar estatus de producción">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-2">Cambiar estatus de producción</h2>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Nuevo estatus</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={nuevoEstatus}
              onChange={e => setNuevoEstatus(e.target.value)}
              disabled={modalIndex !== null && validacionesFiltradas[modalIndex]?.validado && !canEditValidated()}
            >
              {opcionesEstatus.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Comentario</label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              value={modalIndex !== null && validacionesFiltradas[modalIndex]?.id ? comentarios[String(validacionesFiltradas[modalIndex].id)] || '' : ''}
              onChange={e => {
                if (modalIndex !== null && validacionesFiltradas[modalIndex]?.id) {
                  setComentarios(prev => ({ ...prev, [String(validacionesFiltradas[modalIndex].id)]: e.target.value }));
                }
              }}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleGuardarModal}
              disabled={modalIndex !== null && validacionesFiltradas[modalIndex]?.validado && !canEditValidated()}
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 