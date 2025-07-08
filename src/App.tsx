import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Navbar from './components/Navbar';
import { RegistroRecorridos } from './modules/Recorridos';
import { CalculoProduccion } from './modules/Produccion';
import { ValidacionOperacional } from './modules/Validacion';
import { LiquidacionPagos } from './modules/Liquidacion';

function RequireAuth({ children, roles }: { children: ReactElement, roles?: UserRole[] }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && (!role || !roles.includes(role))) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
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
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
