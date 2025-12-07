import { useState, useEffect } from 'react';
import syncService from '../services/syncService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Sincronizacion.css';

const Sincronizacion = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await syncService.getLogs({ limit: 50 });
      const logsList = Array.isArray(data) ? data : (data.logs || []);
      setLogs(logsList);
    } catch (err) {
      setError(err.message || 'Error al cargar los logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const result = await syncService.syncAll();
      setSuccess(`Sincronización completada. ${result.totalRecords || 0} registros procesados.`);
      loadLogs();
    } catch (err) {
      setError(err.message || 'Error en la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncByAPI = async (apiName) => {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const result = await syncService.syncByAPI(apiName);
      setSuccess(`${apiName} sincronizado. ${result.recordsCreated || 0} registros nuevos.`);
      loadLogs();
    } catch (err) {
      setError(err.message || 'Error en la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-CL');
  };

  const formatDuration = (ms) => {
    if (!ms) return '-';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="sincronizacion-page">
      <div className="page-header">
        <h1>Sincronización de Datos</h1>
        <p>Sincroniza datos desde Reservo, Snabb y DTEmite</p>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      <div className="sync-controls">
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="btn-sync primary"
        >
          {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar Todo'}
        </button>
        <button
          onClick={() => handleSyncByAPI('reservo')}
          disabled={syncing}
          className="btn-sync reservo"
        >
          Reservo
        </button>
        <button
          onClick={() => handleSyncByAPI('snabb')}
          disabled={syncing}
          className="btn-sync snabb"
        >
          Snabb
        </button>
        <button
          onClick={() => handleSyncByAPI('dtemite')}
          disabled={syncing}
          className="btn-sync dtemite"
        >
          DTEmite
        </button>
      </div>

      <div className="logs-section">
        <div className="logs-header">
          <h2>Historial de Sincronizaciones</h2>
          <button onClick={loadLogs} className="btn-refresh" disabled={loading}>
            🔄 Actualizar
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <Loading message="Cargando historial..." />
        ) : (
          <div className="logs-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>API</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Procesados</th>
                  <th>Creados</th>
                  <th>Actualizados</th>
                  <th>Errores</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No hay logs de sincronización
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.createdAt)}</td>
                      <td>
                        <span className={`badge-api ${log.apiName}`}>
                          {log.apiName}
                        </span>
                      </td>
                      <td>{log.syncType}</td>
                      <td>
                        <span className={`status ${log.status}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.recordsProcessed || 0}</td>
                      <td className="highlight-green">{log.recordsCreated || 0}</td>
                      <td className="highlight-blue">{log.recordsUpdated || 0}</td>
                      <td className="highlight-red">{log.recordsError || 0}</td>
                      <td>{formatDuration(log.duration)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sincronizacion;