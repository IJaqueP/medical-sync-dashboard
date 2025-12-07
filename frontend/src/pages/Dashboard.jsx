import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import atencionesService from '../services/atencionesService';
import syncService from '../services/syncService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener estadísticas del mes actual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      // Intentar cargar estadísticas de atenciones
      let atencionesStats = {
        totalAtenciones: 0,
        atencionesPagadas: 0,
        atencionesPendientes: 0,
        montoTotal: 0
      };
      
      try {
        atencionesStats = await atencionesService.getEstadisticas(formatDate(firstDay), formatDate(lastDay));
      } catch (err) {
        console.warn('No se pudieron cargar estadísticas de atenciones:', err);
      }

      // Intentar cargar datos de sincronización
      let syncData = null;
      try {
        syncData = await syncService.getStats();
      } catch (err) {
        console.warn('No se pudieron cargar estadísticas de sincronización:', err);
      }

      setStats(atencionesStats);
      setSyncStats(syncData);
    } catch (err) {
      console.error('Error en loadDashboardData:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.username}</h1>
        <p>Panel de control del sistema médico</p>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-content">
            <h3>Total Atenciones</h3>
            <p className="stat-value">{stats?.totalAtenciones || 0}</p>
            <span className="stat-label">Este mes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div className="stat-content">
            <h3>Pagadas</h3>
            <p className="stat-value">{stats?.atencionesPagadas || 0}</p>
            <span className="stat-label">Completadas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-value">{stats?.atencionesPendientes || 0}</p>
            <span className="stat-label">Por cobrar</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-content">
            <h3>Total Recaudado</h3>
            <p className="stat-value">
              ${(stats?.montoTotal || 0).toLocaleString('es-CL')}
            </p>
            <span className="stat-label">Pesos chilenos</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button onClick={() => navigate('/atenciones')} className="action-btn primary">
          Ver todas las atenciones
        </button>
        <button onClick={() => navigate('/reportes')} className="action-btn secondary">
          Generar reportes
        </button>
        <button onClick={() => navigate('/sincronizacion')} className="action-btn accent">
          Sincronizar datos
        </button>
      </div>

      {syncStats && (
        <div className="sync-info">
          <h2>Última Sincronización</h2>
          <div className="sync-cards">
            <div className="sync-card">
              <h4>Reservo</h4>
              <p>
                {syncStats.reservo?.lastSync
                  ? new Date(syncStats.reservo.lastSync).toLocaleString('es-CL')
                  : 'Sin sincronizar'}
              </p>
              <span className={`status ${syncStats.reservo?.status || 'pending'}`}>
                {syncStats.reservo?.status || 'Pendiente'}
              </span>
            </div>
            <div className="sync-card">
              <h4>Snabb</h4>
              <p>
                {syncStats.snabb?.lastSync
                  ? new Date(syncStats.snabb.lastSync).toLocaleString('es-CL')
                  : 'Sin sincronizar'}
              </p>
              <span className={`status ${syncStats.snabb?.status || 'pending'}`}>
                {syncStats.snabb?.status || 'Pendiente'}
              </span>
            </div>
            <div className="sync-card">
              <h4>DTEmite</h4>
              <p>
                {syncStats.dtemite?.lastSync
                  ? new Date(syncStats.dtemite.lastSync).toLocaleString('es-CL')
                  : 'Sin sincronizar'}
              </p>
              <span className={`status ${syncStats.dtemite?.status || 'pending'}`}>
                {syncStats.dtemite?.status || 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;