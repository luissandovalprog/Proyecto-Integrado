// src/servicios/api.js
import { API_URLS, ROLES, TURNOS } from '../utilidades/constantes'; 
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar jwt-decode: npm install jwt-decode

// Determina la URL base según el entorno (ajusta según necesites)
const API_BASE_URL = API_URLS.desarrollo || 'http://localhost:8000/api'; // Usa la URL de tu backend

// --- Funciones de manejo de Token ---
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let refreshTimeout = null; // Para guardar el ID del timeout de refresco

// Guarda los tokens en memoria y localStorage
const setTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken; // refreshToken podría ser undefined si no se actualiza
  if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
  if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
  scheduleTokenRefresh(); // Programa el próximo refresco automático
};

// Limpia los tokens de memoria y localStorage
const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (refreshTimeout) {
    clearTimeout(refreshTimeout); // Cancela el refresco programado
    refreshTimeout = null;
  }
};

// Verifica si un token JWT ha expirado (con un margen de 60 segundos)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Considera expirado si falta menos de 60 segundos
    return decoded.exp < currentTime + 60;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return true; // Considera inválido/expirado si hay error
  }
};

// Intenta obtener un nuevo access token usando el refresh token
const attemptTokenRefresh = async () => {
  if (!refreshToken || isTokenExpired(refreshToken)) {
    console.warn('Refresh token inválido o expirado. Se requiere login.');
    clearTokens();
    // Forzar recarga podría ser muy disruptivo, mejor manejarlo en el componente App
    // window.location.href = '/login'; // O una ruta específica
    return false;
  }

  try {
    console.log('Intentando refrescar token...');
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Si el refresh token falla (ej. revocado en backend), limpia todo
      const errorData = await response.json();
      console.error('Fallo al refrescar token:', response.status, errorData);
      clearTokens();
      // window.location.href = '/login'; // Forzar login
      return false;
    }

    const data = await response.json();
    // Actualiza solo el access token, el refresh token sigue siendo el mismo (a menos que el backend lo rote)
    setTokens(data.access, refreshToken);
    console.log('Token refrescado exitosamente.');
    return true;
  } catch (error) {
    console.error('Error durante el refresco de token:', error);
    clearTokens();
    // window.location.href = '/login';
    return false;
  }
};

// Programa el próximo intento de refresco antes de que expire el access token
const scheduleTokenRefresh = () => {
    // Limpia cualquier timeout anterior
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
    }
    // No programar si no hay access token
    if (!accessToken) return;

    try {
        const decoded = jwtDecode(accessToken);
        // Tiempo hasta la expiración en milisegundos
        const expiresIn = (decoded.exp * 1000) - Date.now();
        // Intentar refrescar 1 minuto antes de que expire (o inmediatamente si ya está cerca)
        const refreshDelay = Math.max(0, expiresIn - 60 * 1000); // 60 segundos antes

        console.log(`Programando refresco de token en ${Math.round(refreshDelay / 1000)} segundos.`);
        // Guarda el ID del timeout para poder cancelarlo si se hace logout
        refreshTimeout = setTimeout(attemptTokenRefresh, refreshDelay);
    } catch (error) {
        console.error('Error al programar refresco de token:', error);
        // Si el token es inválido, limpiarlo
        clearTokens();
    }
};

// Llama a scheduleTokenRefresh al inicio si existen tokens en localStorage
// para programar el refresco inicial si la sesión sigue activa.
if (accessToken && !isTokenExpired(accessToken)) {
  scheduleTokenRefresh();
} else if (accessToken && isTokenExpired(accessToken)) {
    // Si el access token ya expiró pero hay refresh token, intenta refrescarlo de inmediato
    attemptTokenRefresh();
}


