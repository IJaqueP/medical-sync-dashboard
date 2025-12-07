import { useState, useEffect } from 'react';
import usersService from '../services/usersService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Usuarios.css';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersService.getAll();
      const usersList = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersList);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'employee',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'employee',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Actualizar usuario (no enviar password si está vacío)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersService.update(editingUser.id, updateData);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await usersService.create(formData);
        setSuccess('Usuario creado exitosamente');
      }
      handleCloseModal();
      loadUsers();
    } catch (err) {
      setError(err.message || 'Error al guardar el usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await usersService.delete(id);
      setSuccess('Usuario eliminado exitosamente');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await usersService.toggleActive(id);
      setSuccess('Estado del usuario actualizado');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado del usuario');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-CL');
  };

  if (loading) {
    return <Loading message="Cargando usuarios..." />;
  }

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      <div className="users-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge-role ${user.role}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-action edit"
                        onClick={() => handleOpenModal(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action toggle"
                        onClick={() => handleToggleActive(user.id)}
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(user.id)}
                        title="Eliminar"
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Nombre de usuario"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  placeholder="********"
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;