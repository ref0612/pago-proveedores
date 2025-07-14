import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiPut } from '../services/api';

export default function Perfil() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'datos' | 'seguridad'>('datos');

  // Estado para cambio de contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) return <div className="p-8 text-center text-gray-500">No hay información de usuario.</div>;

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

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
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
        <div className="space-y-2">
          <div>
            <span className="text-gray-500 text-sm">Nombre completo:</span>
            <div className="text-gray-800 font-medium">{user.nombre}</div>
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