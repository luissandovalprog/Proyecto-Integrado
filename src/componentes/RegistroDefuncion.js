import React, { useState } from 'react';
import { AlertTriangle, Save, X, Skull, Calendar } from 'lucide-react';
import { datosMock } from '../mocks/datos';

const RegistroDefuncion = ({ madres, partos, onGuardar, onCancelar }) => {
  const [defuncion, setDefuncion] = useState({
    tipo: 'recien_nacido', // 'recien_nacido' o 'madre'
    recienNacidoId: '',
    madreId: '',
    fechaDefuncion: new Date().toISOString().split('T')[0],
    horaDefuncion: new Date().toTimeString().slice(0, 5),
    causaDefuncionCodigo: '',
    observaciones: ''
  });

  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (defuncion.tipo === 'recien_nacido' && !defuncion.recienNacidoId) {
      nuevosErrores.recienNacidoId = 'Debe seleccionar un recién nacido';
    }

    if (defuncion.tipo === 'madre' && !defuncion.madreId) {
      nuevosErrores.madreId = 'Debe seleccionar una madre';
    }

    if (!defuncion.fechaDefuncion) {
      nuevosErrores.fechaDefuncion = 'La fecha de defunción es obligatoria';
    }

    if (!defuncion.horaDefuncion) {
      nuevosErrores.horaDefuncion = 'La hora de defunción es obligatoria';
    }

    if (!defuncion.causaDefuncionCodigo) {
      nuevosErrores.causaDefuncionCodigo = 'Debe seleccionar una causa de defunción (CIE-10)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onGuardar(defuncion);
    }
  };

  const causasDefuncion = datosMock.diagnosticosCIE10.filter(d => 
    d.codigo.startsWith('P') || d.codigo.startsWith('O') || d.codigo === 'P95'
  );

  const recienNacidosDisponibles = partos.filter(p => p.estadoAlNacer === 'Vivo');

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* ADVERTENCIA CRÍTICA */}
      <div
        className="mb-6 p-4"
        style={{
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #ef4444',
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: '#991b1b' }}>
              Registro de Defunción - Documento Crítico
            </p>
            <p className="texto-sm mt-1" style={{ color: '#991b1b' }}>
              Este registro es necesario para el Reporte REM A04 y tiene implicancias legales.
              Asegúrese de que toda la información sea precisa y esté validada por el médico responsable.
            </p>
          </div>
        </div>
      </div>

      <h2 className="texto-2xl font-bold mb-6 flex items-center gap-2">
        <Skull size={28} style={{ color: '#ef4444' }} />
        Registro de Defunción
      </h2>

      {/* TIPO DE DEFUNCIÓN */}
      <div className="grupo-input mb-6">
        <label className="etiqueta">Tipo de Defunción *</label>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            border: defuncion.tipo === 'recien_nacido' ? '2px solid #2563eb' : '1px solid #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            flex: 1,
            backgroundColor: defuncion.tipo === 'recien_nacido' ? '#dbeafe' : '#fff'
          }}>
            <input
              type="radio"
              name="tipo"
              value="recien_nacido"
              checked={defuncion.tipo === 'recien_nacido'}
              onChange={(e) => setDefuncion({ 
                ...defuncion, 
                tipo: e.target.value,
                madreId: '',
                recienNacidoId: ''
              })}
            />
            <div>
              <span className="font-semibold">Recién Nacido</span>
              <p className="texto-xs texto-gris">Muerte neonatal</p>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            border: defuncion.tipo === 'madre' ? '2px solid #2563eb' : '1px solid #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            flex: 1,
            backgroundColor: defuncion.tipo === 'madre' ? '#dbeafe' : '#fff'
          }}>
            <input
              type="radio"
              name="tipo"
              value="madre"
              checked={defuncion.tipo === 'madre'}
              onChange={(e) => setDefuncion({ 
                ...defuncion, 
                tipo: e.target.value,
                madreId: '',
                recienNacidoId: ''
              })}
            />
            <div>
              <span className="font-semibold">Madre</span>
              <p className="texto-xs texto-gris">Muerte materna</p>
            </div>
          </label>
        </div>
      </div>

      {/* SELECCIÓN DE PACIENTE */}
      {defuncion.tipo === 'recien_nacido' && (
        <div className="grupo-input">
          <label className="etiqueta">Seleccionar Recién Nacido *</label>
          <select
            className={`select ${errores.recienNacidoId ? 'input-error' : ''}`}
            value={defuncion.recienNacidoId}
            onChange={(e) => setDefuncion({ ...defuncion, recienNacidoId: e.target.value })}
          >
            <option value="">-- Seleccione un recién nacido --</option>
            {recienNacidosDisponibles.map(parto => {
              const madre = madres.find(m => m.id === parto.madreId);
              return (
                <option key={parto.id} value={parto.id}>
                  {parto.rnId} - Madre: {madre?.nombre} ({madre?.rut}) - {new Date(parto.fecha).toLocaleDateString('es-CL')}
                </option>
              );
            })}
          </select>
          {errores.recienNacidoId && <p className="mensaje-error">{errores.recienNacidoId}</p>}
        </div>
      )}

      {defuncion.tipo === 'madre' && (
        <div className="grupo-input">
          <label className="etiqueta">Seleccionar Madre *</label>
          <select
            className={`select ${errores.madreId ? 'input-error' : ''}`}
            value={defuncion.madreId}
            onChange={(e) => setDefuncion({ ...defuncion, madreId: e.target.value })}
          >
            <option value="">-- Seleccione una madre --</option>
            {madres.map(madre => (
              <option key={madre.id} value={madre.id}>
                {madre.nombre} - {madre.rut}
              </option>
            ))}
          </select>
          {errores.madreId && <p className="mensaje-error">{errores.madreId}</p>}
        </div>
      )}

      {/* FECHA Y HORA DE DEFUNCIÓN */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grupo-input">
          <label className="etiqueta">Fecha de Defunción *</label>
          <input
            type="date"
            className={`input ${errores.fechaDefuncion ? 'input-error' : ''}`}
            value={defuncion.fechaDefuncion}
            onChange={(e) => setDefuncion({ ...defuncion, fechaDefuncion: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
          {errores.fechaDefuncion && <p className="mensaje-error">{errores.fechaDefuncion}</p>}
        </div>

        <div className="grupo-input">
          <label className="etiqueta">Hora de Defunción *</label>
          <input
            type="time"
            className={`input ${errores.horaDefuncion ? 'input-error' : ''}`}
            value={defuncion.horaDefuncion}
            onChange={(e) => setDefuncion({ ...defuncion, horaDefuncion: e.target.value })}
          />
          {errores.horaDefuncion && <p className="mensaje-error">{errores.horaDefuncion}</p>}
        </div>
      </div>

      {/* CAUSA DE DEFUNCIÓN (CIE-10) */}
      <div className="grupo-input">
        <label className="etiqueta">Causa de Defunción (Código CIE-10) *</label>
        <select
          className={`select ${errores.causaDefuncionCodigo ? 'input-error' : ''}`}
          value={defuncion.causaDefuncionCodigo}
          onChange={(e) => setDefuncion({ ...defuncion, causaDefuncionCodigo: e.target.value })}
        >
          <option value="">-- Seleccione una causa --</option>
          {causasDefuncion.map(causa => (
            <option key={causa.codigo} value={causa.codigo}>
              {causa.codigo} - {causa.descripcion}
            </option>
          ))}
        </select>
        {errores.causaDefuncionCodigo && <p className="mensaje-error">{errores.causaDefuncionCodigo}</p>}
        <p className="texto-xs texto-gris mt-1">
          Requerido para el Reporte REM A04
        </p>
      </div>

      {/* OBSERVACIONES */}
      <div className="grupo-input">
        <label className="etiqueta">Observaciones Médicas</label>
        <textarea
          className="textarea"
          rows="4"
          placeholder="Detalles adicionales sobre las circunstancias de la defunción..."
          value={defuncion.observaciones}
          onChange={(e) => setDefuncion({ ...defuncion, observaciones: e.target.value })}
        />
      </div>

      {/* VISTA PREVIA */}
      {(defuncion.recienNacidoId || defuncion.madreId) && defuncion.causaDefuncionCodigo && (
        <div
          className="p-4 mb-6"
          style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '0.5rem'
          }}
        >
          <h4 className="font-semibold mb-2" style={{ color: '#92400e' }}>
            <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Vista Previa del Registro
          </h4>
          <div className="texto-sm">
            <p><strong>Tipo:</strong> {defuncion.tipo === 'recien_nacido' ? 'Recién Nacido' : 'Madre'}</p>
            <p><strong>Fecha:</strong> {new Date(defuncion.fechaDefuncion).toLocaleDateString('es-CL')} a las {defuncion.horaDefuncion}</p>
            <p><strong>Causa:</strong> {causasDefuncion.find(c => c.codigo === defuncion.causaDefuncionCodigo)?.descripcion}</p>
          </div>
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="boton"
          style={{ 
            flex: 1, 
            backgroundColor: '#ef4444', 
            color: 'white' 
          }}
        >
          <Save size={20} />
          Registrar Defunción
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

      {/* NOTA LEGAL */}
      <div className="mt-6 p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <p className="texto-xs texto-gris texto-centro">
          Este registro quedará permanentemente en auditoría y será incluido en los reportes ministeriales REM A04.
          Solo personal médico autorizado puede registrar defunciones.
        </p>
      </div>
    </div>
  );
};

export default RegistroDefuncion;