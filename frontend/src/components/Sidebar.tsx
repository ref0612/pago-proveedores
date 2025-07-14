import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Home,
  Route,
  Calculator,
  CheckCircle,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Users,
  Building2,
} from 'lucide-react';

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
    <div
      className={`
        fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'w-64' : 'w-0'}
        ${isHovered ? 'lg:w-64' : 'lg:w-0'}
        overflow-hidden
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        onMouseLeave();
        if (isOpen) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sidebar content */}
      <div className={`h-full flex flex-col w-64 ${!isOpen && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className={`text-xl font-bold ${!isHovered && 'lg:hidden'}`}>Pullman</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-blue-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
            >
              <Home className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
              Dashboard
            </button>

            {user.canViewTrips && (
              <button
                onClick={() => handleNavigation('/trips')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <Route className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                Viajes
              </button>
            )}

            {user.canViewProduccion && (
              <button
                onClick={() => handleNavigation('/produccion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <Calculator className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                Producción
              </button>
            )}

            {user.canViewValidacion && (
              <button
                onClick={() => handleNavigation('/validacion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <CheckCircle className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                Validación
              </button>
            )}

            {user.canViewLiquidacion && (
              <button
                onClick={() => handleNavigation('/liquidacion')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <CreditCard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                Liquidación
              </button>
            )}

            {user.canViewReportes && (
              <button
                onClick={() => handleNavigation('/reportes')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
              >
                <BarChart3 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                Reportes
              </button>
            )}
          </div>

          <button
            onClick={() => { }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center group"
          >
            <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
            Configuraciones
          </button>

          <div className="mt-1 ml-8 space-y-1">
            <button
              onClick={() => handleNavigation('/recorridos')}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center text-sm text-gray-600"
            >
              <Building2 className="w-4 h-4 mr-3 text-gray-400" />
              Zonas
            </button>

            <button
              onClick={() => handleNavigation('/usuarios')}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center text-sm text-gray-600"
            >
              <Users className="w-4 h-4 mr-3 text-gray-400" />
              Usuarios
            </button>

            <button
              onClick={() => handleNavigation('/privileges')}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center text-sm text-gray-600"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Privilegios
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}