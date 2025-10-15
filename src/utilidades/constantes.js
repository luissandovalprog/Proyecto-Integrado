// src/utilidades/constantes.js
// Constantes globales del sistema

// Información del sistema
export const SISTEMA_INFO = {
    nombre: 'Sistema de Trazabilidad de Partos',
    version: '1.0.0',
    hospital: 'Hospital Clínico Herminda Martín',
    ciudad: 'Chillán, Chile'
  };
  
  // Roles de usuario
  export const ROLES = {
    ADMINISTRATIVO: 'administrativo',
    MATRONA: 'matrona',
    MEDICO: 'medico',
    NEONATOLOGIA: 'neonatologia'
  };
  
  // Tipos de parto
  export const TIPOS_PARTO = [
    { valor: 'Vaginal', etiqueta: 'Vaginal' },
    { valor: 'Cesárea', etiqueta: 'Cesárea' },
    { valor: 'Fórceps', etiqueta: 'Fórceps' },
    { valor: 'Ventosa', etiqueta: 'Ventosa' }
  ];
  
  // Rangos de validación médica
  export const RANGOS_MEDICOS = {
    pesoRN: {
      min: 500,
      max: 6000,
      unidad: 'gramos'
    },
    tallaRN: {
      min: 30,
      max: 70,
      unidad: 'cm'
    },
    apgar: {
      min: 0,
      max: 10
    },
    edadMadre: {
      min: 15,
      max: 60,
      unidad: 'años'
    }
  };
  
  // Timeout de sesión (en milisegundos)
  export const TIMEOUT_SESION = 30 * 60 * 1000; // 30 minutos
  
  // Configuración de paginación
  export const PAGINACION = {
    elementosPorPagina: 10,
    elementosPorPaginaOpciones: [5, 10, 20, 50]
  };
  
  // Mensajes del sistema
  export const MENSAJES = {
    exito: {
      madreRegistrada: 'Madre registrada exitosamente',
      partoRegistrado: 'Parto registrado exitosamente',
      datosActualizados: 'Datos actualizados correctamente',
      pdfGenerado: 'PDF generado correctamente',
      sesionCerrada: 'Sesión cerrada correctamente'
    },
    error: {
      rutInvalido: 'El RUT ingresado no es válido',
      camposObligatorios: 'Complete todos los campos obligatorios',
      rangoInvalido: 'Valor fuera del rango permitido',
      errorServidor: 'Error al comunicarse con el servidor',
      sesionExpirada: 'Sesión expirada por inactividad',
      sinPermiso: 'No tiene permisos para realizar esta acción'
    },
    advertencia: {
      sesionPorExpirar: 'Su sesión expirará en 5 minutos',
      camposIncompletos: 'Hay campos sin completar',
      datosNoGuardados: 'Tiene cambios sin guardar'
    },
    info: {
      cargando: 'Cargando...',
      procesando: 'Procesando información...',
      sinResultados: 'No se encontraron resultados'
    }
  };
  
  // Estados de registro
  export const ESTADOS = {
    PENDIENTE: 'pendiente',
    EN_PROCESO: 'en_proceso',
    COMPLETADO: 'completado',
    CANCELADO: 'cancelado'
  };
  
  // Colores del sistema
  export const COLORES = {
    primario: '#2563eb',
    secundario: '#10b981',
    error: '#ef4444',
    advertencia: '#f59e0b',
    info: '#3b82f6',
    exito: '#22c55e'
  };
  
  // Formato de fecha y hora
  export const FORMATOS = {
    fecha: 'DD/MM/YYYY',
    hora: 'HH:mm',
    fechaHora: 'DD/MM/YYYY HH:mm',
    fechaISO: 'YYYY-MM-DD'
  };
  
  // URLs de la API (configurables por entorno)
  export const API_URLS = {
    desarrollo: 'http://localhost:8000/api',
    staging: 'https://staging-partos.hermindamartin.cl/api',
    produccion: 'https://partos.hermindamartin.cl/api'
  };
  
  // Permisos por rol
  export const PERMISOS = {
    [ROLES.ADMINISTRATIVO]: {
      verMadres: true,
      registrarMadres: true,
      verPartos: false,
      registrarPartos: false,
      editarPartos: false,
      generarPDF: false,
      verEstadisticas: true
    },
    [ROLES.MATRONA]: {
      verMadres: true,
      registrarMadres: true,
      verPartos: true,
      registrarPartos: true,
      editarPartos: true,
      generarPDF: true,
      verEstadisticas: true
    },
    [ROLES.MEDICO]: {
      verMadres: true,
      registrarMadres: false,
      verPartos: true,
      registrarPartos: false,
      editarPartos: false,
      generarPDF: true,
      verEstadisticas: true
    },
    [ROLES.NEONATOLOGIA]: {
      verMadres: false,
      registrarMadres: false,
      verPartos: true,
      registrarPartos: false,
      editarPartos: false,
      generarPDF: true,
      verEstadisticas: false
    }
  };
  
  // Configuración de logs
  export const LOG_CONFIG = {
    habilitado: process.env.REACT_APP_ENABLE_LOGGING === 'true',
    nivel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
  };
  
  // Límites del sistema
  export const LIMITES = {
    intentosLogin: 3,
    tiempoBloqueo: 15 * 60 * 1000, // 15 minutos
    longitudMaximaObservaciones: 500,
    tamañoMaximoArchivo: 5 * 1024 * 1024 // 5 MB
  };