import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import NotificacionesDropdown from './NotificacionesDropdown';
import { useRef, useEffect, useState } from 'react';
import { useNotificaciones } from '../hooks/useAuth';

// Mapeo de rutas a títulos de módulo
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/viajes': 'Gestión de Viajes',
  '/liquidaciones': 'Liquidaciones',
  '/produccion': 'Producción',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
  '/perfil': 'Mi Perfil',
  '/usuarios': 'Gestión de Usuarios',
  '/roles': 'Gestión de Roles',
};

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notificaciones } = useNotificaciones();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const notificacionesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Obtener el título de la página actual
  const getPageTitle = () => {
    const currentPath = location.pathname;
    return ROUTE_TITLES[currentPath] || '';
  };

  useEffect(() => {
    if (!showNotificaciones) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(event.target as Node)
      ) {
        setShowNotificaciones(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificaciones]);

  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  // Función para obtener iniciales del usuario
  const getInitials = (nombre: string) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  // Contar notificaciones no leídas
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);
  const tieneNoLeidas = notificacionesNoLeidas.length > 0;
  const cantidadNoLeidas = notificacionesNoLeidas.length;

  // Agregar animación de respiración usando Tailwind
  const breathingAnimation = `animate-breathing`;

  return (
    <header className="bg-[#F7F8FE] rounded-bl-3xl rounded-br-3xl border-b sticky top-0 z-50 relative">
      <div className="absolute inset-0 rounded-bl-3xl rounded-br-3xl p-[3px] bg-white -z-10"></div>
      <div className="flex items-center justify-between px-6 min-h-[85px]">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 mr-3 md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
           <img src="/pullman-bus-logo.png" onClick={() => navigate('/dashboard')} className="w-64 h-13 cursor-pointer" alt="Pullman_Logo" />
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificacionesRef}>
            <button
              className="p-2 w-10 h-10 text-gray-400 hover:text-gray-700 relative rounded-full hover:bg-gray-50 transition-all hover:scale-105 duration-200 flex items-center justify-center"
              onClick={() => setShowNotificaciones((v) => !v)}
              aria-label="Notificaciones"
            >
              <Bell className="h-7 w-7" />
              {/* Badge con contador de notificaciones no leídas */}
              {tieneNoLeidas ? (
                <span className="absolute -top-0.5 -right-0 bg-red-500 text-white text-xs rounded-full h-4 min-w-4 flex items-center justify-center">
                  {cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0 w-4 h-4 bg-green-500 rounded-full"></span>
              )}
            </button>
            {showNotificaciones && (
              <div className="absolute right-0 mt-2 w-80 z-50 drop-shadow-xl animate-fadein">
                <NotificacionesDropdown onClose={() => setShowNotificaciones(false)} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            
            <div className="flex items-center space-x-2 relative" ref={userMenuRef}>
              <button
                className="w-10 h-10 bg-[#01236A] rounded-full flex items-center justify-center focus:outline-none  shadow-sm hover:scale-105 transition-transform duration-200"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="Abrir menú de usuario"
              >
                <span className="text-white font-bold text-lg select-none" style={{ background: 'transparent' }}>
                  {getInitials(user.nombre)}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-[-10px] top-11 mt-0 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fadein py-2">
                  {/* Bloque de usuario */}
                  <div className="flex flex-col items-center px-4 pt-4 pb-2">
                    <div className="w-14 h-14 bg-[#01236A] rounded-full flex items-center justify-center mb-2 shadow">
                      <span className="text-white font-bold text-xl select-none">{getInitials(user.nombre)}</span>
                    </div>
                    <div className="text-base font-semibold text-gray-800 text-center w-full truncate">{user.nombre}</div>
                    <div className="text-sm text-gray-500 text-center w-full truncate">{user.email}</div>
                  </div>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    className="w-full text-sm text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors duration-200"
                    onClick={() => { setShowUserMenu(false); navigate('/perfil'); }}
                  >
                    <User className="w-4 h-4 text-[#01236A]" /> Perfil
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm transition-colors duration-200"
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                  >
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}