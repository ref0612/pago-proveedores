import { useState } from 'react';
import { Globe, Users, Shield, Bell, Database } from 'lucide-react';

const tabs = [
  { label: 'Configuración de Zonas', key: 'zonas', icon: <Globe className="w-5 h-5 mr-2" /> },
  { label: 'Gestión de Usuarios', key: 'usuarios', icon: <Users className="w-5 h-5 mr-2" /> },
  { label: 'Matriz de Permisos', key: 'permisos', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Seguridad', key: 'seguridad', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Notificaciones', key: 'notificaciones', icon: <Bell className="w-5 h-5 mr-2" /> },
  { label: 'Sistema', key: 'sistema', icon: <Database className="w-5 h-5 mr-2" /> },
];

const mockUsers = [
  {
    nombre: 'Carlos Rodríguez',
    email: 'admin@pullman.cl',
    rol: 'Administrador',
    estado: 'Activo',
  },
  {
    nombre: 'María González',
    email: 'validador@pullman.cl',
    rol: 'Validador',
    estado: 'Activo',
  },
];

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('zonas');

  return (
    <div className="max-w-8xl mx-auto p-6">
      <h2 className="text-3xl font-bold mt-6 mb-1">Configuración del Sistema</h2>
      <p className="text-gray-500 mb-6">Gestiona la configuración general del sistema de liquidación</p>
      <div className=" bg-white border-b rounded-lgborder-gray-200 flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors text-base font-medium focus:outline-none flex items-center ${activeTab === tab.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'usuarios' ? (
        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h3>
              <p className="text-gray-500 text-sm">Administra usuarios y sus permisos en el sistema</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition-colors">
              <Users className="w-4 h-4" /> Agregar Usuario
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Rol</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user, idx) => (
                  <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">{user.nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.rol}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{user.estado}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-3 items-center">
                      <button className="text-blue-600 hover:underline text-sm font-medium">Editar</button>
                      <button className="text-red-500 hover:underline text-sm font-medium">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 min-h-[200px] flex items-center justify-center text-gray-400">
          <span>Contenido de la pestaña <b>{tabs.find(t => t.key === activeTab)?.label}</b> próximamente...</span>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
