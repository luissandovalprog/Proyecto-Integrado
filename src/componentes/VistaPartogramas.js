import React, { useState } from 'react';
import { Activity, X, Search, Eye, Heart, TrendingUp, Droplets, Clock } from 'lucide-react';

const VistaPartogramas = ({ partogramas, madres, onCerrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [partogramaSeleccionado, setPartogramaSeleccionado] = useState(null);

  const partogramasFiltrados = partogramas.filter(part => {
    const madre = madres.find(m => m.id === part.madreId);
    
    return !busqueda || 
      madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
  });

  const DetallePartograma = ({ partograma }) => {
    const madre = madres.find(m => m.id === partograma.madreId);

    return (
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
          maxWidth: '900px', 
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="texto-2xl font-bold">Detalle del Partograma</h3>
            <button
              onClick={() => setPartogramaSeleccionado(null)}
              className="boton boton-gris"
            >
              <X size={20} />
            </button>
          </div>

          {/* Información del paciente */}
          <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="texto-sm texto-gris">Madre</p>
                <p className="font-semibold">{madre?.nombre}</p>
                <p className="texto-sm">RUT: {madre?.rut}</p>
              </div>
              <div>
                <p className="texto-sm texto-gris">Registrado por</p>
                <p className="font-semibold">{partograma.usuario}</p>
                <p className="texto-sm">
                  {new Date(partograma.fechaCreacion).toLocaleString('es-CL')}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de registros */}
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th><Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Hora</th>
                  <th><TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Dilatación</th>
                  <th><Heart size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />FCF</th>
                  <th><Activity size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Contracciones</th>
                  <th><Droplets size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />PA</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {partograma.registros.map((registro, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold">{registro.hora}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: registro.dilatacion >= 10 ? '#10b981' : 
                                       registro.dilatacion >= 7 ? '#f59e0b' : '#3b82f6',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {registro.dilatacion} cm
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: registro.fcf < 110 || registro.fcf > 160 ? '#ef4444' : '#10b981',
                        fontWeight: 'bold'
                      }}>
                        {registro.fcf} lat/min
                      </span>
                    </td>
                    <td>{registro.contracciones || '-'} / 10min</td>
                    <td>{registro.presionArterial || '-'}</td>
                    <td className="texto-sm">{registro.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen clínico */}
          <div className="tarjeta mt-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#1e40af' }}>Resumen Clínico</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="texto-sm texto-gris">Dilatación Final</p>
                <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
                  {partograma.registros[partograma.registros.length - 1]?.dilatacion || 0} cm
                </p>
              </div>
              <div>
                <p className="texto-sm texto-gris">FCF Última Medición</p>
                <p className="texto-2xl font-bold" style={{ color: '#10b981' }}>
                  {partograma.registros[partograma.registros.length - 1]?.fcf || 0} lat/min
                </p>
              </div>
              <div>
                <p className="texto-sm texto-gris">Total Registros</p>
                <p className="texto-2xl font-bold" style={{ color: '#8b5cf6' }}>
                  {partograma.registros.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="texto-2xl font-bold flex items-center gap-2">
            <Activity size={28} style={{ color: '#8b5cf6' }} />
            Partogramas Guardados
          </h2>
          <p className="texto-sm texto-gris mt-1">
            Registro del trabajo de parto
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

      {/* Búsqueda */}
      <div className="tarjeta mb-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="grupo-input">
          <label className="etiqueta">Buscar</label>
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
              placeholder="Buscar por RUT o nombre de madre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Lista de partogramas */}
      {partogramasFiltrados.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Activity size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay partogramas registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {partogramasFiltrados.map((partograma) => {
            const madre = madres.find(m => m.id === partograma.madreId);
            const ultimoRegistro = partograma.registros[partograma.registros.length - 1];

            return (
              <div
                key={partograma.id}
                className="tarjeta tarjeta-hover"
                style={{ borderLeft: '4px solid #8b5cf6' }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
                    <h3 className="font-semibold texto-lg mb-2">
                      {madre?.nombre || 'N/A'}
                    </h3>
                    <p className="texto-sm texto-gris mb-3">
                      RUT: {madre?.rut} | Registros: {partograma.registros.length}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="texto-xs texto-gris">Dilatación Final</p>
                        <p className="font-semibold" style={{ color: '#8b5cf6' }}>
                          {ultimoRegistro?.dilatacion || 0} cm
                        </p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">FCF</p>
                        <p className="font-semibold" style={{ color: '#10b981' }}>
                          {ultimoRegistro?.fcf || 0} lat/min
                        </p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Registrado por</p>
                        <p className="font-semibold texto-sm">{partograma.usuario}</p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Fecha</p>
                        <p className="font-semibold texto-sm">
                          {new Date(partograma.fechaCreacion).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPartogramaSeleccionado(partograma)}
                    className="boton"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#8b5cf6',
                      color: 'white'
                    }}
                  >
                    <Eye size={18} />
                    Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalle */}
      {partogramaSeleccionado && (
        <DetallePartograma partograma={partogramaSeleccionado} />
      )}

      {/* Resumen */}
      <div className="tarjeta mt-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="texto-sm texto-gris">Total Partogramas</p>
            <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
              {partogramas.length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Filtrados</p>
            <p className="texto-2xl font-bold" style={{ color: '#10b981' }}>
              {partogramasFiltrados.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPartogramas;