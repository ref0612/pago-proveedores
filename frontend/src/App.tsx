import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Usuarios from './pages/Usuarios';
import TripsPage from './pages/TripsPage';
import Privileges from './pages/Privileges';
import Layout from './components/Layout';
import { RegistroRecorridos } from './modules/Recorridos';
import { CalculoProduccion } from './modules/Produccion';
import { ValidacionOperacional } from './modules/Validacion';
import { LiquidacionPagos } from './modules/Liquidacion';
import Perfil from './pages/Perfil';
import { useState, createContext, useContext, useEffect } from 'react';
import { ReactNode, Dispatch, SetStateAction } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRef } from 'react';

// Definición del tipo de alerta
export interface Alert {
  message: string;
  icon?: ReactNode;
  type?: 'success' | 'error';
}

// Contexto para notificaciones
export const AlertContext = createContext<{
  alerts: Alert[];
  setAlerts: Dispatch<SetStateAction<Alert[]>>;
}>({
  alerts: [],
  setAlerts: () => {},
});

function RequireAuth({ children, roles }: { children: ReactElement, roles?: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (roles && (!user.rol || !roles.includes(user.rol))) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppContent() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [exitingIdx, setExitingIdx] = useState<number | null>(null);

  // Eliminar automáticamente las alertas después de 5 segundos con animación
  useEffect(() => {
    if (alerts.length === 0) return;
    if (exitingIdx !== null) return; // Ya hay una alerta saliendo
    const timer = setTimeout(() => {
      setExitingIdx(0);
      setTimeout(() => {
        setAlerts(alerts => alerts.slice(1));
        setExitingIdx(null);
      }, 250); // Duración de la animación
    }, 4000);
    return () => clearTimeout(timer);
  }, [alerts, exitingIdx]);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {/* Contenedor de alertas */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end">
        {alerts.map((alert, idx) => {
          let bg = 'bg-green-100 border-green-300 text-green-900';
          let icon = <CheckCircle className="w-5 h-5 text-green-500" />;
          if (alert.type === 'error') {
            bg = 'bg-red-100 border-red-300 text-red-900';
            icon = <XCircle className="w-5 h-5 text-red-500" />;
          }
          if (alert.type === 'success') {
            bg = 'bg-green-100 border-green-300 text-green-900';
            icon = <CheckCircle className="w-5 h-5 text-green-500" />;
          }
          const isExiting = exitingIdx === idx;
          return (
            <div
              key={idx}
              className={`border shadow-lg rounded-lg px-4 py-3 min-w-[220px] max-w-xs flex items-center gap-2 animate-fadein ${bg} transition-transform duration-200 ease-in-out ${isExiting ? 'translate-x-96 opacity-0' : 'translate-x-0 opacity-100'}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
            >
              {alert.icon || icon}
              <span className="flex-1 text-sm">{alert.message}</span>
              <button
                className="ml-2 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setExitingIdx(idx);
                  setTimeout(() => {
                    setAlerts(alerts => alerts.filter((_, i) => i !== idx));
                    setExitingIdx(null);
                  }, 250);
                }}
                aria-label="Cerrar alerta"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <Router key={user ? user.email : 'nouser'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Layout>
                <Dashboard />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/trips" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR', 'MIEMBRO']}>
              <Layout>
                <TripsPage />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/recorridos" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR', 'MIEMBRO']}>
              <Layout>
                <RegistroRecorridos />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/produccion" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
              <Layout>
                <CalculoProduccion />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/validacion" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
              <Layout>
                <ValidacionOperacional />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/liquidacion" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
              <Layout>
                <LiquidacionPagos />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/reportes" element={
            <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
              <Layout>
                <Reportes />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/usuarios" element={
            <RequireAuth roles={['ADMIN']}>
              <Layout>
                <Usuarios />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/configuracion" element={
            <RequireAuth roles={['ADMIN']}>
              <Layout>
                <Configuracion />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/privileges" element={
            <RequireAuth roles={['ADMIN']}>
              <Layout>
                <Privileges />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/perfil" element={
            <RequireAuth>
              <Layout>
                <Perfil />
              </Layout>
            </RequireAuth>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AlertContext.Provider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
