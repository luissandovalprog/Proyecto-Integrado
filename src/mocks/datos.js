// Datos mock para desarrollo y pruebas del Sistema de Partos

export const datosMock = {
  madres: [
    {
      id: 1,
      rut: '12.345.678-9',
      nombre: 'María Gabriela González Pérez',
      edad: 28,
      fechaNacimiento: '1997-02-15',
      nacionalidad: 'Chilena',
      perteneceaPuebloOriginario: false,
      direccion: 'Los Aromos 456, Chillán',
      telefono: '+56 9 8765 4321',
      prevision: 'FONASA A',
      antecedentes: 'Ninguno',
      fechaIngreso: '2025-10-10T08:30:00',
      registradoPor: 'Admin Demo',
      turno: null
    },
    {
      id: 2,
      rut: '98.765.432-1',
      nombre: 'Carla Andrea Pérez Muñoz',
      edad: 32,
      fechaNacimiento: '1993-07-22',
      nacionalidad: 'Venezolana',
      perteneceaPuebloOriginario: false,
      direccion: 'Av. Libertad 789, Chillán',
      telefono: '+56 9 5432 1098',
      prevision: 'FONASA B',
      antecedentes: 'Diabetes gestacional controlada',
      fechaIngreso: '2025-10-11T10:15:00',
      registradoPor: 'Admin Demo',
      turno: null
    },
    {
      id: 3,
      rut: '15.234.567-8',
      nombre: 'Patricia Elena Silva Rojas',
      edad: 25,
      fechaNacimiento: '2000-03-10',
      nacionalidad: 'Chilena',
      perteneceaPuebloOriginario: true,
      direccion: 'Población San Pedro 234, Chillán',
      telefono: '+56 9 7654 3210',
      prevision: 'FONASA C',
      antecedentes: 'Hipertensión arterial',
      fechaIngreso: '2025-10-11T14:20:00',
      registradoPor: 'Matrona Demo',
      turno: 'diurno'
    }
  ],

  partos: [
    {
      id: 1,
      madreId: 1,
      rnId: 'RN-2025-001',
      rutRN: '27.123.456-7',
      rutProvisorio: 'PROV-2025-001',
      tipo: 'Vaginal',
      fecha: '2025-10-10',
      hora: '14:30',
      pesoRN: 3200,
      tallaRN: 50,
      sexoRN: 'Masculino',
      estadoAlNacer: 'Vivo',
      apgar1: 9,
      apgar5: 10,
      corticoides: 'no',
      profilaxisVitaminaK: true,
      profilaxisOftalmica: true,
      observaciones: 'Parto normal sin complicaciones. Recién nacido en buenas condiciones.',
      diagnosticosCIE10: ['O80.0'], // Parto único espontáneo
      fechaRegistro: '2025-10-10T14:45:00',
      fechaIngreso: '2025-10-10',
      registradoPor: 'Matrona Demo',
      turno: 'diurno'
    },
    {
      id: 2,
      madreId: 2,
      rnId: 'RN-2025-002',
      rutRN: 'Pendiente Registro Civil',
      rutProvisorio: 'PROV-2025-002',
      tipo: 'Cesárea',
      fecha: '2025-10-11',
      hora: '16:15',
      pesoRN: 3850,
      tallaRN: 52,
      sexoRN: 'Femenino',
      estadoAlNacer: 'Vivo',
      apgar1: 8,
      apgar5: 9,
      corticoides: 'si',
      profilaxisVitaminaK: true,
      profilaxisOftalmica: true,
      observaciones: 'Cesárea programada. Procedimiento sin complicaciones. Madre con diabetes gestacional controlada.',
      diagnosticosCIE10: ['O82.0', 'O24.4'], // Cesárea electiva, Diabetes gestacional
      fechaRegistro: '2025-10-11T16:30:00',
      fechaIngreso: '2025-10-11',
      registradoPor: 'Matrona Demo',
      turno: 'diurno'
    },
    {
      id: 3,
      madreId: 3,
      rnId: 'RN-2025-003',
      rutRN: '27.234.567-8',
      rutProvisorio: 'PROV-2025-003',
      tipo: 'Vaginal',
      fecha: '2025-10-03',
      hora: '09:15',
      pesoRN: 3100,
      tallaRN: 48,
      sexoRN: 'Masculino',
      estadoAlNacer: 'Vivo',
      apgar1: 9,
      apgar5: 10,
      corticoides: 'no',
      profilaxisVitaminaK: true,
      profilaxisOftalmica: true,
      observaciones: 'Parto sin complicaciones.',
      diagnosticosCIE10: ['O80.0'],
      fechaRegistro: '2025-10-03T09:30:00',
      fechaIngreso: '2025-10-03',
      registradoPor: 'Matrona Demo',
      turno: 'diurno'
    }
  ],

  diagnosticosCIE10: [
    { codigo: 'O80.0', descripcion: 'Parto único espontáneo, presentación cefálica de vértice' },
    { codigo: 'O80.1', descripcion: 'Parto único espontáneo, otra presentación' },
    { codigo: 'O81.0', descripcion: 'Parto por fórceps bajo' },
    { codigo: 'O81.1', descripcion: 'Parto por fórceps medio' },
    { codigo: 'O82.0', descripcion: 'Parto por cesárea electiva' },
    { codigo: 'O82.1', descripcion: 'Parto por cesárea de emergencia' },
    { codigo: 'O24.4', descripcion: 'Diabetes mellitus gestacional' },
    { codigo: 'O13', descripcion: 'Hipertensión gestacional sin proteinuria significativa' },
    { codigo: 'O36.4', descripcion: 'Atención materna por muerte intrauterina del feto' },
    { codigo: 'P07.0', descripcion: 'Peso extremadamente bajo al nacer' },
    { codigo: 'P07.1', descripcion: 'Otros pesos bajos al nacer' },
    { codigo: 'P21.0', descripcion: 'Asfixia del nacimiento, severa' },
    { codigo: 'P95', descripcion: 'Muerte fetal de causa no especificada' },
    { codigo: 'O75.4', descripcion: 'Otra hemorragia del parto' },
    { codigo: 'O90.2', descripcion: 'Hematoma de herida obstétrica' }
  ],

  defunciones: [],

  usuarios: [
    {
      id: 1,
      usuario: 'admin',
      nombre: 'Administrativo Demo',
      rol: 'administrativo',
      activo: true
    },
    {
      id: 2,
      usuario: 'matrona',
      nombre: 'Matrona Demo',
      rol: 'matrona',
      activo: true
    },
    {
      id: 3,
      usuario: 'medico',
      nombre: 'Médico Demo',
      rol: 'medico',
      activo: true
    },
    {
      id: 4,
      usuario: 'enfermera',
      nombre: 'Enfermera Demo',
      rol: 'enfermera',
      activo: true
    },
    {
      id: 5,
      usuario: 'adminSistema',
      nombre: 'Admin Sistema',
      rol: 'admin_sistema',
      activo: true
    }
  ]

};

// Funciones auxiliares para trabajar con los mocks

/**
 * Obtiene todas las madres
 */
export const obtenerMadres = () => {
  return Promise.resolve(datosMock.madres);
};

/**
 * Obtiene una madre por ID
 */
export const obtenerMadrePorId = (id) => {
  const madre = datosMock.madres.find(m => m.id === id);
  return Promise.resolve(madre);
};

/**
 * Obtiene todos los partos
 */
export const obtenerPartos = () => {
  return Promise.resolve(datosMock.partos);
};

/**
 * Obtiene partos por ID de madre
 */
export const obtenerPartosPorMadre = (madreId) => {
  const partos = datosMock.partos.filter(p => p.madreId === madreId);
  return Promise.resolve(partos);
};

/**
 * Simula autenticación de usuario
 */
