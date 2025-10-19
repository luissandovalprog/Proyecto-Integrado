/**
 * Servicio de API
 * Este archivo simula llamadas a una API REST
 * En producción, estos serían fetch() reales al backend
 */

const API_BASE_URL = 'http://localhost:8000/api';
const API_TIMEOUT = 10000; // 10 segundos

// Simular delay de red
const simularDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función auxiliar para hacer requests HTTP
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Agregar token de autenticación si existe
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error en la solicitud');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado');
    }
    throw error;
  }
};

// ============== AUTENTICACIÓN ==============

/**
 * Inicia sesión
 */
export const login = async (usuario, contrasena) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request('/auth/login', {
  //   method: 'POST',
  //   body: JSON.stringify({ usuario, contrasena }),
  // });

  // Simulación
  return {
    exito: true,
    token: 'mock-jwt-token-12345',
    usuario: {
      id: 1,
      nombre: usuario,
      rol: 'administrativo',
    },
  };
};

/**
 * Cierra sesión
 */
export const logout = async () => {
  await simularDelay(200);
  localStorage.removeItem('token');
  
  // TODO: Implementar llamada real a API
  // return request('/auth/logout', { method: 'POST' });
  
  return { exito: true };
};

/**
 * Verifica si el token es válido
 */
export const verificarToken = async () => {
  await simularDelay(300);
  
  // TODO: Implementar llamada real a API
  // return request('/auth/verify');
  
  return { exito: true, valido: true };
};

// ============== MADRES ==============

/**
 * Obtiene todas las madres
 */
export const obtenerMadres = async (filtros = {}) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // const params = new URLSearchParams(filtros);
  // return request(`/madres?${params}`);
  
  return {
    exito: true,
    datos: [],
    total: 0,
  };
};

/**
 * Obtiene una madre por ID
 */
export const obtenerMadrePorId = async (id) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/madres/${id}`);
  
  return {
    exito: true,
    datos: null,
  };
};

/**
 * Crea una nueva madre
 */
export const crearMadre = async (datos) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request('/madres', {
  //   method: 'POST',
  //   body: JSON.stringify(datos),
  // });
  
  return {
    exito: true,
    datos: {
      id: Math.floor(Math.random() * 10000),
      ...datos,
      fechaIngreso: new Date().toISOString(),
    },
    mensaje: 'Madre registrada exitosamente',
  };
};

/**
 * Actualiza una madre
 */
export const actualizarMadre = async (id, datos) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/madres/${id}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(datos),
  // });
  
  return {
    exito: true,
    datos: { id, ...datos },
    mensaje: 'Madre actualizada exitosamente',
  };
};

/**
 * Elimina una madre (soft delete)
 */
export const eliminarMadre = async (id) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/madres/${id}`, { method: 'DELETE' });
  
  return {
    exito: true,
    mensaje: 'Madre eliminada exitosamente',
  };
};

// ============== PARTOS ==============

/**
 * Obtiene todos los partos
 */
export const obtenerPartos = async (filtros = {}) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // const params = new URLSearchParams(filtros);
  // return request(`/partos?${params}`);
  
  return {
    exito: true,
    datos: [],
    total: 0,
  };
};

/**
 * Obtiene un parto por ID
 */
export const obtenerPartoPorId = async (id) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/partos/${id}`);
  
  return {
    exito: true,
    datos: null,
  };
};

/**
 * Obtiene partos de una madre específica
 */
export const obtenerPartosPorMadre = async (madreId) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/madres/${madreId}/partos`);
  
  return {
    exito: true,
    datos: [],
  };
};

/**
 * Crea un nuevo registro de parto
 */
export const crearParto = async (datos) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request('/partos', {
  //   method: 'POST',
  //   body: JSON.stringify(datos),
  // });
  
  return {
    exito: true,
    datos: {
      id: Math.floor(Math.random() * 10000),
      rnId: `RN-${Date.now()}`,
      ...datos,
      fechaRegistro: new Date().toISOString(),
    },
    mensaje: 'Parto registrado exitosamente',
  };
};

/**
 * Actualiza un parto
 */
export const actualizarParto = async (id, datos) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/partos/${id}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(datos),
  // });
  
  return {
    exito: true,
    datos: { id, ...datos },
    mensaje: 'Parto actualizado exitosamente',
  };
};

// ============== REPORTES ==============

/**
 * Genera reporte de brazalete
 */
export const generarBrazalete = async (partoId) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API que devuelva PDF
  // return request(`/reportes/brazalete/${partoId}`, {
  //   headers: {
  //     'Accept': 'application/pdf',
  //   },
  // });
  
  return {
    exito: true,
    mensaje: 'Brazalete generado',
  };
};

/**
 * Genera epicrisis
 */
export const generarEpicrisis = async (partoId) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API que devuelva PDF
  // return request(`/reportes/epicrisis/${partoId}`, {
  //   headers: {
  //     'Accept': 'application/pdf',
  //   },
  // });
  
  return {
    exito: true,
    mensaje: 'Epicrisis generada',
  };
};

/**
 * Obtiene estadísticas generales
 */
