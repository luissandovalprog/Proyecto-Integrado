// src/componentes/EpicrisisMedica.js
import React, { useState } from 'react';
import { FileText, Pill, AlertCircle, Save, X, Plus, Trash2 } from 'lucide-react';
import { MENSAJES } from '../utilidades/constantes';

const EpicrisisMedica = ({ parto, madre, onGuardar, onCancelar }) => {
  const [epicrisis, setEpicrisis] = useState({
    motivoIngreso: '',
    resumenEvolucion: '',
    diagnosticoEgreso: '',
    condicionEgreso: 'buena',
    indicacionesAlta: '',
    controlPosterior: '',
    observaciones: ''
  });

  const [indicaciones, setIndicaciones] = useState([]);
  const [nuevaIndicacion, setNuevaIndicacion] = useState({
    tipo: 'medicamento',
    descripcion: '',
    dosis: '',
    via: 'oral',
    frecuencia: ''
  });

  const agregarIndicacion = () => {
    if (!nuevaIndicacion.descripcion) {
      alert('Debe ingresar una descripción para la indicación');
      return;
    }

    const indicacion = {
      ...nuevaIndicacion,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setIndicaciones([...indicaciones, indicacion]);
    setNuevaIndicacion({
      tipo: 'medicamento',
      descripcion: '',
      dosis: '',
      via: 'oral',
      frecuencia: ''
    });
  };

  const eliminarIndicacion = (id) => {
    setIndicaciones(indicaciones.filter(ind => ind.id !== id));
  };

  const handleGuardar = () => {
    if (!epicrisis.diagnosticoEgreso || !epicrisis.resumenEvolucion) {
      alert('Complete los campos obligatorios: Diagnóstico de Egreso y Resumen de Evolución');
      return;
    }

    const datosCompletos = {
      epicrisis,
      indicaciones,
      madreId: madre.id,
      partoId: parto?.id,
      fechaCreacion: new Date().toISOString()
    };

    onGuardar(datosCompletos);
  };

  return (
    <div className="animacion-entrada" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Información del paciente */}
      <div className="tarjeta mb-6">
        <h2 className="texto-2xl font-bold mb-4">Epicrisis e Indicaciones Médicas</h2>
        <div className="p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="texto-sm texto-gris">Paciente</p>
              <p className="font-semibold">{madre.nombre}</p>
              <p className="texto-sm">RUT: {madre.rut} | Edad: {madre.edad} años</p>
            </div>
            {parto && (
              <div>
                <p className="texto-sm texto-gris">Recién Nacido</p>
                <p className="font-semibold">{parto.rnId}</p>
                <p className="texto-sm">Peso: {parto.pesoRN}g | APGAR: {parto.apgar1}/{parto.apgar5}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Epicrisis */}
      <div className="tarjeta mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={24} style={{ color: '#2563eb' }} />
          <h3 className="texto-xl font-bold">Epicrisis</h3>
        </div>

        <div className="grid gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Motivo de Ingreso</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Trabajo de parto en fase activa"
              value={epicrisis.motivoIngreso}
              onChange={(e) => setEpicrisis({ ...epicrisis, motivoIngreso: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Resumen de Evolución *</label>
            <textarea
              className="textarea"
              rows="4"
              placeholder="Describa la evolución del paciente durante la hospitalización"
              value={epicrisis.resumenEvolucion}
              onChange={(e) => setEpicrisis({ ...epicrisis, resumenEvolucion: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Diagnóstico de Egreso *</label>
            <textarea
              className="textarea"
              rows="3"
              placeholder="Diagnóstico principal y secundarios"
              value={epicrisis.diagnosticoEgreso}
              onChange={(e) => setEpicrisis({ ...epicrisis, diagnosticoEgreso: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Condición al Egreso</label>
              <select
                className="select"
                value={epicrisis.condicionEgreso}
                onChange={(e) => setEpicrisis({ ...epicrisis, condicionEgreso: e.target.value })}
              >
                <option value="buena">Buena</option>
                <option value="regular">Regular</option>
                <option value="grave">Grave</option>
                <option value="fallecido">Fallecido</option>
              </select>
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Control Posterior</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Control en 7 días"
                value={epicrisis.controlPosterior}
                onChange={(e) => setEpicrisis({ ...epicrisis, controlPosterior: e.target.value })}
              />
            </div>
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Indicaciones al Alta</label>
            <textarea
              className="textarea"
              rows="3"
              placeholder="Indicaciones generales para el paciente"
              value={epicrisis.indicacionesAlta}
              onChange={(e) => setEpicrisis({ ...epicrisis, indicacionesAlta: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Observaciones</label>
            <textarea
              className="textarea"
              rows="2"
              placeholder="Observaciones adicionales"
              value={epicrisis.observaciones}
              onChange={(e) => setEpicrisis({ ...epicrisis, observaciones: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Sección de Indicaciones Médicas */}
      <div className="tarjeta mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill size={24} style={{ color: '#10b981' }} />
          <h3 className="texto-xl font-bold">Indicaciones Médicas</h3>
        </div>

        {/* Formulario para nueva indicación */}
        <div className="p-4 mb-4" style={{ backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '2px solid #10b981' }}>
          <h4 className="font-semibold mb-3">Nueva Indicación</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Tipo</label>
              <select
                className="select"
                value={nuevaIndicacion.tipo}
                onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, tipo: e.target.value })}
              >
                <option value="medicamento">Medicamento</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="cuidado">Cuidado de Enfermería</option>
                <option value="dieta">Dieta</option>
                <option value="reposo">Reposo</option>
              </select>
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Descripción *</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Paracetamol"
                value={nuevaIndicacion.descripcion}
                onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, descripcion: e.target.value })}
              />
            </div>

            {nuevaIndicacion.tipo === 'medicamento' && (
              <>
                <div className="grupo-input">
                  <label className="etiqueta">Dosis</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: 500mg"
                    value={nuevaIndicacion.dosis}
                    onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, dosis: e.target.value })}
                  />
                </div>

                <div className="grupo-input">
                  <label className="etiqueta">Vía de Administración</label>
                  <select
                    className="select"
                    value={nuevaIndicacion.via}
                    onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, via: e.target.value })}
                  >
                    <option value="oral">Oral</option>
                    <option value="intravenosa">Intravenosa</option>
                    <option value="intramuscular">Intramuscular</option>
                    <option value="subcutanea">Subcutánea</option>
                    <option value="topica">Tópica</option>
                  </select>
                </div>

                <div className="grupo-input">
                  <label className="etiqueta">Frecuencia</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Cada 8 horas"
                    value={nuevaIndicacion.frecuencia}
                    onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, frecuencia: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={agregarIndicacion}
            className="boton boton-secundario mt-3"
          >
            <Plus size={18} />
            Agregar Indicación
          </button>
        </div>

        {/* Lista de indicaciones */}
        {indicaciones.length === 0 ? (
          <p className="texto-centro texto-gris py-4">No hay indicaciones médicas agregadas</p>
        ) : (
          <div className="grid gap-3">
            {indicaciones.map((indicacion) => (
              <div
                key={indicacion.id}
                className="p-4"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#fff'
                }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
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
                    <p className="font-semibold">{indicacion.descripcion}</p>
                    {indicacion.tipo === 'medicamento' && (
                      <div className="texto-sm texto-gris mt-1">
                        {indicacion.dosis && <span>Dosis: {indicacion.dosis} | </span>}
                        {indicacion.via && <span>Vía: {indicacion.via} | </span>}
                        {indicacion.frecuencia && <span>Frecuencia: {indicacion.frecuencia}</span>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarIndicacion(indicacion.id)}
                    className="boton"
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white'
                    }}
                    title="Eliminar indicación"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advertencia */}
      <div className="tarjeta mb-6" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: '#92400e' }}>Importante</p>
            <p className="texto-sm mt-1" style={{ color: '#92400e' }}>
              La epicrisis e indicaciones médicas quedarán registradas en la ficha clínica del paciente.
              Asegúrese de revisar toda la información antes de guardar.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={handleGuardar}
          className="boton boton-primario"
          style={{ flex: 1 }}
        >
          <Save size={20} />
          Guardar Epicrisis e Indicaciones
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
  );
};

export default EpicrisisMedica;