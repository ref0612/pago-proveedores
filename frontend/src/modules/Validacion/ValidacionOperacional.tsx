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

  // Estados para el modal de comentarios
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);
  const [currentValidation, setCurrentValidation] = useState<Validacion | null>(null);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  
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

  const handleAprobarRechazar = (action: 'approve' | 'reject', validacion: Validacion) => {
    if (!validacion.id) {
      console.error('No se puede procesar la validación sin ID');
      return;
    }
    setCurrentAction(action);
    setCurrentValidation(validacion);
    setComment('');
    setCommentError('');
    setShowCommentModal(true);
  };

  const handleConfirmAction = async () => {
    if (!currentValidation?.id || !currentAction) {
      console.error('Validación inválida o acción no especificada');
      return;
    }
    
    // Validar que se ingrese comentario para rechazo
    if (currentAction === 'reject' && !comment.trim()) {
      setCommentError('El comentario es obligatorio para el rechazo');
      return;
    }
    
    const status = currentAction === 'approve' ? 'APROBADO' : 'RECHAZADO';
    const success = await validar(currentValidation.id, status, comment);
    
    if (success) {
      setValidaciones(prev => prev.map(v =>
        v.id === currentValidation.id
          ? { ...v, validado: status === 'APROBADO', comentarios: comment }
          : v
      ));
      setShowCommentModal(false);
    }
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
      setValidaciones(prev => prev.map(prod => {
        if (prod.id === v.id) {
          return {
            ...prod,
            validado: nuevoEstatus === 'APROBADO',
            comentarios: comentarioFila,
            estatus: nuevoEstatus as 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO',
            validadoPor: user?.nombre || 'Sistema',
            fechaValidacion: new Date().toISOString()
          };
        }
        return prod;
      }));
      setComentarios(prev => ({ ...prev, [String(v.id)]: '' }));
      setModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Validación Operacional</h1>
              <p className="text-gray-600 mt-1">Gestión y seguimiento de validaciones</p>
            </div>
            {user && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.nombre}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{user.rol}</span>
                    {canEditValidated() && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Editor
                      </span>
                    )}
                  </div>

                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Ganancia total</p>
                  <p className="text-xl font-bold text-green-600">${gananciaTotal.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decena</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border"
                  value={decenaSeleccionada}
                  onChange={e => setDecenaSeleccionada(e.target.value)}
                >
                  <option value="">Todas las decenas</option>
                  {generarOpcionesDecenas().map(decena => (
                    <option key={decena} value={decena}>{getNombreDecena(decena)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border"
                  value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border"
                  value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de validaciones */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {validacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay validaciones</h3>
              <p className="mt-1 text-sm text-gray-500">No se encontraron validaciones con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decena</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresario</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {validacionesFiltradas.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {v.decena}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {v.entrepreneur?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                        ${v.total?.toLocaleString() ?? '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.validado ? (
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Aprobado
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={v.comentarios || ''}>
                        {v.comentarios || '-'}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAprobarRechazar('approve', v)}
                            className="inline-flex items-center px-3 py-1 rounded-md font-small text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleAprobarRechazar('reject', v)}
                            className="inline-flex items-center px-3 py-1 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                          </button>
                          {user?.rol === 'ADMIN' && (
                            <button
                              onClick={() => handleAbrirModal(i)}
                              className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md bg-gray-50 border border-gray-300 hover:bg-gray-100 text-sm font-medium"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500">* Tras aprobar o rechazar, la edición solo se puede realizar por los administradores</div>

        {/* Modal de cambio de estatus - Mejorado */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="">
          <div className="p-0">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Validación
                </h2>
              </div>
              {modalIndex !== null && validacionesFiltradas[modalIndex]?.entrepreneur && (
                <p className="text-sm text-gray-500 mt-1">
                  Empresario: <span className="font-medium">{validacionesFiltradas[modalIndex].entrepreneur.nombre}</span>
                </p>
              )}
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Sección de Estado */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estado de la Validación
                </h3>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Estado</label>
                  <div className="relative">
                    <select
                      className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white"
                      value={nuevoEstatus}
                      onChange={e => setNuevoEstatus(e.target.value)}
                      disabled={modalIndex !== null && validacionesFiltradas[modalIndex]?.validado && !canEditValidated()}
                    >
                      {opcionesEstatus.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === 'PENDIENTE' && 'Pendiente'}
                          {opt === 'EN_REVISION' && 'En revisión'}
                          {opt === 'APROBADO' && 'Aprobado'}
                          {opt === 'RECHAZADO' && 'Rechazado'}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Comentarios */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                </h3>
                <div className="mt-1">
                  <textarea
                    rows={4}
                    className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-lg p-3 transition duration-150 ease-in-out"
                    placeholder="Agregue un comentario sobre esta validación..."
                    value={modalIndex !== null && validacionesFiltradas[modalIndex]?.id ? comentarios[String(validacionesFiltradas[modalIndex].id)] || '' : ''}
                    onChange={e => {
                      if (modalIndex !== null && validacionesFiltradas[modalIndex]?.id) {
                        setComentarios(prev => ({
                          ...prev,
                          [String(validacionesFiltradas[modalIndex].id)]: e.target.value
                        }));
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {nuevoEstatus === 'RECHAZADO' ? 'Por favor, proporcione una razón detallada para el rechazo.' : 'Los comentarios ayudan a mantener un registro claro de los cambios realizados.'}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarModal}
                  className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  disabled={modalIndex !== null && validacionesFiltradas[modalIndex]?.validado && !canEditValidated()}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}