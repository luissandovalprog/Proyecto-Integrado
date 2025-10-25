function VistaPreviaMadre({ madre, onClose }) {
  if (!madre) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
      onClick={onClose} // Cierra al hacer clic fuera
    >
      <div
        className="tarjeta"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
      >
        <h2 className="texto-2xl font-bold mb-4">Vista Previa - Madre</h2>

        <div
          style={{
            border: '2px solid #2563eb',
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}
        >
          <h3 className="font-semibold text-lg" style={{ color: '#2563eb' }}>
            HOSPITAL CLÍNICO HERMINDA MARTÍN
          </h3>
          <p className="texto-sm">Información de Admisión</p>

          <div style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>
            <h4 className="font-semibold mb-2">DATOS DE LA MADRE</h4>
            <p><strong>Nombre:</strong> {madre.nombre}</p>
            <p><strong>RUT:</strong> {madre.rut}</p>
            <p><strong>Edad:</strong> {madre.edad} años</p>
            <p><strong>Dirección:</strong> {madre.direccion}</p>
            <p><strong>Teléfono:</strong> {madre.telefono}</p>
            <p><strong>Previsión:</strong> {madre.prevision}</p>
            {madre.antecedentes && (
              <p><strong>Antecedentes:</strong> {madre.antecedentes}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="boton boton-primario"
            style={{ flex: 1 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default VistaPreviaMadre;
