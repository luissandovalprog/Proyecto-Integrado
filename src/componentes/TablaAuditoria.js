// src/componentes/TablaAuditoria.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Search, Download, Eye, Calendar, AlertCircle } from 'lucide-react';
// Importa SOLO la función que existe en el nuevo api.js
import api from '../servicios/api'; // Importa el default export
import { ACCIONES_AUDITORIA } from '../utilidades/constantes'; // Mantenemos esto para colores/iconos

const TablaAuditoria = () => {
  const [eventos, setEventos] = useState([]); // Almacenará los logs de la API
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('todas');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // --- Carga de Datos ---
  const cargarEventos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Llama a la función REAL de api.js para obtener los logs
      const eventosDesdeAPI = await api.obtenerEventosAuditoria(); // Asume que devuelve un array
      setEventos(eventosDesdeAPI || []); // Guarda los eventos en el estado
    } catch (err) {
      console.error("Error cargando eventos de auditoría:", err);
      setError(`Error al cargar logs: ${err.message}`);
      setEventos([]); // Limpia eventos en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias, solo se define una vez

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]); // Depende de cargarEventos

  // --- Filtrado (se ejecuta cuando cambian los eventos o los filtros) ---
  useEffect(() => {
    let resultado = [...eventos];

    // Filtro por búsqueda (buscar en detalles, usuario, acción)
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(evento =>
        (evento.detalles && evento.detalles.toLowerCase().includes(busquedaLower)) ||
        (evento.usuario_username && evento.usuario_username.toLowerCase().includes(busquedaLower)) || // Usa el campo del serializer
        (evento.accion && evento.accion.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro por acción
    if (filtroAccion !== 'todas') {
      resultado = resultado.filter(evento => evento.accion === filtroAccion);
    }

    // Filtro por usuario (usando usuario_username)
    if (filtroUsuario !== 'todos') {
      resultado = resultado.filter(evento => evento.usuario_username === filtroUsuario);
    }

    setEventosFiltrados(resultado);
  }, [eventos, busqueda, filtroAccion, filtroUsuario]); // Dependencias: eventos y los estados de filtro

  // --- Estadísticas (Calculadas localmente) ---
  const estadisticas = useMemo(() => {
    if (isLoading || error || eventos.length === 0) return null;
    try {
      const totalEventos = eventos.length;
      const eventosPorAccion = {};
      const eventosPorUsuario = {};

      eventos.forEach(evento => {
        // Por acción
        eventosPorAccion[evento.accion] = (eventosPorAccion[evento.accion] || 0) + 1;
        // Por usuario
        if (evento.usuario_username) {
             eventosPorUsuario[evento.usuario_username] = (eventosPorUsuario[evento.usuario_username] || 0) + 1;
        }
      });

      return {
        totalEventos,
        eventosPorAccion,
        eventosPorUsuario,
        ultimoEvento: eventos[0]?.fecha_accion // Asumiendo que vienen ordenados por fecha desc
      };
    } catch(e) {
      console.error("Error calculando estadísticas:", e);
      return null; // Evita que un error aquí rompa el render
    }
  }, [eventos, isLoading, error]); // Depende de los eventos cargados

  // --- Funciones Auxiliares ---
  const obtenerUsuariosUnicos = useMemo(() => {
    // Extrae usuarios únicos de los eventos cargados
    const usuarios = [...new Set(eventos.map(e => e.usuario_username).filter(Boolean))];
    return usuarios.sort();
  }, [eventos]); // Depende de los eventos cargados

  // Funciones obtenerColorAccion y obtenerIconoAccion (sin cambios)
  const obtenerColorAccion = (accion) => { /* ... (igual que antes) ... */
     const colores = { [ACCIONES_AUDITORIA.LOGIN]: '#3b82f6', /* ... */ }; return colores[accion] || '#6b7280';
  };
  const obtenerIconoAccion = (accion) => { /* ... (igual que antes) ... */
    if (!accion) return '📋';
     if (accion.includes('CREAR')) return '➕'; if (accion.includes('EDITAR') || accion.includes('MODIFICAR') || accion.includes('UPDATE')) return '✏️'; if (accion.includes('ANEXAR')) return '📎'; if (accion.includes('GENERAR') || accion.includes('EXPORTAR')) return '📊'; if (accion.includes('LOGIN')) return '🔓'; if (accion.includes('LOGOUT')) return '🔒'; if (accion.includes('DESACTIVAR')) return '🚫'; if (accion.includes('DENEGADO')) return '⛔'; if (accion.includes('DELETE') || accion.includes('ELIMINAR')) return '🗑️'; return '📋';
  };

  // --- Renderizado ---
  return (
    <div className="animacion-entrada">
      {/* Indicador de carga o error */}
      {isLoading && <div className="texto-centro py-6"><div className="spinner" style={{ margin: '0 auto' }}></div><p>Cargando logs...</p></div>}
      {error && <div className="alerta alerta-error"><AlertCircle size={20}/> {error}</div>}

      {/* Solo renderiza el resto si no está cargando y no hay error */}
      {!isLoading && !error && (
        <>
          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="tarjeta tarjeta-hover">
                <p className="texto-sm texto-gris">Total Eventos</p>
                <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>{estadisticas.totalEventos}</p>
              </div>
              <div className="tarjeta tarjeta-hover">
                <p className="texto-sm texto-gris">Usuarios Activos</p>
                <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>{Object.keys(estadisticas.eventosPorUsuario).length}</p>
              </div>
              <div className="tarjeta tarjeta-hover">
                <p className="texto-sm texto-gris">Tipos de Acciones</p>
                <p className="texto-3xl font-bold" style={{ color: '#8b5cf6' }}>{Object.keys(estadisticas.eventosPorAccion).length}</p>
              </div>
              <div className="tarjeta tarjeta-hover">
                <p className="texto-sm texto-gris">Último Evento</p>
                <p className="texto-sm font-bold" style={{ color: '#f59e0b' }}>
                  {estadisticas.ultimoEvento ? new Date(estadisticas.ultimoEvento).toLocaleString('es-CL') : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Filtros y controles */}
          <div className="tarjeta mb-6">
            <div className="grid grid-cols-4 gap-4">
              {/* Input de búsqueda */}
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
                <input type="text" className="input" placeholder="Buscar en auditoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {/* Filtro por acción */}
              <select className="select" value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}>
                <option value="todas">Todas las acciones</option>
                {/* Usar ACCIONES_AUDITORIA para las opciones */}
                {Object.entries(ACCIONES_AUDITORIA).map(([key, value]) => (
                  <option key={value} value={value}>{key.replace(/_/g, ' ')}</option>
                ))}
                 {/* Opcional: obtener acciones únicas de los datos si ACCIONES_AUDITORIA no es exhaustivo */}
              </select>
              {/* Filtro por usuario */}
              <select className="select" value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}>
                <option value="todos">Todos los usuarios</option>
                {obtenerUsuariosUnicos.map(usuario => (
                  <option key={usuario} value={usuario}>{usuario}</option>
                ))}
              </select>
              {/* Botón de Exportar (Deshabilitado por ahora) */}
              <button
                // onClick={exportarAuditoriaJSON} // Función eliminada
                className="boton boton-secundario"
                disabled // Deshabilitado
                title="Función de exportación deshabilitada (implementar en backend)"
              >
                <Download size={18} />
                Exportar JSON (Deshab.)
              </button>
            </div>
          </div>

          {/* Tabla de eventos */}
          <div className="tarjeta">
            <div className="flex justify-between items-center mb-4">
              <h3 className="texto-xl font-bold flex items-center gap-2">
                <Shield size={24} style={{ color: '#2563eb' }} /> Registro de Auditoría
              </h3>
              <span className="texto-sm texto-gris">{eventosFiltrados.length} de {eventos.length} eventos</span>
            </div>

            {eventosFiltrados.length === 0 ? (
              <p className="texto-centro texto-gris py-6">No hay eventos de auditoría que coincidan con los filtros.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla">
                  <thead>
                    <tr><th>Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Ver</th></tr>
                  </thead>
                  <tbody>
                    {eventosFiltrados.map((evento) => (
                      <tr key={evento.id}>
                        {/* Usar los nombres de campo del serializer */}
                        <td className="texto-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: '#6b7280' }} />
                                {new Date(evento.fecha_accion).toLocaleString('es-CL')}
                            </div>
                        </td>
                        <td className="font-semibold">{evento.usuario_username || 'Sistema'}</td>
                        <td>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: obtenerColorAccion(evento.accion) + '20', color: obtenerColorAccion(evento.accion), border: `1px solid ${obtenerColorAccion(evento.accion)}` }}>
                            {obtenerIconoAccion(evento.accion)} {evento.accion?.replace(/_/g, ' ') || 'DESCONOCIDA'}
                          </span>
                        </td>
                        <td className="texto-sm" style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {evento.detalles || '-'}
                        </td>
                        <td>
                          <button onClick={() => setEventoSeleccionado(evento)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white' }} title="Ver detalle completo">
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

          {/* Modal de detalle del evento (Ajustado a campos del serializer) */}
          {eventoSeleccionado && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <div className="tarjeta" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                <h3 className="texto-xl font-bold mb-4">Detalle del Evento de Auditoría</h3>
                <div className="grid gap-4">
                  <div><p className="texto-sm texto-gris">ID del Evento</p><p className="font-mono texto-sm">{eventoSeleccionado.id}</p></div>
                  <div><p className="texto-sm texto-gris">Fecha y Hora</p><p className="font-semibold">{new Date(eventoSeleccionado.fecha_accion).toLocaleString('es-CL')}</p></div>
                  <div><p className="texto-sm texto-gris">Usuario</p><p className="font-semibold">{eventoSeleccionado.usuario_username || 'Sistema'}</p></div>
                   <div><p className="texto-sm texto-gris">IP Usuario</p><p className="font-mono texto-sm">{eventoSeleccionado.ip_usuario || 'N/A'}</p></div>
                  <div>
                    <p className="texto-sm texto-gris">Acción</p>
                    <span style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: obtenerColorAccion(eventoSeleccionado.accion) + '20', color: obtenerColorAccion(eventoSeleccionado.accion), border: `2px solid ${obtenerColorAccion(eventoSeleccionado.accion)}`, display: 'inline-block' }}>
                      {obtenerIconoAccion(eventoSeleccionado.accion)} {eventoSeleccionado.accion?.replace(/_/g, ' ') || 'DESCONOCIDA'}
                    </span>
                  </div>
                   {eventoSeleccionado.tabla_afectada && <div><p className="texto-sm texto-gris">Tabla Afectada</p><p className="font-mono texto-sm">{eventoSeleccionado.tabla_afectada}</p></div>}
                   {eventoSeleccionado.registro_id_uuid && <div><p className="texto-sm texto-gris">ID Registro Afectado</p><p className="font-mono texto-xs">{eventoSeleccionado.registro_id_uuid}</p></div>}
                  <div>
                    <p className="texto-sm texto-gris mb-2">Detalle Completo</p>
                    <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
                      <p className="texto-sm">{eventoSeleccionado.detalles || 'Sin detalles adicionales.'}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setEventoSeleccionado(null)} className="boton boton-primario mt-6" style={{ width: '100%' }}>Cerrar</button>
              </div>
            </div>
          )}

          {/* Nota Legal */}
          <div className="tarjeta mt-6 alerta-advertencia">
             {/* ... (igual que antes) ... */}
              <div className="flex items-start gap-3">
                  <Shield size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <div>
                    <p className="font-semibold" style={{ color: '#92400e' }}>Trazabilidad Total - Ley 20.584</p>
                    <p className="texto-sm mt-1" style={{ color: '#92400e' }}>
                      Todos los eventos quedan registrados permanentemente. No se puede eliminar ni modificar el historial de auditoría.
                    </p>
                  </div>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TablaAuditoria;