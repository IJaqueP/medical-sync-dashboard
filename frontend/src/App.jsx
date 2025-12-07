import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Atenciones from './pages/Atenciones';
import Reportes from './pages/Reportes';
import Sincronizacion from './pages/Sincronizacion';
import Usuarios from './pages/Usuarios';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="atenciones" element={<Atenciones />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="sincronizacion" element={<Sincronizacion />} />
            
            {/* Ruta solo para administradores */}
            <Route
              path="usuarios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Ruta 404 - Redirigir al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;