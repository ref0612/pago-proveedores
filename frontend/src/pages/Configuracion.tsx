import { useState, useEffect } from 'react';
import { Globe, Users, Shield, Bell, Database } from 'lucide-react';
import { apiGet } from '../services/api';
import { AlertContext } from '../App';
import { useContext } from 'react';
import UserEditModal from '../components/UserEditModal';
import ZonasConfig from '../components/configuracion/ZonasConfig';


interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
  activo: boolean;
}

const tabs = [
  { label: 'Configuración de Zonas', key: 'zonas', icon: <Globe className="w-5 h-5 mr-2" /> },
  { label: 'Gestión de Usuarios', key: 'usuarios', icon: <Users className="w-5 h-5 mr-2" /> },
  { label: 'Matriz de Permisos', key: 'permisos', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Seguridad', key: 'seguridad', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Notificaciones', key: 'notificaciones', icon: <Bell className="w-5 h-5 mr-2" /> },
  { label: 'Sistema', key: 'sistema', icon: <Database className="w-5 h-5 mr-2" /> },
];

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VALIDADOR', label: 'Validador' },
  { value: 'MIEMBRO', label: 'Miembro' },
  { value: 'INVITADO', label: 'Invitado' },
];

const rolLabel = {
  ADMIN: 'Administrador',
  VALIDADOR: 'Validador',
  MIEMBRO: 'Miembro',
  INVITADO: 'Invitado',
};

const rolColor = {
  ADMIN: 'bg-purple-100 text-purple-700',
  VALIDADOR: 'bg-blue-100 text-blue-700',
  MIEMBRO: 'bg-yellow-100 text-yellow-700',
  INVITADO: 'bg-gray-100 text-gray-700',
};

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { setAlerts } = useContext(AlertContext);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  


  const handleUpdateUser = async (updatedUser: Usuario) => {
    setError('');
    setUpdatingId(updatedUser.id);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      if (response.ok) {
        const userFromServer = await response.json();
        const updated = userFromServer.user ? userFromServer.user : userFromServer;
        setUsuarios(prev => prev.map(u => u.id == updated.id ? updated : u));
        setEditingUser(null);
        setAlerts([{ message: 'Usuario actualizado correctamente.', type: 'success' }]);
      } else {
        setError('Error al actualizar usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios') {
      setLoading(true);
      setError('');
      apiGet('/users')
        .then(data => setUsuarios(data))
        .catch(() => setError('Error al cargar usuarios'))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  // Load users when usuarios tab is active
  useEffect(() => {
    if (activeTab === 'usuarios') {
      setLoading(true);
      setError('');
      apiGet('/users')
        .then(data => {
          console.log('Usuarios cargados:', data);
          setUsuarios(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error('Error cargando usuarios:', err);
          setError('Error al cargar usuarios');
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className='py-6'>
      <div className="max-w-8xl mx-[30px] p-0">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-500 mb-6">Gestiona la configuración general del sistema de liquidación</p>
        
        {/* Navigation Tabs */}
        <nav className="bg-white shadow rounded-t-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-4 text-xs font-medium flex items-center transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange(tab.key)}
                type="button"
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {activeTab === 'zonas' ? (
            <ZonasConfig />
          ) : activeTab === 'usuarios' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h3>
                  <p className="text-gray-500 text-sm">Administra usuarios y sus permisos en el sistema</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition-colors">
                  <Users className="w-4 h-4" /> Agregar Usuario
                </button>
              </div>
              
              {loading ? (
                <div className="text-center text-gray-500 py-8">Cargando usuarios...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold">ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Rol</th>
                        <th className="px-4 py-3 text-left font-semibold">Estado</th>
                        <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((user, idx) => (
                        <tr key={user.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{user.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{user.nombre}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rolColor[user.rol]}`}>
                              {rolLabel[user.rol]}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 hover:text-blue-50 shadow transition-colors"
                              onClick={() => {
                                setEditingUser(user);
                                setLastEditedId(null);
                              }}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {editingUser && (
                <UserEditModal
                  user={editingUser}
                  onChange={u => setEditingUser(u)}
                  onClose={() => { setEditingUser(null); setError(''); }}
                  onSave={() => handleUpdateUser(editingUser)}
                  saving={updatingId === editingUser.id}
                  error={error}
                  roles={roles}
                />
              )}
            </>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center text-gray-400">
              <span>
                Contenido de la pestaña <b>{tabs.find(t => t.key === activeTab)?.label}</b> próximamente...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
