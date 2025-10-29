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
  ENFERMERA: 'enfermera',
  ADMIN_SISTEMA: 'admin_sistema',
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
    max: 11000,
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

// Ventana de edición para matronas (en milisegundos)
export const VENTANA_EDICION_PARTO = 2 * 60 * 60 * 1000; // 2 horas

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
    sesionCerrada: 'Sesión cerrada correctamente',
    correccionAnexada: 'Corrección anexada exitosamente'
  },
  error: {
    rutInvalido: 'El RUT ingresado no es válido',
    camposObligatorios: 'Complete todos los campos obligatorios',
    rangoInvalido: 'Valor fuera del rango permitido',
    errorServidor: 'Error al comunicarse con el servidor',
    sesionExpirada: 'Sesión expirada por inactividad',
    sinPermiso: 'No tiene permisos para realizar esta acción',
    ventanaEdicionCerrada: 'La ventana de edición de 2 horas ha expirado. Use "Anexar Corrección"',
    noAsignadoATurno: 'Este paciente no está asignado a su turno'
  },
  advertencia: {
    sesionPorExpirar: 'Su sesión expirará en 5 minutos',
    camposIncompletos: 'Hay campos sin completar',
    datosNoGuardados: 'Tiene cambios sin guardar'
  },
  info: {
    cargando: 'Cargando...',
    procesando: 'Procesando información...',
    sinResultados: 'No se encontraron resultados',
    registroCerrado: 'Este registro está cerrado. Solo se pueden anexar correcciones.'
  }
};

// Estados de registro
export const ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
  CERRADO: 'cerrado' // Después de ventana de edición
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
// Ejemplo modificado en src/servicios/api.js

export const API_URLS = 'http://localhost:8000/api'; // O configúralo desde constantes.js

// Función auxiliar (simplificada - añade manejo de errores y refresh token)
const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken'); // O donde lo almacenes

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, defaultOptions);

        if (response.status === 204) { // No Content
          return null;
        }

        if (!response.ok) {
            // Aquí deberías manejar errores, posible expiración de token, etc.
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.detail || `Error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// --- AUTENTICACIÓN ---
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/token/`, { // Endpoint de Simple JWT
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }), // Ajusta si tu modelo Usuario usa 'username' u otra cosa
    });
    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.detail || 'Error de autenticación');
    }
    const data = await response.json();
    localStorage.setItem('accessToken', data.access); // Almacena tokens
    localStorage.setItem('refreshToken', data.refresh);
    // Aquí podrías decodificar el token para obtener info del usuario si es necesario
    // O hacer otra llamada a un endpoint /api/usuarios/me/ para obtener datos del usuario logueado
    return { exito: true, usuario: { nombre: username /* ... otros datos */ } }; // Simula la respuesta anterior
  } catch (error) {
     console.error("Login failed:", error);
     return { exito: false, mensaje: error.message };
  }
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Opcional: llamar a un endpoint de blacklist de token en el backend
    return Promise.resolve({ exito: true });
};

// --- MADRES ---
export const obtenerMadres = async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    return request(`/madres?${params}`); // GET /api/madres/
};

export const crearMadre = async (datos) => {
    return request('/madres/', { // POST /api/madres/
        method: 'POST',
        body: JSON.stringify(datos),
    });
};

 export const actualizarMadre = async (id, datos) => {
    return request(`/madres/${id}/`, { // PUT o PATCH /api/madres/{id}/
        method: 'PATCH', // O PUT si reemplazas todo el objeto
        body: JSON.stringify(datos),
    });
};

 export const eliminarMadre = async (id) => {
    return request(`/madres/${id}/`, { // DELETE /api/madres/{id}/
        method: 'DELETE',
    });
};
// ... Implementa las demás funciones para Partos, RecienNacidos, etc.
//     usando los endpoints correctos (ej. /api/partos/, /api/partos/{id}/)
//     y los métodos HTTP adecuados (GET, POST, PUT, PATCH, DELETE)


