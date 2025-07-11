import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import TripsPage from './pages/TripsPage';
import Privileges from './pages/Privileges';
import Navbar from './components/Navbar';
import { RegistroRecorridos } from './modules/Recorridos';
import { CalculoProduccion } from './modules/Produccion';
import { ValidacionOperacional } from './modules/Validacion';
import { LiquidacionPagos } from './modules/Liquidacion';

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

  return (
    <Router key={user ? user.email : 'nouser'}>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        <Route path="/trips" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR', 'MIEMBRO']}>
            <TripsPage />
          </RequireAuth>
        } />
        <Route path="/recorridos" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR', 'MIEMBRO']}>
            <RegistroRecorridos />
          </RequireAuth>
        } />
        <Route path="/produccion" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
            <CalculoProduccion />
          </RequireAuth>
        } />
        <Route path="/validacion" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
            <ValidacionOperacional />
          </RequireAuth>
        } />
        <Route path="/liquidacion" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
            <LiquidacionPagos />
          </RequireAuth>
        } />
        <Route path="/reportes" element={
          <RequireAuth roles={['ADMIN', 'VALIDADOR']}>
            <Reportes />
          </RequireAuth>
        } />
        <Route path="/usuarios" element={
          <RequireAuth roles={['ADMIN']}>
            <Usuarios />
          </RequireAuth>
        } />
        <Route path="/privileges" element={
          <RequireAuth roles={['ADMIN']}>
            <Privileges />
          </RequireAuth>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
