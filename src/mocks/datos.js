// src/mocks/datos.js
// Datos mock para desarrollo y pruebas del Sistema de Partos

export const datosMock = {
  madres: [
    {
      id: 1,
      rut: '12.345.678-9',
      nombre: 'María Gabriela González Pérez',
      edad: 28,
      antecedentes: 'Ninguno',
      fechaIngreso: '2025-10-10T08:30:00',
      registradoPor: 'Admin Demo'
    },
    {
      id: 2,
      rut: '98.765.432-1',
      nombre: 'Carla Andrea Pérez Muñoz',
      edad: 32,
      antecedentes: 'Diabetes gestacional controlada',
      fechaIngreso: '2025-10-11T10:15:00',
      registradoPor: 'Admin Demo'
    },
    {
      id: 3,
      rut: '15.234.567-8',
      nombre: 'Patricia Elena Silva Rojas',
      edad: 25,
      antecedentes: 'Hipertensión arterial',
      fechaIngreso: '2025-10-11T14:20:00',
      registradoPor: 'Matrona Demo'
    }
  ],

  partos: [
    {
      id: 1,
      madreId: 1,
      rnId: 'RN-2025-001',
      rutRN: 'Pendiente Registro Civil',
      tipo: 'Vaginal',
      fecha: '2025-10-10',
      hora: '14:30',
      pesoRN: 3200,
      tallaRN: 50,
      apgar1: 9,
      apgar5: 10,
      corticoides: 'no',
      observaciones: 'Parto normal sin complicaciones. Recién nacido en buenas condiciones.',
      fechaRegistro: '2025-10-10T14:45:00',
      fechaIngreso: '2025-10-10',
      registradoPor: 'Matrona Demo'
    },
    {
      id: 2,
      madreId: 2,
      rnId: 'RN-2025-002',
      rutRN: 'Pendiente Registro Civil',
      tipo: 'Cesárea',
      fecha: '2025-10-11',
      hora: '16:15',
      pesoRN: 3850,
      tallaRN: 52,
      apgar1: 8,
      apgar5: 9,
      corticoides: 'si',
      observaciones: 'Cesárea programada. Procedimiento sin complicaciones. Madre con diabetes gestacional controlada.',
      fechaRegistro: '2025-10-11T16:30:00',
      fechaIngreso: '2025-10-11',
      registradoPor: 'Matrona Demo'
    },
    {
      id: 3,
      madreId: 3,
      rnId: 'RN-2025-003',
      rutRN: 'Pendiente Registro Civil',
      tipo: 'Vaginal',
      fecha: '2025-10-03',
      hora: '09:15',
      pesoRN: 3100,
      tallaRN: 48,
      apgar1: 9,
      apgar5: 10,
      corticoides: 'no',
      observaciones: 'Parto sin complicaciones.',
      fechaRegistro: '2025-10-03T09:30:00',
      fechaIngreso: '2025-10-03',
      registradoPor: 'Matrona Demo'
    }
  ],

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
export const autenticarUsuario = (usuario, contrasena) => {
  // En producción, esto debería hacer una llamada real a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const usuarioEncontrado = datosMock.usuarios.find(u => u.usuario === usuario);
      if (usuarioEncontrado) {
        resolve({
          exito: true,
          usuario: usuarioEncontrado,
          token: 'mock-jwt-token-12345'
        });
      } else {
        resolve({
          exito: false,
          mensaje: 'Credenciales inválidas'
        });
      }
    }, 500);
  });
};