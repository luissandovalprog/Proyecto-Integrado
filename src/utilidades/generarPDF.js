// src/utilidades/generarPDF.js
import jsPDF from 'jspdf';

/**
 * Genera un PDF de brazalete para recién nacido
 * @param {object} parto - Datos del parto
 * @param {object} madre - Datos de la madre
 */
export const generarBrazaletePDF = (parto, madre) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración de fuentes y colores
  const colorTexto = '#1f2937';
  
  // Encabezado
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL CLÍNICO HERMINDA MARTÍN', 105, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('BRAZALETE DE IDENTIFICACIÓN', 105, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Chillán, Chile', 105, 33, { align: 'center' });

  // Información del recién nacido
  doc.setTextColor(colorTexto);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIÉN NACIDO', 20, 55);
  
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, 58, 190, 58);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 70;
  
  // ID
  doc.setFont('helvetica', 'bold');
  doc.text('ID:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.rnId, 50, yPos);
  
  yPos += 10;
  
  // RUT
  doc.setFont('helvetica', 'bold');
  doc.text('RUT:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.rutRN || 'Pendiente Registro Civil', 50, yPos);
  
  yPos += 15;
  
  // Fecha y hora de nacimiento
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Nacimiento:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const fechaNacimiento = new Date(parto.fecha).toLocaleDateString('es-CL');
  doc.text(fechaNacimiento, 70, yPos);
  
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Hora:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.hora, 50, yPos);
  
  yPos += 15;
  
  // Datos físicos del RN
  doc.setFont('helvetica', 'bold');
  doc.text('Peso:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${parto.pesoRN} gramos`, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Talla:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${parto.tallaRN} cm`, 135, yPos);
  
  yPos += 10;
  
  // APGAR
  doc.setFont('helvetica', 'bold');
  doc.text('APGAR:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${parto.apgar1} / ${parto.apgar5}`, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo Parto:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.tipo, 145, yPos);
  
  yPos += 20;
  
  // Información de la madre
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MADRE', 20, yPos);
  
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 3, 190, yPos + 3);
  
  yPos += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.nombre, 50, yPos);
  
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('RUT:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.rut, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Edad:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${madre.edad} años`, 135, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.direccion || '', 50, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.telefono || '', 50, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Previsión:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.prevision || '', 50, yPos);
  yPos += 20;
  
  // Observaciones si existen
  if (parto.observaciones) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
    
    yPos += 12;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const observacionesLineas = doc.splitTextToSize(parto.observaciones, 170);
    doc.text(observacionesLineas, 20, yPos);
    
    yPos += observacionesLineas.length * 6 + 10;
  }
  
  // Código de barras simulado (ID del RN)
  yPos = 220;
  doc.setFillColor(0, 0, 0);
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`||||| ${parto.rnId} |||||`, 105, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Información adicional
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Este brazalete debe permanecer en el recién nacido durante toda su estancia hospitalaria', 105, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Footer
  doc.setFontSize(8);
  const fechaImpresion = new Date().toLocaleString('es-CL');
  doc.text(`Fecha de impresión: ${fechaImpresion}`, 105, yPos, { align: 'center' });
  
  yPos += 5;
  
  doc.text(`Registrado por: ${parto.registradoPor || 'Sistema'}`, 105, yPos, { align: 'center' });
  
  yPos += 8;
  
  doc.setFontSize(7);
  doc.text('Sistema de Trazabilidad de Partos v1.0 - Hospital Herminda Martín', 105, yPos, { align: 'center' });

  // Guardar el PDF
  doc.save(`brazalete-${parto.rnId}.pdf`);
};

/**
 * Genera un PDF de epicrisis
 * @param {object} parto - Datos del parto
 * @param {object} madre - Datos de la madre
 */
export const generarEpicrisisPDF = (parto, madre) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Encabezado institucional
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL CLÍNICO HERMINDA MARTÍN', 105, 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('EPICRISIS DE PARTO', 105, 22, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Servicio de Obstetricia y Ginecología', 105, 29, { align: 'center' });

  let yPos = 50;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA PACIENTE', 20, yPos);
  
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.nombre, 50, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('RUT:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(madre.rut, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Edad:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${madre.edad} años`, 135, yPos);
  
  yPos += 8;
  
  if (madre.antecedentes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Antecedentes:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const antecedentesLineas = doc.splitTextToSize(madre.antecedentes, 120);
    doc.text(antecedentesLineas, 60, yPos);
    yPos += antecedentesLineas.length * 6;
  }
  
  yPos += 12;
  
  // Datos del parto
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PARTO', 20, yPos);
  
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const fechaParto = new Date(parto.fecha).toLocaleDateString('es-CL');
  doc.text(fechaParto, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Hora:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.hora, 135, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de Parto:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.tipo, 60, yPos);
  
  yPos += 12;
  
  // Datos del recién nacido
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL RECIÉN NACIDO', 20, yPos);
  
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('ID:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.rnId, 50, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Peso:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${parto.pesoRN} gramos`, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Talla:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${parto.tallaRN} cm`, 135, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('APGAR 1 min:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.apgar1.toString(), 55, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('APGAR 5 min:', 110, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(parto.apgar5.toString(), 145, yPos);
  
  yPos += 15;
  
  if (parto.observaciones) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES CLÍNICAS', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 12;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const obsLineas = doc.splitTextToSize(parto.observaciones, 170);
    doc.text(obsLineas, 20, yPos);
    
    yPos += obsLineas.length * 6 + 10;
  }
  
  // Firmas
  yPos = 250;
  
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 80, yPos);
  doc.line(130, yPos, 190, yPos);
  
  yPos += 5;
  
  doc.setFontSize(9);
  doc.text('Firma y Timbre Profesional', 50, yPos, { align: 'center' });
  doc.text('Firma Paciente', 160, yPos, { align: 'center' });
  
  // Footer
  yPos = 280;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const fechaEmision = new Date().toLocaleString('es-CL');
  doc.text(`Fecha de emisión: ${fechaEmision}`, 105, yPos, { align: 'center' });
  
  yPos += 4;
  doc.text(`Registrado por: ${parto.registradoPor || 'Sistema'}`, 105, yPos, { align: 'center' });

  // Guardar
  doc.save(`epicrisis-${parto.rnId}.pdf`);
};