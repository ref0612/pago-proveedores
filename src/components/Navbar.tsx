import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
      <div className="font-bold text-lg">Pullman Payment</div>
      {user && (
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          {(role === 'ADMIN' || role === 'VALIDADOR' || role === 'MIEMBRO') && (
            <Link to="/recorridos" className="hover:underline">Recorridos</Link>
          )}
          {(role === 'ADMIN' || role === 'VALIDADOR') && (
            <Link to="/produccion" className="hover:underline">Producción</Link>
          )}
          {(role === 'ADMIN' || role === 'VALIDADOR') && (
            <Link to="/validacion" className="hover:underline">Validación</Link>
          )}
          {(role === 'ADMIN' || role === 'VALIDADOR') && (
            <Link to="/liquidacion" className="hover:underline">Liquidación</Link>
          )}
          {(role === 'ADMIN' || role === 'VALIDADOR') && (
            <Link to="/reportes" className="hover:underline">Reportes</Link>
          )}
          {role === 'ADMIN' && (
            <Link to="/usuarios" className="hover:underline">Usuarios</Link>
          )}
          <span className="text-sm text-blue-200 ml-2">{user} ({role})</span>
          <button onClick={handleLogout} className="ml-2 bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600">Salir</button>
        </div>
      )}
    </nav>
  );
} 