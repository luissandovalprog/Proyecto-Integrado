import React, { useState, useEffect } from 'react';
import { obtenerLogsAuditoria } from '../servicios/api';

const TablaAuditoria = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    obtenerLogsAuditoria().then(res => {
      if (res.exito) setLogs(res.datos);
    });
  }, []);

  return (
    <div className="tarjeta sombra mt-4 mb-4">
      <h2 className="texto-2xl font-bold mb-4 texto-centro">Historial de Auditoría</h2>
      <table className="tabla mt-4">
        <thead>
          <tr>
            <th>Fecha/Hora</th>
            <th>Acción</th>
            <th>Detalle</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td className="texto-centro texto-gris" colSpan={4}>No hay registros de auditoría</td>
            </tr>
          ) : (
            logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.fecha_hora}</td>
                <td>{log.accion}</td>
                <td>{log.detalle}</td>
                <td>{log.usuario}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAuditoria;
