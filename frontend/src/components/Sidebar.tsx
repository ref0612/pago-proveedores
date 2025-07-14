import { useNavigate, useLocation } from 'react-router-dom';
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
  const routerLocation = useLocation();

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

  // Definición de rutas y módulos
  const modules: { path: string; label: string; icon: React.ElementType; show: boolean; extra?: boolean }[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, show: true },
    { path: '/trips', label: 'Viajes', icon: Route, show: user.canViewTrips },
    { path: '/produccion', label: 'Producción', icon: Calculator, show: user.canViewProduccion },
    { path: '/validacion', label: 'Validación', icon: CheckCircle, show: user.canViewValidacion },
    { path: '/liquidacion', label: 'Liquidación', icon: CreditCard, show: user.canViewLiquidacion },
    { path: '/reportes', label: 'Reportes', icon: BarChart3, show: user.canViewReportes },
    { path: '/recorridos', label: 'Zonas', icon: Building2, show: true, extra: true },
    { path: '/usuarios', label: 'Usuarios', icon: Users, show: true, extra: true },
    { path: '/privileges', label: 'Privilegios', icon: Settings, show: true, extra: true },
  ];

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
            {modules.filter((m) => m.show && !m.extra).map(({ path, label, icon: Icon }) => {
              const active = routerLocation.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center group transition-all duration-200 font-medium
                    ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && <span className="ml-2 w-2 h-2 rounded-full bg-blue-600"></span>}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            {modules.filter((m) => m.show && m.extra).map(({ path, label, icon: Icon }) => {
              const active = routerLocation.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center group transition-all duration-200 text-sm
                    ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`w-4 h-4 mr-3 ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>}
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
}