export const obtenerEstadisticas = async (fechaInicio, fechaFin) => {
  await simularDelay();
  
  // TODO: Implementar llamada real a API
  // return request(`/estadisticas?inicio=${fechaInicio}&fin=${fechaFin}`);
  
  return {
    exito: true,
    datos: {
      totalMadres: 0,
      totalPartos: 0,
      partosHoy: 0,
      porTipo: {
        vaginal: 0,
        cesarea: 0,
        forceps: 0,
      },
    },
  };
};

// ============== INTEGRACIÓN REGISTRO CIVIL ==============

/**
 * Solicita RUT al Registro Civil
 */
export const solicitarRUTRegistroCivil = async (datosRN) => {
  await simularDelay(2000); // Simular proceso más lento
  
  // TODO: Implementar integración real con Registro Civil
  // return request('/registro-civil/solicitar-rut', {
  //   method: 'POST',
  //   body: JSON.stringify(datosRN),
  // });
  
  return {
    exito: true,
    rutAsignado: `${Math.floor(Math.random() * 20000000 + 5000000)}-${Math.floor(Math.random() * 10)}`,
    mensaje: 'RUT asignado correctamente',
  };
};

/**
 * Verifica estado de solicitud al Registro Civil
 */
export const verificarEstadoSolicitudRUT = async (solicitudId) => {
  await simularDelay();
  
  // TODO: Implementar integración real
  // return request(`/registro-civil/estado/${solicitudId}`);
  
  return {
    exito: true,
    estado: 'procesado', // pendiente | procesado | error
    rutAsignado: null,
  };
};

// ============== LOGS Y AUDITORÍA ==============

/**
 * Obtiene logs de auditoría
 */
// Muestra solo los eventos de la sesión en curso (se borra si recargas o navegas) simulacion
// src/servicios/api.js
// Sistema de auditoría completo con almacenamiento local

let eventosAuditoria = [];

// Registrar evento en auditoría
export const registrarEventoAuditoria = (evento) => {
  const eventoCompleto = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    fecha: new Date().toLocaleString('es-CL'),
    ...evento
  };
  
  eventosAuditoria.push(eventoCompleto);
  
  // Log en consola para debugging
  console.log('📋 Evento de Auditoría:', eventoCompleto);
  
  return eventoCompleto;
};

// Obtener todos los eventos de auditoría
export const obtenerEventosAuditoria = () => {
  return [...eventosAuditoria].reverse(); // Más recientes primero
};

// Obtener eventos por usuario
export const obtenerEventosPorUsuario = (nombreUsuario) => {
  return eventosAuditoria
    .filter(evento => evento.usuario === nombreUsuario)
    .reverse();
};

// Obtener eventos por acción
export const obtenerEventosPorAccion = (accion) => {
  return eventosAuditoria
    .filter(evento => evento.accion === accion)
    .reverse();
};

// Obtener eventos en un rango de fechas
export const obtenerEventosPorFecha = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaFin).getTime();
  
  return eventosAuditoria
    .filter(evento => {
      const fechaEvento = new Date(evento.timestamp).getTime();
      return fechaEvento >= inicio && fechaEvento <= fin;
    })
    .reverse();
};

// Limpiar auditoría (solo para testing)
export const limpiarAuditoria = () => {
  eventosAuditoria = [];
  console.log('🗑️ Auditoría limpiada');
};

// Exportar auditoría a JSON
export const exportarAuditoriaJSON = () => {
  const dataStr = JSON.stringify(eventosAuditoria, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `auditoria_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  console.log('📥 Auditoría exportada');
};

// Obtener estadísticas de auditoría
export const obtenerEstadisticasAuditoria = () => {
  const totalEventos = eventosAuditoria.length;
  const eventosPorAccion = {};
  const eventosPorUsuario = {};
  
  eventosAuditoria.forEach(evento => {
    // Por acción
    if (!eventosPorAccion[evento.accion]) {
      eventosPorAccion[evento.accion] = 0;
    }
    eventosPorAccion[evento.accion]++;
    
    // Por usuario
    if (!eventosPorUsuario[evento.usuario]) {
      eventosPorUsuario[evento.usuario] = 0;
    }
    eventosPorUsuario[evento.usuario]++;
  });
  
  return {
    totalEventos,
    eventosPorAccion,
    eventosPorUsuario,
    primerEvento: eventosAuditoria[0]?.timestamp,
    ultimoEvento: eventosAuditoria[eventosAuditoria.length - 1]?.timestamp
  };
};

// ============== MANEJO DE ERRORES ==============

export class APIError extends Error {
  constructor(mensaje, codigo, detalles = {}) {
    super(mensaje);
    this.nombre = 'APIError';
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

export default {
  // Auth
  login,
  logout,
  verificarToken,
  
  // Madres
  obtenerMadres,
  obtenerMadrePorId,
  crearMadre,
  actualizarMadre,
  eliminarMadre,
  
  // Partos
  obtenerPartos,
  obtenerPartoPorId,
  obtenerPartosPorMadre,
  crearParto,
  actualizarParto,
  
  // Reportes
  generarBrazalete,
  generarEpicrisis,
  obtenerEstadisticas,
  
  // Registro Civil
  solicitarRUTRegistroCivil,
  verificarEstadoSolicitudRUT,
  
  // Auditoría
  registrarEventoAuditoria,
};