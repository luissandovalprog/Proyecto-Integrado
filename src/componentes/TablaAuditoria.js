// src/componentes/TablaAuditoria.js
import React, { useState, useEffect } from 'react';
import { Shield, Search, Download, Eye, Calendar } from 'lucide-react';
import { obtenerEventosAuditoria, exportarAuditoriaJSON, obtenerEstadisticasAuditoria } from '../servicios/api';
import { ACCIONES_AUDITORIA } from '../utilidades/constantes';

const TablaAuditoria = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('todas');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [estadisticas, setEstadisticas] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [eventos, busqueda, filtroAccion, filtroUsuario]);

  const cargarEventos = () => {
    const eventosAuditoria = obtenerEventosAuditoria();
    setEventos(eventosAuditoria);
    
    const stats = obtenerEstadisticasAuditoria();
    setEstadisticas(stats);
  };

  const aplicarFiltros = () => {
    let resultado = [...eventos];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(evento =>
        evento.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
        evento.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        evento.accion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por acción
    if (filtroAccion !== 'todas') {
      resultado = resultado.filter(evento => evento.accion === filtroAccion);
    }

    // Filtro por usuario
    if (filtroUsuario !== 'todos') {
      resultado = resultado.filter(evento => evento.usuario === filtroUsuario);
    }

    setEventosFiltrados(resultado);
  };

  const obtenerUsuariosUnicos = () => {
    const usuarios = [...new Set(eventos.map(e => e.usuario))];
    return usuarios.sort();
  };

  const obtenerColorAccion = (accion) => {
    const colores = {
      [ACCIONES_AUDITORIA.LOGIN]: '#3b82f6',
      [ACCIONES_AUDITORIA.LOGOUT]: '#6b7280',
      [ACCIONES_AUDITORIA.CREAR_PACIENTE]: '#10b981',
      [ACCIONES_AUDITORIA.EDITAR_PACIENTE]: '#f59e0b',
      [ACCIONES_AUDITORIA.CREAR_PARTO]: '#8b5cf6',
      [ACCIONES_AUDITORIA.EDITAR_PARTO]: '#ec4899',
      [ACCIONES_AUDITORIA.ANEXAR_CORRECCION]: '#ef4444',
      [ACCIONES_AUDITORIA.GENERAR_REPORTE]: '#dc2626',
      [ACCIONES_AUDITORIA.EXPORTAR_DATOS]: '#dc2626',
      [ACCIONES_AUDITORIA.CREAR_USUARIO]: '#059669',
      [ACCIONES_AUDITORIA.MODIFICAR_USUARIO]: '#d97706',
      [ACCIONES_AUDITORIA.DESACTIVAR_USUARIO]: '#7c2d12',
      [ACCIONES_AUDITORIA.INTENTO_ACCESO_DENEGADO]: '#991b1b'
    };
    return colores[accion] || '#6b7280';
  };

  const obtenerIconoAccion = (accion) => {
    if (accion.includes('CREAR')) return '➕';
    if (accion.includes('EDITAR') || accion.includes('MODIFICAR')) return '✏️';
    if (accion.includes('ANEXAR')) return '📎';
    if (accion.includes('GENERAR') || accion.includes('EXPORTAR')) return '📊';
    if (accion.includes('LOGIN')) return '🔓';
    if (accion.includes('LOGOUT')) return '🔒';
    if (accion.includes('DESACTIVAR')) return '🚫';
    if (accion.includes('DENEGADO')) return '⛔';
    return '📋';
  };

  return (
    <div className="animacion-entrada">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="tarjeta tarjeta-hover">
            <p className="texto-sm texto-gris">Total Eventos</p>
            <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>
              {estadisticas.totalEventos}
            </p>
          </div>
          <div className="tarjeta tarjeta-hover">
            <p className="texto-sm texto-gris">Usuarios Activos</p>
            <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>
              {Object.keys(estadisticas.eventosPorUsuario).length}
            </p>
          </div>
          <div className="tarjeta tarjeta-hover">
            <p className="texto-sm texto-gris">Tipos de Acciones</p>
            <p className="texto-3xl font-bold" style={{ color: '#8b5cf6' }}>
              {Object.keys(estadisticas.eventosPorAccion).length}
            </p>
          </div>
          <div className="tarjeta tarjeta-hover">
            <p className="texto-sm texto-gris">Último Evento</p>
            <p className="texto-sm font-bold" style={{ color: '#f59e0b' }}>
              {estadisticas.ultimoEvento ? 
                new Date(estadisticas.ultimoEvento).toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Filtros y controles */}
      <div className="tarjeta mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Buscar en auditoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="select"
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
          >
            <option value="todas">Todas las acciones</option>
            {Object.entries(ACCIONES_AUDITORIA).map(([key, value]) => (
              <option key={value} value={value}>
                {key.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
          >
            <option value="todos">Todos los usuarios</option>
            {obtenerUsuariosUnicos().map(usuario => (
              <option key={usuario} value={usuario}>{usuario}</option>
            ))}
          </select>

          <button
            onClick={exportarAuditoriaJSON}
            className="boton boton-secundario"
          >
            <Download size={18} />
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="tarjeta">
        <div className="flex justify-between items-center mb-4">
          <h3 className="texto-xl font-bold flex items-center gap-2">
            <Shield size={24} style={{ color: '#2563eb' }} />
            Registro de Auditoría
          </h3>
          <span className="texto-sm texto-gris">
            {eventosFiltrados.length} de {eventos.length} eventos
          </span>
        </div>

        {eventosFiltrados.length === 0 ? (
          <p className="texto-centro texto-gris py-6">No hay eventos de auditoría registrados</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Detalle</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map((evento) => (
                  <tr key={evento.id}>
                    <td className="texto-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: '#6b7280' }} />
                        {evento.fecha}
                      </div>
                    </td>
                    <td className="font-semibold">{evento.usuario}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: obtenerColorAccion(evento.accion) + '20',
                          color: obtenerColorAccion(evento.accion),
                          border: `1px solid ${obtenerColorAccion(evento.accion)}`
                        }}
                      >
                        {obtenerIconoAccion(evento.accion)} {evento.accion.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="texto-sm" style={{ maxWidth: '400px' }}>
                      {evento.detalle.length > 80 
                        ? evento.detalle.substring(0, 80) + '...'
                        : evento.detalle}
                    </td>
                    <td>
                      <button
                        onClick={() => setEventoSeleccionado(evento)}
                        className="boton"
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white'
                        }}
                        title="Ver detalle completo"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle del evento */}
      {eventoSeleccionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="tarjeta" style={{ 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 className="texto-xl font-bold mb-4">Detalle del Evento de Auditoría</h3>
            
            <div className="grid gap-4">
              <div>
                <p className="texto-sm texto-gris">ID del Evento</p>
                <p className="font-mono texto-sm">{eventoSeleccionado.id}</p>
              </div>

              <div>
                <p className="texto-sm texto-gris">Fecha y Hora</p>
                <p className="font-semibold">{eventoSeleccionado.fecha}</p>
              </div>

              <div>
                <p className="texto-sm texto-gris">Usuario</p>
                <p className="font-semibold">{eventoSeleccionado.usuario}</p>
              </div>

              <div>
                <p className="texto-sm texto-gris">Acción</p>
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    backgroundColor: obtenerColorAccion(eventoSeleccionado.accion) + '20',
                    color: obtenerColorAccion(eventoSeleccionado.accion),
                    border: `2px solid ${obtenerColorAccion(eventoSeleccionado.accion)}`,
                    display: 'inline-block'
                  }}
                >
                  {obtenerIconoAccion(eventoSeleccionado.accion)} {eventoSeleccionado.accion.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <p className="texto-sm texto-gris mb-2">Detalle Completo</p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  <p className="texto-sm">{eventoSeleccionado.detalle}</p>
                </div>
              </div>

              <div>
                <p className="texto-sm texto-gris">Timestamp (ISO)</p>
                <p className="font-mono texto-xs">{eventoSeleccionado.timestamp}</p>
              </div>
            </div>

            <button
              onClick={() => setEventoSeleccionado(null)}
              className="boton boton-primario mt-6"
              style={{ width: '100%' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Información importante */}
      <div className="tarjeta mt-6" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
        <div className="flex items-start gap-3">
          <Shield size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: '#92400e' }}>
              Trazabilidad Total - Ley 20.584
            </p>
            <p className="texto-sm mt-1" style={{ color: '#92400e' }}>
              Todos los eventos quedan registrados permanentemente. No se puede eliminar ni modificar 
              el historial de auditoría. Los intentos de acceso denegado también quedan registrados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaAuditoria;