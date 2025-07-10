import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={logout}>Cerrar sesión</button>
      </div>
      {user && (
        <div>
          <p>Bienvenido, <span className="font-semibold">{user.nombre}</span> ({user.rol})</p>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Privilegios de acceso:</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded ${user.canViewTrips ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Viajes:</span> {user.canViewTrips ? '✅ Permitido' : '❌ Denegado'}
              </div>
                          <div className={`p-3 rounded ${user.canViewRecorridos ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              <span className="font-medium">Zonas:</span> {user.canViewRecorridos ? '✅ Permitido' : '❌ Denegado'}
            </div>
              <div className={`p-3 rounded ${user.canViewProduccion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Producción:</span> {user.canViewProduccion ? '✅ Permitido' : '❌ Denegado'}
              </div>
              <div className={`p-3 rounded ${user.canViewValidacion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Validación:</span> {user.canViewValidacion ? '✅ Permitido' : '❌ Denegado'}
              </div>
              <div className={`p-3 rounded ${user.canViewLiquidacion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Liquidación:</span> {user.canViewLiquidacion ? '✅ Permitido' : '❌ Denegado'}
              </div>
              <div className={`p-3 rounded ${user.canViewReportes ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Reportes:</span> {user.canViewReportes ? '✅ Permitido' : '❌ Denegado'}
              </div>
              <div className={`p-3 rounded ${user.canViewUsuarios ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-medium">Usuarios:</span> {user.canViewUsuarios ? '✅ Permitido' : '❌ Denegado'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 