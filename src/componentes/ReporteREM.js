// src/componentes/ReporteREM.js
import React, { useState } from 'react';

function exportarCSV(data, filename = 'reporte-rem.csv') {
  const csvRows = [
    ['Fecha Parto', 'RUT Madre', 'Nombre Madre', 'Tipo Parto', 'Peso RN', 'Talla RN', 'APGAR 1', 'APGAR 5'],
    ...data.map(row => [
      row.fecha, row.rutMadre, row.nombreMadre, row.tipo, row.pesoRN, row.tallaRN, row.apgar1, row.apgar5
    ])
  ];
  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ReporteREM = ({ partos = [], madres = [] }) => {
  const [rango, setRango] = useState({ inicio: '', fin: '' });
  const [reporte, setReporte] = useState([]);

  const generarReporte = () => {
    const { inicio, fin } = rango;
    const filtered = partos
      .filter(p =>
        (!inicio || p.fecha >= inicio) && (!fin || p.fecha <= fin)
      )
      .map(p => ({
        fecha: p.fecha,
        rutMadre: madres.find(m => m.id === p.madreId)?.rut,
        nombreMadre: madres.find(m => m.id === p.madreId)?.nombre,
        tipo: p.tipo,
        pesoRN: p.pesoRN,
        tallaRN: p.tallaRN,
        apgar1: p.apgar1,
        apgar5: p.apgar5
      }));
    setReporte(filtered);
  };


  return (
    <div className="tarjeta p-6 contenedor mt-4">
      <h2 className="texto-2xl font-bold mb-4">Generar Reporte REM Neonatal</h2>
      <div className="flex gap-4 mb-4 items-center">
        <label className="etiqueta">
          Fecha Inicio:
          <input
            className="input ml-2"
            type="date"
            value={rango.inicio}
            onChange={e => setRango({ ...rango, inicio: e.target.value })}
          />
        </label>
        <label className="etiqueta">
          Fecha Fin:
          <input
            className="input ml-2"
            type="date"
            value={rango.fin}
            onChange={e => setRango({ ...rango, fin: e.target.value })}
          />
        </label>
        <button className="boton boton-primario" onClick={generarReporte}>
          Generar
        </button>
      </div>
      {reporte.length > 0 && (
        <div>
          <h3 className="texto-xl font-semibold mb-2">Resultados</h3>
          <div className="sombra redondeado overflow-auto mb-4">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>RUT Madre</th>
                  <th>Nombre Madre</th>
                  <th>Tipo Parto</th>
                  <th>Peso RN</th>
                  <th>Talla RN</th>
                  <th>APGAR 1</th>
                  <th>APGAR 5</th>
                </tr>
              </thead>
              <tbody>
                {reporte.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.fecha}</td>
                    <td>{row.rutMadre}</td>
                    <td>{row.nombreMadre}</td>
                    <td>{row.tipo}</td>
                    <td>{row.pesoRN}</td>
                    <td>{row.tallaRN}</td>
                    <td>{row.apgar1}</td>
                    <td>{row.apgar5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="boton boton-secundario" onClick={() => exportarCSV(reporte)}>
            Exportar a Excel (CSV)
          </button>
        </div>
      )}
    </div>
  );
};

export default ReporteREM;
