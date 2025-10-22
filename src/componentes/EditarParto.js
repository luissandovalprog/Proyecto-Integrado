import React, { useState } from 'react';
import { Edit3, Save, X, Clock, AlertTriangle } from 'lucide-react';

const EditarParto = ({ parto, madre, onGuardar, onCancelar }) => {
  const [datos, setDatos] = useState({
    tipo: parto.tipo,
    fecha: parto.fecha,
    hora: parto.hora,
    pesoRN: parto.pesoRN,
    tallaRN: parto.tallaRN,
    apgar1: parto.apgar1,
    apgar5: parto.apgar5,
    corticoides: parto.corticoides || 'no',
    observaciones: parto.observaciones || ''
  });
  const [errores, setErrores] = useState({});

  // Calcular tiempo restante de edición
  const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
  const horasRestantes = Math.max(0, 2 - Math.floor(tiempoTranscurrido / (1000 * 60 * 60)));
  const minutosRestantes = Math.max(0, 120 - Math.floor(tiempoTranscurrido / (1000 * 60))) % 60;

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!datos.pesoRN) nuevosErrores.pesoRN = 'El peso es obligatorio';
    else if (datos.pesoRN < 500 || datos.pesoRN > 6000) {
      nuevosErrores.pesoRN = 'Peso fuera del rango válido (500-6000g)';
    }
    
    if (!datos.tallaRN) nuevosErrores.tallaRN = 'La talla es obligatoria';
    else if (datos.tallaRN < 30 || datos.tallaRN > 70) {
      nuevosErrores.tallaRN = 'Talla fuera del rango válido (30-70cm)';
    }
    
    if (!datos.apgar1) nuevosErrores.apgar1 = 'APGAR 1min es obligatorio';
    if (!datos.apgar5) nuevosErrores.apgar5 = 'APGAR 5min es obligatorio';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onGuardar(datos);
    }
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Advertencia de ventana temporal */}
      <div
        className="mb-6 p-4"
        style={{
          backgroundColor: horasRestantes < 1 ? '#fee2e2' : '#fef3c7',
          borderLeft: `4px solid ${horasRestantes < 1 ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <Clock size={24} style={{ color: horasRestantes < 1 ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: horasRestantes < 1 ? '#991b1b' : '#92400e' }}>
              Ventana de Edición: {horasRestantes}h {minutosRestantes}min restantes
            </p>
            <p className="texto-sm mt-1" style={{ color: horasRestantes < 1 ? '#991b1b' : '#92400e' }}>
              Como matrona, puede editar este registro solo dentro de las primeras 2 horas.
              Después de este tiempo, deberá solicitar a un médico que anexe una corrección.
            </p>
          </div>
        </div>
      </div>

      <h2 className="texto-2xl font-bold mb-4 flex items-center gap-2">
        <Edit3 size={28} style={{ color: '#2563eb' }} />
        Editar Registro de Parto
      </h2>

      {/* Información del parto */}
      <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="texto-sm texto-gris">Madre</p>
            <p className="font-semibold">{madre?.nombre}</p>
            <p className="texto-sm">RUT: {madre?.rut}</p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Recién Nacido</p>
            <p className="font-semibold">{parto.rnId}</p>
            <p className="texto-sm">
              Registrado: {new Date(parto.fechaRegistro).toLocaleString('es-CL')}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #bfdbfe' }}>
          <p className="texto-sm">
            <strong>Registrado por:</strong> {parto.registradoPor}
          </p>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Tipo de Parto *</label>
            <select
              className="select"
              value={datos.tipo}
              onChange={(e) => setDatos({ ...datos, tipo: e.target.value })}
            >
              <option value="Vaginal">Vaginal</option>
              <option value="Cesárea">Cesárea</option>
              <option value="Fórceps">Fórceps</option>
              <option value="Ventosa">Ventosa</option>
            </select>
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Fecha *</label>
            <input
              type="date"
              className="input"
              value={datos.fecha}
              onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Hora *</label>
            <input
              type="time"
              className="input"
              value={datos.hora}
              onChange={(e) => setDatos({ ...datos, hora: e.target.value })}
            />
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Peso del RN (gramos) *</label>
            <input
              type="number"
              className={`input ${errores.pesoRN ? 'input-error' : ''}`}
              placeholder="3500"
              value={datos.pesoRN}
              onChange={(e) => setDatos({ ...datos, pesoRN: e.target.value })}
              min="500"
              max="6000"
            />
            {errores.pesoRN && <p className="mensaje-error">{errores.pesoRN}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Talla del RN (cm) *</label>
            <input
              type="number"
              className={`input ${errores.tallaRN ? 'input-error' : ''}`}
              placeholder="50"
              value={datos.tallaRN}
              onChange={(e) => setDatos({ ...datos, tallaRN: e.target.value })}
              min="30"
              max="70"
            />
            {errores.tallaRN && <p className="mensaje-error">{errores.tallaRN}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">APGAR 1 min *</label>
            <input
              type="number"
              className={`input ${errores.apgar1 ? 'input-error' : ''}`}
              placeholder="9"
              value={datos.apgar1}
              onChange={(e) => setDatos({ ...datos, apgar1: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar1 && <p className="mensaje-error">{errores.apgar1}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">APGAR 5 min *</label>
            <input
              type="number"
              className={`input ${errores.apgar5 ? 'input-error' : ''}`}
              placeholder="10"
              value={datos.apgar5}
              onChange={(e) => setDatos({ ...datos, apgar5: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar5 && <p className="mensaje-error">{errores.apgar5}</p>}
          </div>
        </div>

        <div className="grupo-input">
          <label className="etiqueta">¿La madre recibió corticoides durante la gestación? *</label>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="corticoides"
                value="si"
                checked={datos.corticoides === 'si'}
                onChange={(e) => setDatos({ ...datos, corticoides: e.target.value })}
              />
              <span>Sí</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="corticoides"
                value="no"
                checked={datos.corticoides === 'no'}
                onChange={(e) => setDatos({ ...datos, corticoides: e.target.value })}
              />
              <span>No</span>
            </label>
          </div>
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Observaciones</label>
          <textarea
            className="textarea"
            rows="3"
            placeholder="Observaciones adicionales del parto"
            value={datos.observaciones}
            onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
          />
        </div>

        {/* Advertencia de trazabilidad */}
        <div
          className="mb-6 p-4"
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #3b82f6',
            borderRadius: '0.5rem'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
            <div>
              <p className="font-semibold texto-sm" style={{ color: '#1e40af' }}>
                Importante
              </p>
              <p className="texto-xs mt-1" style={{ color: '#1e40af' }}>
                Los cambios quedarán registrados en auditoría. Esta edición sobrescribe
                los datos originales dentro de la ventana de 2 horas permitida.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="boton boton-primario" style={{ flex: 1 }}>
            <Save size={20} />
            Guardar Cambios
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
      </div>
    </div>
  );
};

export default EditarParto;