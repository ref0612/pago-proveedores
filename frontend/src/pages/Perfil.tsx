import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Perfil() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'datos' | 'seguridad'>('datos');

  if (!user) return <div className="p-8 text-center text-gray-500">No hay información de usuario.</div>;

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
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 font-medium text-sm">Seguridad de la cuenta</span>
          </div>
          <div className="text-gray-500 text-sm">Próximamente podrás cambiar tu contraseña y gestionar opciones de seguridad.</div>
        </div>
      )}
    </div>
  );
} 