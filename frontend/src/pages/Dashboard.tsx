import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, role, logout } = useAuth();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={logout}>Cerrar sesión</button>
      </div>
      <p>Bienvenido, <span className="font-semibold">{user}</span> ({role})</p>
      <div className="mt-8">
        {/* Aquí irán los accesos y módulos según el rol */}
        <div className="text-gray-600">Selecciona un módulo del menú para comenzar.</div>
      </div>
    </div>
  );
} 