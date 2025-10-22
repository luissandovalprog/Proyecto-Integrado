import React, { useState } from 'react';
import { FileText, AlertTriangle, X, Calendar, User, Clock } from 'lucide-react';

const VistaCorrecciones = ({ correcciones, partos, madres, onCerrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');

  const correccionesFiltradas = correcciones.filter(corr => {
    const parto = partos.find(p => p.id === corr.partoId);
    const madre = madres.find(m => m.id === corr.madreId);
    
    const coincideBusqueda = !busqueda || 
      madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
      parto?.rnId.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideUsuario = filtroUsuario === 'todos' || corr.usuarioCorreccion === filtroUsuario;
    
    return coincideBusqueda && coincideUsuario;
  });

  const usuariosUnicos = [...new Set(correcciones.map(c => c.usuarioCorreccion))];

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="texto-2xl font-bold flex items-center gap-2">
            <FileText size={28} style={{ color: '#f59e0b' }} />
            Correcciones Anexadas
          </h2>
          <p className="texto-sm texto-gris mt-1">
            Historial completo de correcciones según Ley 20.584
          </p>
        </div>
        <button
          onClick={onCerrar}
          className="boton boton-gris"
        >
          <X size={20} />
          Cerrar
        </button>
      </div>

      {/* Filtros */}
      <div className="tarjeta mb-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Buscar</label>
            <input
              type="text"
              className="input"
              placeholder="Buscar por RUT, nombre o ID RN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Filtrar por Usuario</label>
            <select
              className="select"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
            >
              <option value="todos">Todos los usuarios</option>
              {usuariosUnicos.map(usuario => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advertencia de trazabilidad */}
      <div
        className="mb-6 p-4"
        style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: '#92400e' }}>
              Trazabilidad Completa
            </p>
            <p className="texto-sm mt-1" style={{ color: '#92400e' }}>
              Las correcciones NO sobrescriben datos originales. Cada cambio queda
              registrado permanentemente con justificación.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de correcciones */}
      {correccionesFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay correcciones registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {correccionesFiltradas.map((correccion) => {
            const parto = partos.find(p => p.id === correccion.partoId);
            const madre = madres.find(m => m.id === correccion.madreId);

            return (
              <div
                key={correccion.id}
                className="tarjeta"
                style={{
                  borderLeft: '4px solid #f59e0b',
                  backgroundColor: '#fffbeb'
                }}
              >
                {/* Encabezado */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold texto-lg">
                      RN: {parto?.rnId || 'N/A'}
                    </h3>
                    <p className="texto-sm texto-gris">
                      Madre: {madre?.nombre} ({madre?.rut})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: '#7c3aed',
                        color: 'white'
                      }}
                    >
                      {correccion.rolUsuario.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Información de la corrección */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="texto-sm texto-gris mb-1">Campo Corregido</p>
                    <p className="font-semibold">{correccion.campo}</p>
                  </div>
                  <div>
                    <p className="texto-sm texto-gris mb-1">Usuario</p>
                    <p className="font-semibold flex items-center gap-2">
                      <User size={16} />
                      {correccion.usuarioCorreccion}
                    </p>
                  </div>
                </div>

                {/* Cambio realizado */}
                <div className="mb-4 p-3" style={{ backgroundColor: '#fff', borderRadius: '0.5rem' }}>
                  <p className="texto-sm font-semibold mb-2">Cambio Realizado:</p>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: '#ef4444',
                        fontWeight: 'bold'
                      }}
                    >
                      {correccion.valorOriginal}
                    </span>
                    <span style={{ color: '#6b7280' }}>→</span>
                    <span
                      style={{
                        color: '#10b981',
                        fontWeight: 'bold'
                      }}
                    >
                      {correccion.valorNuevo}
                    </span>
                  </div>
                </div>

                {/* Justificación */}
                <div className="mb-4 p-3" style={{ backgroundColor: '#fff', borderRadius: '0.5rem' }}>
                  <p className="texto-sm font-semibold mb-2">Justificación:</p>
                  <p className="texto-sm">{correccion.justificacion}</p>
                </div>

                {/* Footer con timestamp */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2 texto-xs texto-gris">
                    <Calendar size={14} />
                    <span>{new Date(correccion.fechaCorreccion).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center gap-2 texto-xs texto-gris">
                    <Clock size={14} />
                    <span>ID: {correccion.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen */}
      <div className="tarjeta mt-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="texto-sm texto-gris">Total Correcciones</p>
            <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
              {correcciones.length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Filtradas</p>
            <p className="texto-2xl font-bold" style={{ color: '#10b981' }}>
              {correccionesFiltradas.length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Usuarios</p>
            <p className="texto-2xl font-bold" style={{ color: '#8b5cf6' }}>
              {usuariosUnicos.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaCorrecciones;