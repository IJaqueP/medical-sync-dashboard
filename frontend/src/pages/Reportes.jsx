import { useState } from 'react';
import reportsService from '../services/reportsService';
import ErrorMessage from '../components/common/ErrorMessage';
import './Reportes.css';

const Reportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estadoPago: '',
    origenDatos: '',
    profesional: '',
    especialidad: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleGeneratePDF = async () => {
    if (!filters.fechaInicio || !filters.fechaFin) {
      setError('Debes seleccionar un rango de fechas');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await reportsService.generatePDF(filters);
      setSuccess('Reporte PDF generado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al generar el reporte PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (!filters.fechaInicio || !filters.fechaFin) {
      setError('Debes seleccionar un rango de fechas');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await reportsService.generateExcel(filters);
      setSuccess('Reporte Excel generado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al generar el reporte Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reportes-page">
      <div className="page-header">
        <h1>Generación de Reportes</h1>
        <p>Exporta reportes de atenciones en formato PDF o Excel</p>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      <div className="report-config">
        <h2>Configuración del Reporte</h2>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Fecha Inicio *</label>
            <input
              type="date"
              name="fechaInicio"
              value={filters.fechaInicio}
              onChange={handleFilterChange}
              className="filter-input"
              required
            />
          </div>

          <div className="filter-group">
            <label>Fecha Fin *</label>
            <input
              type="date"
              name="fechaFin"
              value={filters.fechaFin}
              onChange={handleFilterChange}
              className="filter-input"
              required
            />
          </div>

          <div className="filter-group">
            <label>Estado de Pago</label>
            <select
              name="estadoPago"
              value={filters.estadoPago}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Origen de Datos</label>
            <select
              name="origenDatos"
              value={filters.origenDatos}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="reservo">Reservo</option>
              <option value="snabb">Snabb</option>
              <option value="dtemite">DTEmite</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Profesional</label>
            <input
              type="text"
              name="profesional"
              placeholder="Nombre del profesional"
              value={filters.profesional}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Especialidad</label>
            <input
              type="text"
              name="especialidad"
              placeholder="Especialidad médica"
              value={filters.especialidad}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>

        <div className="report-actions">
          <button
            onClick={handleGeneratePDF}
            disabled={loading}
            className="btn-report pdf"
          >
            {loading ? 'Generando...' : '📄 Generar PDF'}
          </button>
          <button
            onClick={handleGenerateExcel}
            disabled={loading}
            className="btn-report excel"
          >
            {loading ? 'Generando...' : '📊 Generar Excel'}
          </button>
        </div>
      </div>

      <div className="report-info">
        <h3>Información sobre los Reportes</h3>
        <ul>
          <li>Los reportes incluyen todas las atenciones dentro del rango de fechas seleccionado</li>
          <li>Puedes aplicar filtros adicionales para generar reportes más específicos</li>
          <li>El formato PDF es ideal para impresión y presentaciones</li>
          <li>El formato Excel permite análisis y manipulación de datos</li>
          <li>Los archivos se descargarán automáticamente al generarse</li>
        </ul>
      </div>
    </div>
  );
};

export default Reportes;