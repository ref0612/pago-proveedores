import React, { useState } from 'react';
import { User, Shield, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiPut } from '../services/api';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<'datos' | 'seguridad'>('datos');

  // Estado para cambio de contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estado para edición de nombre
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.nombre || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  if (!user) return <div className="p-8 text-center text-gray-500">No hay información de usuario.</div>;

  // Función para obtener iniciales del usuario
  const getInitials = (nombre: string) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await apiPut(`/users/${user.id}/password`, { oldPassword, newPassword });
      setSuccess('Contraseña actualizada correctamente.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSuccess('');
    setNameError('');
    if (!newName.trim()) {
      setNameError('El nombre no puede estar vacío.');
      return;
    }
    setNameLoading(true);
    try {
      const response = await apiPut(`/users/${user.id}/nombre`, { nombre: newName.trim() });
      setNameSuccess('Nombre actualizado correctamente.');
      // Actualizar el contexto de usuario con el nuevo nombre
      if (updateUser && response.data?.user) {
        updateUser(response.data.user);
      }
      setEditingName(false);
    } catch (err: any) {
      setNameError(err?.response?.data?.error || 'Error al actualizar el nombre.');
    } finally {
      setNameLoading(false);
    }
  };

  const startEditingName = () => {
    setNewName(user.nombre);
    setEditingName(true);
    setNameSuccess('');
    setNameError('');
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNewName(user.nombre);
    setNameSuccess('');
    setNameError('');
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl select-none">
            {getInitials(user.nombre)}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{user.nombre}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400">Rol: {user.rol}</p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 -mb-px border-b-2 transition-colors text-sm font-medium focus:outline-none ${tab === 'datos' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('datos')}
        >
          Datos personales
        </button>
        <button
          className={`ml-2 px-4 py-2 -mb-px border-b-2 transition-colors text-sm font-medium focus:outline-none ${tab === 'seguridad' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('seguridad')}
        >
          Seguridad
        </button>
      </div>
      {/* Contenido de la pestaña activa */}
      {tab === 'datos' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Nombre completo:</span>
              {!editingName && (
                <button
                  onClick={startEditingName}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>
            {!editingName ? (
              <div className="text-gray-800 font-medium">{user.nombre}</div>
            ) : (
              <form onSubmit={handleUpdateName} className="space-y-3">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  autoFocus
                />
                {nameError && <div className="text-red-600 text-sm">{nameError}</div>}
                {nameSuccess && <div className="text-green-600 text-sm">{nameSuccess}</div>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                    disabled={nameLoading}
                  >
                    {nameLoading ? 'Guardando...' : (
                      <>
                        <Save className="w-3 h-3" />
                        Guardar
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingName}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition-colors text-sm font-medium flex items-center gap-1"
                    disabled={nameLoading}
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
          <div>
            <span className="text-gray-500 text-sm">Correo electrónico:</span>
            <div className="text-gray-800 font-medium">{user.email}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Rol:</span>
            <div className="text-gray-800 font-medium">{user.rol}</div>
          </div>
        </div>
      )}
      {tab === 'seguridad' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 font-medium text-sm">Cambio de contraseña</span>
          </div>
          <form className="space-y-3" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contraseña actual</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nueva contraseña</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 