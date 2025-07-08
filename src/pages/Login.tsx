import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../hooks/useAuth';

const users = [
  { email: 'admin@demo.com', password: 'Admin123', role: 'ADMIN' },
  { email: 'validador@demo.com', password: 'Valida123', role: 'VALIDADOR' },
  { email: 'miembro@demo.com', password: 'Miembro123', role: 'MIEMBRO' },
  { email: 'invitado@demo.com', password: 'Invitado123', role: 'INVITADO' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      login(user.email, user.role as UserRole, 'mock-token');
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          className="border p-2 w-full mb-4"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-4"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" type="submit">
          Ingresar
        </button>
        <div className="mt-4 text-xs text-gray-500">
          <div>Usuarios de prueba:</div>
          {users.map(u => (
            <div key={u.email}>{u.email} / {u.password} ({u.role})</div>
          ))}
        </div>
      </form>
    </div>
  );
} 