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

  const getInitials = (nombre: string) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
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
        fixed top-0 left-0 h-full rounded-br-3xl shadow-md transition-all duration-300 ease-in-out z-50
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
        <div className="flex items-center justify-between p-3 text-black bg-[#F7F8FE]">
          <div className={`flex items-center ${!isOpen && !isHovered ? 'lg:justify-center' : 'justify-start'} w-full`}>
            {isOpen || isHovered ? (
              <img 
                src="/Pullman_Bus.png" 
                alt="Pullman Bus" 
                className="my-1 h-8 object-contain"
              />
            ) : (
              <div className="lg:flex items-center justify-center w-full">
                <img 
                  src="/Pullman_Bus.png"
                  alt="Pullman"
                  className="h-8 object-contain hidden lg:block"
                />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-1 overflow-y-auto bg-[#F7F8FE]">
          <div className="space-y-1 mt-6">
            {modules.filter((m) => m.show).map(({ path, label, icon: Icon }) => {
              const active = routerLocation.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`w-full text-left px-3 py-4 text-sm rounded-lg flex items-center group transition-all duration-100 font-medium
                    ${active ? 'bg-blue-50 text-[#01236A] border-r-4 border-[#01236A] shadow-sm' : 'text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-2 ${active ? 'text-[#01236A]' : 'text-gray-400 group-hover:text-[#01236A]'} transition-colors`} />
                  <span className={`flex-1 text-left ${active ? 'text-[#01236A]' : 'text-gray-500 group-hover:text-[#01236A]'}`}>{label}</span>
                  {active && <span className="ml-2 w-2 h-2 rounded-full bg-[#01236A]"></span>}
                </button>
              );
            })}
          </div>
        </nav>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-[#01236A] opacity-90">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                Sistema de Liquidación v1.0.1
              </p>
              <p className="text-xs text-white truncate">
                © {new Date().getFullYear()} Pullman Bus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}