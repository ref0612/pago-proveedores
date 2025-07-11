import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function Sidebar({ isOpen, onClose, isHovered, onMouseEnter, onMouseLeave }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Overlay para cerrar el sidebar al hacer clic fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-64'}
          ${isHovered ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
          lg:static lg:z-auto lg:shadow-lg
        `}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-xl font-bold">Pullman</h1>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-blue-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Dashboard
            </button>

            {user.canViewTrips && (
              <button
                onClick={() => handleNavigation('/trips')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Viajes
              </button>
            )}

            {user.canViewRecorridos && (
              <button
                onClick={() => handleNavigation('/recorridos')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
                Zonas
              </button>
            )}

            {user.canViewProduccion && (
              <button
                onClick={() => handleNavigation('/produccion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Producción
              </button>
            )}

            {user.canViewValidacion && (
              <button
                onClick={() => handleNavigation('/validacion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validación
              </button>
            )}

            {user.canViewLiquidacion && (
              <button
                onClick={() => handleNavigation('/liquidacion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Liquidación
              </button>
            )}

            {user.canViewReportes && (
              <button
                onClick={() => handleNavigation('/reportes')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reportes
              </button>
            )}

            {user.canViewUsuarios && (
              <button
                onClick={() => handleNavigation('/usuarios')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Usuarios
              </button>
            )}

            {user.rol === 'ADMIN' && (
              <button
                onClick={() => handleNavigation('/privileges')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Privilegios
              </button>
            )}
          </div>
        </nav>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 mt-64">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
              <p className="text-xs text-gray-500">{user.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-18 ml-10 flex items-center justify-right px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
} 