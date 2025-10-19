// src/componentes/GestionUsuarios.js
import React, { useState } from 'react';
import { User, Shield, UserPlus, Edit2, UserX, Key, Save, X } from 'lucide-react';
import { ROLES, TURNOS, MENSAJES } from '../utilidades/constantes';

const GestionUsuarios = ({ usuarios = [], onGuardarUsuario, onDesactivarUsuario, mostrarAlerta }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    username: '',
    rol: ROLES.ENFERMERA,
    turno: TURNOS.DIURNO,
    activo: true
  });

  const iniciarNuevoUsuario = () => {
    setFormulario({
      nombre: '',
      username: '',
      rol: ROLES.ENFERMERA,
      turno: TURNOS.DIURNO,
      activo: true
    });
    setUsuarioEditando(null);
    setModoEdicion(true);
  };

  const iniciarEdicion = (usuario) => {
    setFormulario({
      nombre: usuario.nombre,
      username: usuario.username,
      rol: usuario.rol,
      turno: usuario.turno || TURNOS.DIURNO,
      activo: usuario.activo
    });
    setUsuarioEditando(usuario);
    setModoEdicion(true);
  };

  const handleGuardar = () => {
    if (!formulario.nombre || !formulario.username) {
      mostrarAlerta(MENSAJES.error.camposObligatorios, 'error');
      return;
    }

    const datosUsuario = {
      ...formulario,
      id: usuarioEditando?.id || Date.now()
    };

    onGuardarUsuario(datosUsuario);
    setModoEdicion(false);
    setFormulario({
      nombre: '',
      username: '',
      rol: ROLES.ENFERMERA,
      turno: TURNOS.DIURNO,
      activo: true
    });
  };

  const handleDesactivar = (usuario) => {
    if (window.confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre}?`)) {
      onDesactivarUsuario(usuario.id);
    }
  };

  const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];

  return (
    <div className="tarjeta">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="texto-2xl font-bold">Gestión de Usuarios</h2>
          <p className="texto-sm texto-gris mt-1">
            Administración de cuentas y asignación de roles
          </p>
        </div>
        {!modoEdicion && (
          <button
            onClick={iniciarNuevoUsuario}
            className="boton boton-primario"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {modoEdicion ? (
        <div className="p-6" style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <h3 className="texto-xl font-bold mb-4">
            {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Nombre Completo *</label>
              <input
                type="text"
                className="input"
                placeholder="Juan Pérez"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Usuario (Login) *</label>
              <input
                type="text"
                className="input"
                placeholder="jperez"
                value={formulario.username}
                onChange={(e) => setFormulario({ ...formulario, username: e.target.value })}
                disabled={!!usuarioEditando}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Rol *</label>
              <select
                className="select"
                value={formulario.rol}
                onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
              >
                <option value={ROLES.ADMINISTRATIVO}>Administrativo</option>
                <option value={ROLES.ENFERMERA}>Enfermera</option>
                <option value={ROLES.MATRONA}>Matrona</option>
                <option value={ROLES.MEDICO}>Médico</option>
                <option value={ROLES.ADMIN_SISTEMA}>Admin Sistema</option>
              </select>
            </div>

            {rolesConTurno.includes(formulario.rol) && (
              <div className="grupo-input">
                <label className="etiqueta">Turno Asignado *</label>
                <select
                  className="select"
                  value={formulario.turno}
                  onChange={(e) => setFormulario({ ...formulario, turno: e.target.value })}
                >
                  <option value={TURNOS.DIURNO}>Diurno (08:00 - 20:00)</option>
                  <option value={TURNOS.NOCTURNO}>Nocturno (20:00 - 08:00)</option>
                  <option value={TURNOS.VESPERTINO}>Vespertino (14:00 - 22:00)</option>
                </select>
                <p className="texto-xs texto-gris mt-1">
                  ⚠️ Este usuario solo verá pacientes de su turno asignado
                </p>
              </div>
            )}

            {usuarioEditando && (
              <div className="grupo-input">
                <label className="etiqueta">Estado</label>
                <select
                  className="select"
                  value={formulario.activo ? 'activo' : 'inactivo'}
                  onChange={(e) => setFormulario({ ...formulario, activo: e.target.value === 'activo' })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleGuardar}
              className="boton boton-primario"
              style={{ flex: 1 }}
            >
              <Save size={20} />
              Guardar Usuario
            </button>
            <button
              onClick={() => setModoEdicion(false)}
              className="boton boton-gris"
              style={{ flex: 1 }}
            >
              <X size={20} />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Turno</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="texto-centro texto-gris py-6">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="font-semibold">{usuario.nombre}</td>
                    <td>{usuario.username}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          backgroundColor: 
                            usuario.rol === ROLES.MEDICO ? '#dbeafe' :
                            usuario.rol === ROLES.MATRONA ? '#dcfce7' :
                            usuario.rol === ROLES.ENFERMERA ? '#fef3c7' :
                            usuario.rol === ROLES.ADMIN_SISTEMA ? '#e0e7ff' :
                            '#f3f4f6',
                          color: 
                            usuario.rol === ROLES.MEDICO ? '#1e40af' :
                            usuario.rol === ROLES.MATRONA ? '#166534' :
                            usuario.rol === ROLES.ENFERMERA ? '#92400e' :
                            usuario.rol === ROLES.ADMIN_SISTEMA ? '#4338ca' :
                            '#374151'
                        }}
                      >
                        {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                      </span>
                    </td>
                    <td>
                      {rolesConTurno.includes(usuario.rol) ? (
                        <span className="texto-sm">
                          {usuario.turno?.charAt(0).toUpperCase() + usuario.turno?.slice(1) || '-'}
                        </span>
                      ) : (
                        <span className="texto-sm texto-gris">N/A</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: usuario.activo ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => iniciarEdicion(usuario)}
                          className="boton"
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          }}
                          title="Editar usuario"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDesactivar(usuario)}
                          className="boton"
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white'
                          }}
                          title="Desactivar usuario"
                          disabled={!usuario.activo}
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Información importante */}
      <div
        className="mt-6 p-4"
        style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <Shield size={20} style={{ color: '#f59e0b', marginTop: '2px' }} />
          <div>
            <p className="font-semibold" style={{ color: '#92400e' }}>
              Principio de Segmentación RBAC
            </p>
            <ul className="texto-sm mt-2" style={{ color: '#92400e', listStyle: 'disc', marginLeft: '1.5rem' }}>
              <li>Enfermeras y Matronas solo acceden a pacientes de su turno</li>
              <li>Administrativos NO ven datos clínicos (solo demográficos)</li>
              <li>Admin Sistema NO accede a datos de pacientes</li>
              <li>Todos los cambios quedan registrados en auditoría</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;