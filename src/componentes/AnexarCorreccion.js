// src/componentes/AnexarCorreccion.js
import React, { useState } from 'react';
import { AlertTriangle, FileText, Save, X, Clock } from 'lucide-react';
import { MENSAJES } from '../utilidades/constantes';

const AnexarCorreccion = ({ parto, madre, onGuardar, onCancelar }) => {
  const [correccion, setCorreccion] = useState({
    campo: '',
    valorOriginal: '',
    valorNuevo: '',
    justificacion: ''
  });

  const camposEditables = [
    { valor: 'pesoRN', etiqueta: 'Peso del RN', valorActual: parto.pesoRN + 'g' },
    { valor: 'tallaRN', etiqueta: 'Talla del RN', valorActual: parto.tallaRN + 'cm' },
    { valor: 'apgar1', etiqueta: 'APGAR 1 min', valorActual: parto.apgar1 },
    { valor: 'apgar5', etiqueta: 'APGAR 5 min', valorActual: parto.apgar5 },
    { valor: 'tipo', etiqueta: 'Tipo de Parto', valorActual: parto.tipo },
    { valor: 'fecha', etiqueta: 'Fecha', valorActual: parto.fecha },
    { valor: 'hora', etiqueta: 'Hora', valorActual: parto.hora },
    { valor: 'observaciones', etiqueta: 'Observaciones', valorActual: parto.observaciones || 'Sin observaciones' }
  ];

  const handleCampoChange = (campo) => {
    const campoSeleccionado = camposEditables.find(c => c.valor === campo);
    setCorreccion({
      ...correccion,
      campo,
      valorOriginal: campoSeleccionado?.valorActual || '',
      valorNuevo: ''
    });
  };

  const handleGuardar = () => {
    if (!correccion.campo || !correccion.valorNuevo || !correccion.justificacion) {
      alert(MENSAJES.error.camposObligatorios);
      return;
    }

    if (correccion.justificacion.length < 20) {
      alert('La justificación debe tener al menos 20 caracteres');
      return;
    }

    const datosCorreccion = {
      ...correccion,
      fecha: new Date().toISOString(),
      partoId: parto.id,
      madreId: madre.id
    };

    onGuardar(datosCorreccion);
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Advertencia importante */}
      <div
        className="mb-6 p-4"
        style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: '#92400e' }}>
              Anexar Corrección - Trazabilidad Completa
            </p>
            <p className="texto-sm mt-1" style={{ color: '#92400e' }}>
              Esta acción NO sobrescribe el dato original. Se anexa una corrección que queda
              registrada en auditoría con justificación. El valor original permanece visible
              en el historial.
            </p>
          </div>
        </div>
      </div>

      <h2 className="texto-2xl font-bold mb-4">Anexar Corrección a Registro de Parto</h2>

      {/* Información del parto */}
      <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
        <h3 className="font-semibold mb-2">Información del Registro</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="texto-sm texto-gris">Madre</p>
            <p className="font-semibold">{madre.nombre}</p>
            <p className="texto-sm texto-gris">RUT: {madre.rut}</p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Recién Nacido</p>
            <p className="font-semibold">{parto.rnId}</p>
            <p className="texto-sm texto-gris">
              Registrado: {new Date(parto.fechaRegistro).toLocaleString('es-CL')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 p-2" style={{ backgroundColor: '#fff', borderRadius: '4px' }}>
          <Clock size={16} style={{ color: '#6b7280' }} />
          <span className="texto-sm texto-gris">
            Registrado por: <strong>{parto.registradoPor}</strong>
          </span>
        </div>
      </div>

      {/* Formulario de corrección */}
      <div className="grid gap-4">
        <div className="grupo-input">
          <label className="etiqueta">Campo a Corregir *</label>
          <select
            className="select"
            value={correccion.campo}
            onChange={(e) => handleCampoChange(e.target.value)}
          >
            <option value="">Seleccione un campo...</option>
            {camposEditables.map((campo) => (
              <option key={campo.valor} value={campo.valor}>
                {campo.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {correccion.campo && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="grupo-input">
                <label className="etiqueta">Valor Original (No se modificará)</label>
                <input
                  type="text"
                  className="input"
                  value={correccion.valorOriginal}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div className="grupo-input">
                <label className="etiqueta">Valor Corregido *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ingrese el valor correcto"
                  value={correccion.valorNuevo}
                  onChange={(e) => setCorreccion({ ...correccion, valorNuevo: e.target.value })}
                  style={{ borderColor: '#10b981', borderWidth: '2px' }}
                />
              </div>
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Justificación de la Corrección *</label>
              <textarea
                className="textarea"
                rows="4"
                placeholder="Describa detalladamente el motivo de la corrección (mínimo 20 caracteres)"
                value={correccion.justificacion}
                onChange={(e) => setCorreccion({ ...correccion, justificacion: e.target.value })}
                style={{ borderColor: '#10b981', borderWidth: '2px' }}
              />
              <p className="texto-xs texto-gris mt-1">
                {correccion.justificacion.length}/500 caracteres
              </p>
            </div>

            {/* Vista previa de la corrección */}
            <div
              className="p-4"
              style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '0.5rem'
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: '#065f46' }}>
                Vista Previa de la Corrección
              </h4>
              <div className="texto-sm">
                <p>
                  <strong>Campo:</strong>{' '}
                  {camposEditables.find(c => c.valor === correccion.campo)?.etiqueta}
                </p>
                <p className="mt-1">
                  <strong>Cambio:</strong>{' '}
                  <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>
                    {correccion.valorOriginal}
                  </span>
                  {' → '}
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    {correccion.valorNuevo || '(pendiente)'}
                  </span>
                </p>
                <p className="mt-1">
                  <strong>Justificación:</strong> {correccion.justificacion || '(pendiente)'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleGuardar}
          className="boton boton-primario"
          style={{ flex: 1 }}
          disabled={!correccion.campo || !correccion.valorNuevo || !correccion.justificacion}
        >
          <Save size={20} />
          Anexar Corrección
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

      {/* Nota legal */}
      <div className="mt-6 p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <p className="texto-xs texto-gris texto-centro">
          <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Esta corrección quedará registrada en auditoría según Ley 20.584 sobre Derechos y
          Deberes de los Pacientes. El registro original se mantiene intacto.
        </p>
      </div>
    </div>
  );
};

export default AnexarCorreccion;