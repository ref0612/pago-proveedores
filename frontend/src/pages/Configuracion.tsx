import { useState, useEffect } from 'react';
import { Globe, Users, Shield, Bell, Database } from 'lucide-react';
import { SpinnerWithText } from '../components/ui/Spinner';
import { apiGet } from '../services/api';
import { AlertContext } from '../App';
import { useContext } from 'react';
import UserEditModal from '../components/UserEditModal';
import RegistroRecorridos from '../modules/Recorridos/RegistroRecorridos';
import Privileges from './Privileges';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
  activo: boolean;
  password?: string;
}

interface NewUser {
  nombre: string;
  email: string;
  password: string;
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
  const [activeStatusTab, setActiveStatusTab] = useState<'active' | 'inactive'>('active');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    nombre: '',
    email: '',
    password: '',
    rol: 'MIEMBRO',
    activo: true
  });
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { setAlerts } = useContext(AlertContext);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }
    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*)';
    }
    return '';
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordError(validatePassword(value));
  };
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  const handleResetPassword = async (userId: number) => {
    setResettingPasswordFor(userId);
    setNewPassword('');
    setShowPasswordResetModal(true);
  };

  const submitPasswordReset = async () => {
    if (!newPassword || !resettingPasswordFor) return;
    
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setResettingPasswordFor(resettingPasswordFor); // Set loading state
      const response = await fetch(`http://localhost:8080/api/users/${resettingPasswordFor}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAlerts([{ message: 'Contraseña restablecida correctamente', type: 'success' }]);
        setShowPasswordResetModal(false);
        setNewPassword('');
        setError('');
      } else {
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error: any) {
      setError(error.message || 'Error al restablecer la contraseña');
    } finally {
      setResettingPasswordFor(null);
    }
  };


  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(prev => [...prev, data.user || data]);
        setShowNewUserModal(false);
        setNewUser({
          nombre: '',
          email: '',
          password: '',
          rol: 'MIEMBRO',
          activo: true
        });
        setAlerts([{ message: 'Usuario creado correctamente', type: 'success' }]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }
    } catch (error: any) {
      setError(error.message || 'Error al crear el usuario');
    }
  };

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }
    } catch (error: any) {
      setError(error.message || 'Error de conexión');
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
                    ? 'border-b-2 border-[#01236A] text-[#01236A]'
                    : 'text-gray-500 hover:text-[#01236A] hover:border-[#01236A] hover:bg-gray-50'
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
            <RegistroRecorridos />
          ) : activeTab === 'permisos' ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Matriz de Permisos</h3>
                  <p className="text-gray-500 text-sm">Administra los permisos para cada rol en el sistema</p>
                </div>
              </div>
              <Privileges />
            </div>
          ) : activeTab === 'usuarios' ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h3>
                    <p className="text-gray-500 text-sm">Administra usuarios y sus permisos en el sistema</p>
                  </div>
                  <button 
                    onClick={() => setShowNewUserModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition-colors"
                  >
                    <Users className="w-4 h-4" /> Agregar Usuario
                  </button>
                </div>
                
                {/* Pestañas de filtrado */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveStatusTab('active')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeStatusTab === 'active'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Activos
                      <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {usuarios.filter(u => u.activo).length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveStatusTab('inactive')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeStatusTab === 'inactive'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Inactivos
                      <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {usuarios.filter(u => !u.activo).length}
                      </span>
                    </button>
                  </nav>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <SpinnerWithText size="lg" text="Cargando usuarios..." />
                </div>
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
                      {usuarios
                        .filter(user => activeStatusTab === 'active' ? user.activo : !user.activo)
                        .map((user, idx) => (
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
                          <td className="px-4 py-3 whitespace-nowrap space-x-2">
                            <button
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 hover:text-blue-50 shadow transition-colors"
                              onClick={() => {
                                setEditingUser(user);
                                setLastEditedId(null);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-medium shadow-sm hover:bg-amber-600 hover:text-amber-50 shadow transition-colors"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              Restablecer contraseña
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {usuarios.filter(user => activeStatusTab === 'active' ? user.activo : !user.activo).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                            No hay usuarios {activeStatusTab === 'active' ? 'activos' : 'inactivos'} para mostrar
                          </td>
                        </tr>
                      )}
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

      {/* New User Modal */}
      {showNewUserModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewUserModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Usuario</h3>
                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={newUser.nombre}
                      onChange={handleNewUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleNewUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      id="rol"
                      name="rol"
                      value={newUser.rol}
                      onChange={handleNewUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="activo"
                      name="activo"
                      type="checkbox"
                      checked={newUser.activo}
                      onChange={handleNewUserChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                      Usuario activo
                    </label>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordResetModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Restablecer Contraseña</h3>
                <button 
                  onClick={() => setShowPasswordResetModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nueva contraseña"
                    />
                    {passwordError && (
                      <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                    )}
                    {!passwordError && newPassword && (
                      <p className="mt-1 text-xs text-green-600"> La contraseña cumple con los requisitos</p>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>La contraseña debe contener:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                        Al menos 8 caracteres
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        Al menos una letra mayúscula
                      </li>
                      <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        Al menos una letra minúscula
                      </li>
                      <li className={/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        Al menos un número
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        Al menos un carácter especial (ej: !@#$%^&*)
                      </li>
                    </ul>
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordResetModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={submitPasswordReset}
                    disabled={!newPassword || !!passwordError}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                      !newPassword || passwordError ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {resettingPasswordFor ? 'Guardar Contraseña' : 'Guardar Contraseña'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
