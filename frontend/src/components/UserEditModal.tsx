import React from 'react';
import { User as UserIcon, X } from 'lucide-react';

export interface UserEditModalProps<T> {
  user: T;
  onChange: (user: T) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
  roles: { value: string; label: string }[];
}

function UserEditModal<T extends { nombre: string; email: string; rol: string; activo: boolean }>(
  { user, onChange, onClose, onSave, saving, error, roles }: UserEditModalProps<T>
) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fadein" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-0 overflow-hidden animate-fadein-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Editar Usuario</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Contenido */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nombre</label>
            <input
              type="text"
              value={user.nombre}
              onChange={e => onChange({ ...user, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={e => onChange({ ...user, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Rol</label>
            <select
              value={user.rol}
              onChange={e => onChange({ ...user, rol: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={user.activo}
              onChange={e => onChange({ ...user, activo: e.target.checked })}
              className="mr-2 accent-blue-500"
            />
            <label className="text-sm text-gray-700">Usuario activo</label>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        {/* Botones */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserEditModal; 