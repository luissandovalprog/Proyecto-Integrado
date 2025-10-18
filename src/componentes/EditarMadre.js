import React, { useState } from 'react';

const EditarMadre = ({ madre, onGuardar, onCancelar }) => {
  const [datos, setDatos] = useState({
    rut: madre.rut,
    nombre: madre.nombre,
    edad: madre.edad,
    direccion: madre.direccion || '',
    telefono: madre.telefono || '',
    prevision: madre.prevision || ''
  });

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(datos);
  };

  return (
    <div className="tarjeta contenedor p-6 mt-4">
      <h2 className="texto-2xl font-bold mb-4">Editar Información de Admisión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="etiqueta">RUT</label>
          <input
            className="input"
            name="rut"
            value={datos.rut}
            onChange={handleChange}
            required
            disabled // para evitar cambiar RUT
          />
        </div>
        <div className="mb-4">
          <label className="etiqueta">Nombre completo</label>
          <input
            className="input"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="etiqueta">Edad</label>
          <input
            className="input"
            name="edad"
            type="number"
            min={15}
            max={60}
            value={datos.edad}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="etiqueta">Dirección</label>
          <input
            className="input"
            name="direccion"
            value={datos.direccion}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="etiqueta">Teléfono</label>
          <input
            className="input"
            name="telefono"
            value={datos.telefono}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="etiqueta">Previsión</label>
          <input
            className="input"
            name="prevision"
            value={datos.prevision}
            onChange={handleChange}
          />
        </div>
        <div className="flex gap-4">
          <button className="boton boton-primario" type="submit">
            Guardar cambios
          </button>
          <button className="boton boton-gris" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarMadre;
