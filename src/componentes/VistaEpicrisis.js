import React, { useState } from 'react';
import { Stethoscope, X, Search, Eye, FileText, Pill, Download } from 'lucide-react';
import { generarEpicrisisPDF } from '../utilidades/generarPDF';

const VistaEpicrisis = ({ epicrisis, partos, madres, onCerrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [epicrisisSeleccionada, setEpicrisisSeleccionada] = useState(null);

  const epicrisisFiltradas = epicrisis.filter(epi => {
    const madre = madres.find(m => m.id === epi.madreId);
    const parto = partos.find(p => p.id === epi.partoId);
    
    return !busqueda || 
      madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
      parto?.rnId.toLowerCase().includes(busqueda.toLowerCase());
  });

  const DetalleEpicrisis = ({ epicrisis }) => {
    const madre = madres.find(m => m.id === epicrisis.madreId);
    const parto = partos.find(p => p.id === epicrisis.partoId);

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
            <h3 className="texto-2xl font-bold">Epicrisis e Indicaciones Médicas</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  generarEpicrisisPDF(parto, madre, epicrisis);
                }}
                className="boton"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                <Download size={18} />
                Descargar PDF
              </button>
              <button
                onClick={() => setEpicrisisSeleccionada(null)}
                className="boton boton-gris"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="texto-sm texto-gris">Paciente</p>
                <p className="font-semibold">{madre?.nombre}</p>
                <p className="texto-sm">RUT: {madre?.rut} | Edad: {madre?.edad} años</p>
              </div>
              {parto && (
                <div>
                  <p className="texto-sm texto-gris">Recién Nacido</p>
                  <p className="font-semibold">{parto.rnId}</p>
                  <p className="texto-sm">Peso: {parto.pesoRN}g | APGAR: {parto.apgar1}/{parto.apgar5}</p>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #bfdbfe' }}>
              <p className="texto-sm">
                <strong>Médico:</strong> {epicrisis.medico} | 
                <strong> Fecha:</strong> {new Date(epicrisis.fechaCreacion).toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {/* Epicrisis */}
          <div className="tarjeta mb-6" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={24} style={{ color: '#2563eb' }} />
              <h4 className="texto-xl font-bold">Epicrisis</h4>
            </div>

            {epicrisis.epicrisis.motivoIngreso && (
              <div className="mb-4">
                <p className="texto-sm font-semibold texto-gris">Motivo de Ingreso</p>
                <p>{epicrisis.epicrisis.motivoIngreso}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="texto-sm font-semibold texto-gris">Resumen de Evolución</p>
              <p>{epicrisis.epicrisis.resumenEvolucion}</p>
            </div>

            <div className="mb-4">
              <p className="texto-sm font-semibold texto-gris">Diagnóstico de Egreso</p>
              <p>{epicrisis.epicrisis.diagnosticoEgreso}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="texto-sm font-semibold texto-gris">Condición al Egreso</p>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    backgroundColor: 
                      epicrisis.epicrisis.condicionEgreso === 'buena' ? '#dcfce7' :
                      epicrisis.epicrisis.condicionEgreso === 'regular' ? '#fef3c7' :
                      epicrisis.epicrisis.condicionEgreso === 'grave' ? '#fee2e2' : '#f3f4f6',
                    color:
                      epicrisis.epicrisis.condicionEgreso === 'buena' ? '#166534' :
                      epicrisis.epicrisis.condicionEgreso === 'regular' ? '#92400e' :
                      epicrisis.epicrisis.condicionEgreso === 'grave' ? '#991b1b' : '#374151'
                  }}
                >
                  {epicrisis.epicrisis.condicionEgreso.toUpperCase()}
                </span>
              </div>
              {epicrisis.epicrisis.controlPosterior && (
                <div>
                  <p className="texto-sm font-semibold texto-gris">Control Posterior</p>
                  <p>{epicrisis.epicrisis.controlPosterior}</p>
                </div>
              )}
            </div>

            {epicrisis.epicrisis.indicacionesAlta && (
              <div className="mb-4">
                <p className="texto-sm font-semibold texto-gris">Indicaciones al Alta</p>
                <p>{epicrisis.epicrisis.indicacionesAlta}</p>
              </div>
            )}

            {epicrisis.epicrisis.observaciones && (
              <div>
                <p className="texto-sm font-semibold texto-gris">Observaciones</p>
                <p>{epicrisis.epicrisis.observaciones}</p>
              </div>
            )}
          </div>

          {/* Indicaciones Médicas */}
          <div className="tarjeta" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="flex items-center gap-2 mb-4">
              <Pill size={24} style={{ color: '#10b981' }} />
              <h4 className="texto-xl font-bold">Indicaciones Médicas ({epicrisis.indicaciones.length})</h4>
            </div>

            {epicrisis.indicaciones.length === 0 ? (
              <p className="texto-centro texto-gris py-4">Sin indicaciones médicas</p>
            ) : (
              <div className="grid gap-3">
                {epicrisis.indicaciones.map((indicacion, idx) => (
                  <div
                    key={idx}
                    className="p-4"
                    style={{
                      border: '1px solid #d1fae5',
                      borderRadius: '0.5rem',
                      backgroundColor: '#fff'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: 
                            indicacion.tipo === 'medicamento' ? '#dbeafe' :
                            indicacion.tipo === 'procedimiento' ? '#fef3c7' :
                            indicacion.tipo === 'cuidado' ? '#dcfce7' :
                            indicacion.tipo === 'dieta' ? '#fce7f3' : '#f3f4f6',
                          color:
                            indicacion.tipo === 'medicamento' ? '#1e40af' :
                            indicacion.tipo === 'procedimiento' ? '#92400e' :
                            indicacion.tipo === 'cuidado' ? '#166534' :
                            indicacion.tipo === 'dieta' ? '#9f1239' : '#374151'
                        }}
                      >
                        {indicacion.tipo.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-semibold mb-1">{indicacion.descripcion}</p>
                    {indicacion.tipo === 'medicamento' && (
                      <div className="texto-sm texto-gris">
                        {indicacion.dosis && <span>Dosis: {indicacion.dosis} | </span>}
                        {indicacion.via && <span>Vía: {indicacion.via} | </span>}
                        {indicacion.frecuencia && <span>Frecuencia: {indicacion.frecuencia}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            <Stethoscope size={28} style={{ color: '#7c3aed' }} />
            Epicrisis e Indicaciones Guardadas
          </h2>
          <p className="texto-sm texto-gris mt-1">
            Documentación médica de alta
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
              placeholder="Buscar por RUT, nombre o ID RN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Lista de epicrisis */}
      {epicrisisFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Stethoscope size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay epicrisis registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {epicrisisFiltradas.map((epi) => {
            const madre = madres.find(m => m.id === epi.madreId);
            const parto = partos.find(p => p.id === epi.partoId);

            return (
              <div
                key={epi.id}
                className="tarjeta tarjeta-hover"
                style={{ borderLeft: '4px solid #7c3aed' }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
                    <h3 className="font-semibold texto-lg mb-2">
                      {madre?.nombre || 'N/A'}
                    </h3>
                    <p className="texto-sm texto-gris mb-3">
                      RUT: {madre?.rut} | RN: {parto?.rnId}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="texto-xs texto-gris">Diagnóstico</p>
                        <p className="font-semibold texto-sm">
                          {epi.epicrisis.diagnosticoEgreso.substring(0, 30)}...
                        </p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Condición</p>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: 
                              epi.epicrisis.condicionEgreso === 'buena' ? '#dcfce7' :
                              epi.epicrisis.condicionEgreso === 'regular' ? '#fef3c7' :
                              epi.epicrisis.condicionEgreso === 'grave' ? '#fee2e2' : '#f3f4f6',
                            color:
                              epi.epicrisis.condicionEgreso === 'buena' ? '#166534' :
                              epi.epicrisis.condicionEgreso === 'regular' ? '#92400e' :
                              epi.epicrisis.condicionEgreso === 'grave' ? '#991b1b' : '#374151'
                          }}
                        >
                          {epi.epicrisis.condicionEgreso.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Médico</p>
                        <p className="font-semibold texto-sm">{epi.medico}</p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Fecha</p>
                        <p className="font-semibold texto-sm">
                          {new Date(epi.fechaCreacion).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      <p className="texto-xs texto-gris">
                        {epi.indicaciones.length} indicaciones médicas registradas
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEpicrisisSeleccionada(epi)}
                    className="boton"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#7c3aed',
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
      {epicrisisSeleccionada && (
        <DetalleEpicrisis epicrisis={epicrisisSeleccionada} />
      )}

      {/* Resumen */}
      <div className="tarjeta mt-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="texto-sm texto-gris">Total Epicrisis</p>
            <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
              {epicrisis.length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Filtradas</p>
            <p className="texto-2xl font-bold" style={{ color: '#10b981' }}>
              {epicrisisFiltradas.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaEpicrisis;