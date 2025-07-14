import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User } from 'lucide-react';
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
              className="p-2 text-gray-600 hover:text-gray-900 relative"
              onClick={() => setShowNotificaciones((v) => !v)}
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
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
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
              <p className="text-xs text-gray-500">{user.rol}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}