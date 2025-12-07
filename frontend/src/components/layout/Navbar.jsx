import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard">
            <h1>Sistema Médico</h1>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-item">
            Dashboard
          </Link>
          <Link to="/atenciones" className="navbar-item">
            Atenciones
          </Link>
          <Link to="/reportes" className="navbar-item">
            Reportes
          </Link>
          <Link to="/sincronizacion" className="navbar-item">
            Sincronización
          </Link>
          {isAdmin && (
            <Link to="/usuarios" className="navbar-item">
              Usuarios
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Empleado'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;