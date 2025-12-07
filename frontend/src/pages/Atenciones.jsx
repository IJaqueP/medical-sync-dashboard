import { useState, useEffect } from 'react';
import atencionesService from '../services/atencionesService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Atenciones.css';

const Atenciones = () => {
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    estadoPago: '',
    origenDatos: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadAtenciones();
  }, [filters, pagination.page]);

  const loadAtenciones = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const data = await atencionesService.getAll(params);
      const atencionesList = Array.isArray(data) ? data : (data.atenciones || []);
      setAtenciones(atencionesList);
      if (data.pagination) {
        setPagination({ ...pagination, total: data.pagination.total });
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las atenciones');
      setAtenciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta atención?')) return;

    try {
      await atencionesService.delete(id);
      loadAtenciones();
    } catch (err) {
      setError(err.message || 'Error al eliminar la atención');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `$${Number(amount).toLocaleString('es-CL')}`;
  };

  if (loading && atenciones.length === 0) {
    return <Loading message="Cargando atenciones..." />;
  }

  return (
    <div className="atenciones-page">
      <div className="page-header">
        <h1>Gestión de Atenciones</h1>
        <button className="btn-primary" onClick={() => alert('Funcionalidad en desarrollo')}>
          + Nueva Atención
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Buscar por RUT o nombre..."
            value={filters.search}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select
            name="estadoPago"
            value={filters.estadoPago}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            name="origenDatos"
            value={filters.origenDatos}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Todas las fuentes</option>
            <option value="reservo">Reservo</option>
            <option value="snabb">Snabb</option>
            <option value="dtemite">DTEmite</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="atenciones-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>RUT Paciente</th>
              <th>Nombre Paciente</th>
              <th>Profesional</th>
              <th>Especialidad</th>
              <th>Monto</th>
              <th>Estado Pago</th>
              <th>Origen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {atenciones.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No hay atenciones registradas
                </td>
              </tr>
            ) : (
              atenciones.map((atencion) => (
                <tr key={atencion.id}>
                  <td>{formatDate(atencion.fechaAtencion)}</td>
                  <td>{atencion.rutPaciente}</td>
                  <td>{atencion.nombrePaciente}</td>
                  <td>{atencion.profesional || '-'}</td>
                  <td>{atencion.especialidad || '-'}</td>
                  <td>{formatCurrency(atencion.montoPagado || atencion.montoTotal)}</td>
                  <td>
                    <span className={`badge ${atencion.estadoPago || 'pendiente'}`}>
                      {atencion.estadoPago || 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <span className="badge-origin">{atencion.origenDatos || 'Manual'}</span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-action view"
                        onClick={() => alert('Ver detalles: ' + atencion.id)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => alert('Editar: ' + atencion.id)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(atencion.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={pagination.page === 1}
          className="btn-pagination"
        >
          Anterior
        </button>
        <span className="page-info">
          Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit) || 1}
        </span>
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={atenciones.length < pagination.limit}
          className="btn-pagination"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Atenciones;