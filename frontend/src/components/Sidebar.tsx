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
  const modules: { path: string; label: string; icon: React.ElementType; show: boolean }[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, show: true },
    { path: '/trips', label: 'Registro de Recorridos', icon: Route, show: user.canViewTrips },
    { path: '/produccion', label: 'Cálculo de Producción', icon: Calculator, show: user.canViewProduccion },
    { path: '/validacion', label: 'Validación Operacional', icon: CheckCircle, show: user.canViewValidacion },
    { path: '/liquidacion', label: 'Liquidación y Pagos', icon: CreditCard, show: user.canViewLiquidacion },
    { path: '/reportes', label: 'Reportes', icon: BarChart3, show: user.canViewReportes },
    { path: '/configuracion', label: 'Configuración', icon: Settings, show: user.rol === 'ADMIN'},
    { path: '/recorridos', label: 'Zonas', icon: Building2, show: user.rol === 'ADMIN'},
    { path: '/privileges', label: 'Privilegios', icon: Settings, show: user.rol === 'ADMIN'},
  ];

  return (
    <div
      className={`
        fixed top-0 left-0 h-full rounded-e-xl bg-white shadow-xl transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'w-72' : 'w-0'}
        ${isHovered ? 'lg:w-72' : 'lg:w-0'}
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
      <div className={`h-full flex flex-col w-72 ${!isOpen && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-[17.5px] text-black border-b border-gray-200 mb-6">
          <h1 className={`text-xl font-bold ${!isHovered && 'lg:hidden'}`}>Pullman</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-blue-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-1 overflow-y-auto">
          <div className="space-y-1">
            {modules.filter((m) => m.show).map(({ path, label, icon: Icon }) => {
              const active = routerLocation.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`w-full text-left px-3 py-3 text-sm rounded-lg flex items-center group transition-all duration-100 font-medium
                    ${active ? 'bg-blue-50 text-[#01236A] border-r-4 border-[#01236A] shadow-sm' : 'text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-2 ${active ? 'text-[#01236A]' : 'text-gray-400 group-hover:text-[#01236A]'} transition-colors`} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && <span className="ml-2 w-2 h-2 rounded-full bg-[#01236A]"></span>}
                </button>
              );
            })}
          </div>
        </nav>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                Sistema de Liquidación v1.0.1
              </p>
              <p className="text-xs text-gray-500 truncate">
                © {new Date().getFullYear()} Pullman Bus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}