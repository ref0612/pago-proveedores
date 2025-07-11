import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <a href="/dashboard" className="hover:text-blue-200">Dashboard</a>
          {user.canViewTrips && (
            <a href="/trips" className="hover:text-blue-200">Viajes</a>
          )}
                      {user.canViewRecorridos && (
              <a href="/recorridos" className="hover:text-blue-200">Zonas</a>
            )}
          {user.canViewProduccion && (
            <a href="/produccion" className="hover:text-blue-200">Producción</a>
          )}
          {user.canViewValidacion && (
            <a href="/validacion" className="hover:text-blue-200">Validación</a>
          )}
          {user.canViewLiquidacion && (
            <a href="/liquidacion" className="hover:text-blue-200">Liquidación</a>
          )}
          {user.canViewReportes && (
            <a href="/reportes" className="hover:text-blue-200">Reportes</a>
          )}
          {user.canViewUsuarios && (
            <a href="/usuarios" className="hover:text-blue-200">Usuarios</a>
          )}
          {user.rol === 'ADMIN' && (
            <a href="/privileges" className="hover:text-blue-200">Privilegios</a>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user.nombre} ({user.rol})
          </span>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
} 