// --- Función Principal `request` ---
// Maneja la adición del token, reintentos con refresh token y errores comunes.
const request = async (endpoint, options = {}, isRetry = false) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // 1. Verificar si el access token existe y está expirado ANTES de la llamada
  if (accessToken && isTokenExpired(accessToken) && !isRetry) {
    console.log('Access token expirado, intentando refresco antes de la llamada...');
    const refreshed = await attemptTokenRefresh();
    // Si el refresco falló, lanzar error para requerir login
    if (!refreshed) {
      throw new Error('Sesión expirada. Por favor, inicie sesión de nuevo.'); // Error específico
    }
    // Si el refresh fue exitoso, reintentar la petición original UNA VEZ
    return request(endpoint, options, true); // Marcar como reintento
  }

  // 2. Configurar opciones de Fetch
  const defaultOptions = {
    method: 'GET', // Por defecto es GET
    headers: {
      'Content-Type': 'application/json', // Asumir JSON por defecto
      ...options.headers, // Permitir sobreescribir headers
    },
    ...options, // Incluir method, body, etc.
  };

  // 3. Añadir token de autorización si existe
  if (accessToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 4. Realizar la llamada Fetch
  try {
    console.log(`API Request: ${defaultOptions.method} ${url}`);
    const response = await fetch(url, defaultOptions);

    // 5. Manejar respuestas sin contenido (ej. DELETE exitoso)
    if (response.status === 204) {
      return null; // No hay cuerpo que parsear
    }

    // 6. Manejar errores HTTP
    if (!response.ok) {
        // 6.1. Caso especial: 401 Unauthorized (podría ser token recién expirado)
        if (response.status === 401 && !isRetry) {
             console.log('Recibido 401 Unauthorized, intentando refresco...');
             const refreshed = await attemptTokenRefresh();
             if (refreshed) {
                 // Reintentar la petición original UNA VEZ con el nuevo token
                 return request(endpoint, options, true);
             } else {
                  // Si el refresco falla después de un 401, forzar logout/login
                  throw new Error('Sesión inválida o expirada. Por favor, inicie sesión de nuevo.');
             }
        }

       // 6.2. Otros errores (400, 403, 404, 500, etc.)
       let errorData;
       try {
           errorData = await response.json(); // Intentar parsear el cuerpo del error JSON
       } catch (parseError) {
           // Si el cuerpo no es JSON, usar el texto del estado
           errorData = { detail: response.statusText || `HTTP error ${response.status}` };
       }
       console.error('API Error Response:', response.status, errorData);
       // Lanzar un error con el detalle del backend si existe, o un mensaje genérico
       throw new Error(errorData.detail || `Error ${response.status} en la solicitud a ${endpoint}`);
    }

    // 7. Parsear respuesta JSON exitosa (si hay contenido)
    // Evitar error si la respuesta es 200 OK pero el cuerpo está vacío
    const text = await response.text();
    if (!text) {
        return null; // O {} o [], dependiendo de lo esperado
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Error parseando JSON, respuesta recibida:", text);
        throw new Error("Respuesta inválida recibida del servidor.");
    }

  } catch (error) {
    console.error('Error en Fetch:', error);
    // Re-lanzar el error para que sea manejado por el componente que hizo la llamada
    // (Asegúrate que el mensaje de error sea útil para el usuario)
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique la conexión de red.');
    }
    throw error; // Re-lanza otros errores (incluyendo los de refresh y parseo)
  }
};


// --- Implementación de API Endpoints (Reemplazando Mocks) ---

// ======================= AUTENTICACIÓN =======================
export const login = async (username, password) => {
  try {
    // Llama al endpoint /api/token/ de Simple JWT
    const data = await request('/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }), // El backend espera 'username' y 'password'
    });

    // Guardar tokens si la llamada fue exitosa
    setTokens(data.access, data.refresh);

    // Obtener datos completos del usuario desde /api/user/me/
    const userData = await request('/user/me/');

    // Mapear los nombres de turno del backend ('Manana', 'Tarde', 'Noche') a los del frontend ('diurno', 'vespertino', 'nocturno')
    let turnoFrontend = null;
    if (userData.turno === 'Mañana') turnoFrontend = TURNOS.DIURNO;
    else if (userData.turno === 'Tarde') turnoFrontend = TURNOS.VESPERTINO;
    else if (userData.turno === 'Noche') turnoFrontend = TURNOS.NOCTURNO;

    return {
        exito: true,
        usuario: {
            // Usa los campos devueltos por UsuarioSerializer
            nombre: userData.nombre_completo || userData.username, // Usa nombre_completo si existe
            rol: userData.rol_nombre.toLowerCase(), // Convertir a minúsculas para coincidir con constantes ROLES
            turno: turnoFrontend, // Usa el turno mapeado
            // Puedes añadir otros datos si los necesitas: userData.id, userData.email, etc.
        }
    };
  } catch (error) {
    console.error('Login fallido:', error);
    clearTokens(); // Asegura limpiar tokens en caso de fallo
    // Devuelve un mensaje de error específico si es posible
    return { exito: false, mensaje: error.message || 'Error desconocido al iniciar sesión.' };
  }
};

export const logout = async () => {
    // Opcional: Llamar a un endpoint de blacklist si tu backend lo implementa
    // try { await request('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh: refreshToken }) }); } catch (e) { /* Ignorar error */ }
    clearTokens(); // Limpia tokens localmente
    console.log('Sesión cerrada');
    return { exito: true }; // Siempre retorna éxito en logout local
};

// Ya no necesitamos verificarToken, la función request maneja la expiración/refresh

