import { useRef, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPut } from '../services/api';
import { useAuth, useNotificaciones } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, FileCheck2, FileText, RefreshCcw, XCircle, MoreVertical, CheckCircle as CheckIcon, Loader2 } from 'lucide-react';
import { SpinnerWithText } from './ui/Spinner';

interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: string;
  referenciaId?: number;
}

interface Props {
  onClose: () => void;
  onNoLeidasChange?: (hasNoLeidas: boolean) => void;
  onCantidadNoLeidasChange?: (cantidad: number) => void;
}

function iconoPorTipo(tipo: string) {
  switch (tipo) {
    case 'VALIDACION':
      return <FileCheck2 className=" p-2 rounded-lg mr-3 bg-orange-100 border-orange-200 text-orange-800 w-8 h-8 text-blue-500 mr-2" />;
    case 'AUTORIZACION':
      return <CheckCircle className=" p-2 rounded-lg mr-3 bg-orange-100 border-orange-200 text-orange-800 w-8 h-8 text-green-500 mr-2" />;
    case 'LIQUIDACION':
      return <FileText className=" p-2 rounded-lg mr-3 bg-orange-100 border-orange-200 text-orange-800 w-8 h-8 text-yellow-500 mr-2" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400 mr-2" />;
  }
}


export default function NotificacionesDropdown({ onClose, onNoLeidasChange, onCantidadNoLeidasChange }: Props) {
  const { user } = useAuth();
  const { notificaciones, setNotificaciones, recargarNotificaciones } = useNotificaciones();
  const [loading, setLoading] = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  const fetchNotificaciones = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiGet(`/notificaciones/${user.rol}`);
      setNotificaciones(res);
      
      if (onNoLeidasChange) {
        onNoLeidasChange(res.some((n: Notificacion) => !n.leida));
      }
      if (onCantidadNoLeidasChange) {
        onCantidadNoLeidasChange(res.filter((n: Notificacion) => !n.leida).length);
      }
    } catch (e) {
      if (onNoLeidasChange) onNoLeidasChange(false);
      if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // eslint-disable-next-line
  }, [user]);

  const marcarComoLeida = async (id: number) => {
    try {
      await apiPut(`/notificaciones/${id}/leida`);
      setNotificaciones((prev: Notificacion[]) => {
        const updated = prev.map((n: Notificacion) => n.id === id ? { ...n, leida: true } : n);
        if (onNoLeidasChange) onNoLeidasChange(updated.some((n) => !n.leida));
        if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(updated.filter((n) => !n.leida).length);
        return updated;
      });
    } catch (e) {
      // Manejo de error
    }
  };

  // Nueva función para marcar como NO leída (requiere endpoint PATCH/PUT en backend)
  const marcarComoNoLeida = async (id: number) => {
    try {
      await apiPut(`/notificaciones/${id}/no-leida`); // Debes implementar este endpoint en backend
      setNotificaciones((prev: Notificacion[]) => {
        const updated = prev.map((n: Notificacion) => n.id === id ? { ...n, leida: false } : n);
        if (onNoLeidasChange) onNoLeidasChange(updated.some((n) => !n.leida));
        if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(updated.filter((n) => !n.leida).length);
        return updated;
      });
    } catch (e) {
      // Manejo de error
    }
  };

  const marcarTodasComoLeidas = async () => {
    setMarcandoTodas(true);
    try {
      await Promise.all(
        notificaciones.filter(n => !n.leida).map(n => apiPut(`/notificaciones/${n.id}/leida`))
      );
      setNotificaciones((prev) => prev.map(n => ({ ...n, leida: true })));
      if (onNoLeidasChange) onNoLeidasChange(false);
      if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(0);
    } catch (e) {
      // Manejo de error
    } finally {
      setMarcandoTodas(false);
    }
  };

  const eliminarTodasLasNotificaciones = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
      return;
    }
    try {
      await apiPut('/notificaciones/limpiar');
      setNotificaciones([]);
      if (onNoLeidasChange) onNoLeidasChange(false);
      if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(0);
      setMenuAbierto(false);
    } catch (e) {
      console.error('Error al eliminar notificaciones:', e);
    }
  };

  const eliminarNotificacion = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Llamar al endpoint de eliminación
      await apiDelete(`/notificaciones/${id}`);
      
      // Actualizar el estado local eliminando la notificación
      setNotificaciones(prev => {
        const updated = prev.filter(n => n.id !== id);
        const tieneNoLeidas = updated.some(n => !n.leida);
        if (onNoLeidasChange) onNoLeidasChange(tieneNoLeidas);
        if (onCantidadNoLeidasChange) onCantidadNoLeidasChange(updated.filter(n => !n.leida).length);
        return updated;
      });
      
      // Recargar las notificaciones para asegurarnos de que todo esté sincronizado
      recargarNotificaciones();
    } catch (e) {
      console.error('Error al eliminar la notificación:', e);
      // Recargar las notificaciones en caso de error
      fetchNotificaciones();
    }
  };

  const handleNotificacionClick = async (n: Notificacion) => {
    if (!n.leida) {
      await marcarComoLeida(n.id);
    }
    // Redirección según tipo
    if (n.tipo === 'VALIDACION') {
      navigate(`/validacion/`);
      onClose();
    } else if (n.tipo === 'AUTORIZACION') {
      navigate(`/produccion/`);
      onClose();
    } else if (n.tipo === 'LIQUIDACION') {
      navigate(`/liquidacion/`);
      onClose();
    }
  };

  const notificacionesFiltradas = soloNoLeidas
    ? notificaciones.filter(n => !n.leida)
    : notificaciones;

  return (
    <div className="bg-white shadow-1xl rounded-xl max-h-104 overflow-y-auto border border-gray-200 w-[90vw] max-w-xs sm:min-w-[320px] md:min-w-[420px] animate-fadein ml-0 md:ml-[-80px]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-gray-50 bg-opacity-45 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-800">Notificaciones</span>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            title="Más opciones"
            className="p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          {menuAbierto && (
            <div ref={menuRef} className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[220px] animate-fadein overflow-hidden">
              <button
                onClick={() => { marcarTodasComoLeidas(); setMenuAbierto(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100"
              >
                <CheckIcon className="w-4 h-4 text-blue-600" />
                <span>Marcar todas como leídas</span>
              </button>
              <button
                onClick={() => { eliminarTodasLasNotificaciones(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Limpiar notificaciones</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-2 flex flex-col gap-2 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <span className={`text-xs rounded-lg px-3 py-0.5 ${notificaciones.filter(n => !n.leida).length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {notificaciones.filter(n => !n.leida).length} {notificaciones.filter(n => !n.leida).length === 1 ? 'nueva' : 'nuevas'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar solo no leídas</span>
            <button
              className={`relative w-6 h-3.5 rounded-full transition-colors duration-200 focus:outline-none ${soloNoLeidas ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setSoloNoLeidas(v => !v)}
              aria-pressed={soloNoLeidas}
              aria-label="Mostrar solo no leídas"
            >
              <span
                className={`absolute left-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform duration-200 ${soloNoLeidas ? 'translate-x-2.5' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <SpinnerWithText size="md" text="Cargando notificaciones..." />
        </div>
      ) : notificacionesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <span className="text-sm">No tienes notificaciones</span>
        </div>
      ) : (
        <ul className="p-0 space-y-0">
          {notificacionesFiltradas.map((n) => (
            <li
              key={n.id}
              className={`group flex items-start gap-2 p-3 border-b border-gray-200 shadow-sm transition-all duration-200 cursor-pointer ${n.leida ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
              onClick={() => handleNotificacionClick(n)}
              title={n.tipo}
            >
              {iconoPorTipo(n.tipo)}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className={`block text-sm ${n.leida ? 'text-gray-700' : 'font-semibold text-blue-900'}`}>
                    {n.mensaje}
                  </span>
                  <button
                    onClick={(e) => eliminarNotificacion(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                    title="Marcar como leída y ocultar"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                <span className="block text-xs text-gray-500 mt-1">
                  {new Date(n.fecha).toLocaleTimeString('es-CL', {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                </span>
              <div className="flex items-center gap-2">
                
                <button
                  onClick={e => { 
                    e.stopPropagation(); 
                    n.leida ? marcarComoNoLeida(n.id) : marcarComoLeida(n.id); 
                  }}
                  className="text-[10px] font-light text-blue-600 hover:text-blue-800 hover:text-blue-50"
                >
                  {n.leida ? 'Marcar como no leída' : 'Marcar como leída'}
                </button>
              </div>
                </div>
                 
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}