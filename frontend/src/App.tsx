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
  );
}

function App() {
  return <AppContent />;
}

export default App;
