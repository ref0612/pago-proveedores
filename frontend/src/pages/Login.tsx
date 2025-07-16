import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SpinnerWithText } from '../components/ui/Spinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, initializeUsers } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 0);
      } else {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      }
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeUsers = async () => {
    setLoading(true);
    try {
      const success = await initializeUsers();
      if (success) {
        setError('');
        alert('Usuarios por defecto creados exitosamente. Puedes usar:\n\n' +
              'ADMIN: admin@pullman.com / admin123\n' +
              'VALIDADOR: validador@pullman.com / val123\n' +
              'MIEMBRO: miembro@pullman.com / miem123\n' +
              'INVITADO: invitado@pullman.com / inv123');
      } else {
        setError('Error al crear usuarios por defecto');
      }
    } catch (error) {
      setError('Error de conexión al crear usuarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
            >
              {loading ? (
                <SpinnerWithText size="sm" text="Iniciando sesión..." />
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleInitializeUsers}
            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 min-h-[36px]"
            disabled={loading}
          >
            {loading ? (
              <SpinnerWithText size="sm" text="Inicializando..." />
            ) : 'Inicializar Usuarios de Prueba'}
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p><strong>Usuarios disponibles:</strong></p>
          <p>ADMIN: admin@pullman.com / admin123</p>
          <p>VALIDADOR: validador@pullman.com / val123</p>
          <p>MIEMBRO: miembro@pullman.com / miem123</p>
          <p>INVITADO: invitado@pullman.com / inv123</p>
        </div>
      </div>
    </div>
  );
} 