import React, { useState } from 'react';
import { Skull, X, Search, Eye, Calendar, User, AlertTriangle } from 'lucide-react';

const VistaDefunciones = ({ defunciones, partos, madres, onCerrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [defuncionSeleccionada, setDefuncionSeleccionada] = useState(null);

  const defuncionesFiltradas = defunciones.filter(def => {
    if (def.tipo === 'recien_nacido') {
      const parto = partos.find(p => p.id === parseInt(def.recienNacidoId));
      const madre = madres.find(m => m.id === parto?.madreId);
      
      return !busqueda || 
        parto?.rnId.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
    } else {
      const madre = madres.find(m => m.id === parseInt(def.madreId));
      
      return !busqueda ||
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
    }
  });

  const DetalleDefuncion = ({ defuncion }) => {
    let pacienteInfo = null;

    if (defuncion.tipo === 'recien_nacido') {
      const parto = partos.find(p => p.id === parseInt(defuncion.recienNacidoId));
      const madre = madres.find(m => m.id === parto?.madreId);
      pacienteInfo = {
        tipo: 'Recién Nacido',
        nombre: parto?.rnId || 'N/A',
        madre: madre?.nombre || 'N/A',
        rut: madre?.rut || 'N/A'
      };
    } else {
      const madre = madres.find(m => m.id === parseInt(defuncion.madreId));
      pacienteInfo = {
        tipo: 'Madre',
        nombre: madre?.nombre || 'N/A',
        rut: madre?.rut || 'N/A'
      };
    }

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
          maxWidth: '700px', 
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="texto-2xl font-bold flex items-center gap-2">
              <Skull size={28} style={{ color: '#ef4444' }} />
              Registro de Defunción
            </h3>
            <button
              onClick={() => setDefuncionSeleccionada(null)}
              className="boton boton-gris"
            >
              <X size={20} />
            </button>
          </div>

          {/* ADVERTENCIA */}
          <div
            className="mb-6 p-4"
            style={{
              backgroundColor: '#fee2e2',
              borderLeft: '4px solid #ef4444',
              borderRadius: '0.5rem'
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div>
                <p className="font-semibold" style={{ color: '#991b1b' }}>
                  Documento Crítico - Reporte REM A04
                </p>
                <p className="texto-sm mt-1" style={{ color: '#991b1b' }}>
                  Este registro tiene implicancias legales y estadísticas ministeriales.
                </p>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL PACIENTE */}
          <div className="mb-6 p-4" style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#ef4444' }}>
              Información del Paciente
            </h4>
            <div className="grid gap-2">
              <p><strong>Tipo:</strong> {pacienteInfo.tipo}</p>
              {defuncion.tipo === 'recien_nacido' ? (
                <>
                  <p><strong>ID RN:</strong> {pacienteInfo.nombre}</p>
                  <p><strong>Madre:</strong> {pacienteInfo.madre}</p>
                  <p><strong>RUT Madre:</strong> {pacienteInfo.rut}</p>
                </>
              ) : (
                <>
                  <p><strong>Nombre:</strong> {pacienteInfo.nombre}</p>
                  <p><strong>RUT:</strong> {pacienteInfo.rut}</p>
                </>
              )}
            </div>
          </div>

          {/* DETALLES DE LA DEFUNCIÓN */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3" style={{ color: '#1f2937' }}>
              Detalles de la Defunción
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="texto-sm texto-gris">Fecha</p>
                <p className="font-semibold">
                  {new Date(defuncion.fechaDefuncion).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div>
                <p className="texto-sm texto-gris">Hora</p>
                <p className="font-semibold">{defuncion.horaDefuncion}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="texto-sm texto-gris">Causa de Defunción (CIE-10)</p>
              <p className="font-semibold" style={{ color: '#ef4444' }}>
                {defuncion.causaDefuncionCodigo}
              </p>
            </div>

            {defuncion.observaciones && (
              <div>
                <p className="texto-sm texto-gris mb-2">Observaciones Médicas</p>
                <div className="p-3" style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                  <p className="texto-sm">{defuncion.observaciones}</p>
                </div>
              </div>
            )}
          </div>

          {/* INFORMACIÓN DE REGISTRO */}
          <div className="pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
            <div className="grid grid-cols-2 gap-4 texto-sm">
              <div>
                <p className="texto-gris">Registrado por</p>
                <p className="font-semibold flex items-center gap-2">
                  <User size={16} />
                  {defuncion.medico}
                </p>
              </div>
              <div>
                <p className="texto-gris">Fecha de Registro</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(defuncion.fechaRegistro).toLocaleString('es-CL')}
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
            <Skull size={28} style={{ color: '#ef4444' }} />
            Registro de Defunciones
          </h2>
          <p className="texto-sm texto-gris mt-1">
            Reporte REM A04 - Información crítica ministerial
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

      {/* Lista de defunciones */}
      {defuncionesFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Skull size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay defunciones registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defuncionesFiltradas.map((defuncion) => {
            let pacienteInfo = null;

            if (defuncion.tipo === 'recien_nacido') {
              const parto = partos.find(p => p.id === parseInt(defuncion.recienNacidoId));
              const madre = madres.find(m => m.id === parto?.madreId);
              pacienteInfo = {
                tipo: 'Recién Nacido',
                nombre: parto?.rnId || 'N/A',
                madre: madre?.nombre || 'N/A',
                rut: madre?.rut || 'N/A'
              };
            } else {
              const madre = madres.find(m => m.id === parseInt(defuncion.madreId));
              pacienteInfo = {
                tipo: 'Madre',
                nombre: madre?.nombre || 'N/A',
                rut: madre?.rut || 'N/A'
              };
            }

            return (
              <div
                key={defuncion.id}
                className="tarjeta tarjeta-hover"
                style={{ borderLeft: '4px solid #ef4444' }}
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
                          backgroundColor: defuncion.tipo === 'recien_nacido' ? '#dbeafe' : '#fce7f3',
                          color: defuncion.tipo === 'recien_nacido' ? '#1e40af' : '#9f1239'
                        }}
                      >
                        {pacienteInfo.tipo.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-semibold texto-lg mb-2">
                      {pacienteInfo.nombre}
                    </h3>
                    
                    {defuncion.tipo === 'recien_nacido' && (
                      <p className="texto-sm texto-gris mb-3">
                        Madre: {pacienteInfo.madre} ({pacienteInfo.rut})
                      </p>
                    )}

                    {defuncion.tipo === 'madre' && (
                      <p className="texto-sm texto-gris mb-3">
                        RUT: {pacienteInfo.rut}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="texto-xs texto-gris">Fecha</p>
                        <p className="font-semibold texto-sm">
                          {new Date(defuncion.fechaDefuncion).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Hora</p>
                        <p className="font-semibold texto-sm">{defuncion.horaDefuncion}</p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Causa CIE-10</p>
                        <p className="font-semibold texto-sm" style={{ color: '#ef4444' }}>
                          {defuncion.causaDefuncionCodigo}
                        </p>
                      </div>
                      <div>
                        <p className="texto-xs texto-gris">Médico</p>
                        <p className="font-semibold texto-sm">{defuncion.medico}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDefuncionSeleccionada(defuncion)}
                    className="boton"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
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
      {defuncionSeleccionada && (
        <DetalleDefuncion defuncion={defuncionSeleccionada} />
      )}

      {/* Resumen */}
      <div className="tarjeta mt-6" style={{ backgroundColor: '#fee2e2', border: '2px solid #ef4444' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="texto-sm texto-gris">Total Defunciones</p>
            <p className="texto-2xl font-bold" style={{ color: '#ef4444' }}>
              {defunciones.length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Neonatales</p>
            <p className="texto-2xl font-bold" style={{ color: '#2563eb' }}>
              {defunciones.filter(d => d.tipo === 'recien_nacido').length}
            </p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Maternas</p>
            <p className="texto-2xl font-bold" style={{ color: '#9f1239' }}>
              {defunciones.filter(d => d.tipo === 'madre').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaDefunciones;