import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import NotificacionesDropdown from './NotificacionesDropdown';
import { useRef, useEffect, useState } from 'react';
import { useNotificaciones } from '../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notificaciones } = useNotificaciones();
  const navigate = useNavigate();
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const notificacionesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Determinar si hay notificaciones no leídas desde el contexto global
  const tieneNoLeidas = notificaciones.some(n => !n.leida);

  // Agregar animación de respiración usando Tailwind
  const breathingAnimation = `animate-breathing`;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 mr-3 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificacionesRef}>
            <button
              className="p-2 w-9 h-9 text-gray-600 hover:text-gray-900 relative rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center"
              onClick={() => setShowNotificaciones((v) => !v)}
              aria-label="Notificaciones"
            >
              <Bell className="h-10 w-10" />
              {/* Badge con animación de respiración si hay no leídas, verde si no hay */}
              {tieneNoLeidas ? (
                <span className={`absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-breathing`}></span>
              ) : (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
            {showNotificaciones && (
              <div className="absolute right-0 mt-2 w-80 z-50">
                <NotificacionesDropdown onClose={() => setShowNotificaciones(false)} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            
            <div className="flex items-center space-x-2 relative" ref={userMenuRef}>
              <button
                className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="Abrir menú de usuario"
              >
                <User className="w-5 h-5 text-blue-600" />
              </button>
              {showUserMenu && (
                <div className="absolute right-[-10px] top-11 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadein py-2">
                  {/* Elimino la opción de ajustes de cuenta */}
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2 text-sm"
                    onClick={() => { setShowUserMenu(false); navigate('/perfil'); }}
                  >
                    <User className="w-4 h-4 text-blue-500" /> Perfil
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
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