import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Video } from 'lucide-react';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
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
    setShowError(false);
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 0);
      } else {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
        setShowError(true);
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
    <div className="min-h-screen relative">
  {/* Video de fondo */}
  <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="/video/torres-del-paine-park-in-chile-2023-11-27-05-04-35-utc.mp4"
      />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen bg-black/30">
        {/* Login Form */}
        <main className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-sm">
            <div className="text-center my-3 mb-0">
              <div className="flex items-center justify-center gap-2 my-4">
              </div>
              <img src="/pullman-bus-logo.jpg " alt="Logo Pullman" className="w-1/2 mx-auto" />
            </div>

            <h1 className="text-xl text-center px-4 font-bold text-[#01236A] border-b border-t border-gray-100 py-0">Portal de Gestión:<br />
              <span className="font-light">Pago a Proveedores</span></h1>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#01236A] mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`block w-full pl-10 pr-3 py-2 text-[#01236A] border ${showError ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-1 ${showError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#01236A] focus:border-[#01236A]'} sm:text-sm`}
                        placeholder="usuario@pullman.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (showError) setShowError(false);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#01236A] mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className={`block w-full pl-10 pr-10 py-2 text-[#01236A] border ${showError ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-1 ${showError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#01236A] focus:border-[#01236A]'} sm:text-sm`}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (showError) setShowError(false);
                          }}
                        />
                        {password && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#01236A] focus:outline-none"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mx-8 !mt-2">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-1">
                        <p className="text-xs text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border rounded-lg shadow-sm text-sm font-medium text-white bg-[#01236A] hover:bg-[#01236A]/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ingresando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleInitializeUsers}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#01236A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Inicializando...
                      </>
                    ) : (
                      'Inicializar Usuarios de Prueba'
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-2 rounded-lg border-gray-200">
                <h3 className="text-sm text-center font-medium text-[#01236A] mb-2">¿Tienes problemas para ingresar? {<br />} Contacta a tu administrador</h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">ADMIN</span>
                    <span>admin@pullman.com / admin123</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">VALIDADOR</span>
                    <span>validador@pullman.com / val123</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">MIEMBRO</span>
                    <span>miembro@pullman.com / miem123</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">INVITADO</span>
                    <span>invitado@pullman.com / inv123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Side Content - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative">
          <div className="absolute bottom-4 right-4">
            <div className="relative group">
              <button className="bg-white/70 hover:bg-white p-1.5 rounded-full shadow-md transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white p-3 rounded-lg shadow-lg text-sm text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <p>Parque Nacional Torres del Paine</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}