// ======================= MADRES =======================
export const obtenerMadres = async (filtros = {}) => {
    const params = new URLSearchParams(filtros); // Convierte {rut: '...', nombre: '...'} a "?rut=...&nombre=..."
    // DRF generalmente devuelve listas directamente (o paginadas con 'results')
    const data = await request(`/madres/?${params}`);
    // Asegurarse de devolver siempre un array
    return Array.isArray(data) ? data : (data?.results || []); // Ajusta si usas paginación
};
export const obtenerMadrePorId = async (id) => request(`/madres/${id}/`);
export const crearMadre = async (datos) => request('/madres/', { method: 'POST', body: JSON.stringify(datos) });
export const actualizarMadre = async (id, datos) => request(`/madres/${id}/`, { method: 'PATCH', body: JSON.stringify(datos) }); // PATCH para actualizaciones parciales
export const eliminarMadre = async (id) => request(`/madres/${id}/`, { method: 'DELETE' }); // El backend maneja si es soft delete o no

// ======================= PARTOS =======================
export const obtenerPartos = async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const data = await request(`/partos/?${params}`);
    return Array.isArray(data) ? data : (data?.results || []);
};
export const obtenerPartoPorId = async (id) => request(`/partos/${id}/`);
export const crearParto = async (datos) => request('/partos/', { method: 'POST', body: JSON.stringify(datos) });
export const actualizarParto = async (id, datos) => request(`/partos/${id}/`, { method: 'PATCH', body: JSON.stringify(datos) });
// No implementamos eliminarParto, se usa anexarCorreccion

// Acción personalizada para anexar corrección (Médico)
export const anexarCorreccionParto = async (id, datosCorreccion) => {
    // datosCorreccion debe ser { campo: 'nombre_campo', valor_nuevo: 'nuevo valor', justificacion: '...' }
    return request(`/partos/${id}/anexar_correccion/`, {
        method: 'POST',
        body: JSON.stringify(datosCorreccion)
    });
};

// ======================= RECIÉN NACIDOS =======================
export const obtenerRecienNacidos = async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const data = await request(`/recien-nacidos/?${params}`);
    return Array.isArray(data) ? data : (data?.results || []);
};
export const obtenerRecienNacidoPorId = async (id) => request(`/recien-nacidos/${id}/`);
export const crearRecienNacido = async (datos) => request('/recien-nacidos/', { method: 'POST', body: JSON.stringify(datos) });
export const actualizarRecienNacido = async (id, datos) => request(`/recien-nacidos/${id}/`, { method: 'PATCH', body: JSON.stringify(datos) });
// No implementamos eliminarRecienNacido

// ======================= DEFUNCIONES =======================
export const obtenerDefunciones = async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const data = await request(`/defunciones/?${params}`);
    return Array.isArray(data) ? data : (data?.results || []);
};
export const crearDefuncion = async (datos) => {
    // Asegúrate de enviar los IDs correctos para 'madre' o 'recien_nacido'
    const payload = { ...datos };
    if (payload.tipo === 'madre' && payload.madreId) {
        payload.madre = payload.madreId; // El serializer espera 'madre' (el ID)
        delete payload.madreId;
        delete payload.recienNacidoId;
    } else if (payload.tipo === 'recien_nacido' && payload.recienNacidoId) {
        // Necesitamos el ID del *RecienNacido*, no del Parto. Asumimos que viene en 'recienNacidoId'
        // Esto podría requerir ajustar cómo se obtiene el ID en el frontend.
        // Si 'recienNacidoId' en realidad contiene el ID del *Parto*, necesitamos buscar el RN asociado.
        // **¡CUIDADO AQUÍ!** Asegúrate que 'recienNacidoId' sea el UUID del RN.
        // Si no lo es, esta llamada fallará o necesitará lógica adicional.
        payload.recien_nacido = payload.recienNacidoId; // El serializer espera 'recien_nacido' (el ID)
        delete payload.recienNacidoId;
        delete payload.madreId;
    }
     // Mapear causaDefuncionCodigo a causa_defuncion (ID del diagnóstico)
     // Esto requiere que tengas los diagnósticos cargados en el frontend o hacer una búsqueda.
     // Por ahora, asumimos que 'causaDefuncionCodigo' CONTIENE el ID (UUID) del diagnóstico. ¡REVISAR!
     payload.causa_defuncion = payload.causaDefuncionCodigo;
     delete payload.causaDefuncionCodigo;

    delete payload.tipo; // El backend no necesita el campo 'tipo'

    return request('/defunciones/', { method: 'POST', body: JSON.stringify(payload) });
};
// No implementamos actualizar/eliminar Defuncion por ahora

