import React, { useState } from "react";

const NotasEnfermera = ({ notas, setNotas, usuario }) => {
  const [nuevaNota, setNuevaNota] = useState({
    paciente: "",
    fecha: new Date().toISOString().substring(0, 10),
    turno: "",
    nota: "",
    enfermera: usuario.nombre
  });

  const handleChange = (e) => {
    setNuevaNota({ ...nuevaNota, [e.target.name]: e.target.value });
  };

  const agregarNota = (e) => {
    e.preventDefault();
    if (nuevaNota.paciente && nuevaNota.nota && nuevaNota.turno) {
      setNotas([...notas, { ...nuevaNota }]);
      setNuevaNota({
        paciente: "",
        fecha: new Date().toISOString().substring(0, 10),
        turno: "",
        nota: "",
        enfermera: usuario.nombre
      });
    }
  };

  return (
    <div className="tarjeta p-6 contenedor mt-4">
      <h2 className="texto-2xl font-bold mb-4">Registro de Notas de Enfermería</h2>
      <form className="mb-4" onSubmit={agregarNota}>
        <div className="flex gap-4 mb-4">
          <input
            className="input"
            name="paciente"
            type="text"
            placeholder="Nombre/RUT Paciente"
            value={nuevaNota.paciente}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            name="turno"
            type="text"
            placeholder="Turno (Mañana/Tarde/Noche)"
            value={nuevaNota.turno}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            name="fecha"
            type="date"
            value={nuevaNota.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <textarea
          className="textarea mb-2"
          name="nota"
          placeholder="Escriba la nota clínica de enfermería"
          value={nuevaNota.nota}
          onChange={handleChange}
          required
        />
        <button className="boton boton-primario" type="submit">Agregar Nota</button>
      </form>

      <h3 className="texto-xl font-semibold mb-2">Notas Registradas</h3>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Turno</th>
            <th>Enfermera</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((n, idx) => (
            <tr key={idx}>
              <td>{n.fecha}</td>
              <td>{n.paciente}</td>
              <td>{n.turno}</td>
              <td>{n.enfermera}</td>
              <td>{n.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotasEnfermera;