// PERMISOS POR ROL - Cumplimiento RBAC según Ley 20.584
export const PERMISOS = {
  [ROLES.ADMINISTRATIVO]: {
    // Datos Demográficos SOLAMENTE
    verDatosDemograficos: true,
    crearPaciente: true,
    editarDatosDemograficos: true,
    
    // Datos Clínicos - PROHIBIDO
    verDatosClinicos: false,
    verHistorialClinico: false,
    verPartograma: false,
    verExamenes: false,
    verEpicrisis: false,
    crearRegistroParto: false,
    editarRegistroParto: false,
    
    // Otros
    generarBrazalete: false,
    generarReportes: false,
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: true, // Solo demográficas
    accesoPorTurno: false
  },
  
  [ROLES.ENFERMERA]: {
    // Lectura limitada a turno asignado
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true, // Solo de su turno
    verPartograma: false,
    verExamenes: true,
    verEpicrisis: true,
    
    // Creación
    crearNotasEnfermeria: true,
    crearSignosVitales: true,
    crearProfilaxis: true,
    crearPaciente: false,
    crearRegistroParto: false,
    
    // Edición
    editarDatosDemograficos: false,
    editarNotasEnfermeria: true, // Solo las propias
    editarRegistroParto: false,
    
    // Otros
    generarBrazalete: false,
    generarReportes: false,
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: false,
    accesoPorTurno: true // CRÍTICO: Solo ve pacientes de su turno
  },
  
  [ROLES.MATRONA]: {
    // Rol clave - "Dueña" del registro de parto
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true, // Solo de su turno
    verPartograma: true,
    verExamenes: true,
    verEpicrisis: true,
    
    // Creación
    crearPaciente: true,
    crearRegistroParto: true,
    crearRecienNacido: true,
    crearPartograma: true,
    crearNotasEnfermeria: false,
    
    // Edición con ventana temporal de 2 horas
    editarDatosDemograficos: true,
    editarRegistroParto: true, // Solo dentro de 2 horas
    editarPartograma: true, // Solo durante parto en curso
    editarConVentanaTemporal: true, // Flag especial
    anexarCorreccion: false, // No puede, debe ir a médico
    
    // Otros
    generarBrazalete: true,
    generarReportes: false, // NO - privilegio elevado
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: true,
    accesoPorTurno: true // CRÍTICO: Solo ve pacientes de su turno
  },
  
  [ROLES.MEDICO]: {
    // Supervisor - Acceso completo para supervisión
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true, // TODOS los pacientes
    verPartograma: true,
    verExamenes: true,
    verEpicrisis: true,
    
    // Creación
    crearPaciente: false, // No es su función
    crearRegistroParto: false, // No es su función
    crearEpicrisis: true,
    crearIndicacionesMedicas: true,
    crearDerivacion: true,
    
    // Edición
    editarDatosDemograficos: false,
    editarRegistroParto: false, // Usa anexarCorreccion en su lugar
    editarEpicrisis: true,
    editarIndicacionesMedicas: true,
    anexarCorreccion: true, // PERMISO ESPECIAL - No sobrescribe, anexa
    
    // Privilegios Especiales - MÁXIMO RIESGO
    generarBrazalete: true,
    generarReportes: true, // REM, Excel - EXCLUSIVO
    exportarDatos: true, // EXCLUSIVO
    verAuditoria: false, // No es admin técnico
    gestionarUsuarios: false,
    verEstadisticas: true,
    accesoPorTurno: false // Ve TODOS los turnos
  },
  
  [ROLES.ADMIN_SISTEMA]: {
    // Rol técnico - NO ACCEDE A DATOS CLÍNICOS
    verDatosDemograficos: false, // PROHIBIDO
    verDatosClinicos: false, // PROHIBIDO
    verHistorialClinico: false, // PROHIBIDO
    verPartograma: false, // PROHIBIDO
    verExamenes: false, // PROHIBIDO
    verEpicrisis: false, // PROHIBIDO
    
    // Sin permisos clínicos
    crearPaciente: false,
    crearRegistroParto: false,
    editarDatosDemograficos: false,
    editarRegistroParto: false,
    
    // Funciones técnicas exclusivas
    gestionarUsuarios: true,
    crearUsuarios: true,
    editarUsuarios: true,
    desactivarUsuarios: true,
    asignarRoles: true,
    resetearContrasenas: true,
    verAuditoria: true, // Solo logs técnicos, no contenido clínico
    verLogsSeguridad: true,
    
    // Otros
    generarBrazalete: false,
    generarReportes: false,
    verEstadisticas: false, // Solo estadísticas técnicas del sistema
    accesoPorTurno: false
  }
};

// Tipos de acciones de auditoría
export const ACCIONES_AUDITORIA = {
  CREAR_PACIENTE: 'crear_paciente',
  EDITAR_PACIENTE: 'editar_paciente',
  VER_FICHA_CLINICA: 'ver_ficha_clinica',
  CREAR_PARTO: 'crear_parto',
  EDITAR_PARTO: 'editar_parto',
  ANEXAR_CORRECCION: 'anexar_correccion',
  GENERAR_REPORTE: 'generar_reporte',
  EXPORTAR_DATOS: 'exportar_datos',
  CREAR_USUARIO: 'crear_usuario',
  MODIFICAR_USUARIO: 'modificar_usuario',
  DESACTIVAR_USUARIO: 'desactivar_usuario',
  LOGIN: 'login',
  LOGOUT: 'logout',
  INTENTO_ACCESO_DENEGADO: 'intento_acceso_denegado'
};

// Configuración de logs
export const LOG_CONFIG = {
  habilitado: true,
  nivel: 'debug'
};

// Límites del sistema
export const LIMITES = {
  intentosLogin: 3,
  tiempoBloqueo: 15 * 60 * 1000, // 15 minutos
  longitudMaximaObservaciones: 500,
  tamañoMaximoArchivo: 5 * 1024 * 1024 // 5 MB
};

// Turnos disponibles (para asignación de matronas/enfermeras)
export const TURNOS = {
  DIURNO: 'diurno',
  NOCTURNO: 'nocturno',
  VESPERTINO: 'vespertino',
  NINGUNO: 'Ninguno'
};

export const OPCIONES_TURNO_LOGIN = [
    { value: TURNOS.MANANA, label: 'Mañana (Diurno 08-20)' },
    { value: TURNOS.TARDE,   label: 'Tarde (Vespertino 14-22)' },
    { value: TURNOS.NOCHE,   label: 'Noche (Nocturno 20-08)' },
];