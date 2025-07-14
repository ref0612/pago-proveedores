import { useRef, useEffect, useState } from 'react';
import { apiGet, apiPut } from '../services/api';
import { useAuth, useNotificaciones } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, FileCheck2, FileText, RefreshCcw, XCircle, MoreVertical, CheckCircle as CheckIcon } from 'lucide-react';

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
      return <FileCheck2 className="w-5 h-5 text-blue-500 mr-2" />;
    case 'AUTORIZACION':
      return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
    case 'LIQUIDACION':
      return <FileText className="w-5 h-5 text-yellow-500 mr-2" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400 mr-2" />;
  }
}

function fechaAmigable(fecha: string) {
  const date = new Date(fecha);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return date.toLocaleString();
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
    <div className="bg-white shadow-2xl rounded-xl p-0 max-h-104 overflow-y-auto border border-gray-200 min-w-[420px] animate-fadein">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-800">Notificaciones</span>
        </div>
        <div className="flex items-center gap-2 relative">
          <button onClick={fetchNotificaciones} title="Recargar" className="p-1 rounded hover:bg-blue-100 transition-colors">
            <RefreshCcw className="w-5 h-5 text-blue-500" />
          </button>
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            title="Más opciones"
            className="p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          {menuAbierto && (
            <div ref={menuRef} className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[200px] animate-fadein">
              <button
                onClick={() => { marcarTodasComoLeidas(); setMenuAbierto(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-blue-50"
              >
                <CheckIcon className="w-4 h-4 text-blue-600" /><span>Marcar todas como leídas</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-2 flex flex-col gap-2 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{notificaciones.filter(n => !n.leida).length} nuevas</span>
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
        <div className="text-center text-gray-500 py-8 animate-pulse">Cargando...</div>
      ) : notificacionesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <Bell className="w-10 h-10 mb-2" />
          <span className="text-sm">No tienes notificaciones</span>
        </div>
      ) : (
        <ul className="p-2 space-y-2">
          {notificacionesFiltradas.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-2 p-3 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${n.leida ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
              onClick={() => handleNotificacionClick(n)}
              title={n.tipo}
            >
              {iconoPorTipo(n.tipo)}
              <div className="flex-1">
                <span className={`block text-sm ${n.leida ? 'text-gray-700' : 'font-semibold text-blue-900'}`}>{n.mensaje}</span>
                <span className="block text-xs text-gray-400 mt-1">{fechaAmigable(n.fecha)}</span>
              </div>
              {!n.leida ? (
                <button
                  onClick={e => { e.stopPropagation(); marcarComoLeida(n.id); }}
                  className="ml-2 w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                  title="Marcar como leída"
                >
                  <span className="w-2 h-2 bg-white rounded-full block"></span>
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); marcarComoNoLeida(n.id); }}
                  className="ml-2 w-4 h-4 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center"
                  title="Marcar como no leída"
                >
                  <span className="w-2 h-2 bg-white rounded-full block"></span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 