import { useState, useEffect } from 'react';
import { Globe, Users, Shield, Bell, Database, User, X } from 'lucide-react';
import { apiGet } from '../services/api';
import React from 'react';
import { AlertContext } from '../App';
import { useContext } from 'react';

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

const rolLabel = {
  ADMIN: 'Administrador',
  VALIDADOR: 'Validador',
  MIEMBRO: 'Miembro',
  INVITADO: 'Invitado',
};

const rolColor = {
  ADMIN: 'bg-purple-100 text-purple-700',
  VALIDADOR: 'bg-blue-100 text-blue-700',
  MIEMBRO: 'bg-green-100 text-green-700',
  INVITADO: 'bg-gray-100 text-gray-700',
};

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('zonas');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { setAlerts } = useContext(AlertContext);

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
        setUsuarios(prev => prev.map(u => u.id === userFromServer.id ? userFromServer : u));
        setEditingUser(null);
        setAlerts(alerts => [...alerts, { message: 'Usuario actualizado correctamente.', type: 'success' }]);
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

  return (
    <div className="max-w-8xl mx-[25px] p-2">
      <h2 className="text-2xl font-bold mb-1 text-gray-900">Configuración del Sistema</h2>
      <p className="text-gray-500 mb-6">Gestiona la configuración general del sistema de liquidación</p>
      <div className="border-b border-gray-200  flex gap-2">
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
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando usuarios...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
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
                  {usuarios.map((user, idx) => (
                    <tr key={user.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900">{user.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rolColor[user.rol]}`}>{rolLabel[user.rol]}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap flex gap-3 items-center">
                        <button
                          className="px-3 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium shadow-sm hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          onClick={() => setEditingUser(user)}
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
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fadein"
              onClick={() => setEditingUser(null)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-0 overflow-hidden animate-fadein-up"
                onClick={e => e.stopPropagation()}
              >
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Editar Usuario</h3>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Contenido */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editingUser.nombre}
                      onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Rol</label>
                    <select
                      value={editingUser.rol}
                      onChange={(e) => {
                        const newRol = e.target.value as Usuario['rol'];
                        setEditingUser({ ...editingUser, rol: newRol });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="VALIDADOR">Validador</option>
                      <option value="MIEMBRO">Miembro</option>
                      <option value="INVITADO">Invitado</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingUser.activo}
                      onChange={(e) => setEditingUser({...editingUser, activo: e.target.checked})}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-700">Usuario activo</label>
                  </div>
                  {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                </div>
                {/* Botones */}
                <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
                    disabled={updatingId === editingUser.id}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdateUser(editingUser)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                    disabled={updatingId === editingUser.id}
                  >
                    {updatingId === editingUser.id ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
