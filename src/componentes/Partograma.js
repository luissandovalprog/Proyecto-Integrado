// src/componentes/Partograma.js
import React, { useState } from 'react';
import { Activity, Heart, Droplets, TrendingUp, Save, X, Plus, Clock } from 'lucide-react';
import { MENSAJES } from '../utilidades/constantes';

const Partograma = ({ parto, madre, onGuardar, onCancelar, soloLectura = false }) => {
  const [registros, setRegistros] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    hora: new Date().toTimeString().slice(0, 5),
    dilatacion: '',
    fcf: '', // Frecuencia Cardíaca Fetal
    contracciones: '',
    presionArterial: '',
    observaciones: ''
  });

  const agregarRegistro = () => {
    if (!nuevoRegistro.hora || !nuevoRegistro.dilatacion || !nuevoRegistro.fcf) {
      alert('Complete los campos obligatorios: Hora, Dilatación y FCF');
      return;
    }

    const registro = {
      ...nuevoRegistro,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setRegistros([...registros, registro]);
    setNuevoRegistro({
      hora: new Date().toTimeString().slice(0, 5),
      dilatacion: '',
      fcf: '',
      contracciones: '',
      presionArterial: '',
      observaciones: ''
    });
  };

  const handleGuardar = () => {
    if (registros.length === 0) {
      alert('Debe agregar al menos un registro al partograma');
      return;
    }

    const partograma = {
      madreId: madre.id,
      partoId: parto?.id,
      registros,
      fechaCreacion: new Date().toISOString()
    };

    onGuardar(partograma);
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mb-6">
        <h2 className="texto-2xl font-bold mb-2">Partograma Electrónico</h2>
        <div className="p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="texto-sm texto-gris">Madre</p>
              <p className="font-semibold">{madre.nombre}</p>
              <p className="texto-sm">RUT: {madre.rut}</p>
            </div>
            <div>
              <p className="texto-sm texto-gris">Fecha de Inicio</p>
              <p className="font-semibold">{new Date().toLocaleDateString('es-CL')}</p>
              <p className="texto-sm">{new Date().toLocaleTimeString('es-CL')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para nuevo registro */}
      {!soloLectura && (
        <div className="tarjeta mb-6" style={{ backgroundColor: '#f0fdf4', border: '2px solid #10b981' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} style={{ color: '#10b981' }} />
            Nuevo Registro
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Hora *</label>
              <input
                type="time"
                className="input"
                value={nuevoRegistro.hora}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, hora: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Dilatación (cm) *</label>
              <input
                type="number"
                className="input"
                placeholder="0-10"
                min="0"
                max="10"
                value={nuevoRegistro.dilatacion}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, dilatacion: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">FCF (lat/min) *</label>
              <input
                type="number"
                className="input"
                placeholder="110-160"
                min="80"
                max="200"
                value={nuevoRegistro.fcf}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fcf: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Contracciones (10 min)</label>
              <input
                type="number"
                className="input"
                placeholder="0-5"
                min="0"
                max="10"
                value={nuevoRegistro.contracciones}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, contracciones: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Presión Arterial</label>
              <input
                type="text"
                className="input"
                placeholder="120/80"
                value={nuevoRegistro.presionArterial}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, presionArterial: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Observaciones</label>
              <input
                type="text"
                className="input"
                placeholder="Observaciones clínicas"
                value={nuevoRegistro.observaciones}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, observaciones: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={agregarRegistro}
            className="boton boton-secundario mt-4"
          >
            <Plus size={18} />
            Agregar Registro
          </button>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="tarjeta">
        <h3 className="font-semibold mb-4">Registros del Partograma ({registros.length})</h3>
        
        {registros.length === 0 ? (
          <p className="texto-centro texto-gris py-6">No hay registros en el partograma</p>
        ) : (
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
                {registros.map((registro) => (
                  <tr key={registro.id}>
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
        )}
      </div>

      {/* Interpretación clínica */}
      {registros.length > 0 && (
        <div className="tarjeta mt-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
          <h4 className="font-semibold mb-3" style={{ color: '#1e40af' }}>Resumen Clínico</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="texto-sm texto-gris">Dilatación Actual</p>
              <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
                {registros[registros.length - 1].dilatacion} cm
              </p>
            </div>
            <div>
              <p className="texto-sm texto-gris">FCF Última Medición</p>
              <p className="texto-2xl font-bold" style={{ color: '#10b981' }}>
                {registros[registros.length - 1].fcf} lat/min
              </p>
            </div>
            <div>
              <p className="texto-sm texto-gris">Duración Trabajo de Parto</p>
              <p className="texto-2xl font-bold" style={{ color: '#8b5cf6' }}>
                {registros.length} registros
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {!soloLectura && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleGuardar}
            className="boton boton-primario"
            style={{ flex: 1 }}
            disabled={registros.length === 0}
          >
            <Save size={20} />
            Guardar Partograma
          </button>
          <button
            onClick={onCancelar}
            className="boton boton-gris"
            style={{ flex: 1 }}
          >
            <X size={20} />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default Partograma;