// ======================= USUARIOS (Admin Sistema) =======================
export const obtenerUsuarios = async () => {
    const data = await request('/usuarios/');
    return Array.isArray(data) ? data : (data?.results || []);
};
export const crearUsuario = async (datos) => {
    // Necesitas enviar el ID del Rol, no el nombre
    // Asumiendo que tienes una forma de obtener el ID del rol seleccionado
    const payload = { ...datos }; // Copia los datos
    // payload.rol = obtenerIdRolPorNombre(datos.rol); // Necesitas esta función auxiliar o cargar roles
    // Necesitas enviar 'password' para que el backend lo hashee (requiere ajustar serializer/view)
    // payload.password = 'contraseña_temporal'; // O un campo del formulario
    return request('/usuarios/', { method: 'POST', body: JSON.stringify(payload) });
};
export const actualizarUsuario = async (id, datos) => {
    const payload = { ...datos };
    // payload.rol = obtenerIdRolPorNombre(datos.rol); // Mapear rol si es necesario
    return request(`/usuarios/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
};
// La desactivación se maneja en el backend al recibir DELETE en /usuarios/{id}/
export const desactivarUsuario = async (id) => request(`/usuarios/${id}/`, { method: 'DELETE' });

// ======================= DIAGNÓSTICOS CIE10 =======================
export const obtenerDiagnosticos = async () => {
    const data = await request('/diagnosticos-cie10/');
    // Devuelve la lista completa, asumiendo que no son demasiados para cargar de una vez
    return Array.isArray(data) ? data : (data?.results || []);
}

// ======================= LOGS DE AUDITORÍA (Admin Sistema) =======================
export const obtenerEventosAuditoria = async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const data = await request(`/logs/?${params}`);
    // Asumiendo paginación por defecto de DRF
    return data?.results || []; // Devuelve solo la lista de resultados
    // Si necesitas el total, etc., devuelve 'data' completo
}
// La exportación ahora debería hacerse en el backend si son muchos logs
// export const exportarAuditoriaJSON = () => { /* Implementar endpoint en backend */ };

// ======================= OTROS (Partograma, Epicrisis, etc.) =======================
// Estas funciones ahora interactuarán con los campos JSONB en Parto o modelos dedicados

// Ejemplo para guardar Partograma (si usas JSONB en Parto)
export const guardarPartograma = async (partoId, datosPartograma) => {
    // datosPartograma debe ser el objeto JSON completo a guardar
    return actualizarParto(partoId, { partograma_data: datosPartograma });
};

// Ejemplo para guardar Epicrisis (si usas JSONB en Parto)
export const guardarEpicrisis = async (partoId, datosEpicrisis) => {
    // datosEpicrisis debe ser el objeto JSON completo
    return actualizarParto(partoId, { epicrisis_data: datosEpicrisis });
};


// Mapear funciones al export default para compatibilidad si `App.js` usa `api.login()` etc.
export default {
    login,
    logout,
    // Funciones de Madre
    obtenerMadres,
    obtenerMadrePorId,
    crearMadre,
    actualizarMadre,
    eliminarMadre, // Soft delete
    // Funciones de Parto
    obtenerPartos,
    obtenerPartoPorId,
    crearParto,
    actualizarParto, // Con ventana de tiempo en backend
    anexarCorreccionParto, // Acción médico
    // Funciones de RecienNacido
    obtenerRecienNacidos,
    obtenerRecienNacidoPorId,
    crearRecienNacido,
    actualizarRecienNacido, // Con ventana de tiempo en backend
    // Funciones de Defuncion
    obtenerDefunciones,
    crearDefuncion,
    // Funciones de Usuario (Admin)
    obtenerUsuarios,
    crearUsuario, // Necesita manejo de password y rol ID
    actualizarUsuario, // Necesita mapeo de rol ID
    desactivarUsuario, // Soft delete via DELETE
    // Funciones de Diagnostico
    obtenerDiagnosticos,
    // Funciones de Auditoría
    obtenerEventosAuditoria,
    // Funciones de JSONB (Partograma, Epicrisis)
    guardarPartograma, // Ejemplo usando actualizarParto
    guardarEpicrisis, // Ejemplo usando actualizarParto
    // Función request (puede ser útil exportarla si se usa fuera)
    request,
    // Funciones para obtener/limpiar tokens (útiles para App.js)
    setTokens,
    clearTokens,
    isTokenExpired,
    accessToken, // Exportar el token actual puede ser útil
    refreshToken,
};

// Llama a scheduleTokenRefresh al cargar el script si hay un token válido
// Esto asegura que si el usuario recarga la página, el refresco se reprograme.
if (accessToken && !isTokenExpired(accessToken)) {
    scheduleTokenRefresh();
}