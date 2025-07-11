import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
  activo: boolean;
  canViewTrips: boolean;
  canViewRecorridos: boolean;
  canViewProduccion: boolean;
  canViewValidacion: boolean;
  canViewLiquidacion: boolean;
  canViewReportes: boolean;
  canViewUsuarios: boolean;
}

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    console.log('useEffect Usuarios');
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        // Solo actualiza si los datos realmente cambiaron
        setUsuarios(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
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
      } else {
        setError('Error al actualizar usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  // Habilitar todos los privilegios para un usuario (ADMIN)
  const handleEnableAllPrivileges = (userId: number) => {
    const userToUpdate = usuarios.find(u => u.id === userId);
    if (userToUpdate) {
      const updatedUser = {
        ...userToUpdate,
        canViewTrips: true,
        canViewRecorridos: true,
        canViewProduccion: true,
        canViewValidacion: true,
        canViewLiquidacion: true,
        canViewReportes: true,
        canViewUsuarios: true,
      };
      handleUpdateUser(updatedUser);
    }
  };

  const handleTogglePrivilege = (userId: number, privilege: keyof User, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const userToUpdate = usuarios.find(u => u.id === userId);
    if (userToUpdate) {
      const valorActual = (userToUpdate as any)[privilege];
      const nuevoValor = !valorActual;
      console.log(`Intentando cambiar privilegio '${privilege}' para usuario ${userId}: actual=${valorActual}, nuevo=${nuevoValor}`);
      // Solo actualizar si el valor realmente cambia
      if (valorActual !== nuevoValor) {
        const updatedUser = { ...userToUpdate, [privilege]: nuevoValor };
        console.log('Disparando update de usuario:', updatedUser);
        handleUpdateUser(updatedUser);
      } else {
        console.log('No se dispara update porque el valor no cambió');
      }
    }
  };

  if (!user?.canViewUsuarios) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No tienes permisos para acceder a esta sección.
        </div>
      </div>
    );
  }

  // Solo mostrar loading si no se está editando
  if (loading && !editingUser) {
    return <div className="p-8">Cargando usuarios...</div>;
  }

  console.log('Render Usuarios');
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Rol</th>
              <th className="px-4 py-2 border">Activo</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{usuario.id}</td>
                <td className="px-4 py-2 border">{usuario.nombre}</td>
                <td className="px-4 py-2 border">{usuario.email}</td>
                <td className="px-4 py-2 border text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    usuario.rol === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    usuario.rol === 'VALIDADOR' ? 'bg-blue-100 text-blue-800' :
                    usuario.rol === 'MIEMBRO' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <span className={`px-2 py-1 rounded text-xs ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => setEditingUser(usuario)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={editingUser.rol}
                  onChange={(e) => {
                    const newRol = e.target.value as 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
                    setEditingUser({
                      ...editingUser,
                      rol: newRol,
                      canViewTrips: newRol === 'ADMIN' ? true : false,
                      canViewRecorridos: newRol === 'ADMIN' ? true : false,
                      canViewProduccion: newRol === 'ADMIN' ? true : false,
                      canViewValidacion: newRol === 'ADMIN' ? true : false,
                      canViewLiquidacion: newRol === 'ADMIN' ? true : false,
                      canViewReportes: newRol === 'ADMIN' ? true : false,
                      canViewUsuarios: newRol === 'ADMIN' ? true : false,
                    });
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="VALIDADOR">VALIDADOR</option>
                  <option value="MIEMBRO">MIEMBRO</option>
                  <option value="INVITADO">INVITADO</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingUser.activo}
                  onChange={(e) => setEditingUser({...editingUser, activo: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm">Usuario activo</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleUpdateUser(editingUser);
                  setEditingUser(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 