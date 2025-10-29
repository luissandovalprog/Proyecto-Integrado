// src/App.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Importa componentes UI (asume que están correctamente exportados)
import {
  FileText, User, Baby, Printer, LogOut, AlertCircle, CheckCircle, Home,
  Search, Eye, PlusCircle, Shield, BarChart3, Users, Edit3, Clock, Activity,
  Stethoscope, List, ChevronDown, Skull, X, Save, Calendar, UserPlus, UserX,
  Download, Droplets, Heart, TrendingUp
} from 'lucide-react';
import { generarBrazaletePDF, generarEpicrisisPDF } from './utilidades/generarPDF';
import { validarRUT, formatearRUT } from './servicios/validaciones'; // Importa formatearRUT si lo necesitas
// ¡IMPORTANTE! Importa el servicio API REAL, no los mocks
import api from './servicios/api';
// Importa componentes de vistas y formularios
import TablaAuditoria from './componentes/TablaAuditoria'; // Asegúrate que este componente ahora obtenga datos de la API
import ReporteREM from './componentes/ReporteREM'; // Asegúrate que este componente ahora obtenga datos de la API
import NotasEnfermera from './componentes/NotasEnfermera'; // Necesitará integración API
import EditarMadre from './componentes/EditarMadre';
import GestionUsuarios from './componentes/GestionUsuarios';
import AnexarCorreccion from './componentes/AnexarCorreccion';
import Partograma from './componentes/Partograma'; // Necesitará integración API
import EpicrisisMedica from './componentes/EpicrisisMedica';
import EditarParto from './componentes/EditarParto';
import VistaCorrecciones from './componentes/VistaCorrecciones'; // Necesitará obtener datos de API
import VistaPartogramas from './componentes/VistaPartogramas'; // Necesitará obtener datos de API
import VistaEpicrisis from './componentes/VistaEpicrisis'; // Necesitará obtener datos de API
import VistaDefunciones from './componentes/VistaDefunciones'; // Necesitará obtener datos de API
import RegistroDefuncion from './componentes/RegistroDefuncion';
// Importa constantes
import {
  PERMISOS, ROLES, MENSAJES, ACCIONES_AUDITORIA, TURNOS, VENTANA_EDICION_PARTO, OPCIONES_TURNO_LOGIN // Removido TIMEOUT_SESION por ahora
} from './utilidades/constantes';

// --- Componentes UI Internos (Alerta, Vistas Previas, Login) ---

// AlertaFlotante (Sin cambios respecto a tu versión)
const AlertaFlotante = React.memo(({ mensaje, tipo }) => {
  const iconos = {
    success: <CheckCircle size={20} />, error: <AlertCircle size={20} />,
    info: <AlertCircle size={20} />, advertencia: <AlertCircle size={20} />,
  };
  const estilos = {
    success: 'alerta-exito', error: 'alerta-error',
    info: 'alerta-info', advertencia: 'alerta-advertencia',
  };
  return (
    <div className={`alerta ${estilos[tipo]} animacion-entrada`}
         style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 3000, minWidth: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
      {iconos[tipo]} <span>{mensaje}</span>
    </div>
  );
});
AlertaFlotante.displayName = 'AlertaFlotante';

// VistaPreviaBrazalete (Sin cambios respecto a tu versión)
const VistaPreviaBrazalete = React.memo(({ vistaPrevia, onImprimir, onCerrar }) => {
    if (!vistaPrevia) return null;
    const { parto, madre } = vistaPrevia;
    // ... (resto del JSX como lo tenías) ...
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="tarjeta" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 className="texto-2xl font-bold mb-4">Vista Previa del Brazalete</h2>
            <div style={{ border: '2px solid #2563eb', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 className="font-bold texto-xl" style={{ color: '#2563eb' }}>HOSPITAL CLÍNICO HERMINDA MARTÍN</h3>
                <p className="texto-sm">Brazalete de Identificación</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 className="font-semibold mb-2">RECIÉN NACIDO</h4>
                <p><strong>ID:</strong> {parto.id}</p> {/* Usa ID del parto o RN si tienes uno específico */}
                <p><strong>Fecha:</strong> {new Date(parto.fecha_parto).toLocaleDateString('es-CL')}</p>
                <p><strong>Hora:</strong> {new Date(parto.fecha_parto).toLocaleTimeString('es-CL')}</p>
                {/* Asumiendo que RecienNacidoSerializer devuelve estos campos */}
                {/* <p><strong>Peso:</strong> {parto.recien_nacidos?.[0]?.peso_gramos}g</p> */}
                {/* <p><strong>Talla:</strong> {parto.recien_nacidos?.[0]?.talla_cm}cm</p> */}
                {/* <p><strong>APGAR:</strong> {parto.recien_nacidos?.[0]?.apgar_1_min}/{parto.recien_nacidos?.[0]?.apgar_5_min}</p> */}
                 <p><strong>Peso:</strong> {parto.peso_gramos || 'N/A'}g</p>
                 <p><strong>Talla:</strong> {parto.talla_cm || 'N/A'}cm</p>
                 <p><strong>APGAR:</strong> {parto.apgar_1_min || 'N/A'}/{parto.apgar_5_min || 'N/A'}</p>

              </div>
              <div>
                <h4 className="font-semibold mb-2">MADRE</h4>
                <p><strong>Nombre:</strong> {madre?.nombre_encrypted || 'N/A'}</p> {/* Ajusta si desencriptas */}
                <p><strong>RUT:</strong> {madre?.rut_encrypted || 'N/A'}</p> {/* Ajusta si desencriptas */}
                 {/* <p><strong>Dirección:</strong> {madre?.direccion || 'N/A'}</p> */}
                 {/* <p><strong>Teléfono:</strong> {madre?.telefono_encrypted || 'N/A'}</p> */}
                 <p><strong>Previsión:</strong> {madre?.prevision || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => onImprimir(parto, madre)} className="boton boton-primario" style={{ flex: 1 }}>
                <Printer size={20} /> Imprimir Brazalete
              </button>
              <button onClick={onCerrar} className="boton boton-gris" style={{ flex: 1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      );
});
VistaPreviaBrazalete.displayName = 'VistaPreviaBrazalete';

// VistaPreviaMadre (Sin cambios respecto a tu versión)
const VistaPreviaMadre = React.memo(({ vistaPreviaMadre, mostrarDatosClinicos, onCerrar }) => {
    if (!vistaPreviaMadre) return null;
    // ... (resto del JSX como lo tenías, usando los campos del serializer como nombre_encrypted) ...
      return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="tarjeta" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="texto-2xl font-bold mb-4">Información del Paciente</h2>
        <div style={{ border: '2px solid #2563eb', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          {/* Datos Demográficos */}
          <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>DATOS DEMOGRÁFICOS</h4>
          <p className="mb-2"><strong>Nombre:</strong> {vistaPreviaMadre.nombre_encrypted || 'No disponible'}</p> {/* Ajusta si desencriptas */}
          <p className="mb-2"><strong>RUT:</strong> {vistaPreviaMadre.rut_encrypted || 'No disponible'}</p> {/* Ajusta si desencriptas */}
          {/* <p className="mb-2"><strong>Edad:</strong> {calcularEdad(vistaPreviaMadre.fecha_nacimiento)} años</p> */} {/* Necesitas función calcularEdad */}
           <p className="mb-2"><strong>Fecha Nacimiento:</strong> {vistaPreviaMadre.fecha_nacimiento}</p>
           {/* <p className="mb-2"><strong>Dirección:</strong> {vistaPreviaMadre.direccion || 'No registrada'}</p> */}
           <p className="mb-2"><strong>Teléfono:</strong> {vistaPreviaMadre.telefono_encrypted || 'No registrado'}</p> {/* Ajusta si desencriptas */}
           <p className="mb-2"><strong>Previsión:</strong> {vistaPreviaMadre.prevision || 'No registrada'}</p>
           <p className="mb-2"><strong>Nacionalidad:</strong> {vistaPreviaMadre.nacionalidad || 'No registrada'}</p>
           <p className="mb-2"><strong>Pueblo Originario:</strong> {vistaPreviaMadre.pertenece_pueblo_originario ? 'Sí' : 'No'}</p>

          {/* Datos Clínicos (Condicional) */}
          {mostrarDatosClinicos && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#10b981' }}>ANTECEDENTES CLÍNICOS</h4>
              <p className="mb-2">{vistaPreviaMadre.antecedentes_medicos || 'Sin antecedentes registrados'}</p>
            </div>
          )}

          {/* Info Registro */}
           <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#6b7280' }}>REGISTRO</h4>
               <p className="mb-2"><strong>Fecha de Ingreso:</strong> {new Date(vistaPreviaMadre.fecha_registro).toLocaleString('es-CL')}</p>
               {/* <p className="mb-2"><strong>Registrado por:</strong> {vistaPreviaMadre.registradoPor || 'Sistema'}</p> */} {/* Necesitas este campo del backend */}
           </div>

        </div>
        {!mostrarDatosClinicos && (
          <div className="mt-4 p-3 alerta-advertencia">
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Su rol solo permite ver datos demográficos según Ley 20.584
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button onClick={onCerrar} className="boton boton-primario" style={{ flex: 1 }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
});
VistaPreviaMadre.displayName = 'VistaPreviaMadre';

// PantallaLogin (Modificada para usar usuario/contraseña real)
const PantallaLogin = React.memo(({ onLogin, mostrarAlerta }) => {
  const [credenciales, setCredenciales] = useState({
    username: '', // Cambiado de 'usuario' a 'username' para coincidir con backend
    password: '', // Cambiado de 'contrasena' a 'password'
    turno: OPCIONES_TURNO_LOGIN[0].value,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Maneja el intento de login para cualquier rol
  const handleLogin = useCallback(async (e, rolSeleccionado) => {
      e.preventDefault(); // Prevenir recarga de página si está en un form
      if (!credenciales.username || !credenciales.password) {
        mostrarAlerta('Ingrese nombre de usuario y contraseña', 'error');
        return;
      }
      setIsLoading(true); // Mostrar indicador de carga
      try {
        // Llama a la función 'login' del api.js que a su vez llama al backend
        const resultado = await api.login(credenciales.username, credenciales.password);

        if (resultado.exito && resultado.usuario) {
            // VERIFICACIÓN ADICIONAL EN FRONTEND (Opcional, la principal está en backend)
            // Compara el rol devuelto por el backend con el rol del botón presionado
            if (resultado.usuario.rol !== rolSeleccionado) {
                 throw new Error(`Credenciales correctas, pero no para el rol "${rolSeleccionado}". Rol detectado: "${resultado.usuario.rol}"`);
            }

            // Pasa el usuario completo (incluyendo nombre y rol reales del backend) y el turno seleccionado
            const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];
            const turnoFinal = rolesConTurno.includes(resultado.usuario.rol) ? credenciales.turno : null;

            onLogin(resultado.usuario, turnoFinal); // Llama a la función onLogin de App.js
            // No necesita mostrar alerta aquí, App.js lo hará
        } else {
             throw new Error(resultado.mensaje || 'Error desconocido al iniciar sesión');
        }
      } catch (error) {
         console.error("Error en handleLogin:", error);
         mostrarAlerta(`Error: ${error.message}`, 'error');
      } finally {
         setIsLoading(false); // Ocultar indicador de carga
      }
    }, [credenciales, onLogin, mostrarAlerta]);

  // Actualiza el estado cuando cambian los inputs
  const handleInputChange = useCallback((field, value) => {
    setCredenciales((prev) => ({ ...prev, [field]: value }));
  }, []);

   return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="tarjeta" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="texto-centro mb-6">
           <div style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
             <Baby size={40} />
           </div>
           <h1 className="texto-3xl font-bold mb-4">SIGN - Sistema de Partos</h1>
           <p className="texto-gris">Hospital Clínico Herminda Martín</p>
           <p className="texto-sm texto-gris">Chillán, Chile</p>
        </div>

        {/* Formulario real de login */}
         <div className="grupo-input">
           <label className="etiqueta">Nombre de Usuario</label>
           <input type="text" className="input" placeholder="Ingrese su usuario" value={credenciales.username} onChange={(e) => handleInputChange('username', e.target.value)} disabled={isLoading} />
         </div>
         <div className="grupo-input">
           <label className="etiqueta">Contraseña</label>
           <input type="password" className="input" placeholder="••••••••" value={credenciales.password} onChange={(e) => handleInputChange('password', e.target.value)} disabled={isLoading} />
         </div>
         {/* Selección de turno solo relevante si se loguea como Enfermera o Matrona */}
          <div className="grupo-input">
            <label className="etiqueta">Turno (si aplica)</label>
            <select
                className="select"
                value={credenciales.turno} // El valor guardado es 'Mañana', 'Tarde', 'Noche'
                onChange={(e) => handleInputChange('turno', e.target.value)} // Guarda el valor seleccionado
                disabled={isLoading}>
              {/* Mapea las opciones desde la constante */}
              {OPCIONES_TURNO_LOGIN.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                      {opcion.label} {/* Muestra la etiqueta legible */}
                  </option>
              ))}
            </select>
          </div>

        {/* Botones de Login por Rol (Simulados para UX, la validación real es por usuario/pass) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          {isLoading && <div className="spinner" style={{ margin: '1rem auto' }}></div>}
           {/* Cada botón llama a handleLogin con el ROL esperado */}
           <button onClick={(e) => handleLogin(e, ROLES.ADMINISTRATIVO)} className="boton boton-primario boton-completo" disabled={isLoading}><User size={20} /> Entrar como Administrativo</button>
           <button onClick={(e) => handleLogin(e, ROLES.MATRONA)} className="boton boton-secundario boton-completo" disabled={isLoading}><FileText size={20} /> Entrar como Matrona</button>
           <button onClick={(e) => handleLogin(e, ROLES.MEDICO)} className="boton boton-completo" style={{ backgroundColor: '#7c3aed', color: 'white' }} disabled={isLoading}><Stethoscope size={20} /> Entrar como Médico</button>
           <button onClick={(e) => handleLogin(e, ROLES.ENFERMERA)} className="boton boton-completo" style={{ backgroundColor: '#00bddfff', color: 'white' }} disabled={isLoading}><User size={20} /> Entrar como Enfermera</button>
           <button onClick={(e) => handleLogin(e, ROLES.ADMIN_SISTEMA)} className="boton boton-completo" style={{ backgroundColor: '#5d00ffff', color: 'white' }} disabled={isLoading}><Shield size={20} /> Entrar como Admin Sistema</button>
        </div>
        <p className="texto-xs texto-gris texto-centro mt-4">Demo v1.0 - Sistema RBAC según Ley 20.584</p>
      </div>
    </div>
  );
});
PantallaLogin.displayName = 'PantallaLogin';

// ======= COMPONENTE PRINCIPAL APP =======
const App = () => {
  // --- Estados ---
  const [usuario, setUsuario] = useState(null); // Almacena { nombre, rol, turno } del backend
  const [isLoading, setIsLoading] = useState(true); // Carga inicial de la app
  const [isDataLoading, setIsDataLoading] = useState(false); // Carga de datos después del login
  const [pantallaActual, setPantallaActual] = useState('loading'); // 'loading', 'login', 'dashboard', 'admision', etc.
  const [alerta, setAlerta] = useState(null); // Para mostrar mensajes flotantes
  const [busqueda, setBusqueda] = useState(''); // Término de búsqueda en dashboard
  const [menuRegistrosAbierto, setMenuRegistrosAbierto] = useState(false); // Para menú desplegable

  // Estados para los datos de la aplicación (inicialmente vacíos)
  const [madres, setMadres] = useState([]);
  const [partos, setPartos] = useState([]);
  const [recienNacidos, setRecienNacidos] = useState([]); // Añadido estado para RN
  const [diagnosticos, setDiagnosticos] = useState([]); // Catálogo CIE10
  const [defunciones, setDefunciones] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]); // Para Admin Sistema
  const [logsAuditoria, setLogsAuditoria] = useState([]); // Para Admin Sistema

  // Estados para selecciones y vistas previas
  const [madreSeleccionada, setMadreSeleccionada] = useState(null); // Para editar o registrar parto
  const [partoSeleccionado, setPartoSeleccionado] = useState(null); // Para editar, corregir, epicrisis
  const [vistaPrevia, setVistaPrevia] = useState(null); // Para brazalete
  const [vistaPreviaMadre, setVistaPreviaMadre] = useState(null); // Para detalle madre

  // Estados que antes eran mocks (Partograma, Epicrisis, Correcciones, Notas)
  // Estos ahora se obtendrán de la API si es necesario, o se manejarán localmente si son temporales
  const [partogramas, setPartogramas] = useState([]); // Podría venir de parto.partograma_data
  const [epicrisis, setEpicrisis] = useState([]); // Podría venir de parto.epicrisis_data
  const [correcciones, setCorrecciones] = useState([]); // Necesitaría endpoint o modelo propio
  const [notasEnfermera, setNotasEnfermera] = useState([]); // Necesitaría endpoint o modelo propio


  // --- Funciones de Utilidad ---
  const mostrarAlerta = useCallback((mensaje, tipo = 'info') => {
    console.log(`Alerta [${tipo}]: ${mensaje}`);
    setAlerta({ mensaje, tipo });
    // Usar setTimeout para limpiar la alerta después de 5 segundos
    const timerId = setTimeout(() => setAlerta(null), 5000);
    // Devolver una función de limpieza por si el componente se desmonta
    return () => clearTimeout(timerId);
  }, []);

   // --- Permisos ---
   // Calcula si el usuario actual tiene un permiso específico
  const tienePermiso = useCallback((permiso) => {
    // Si no hay usuario o rol, no hay permisos
    if (!usuario || !usuario.rol) return false;
    // Busca el permiso en la constante PERMISOS para el rol del usuario
    // Asegúrate que usuario.rol coincida con las claves de PERMISOS (ej. 'matrona')
    return PERMISOS[usuario.rol]?.[permiso] || false;
  }, [usuario]); // Depende del estado 'usuario'

   // Función para verificar si un parto específico puede ser editado por el usuario actual
  const puedeEditarParto = useCallback((partoAEditar) => {
      if (!usuario || !partoAEditar || usuario.rol !== ROLES.MATRONA) {
          return false; // Solo matronas pueden editar directamente
      }
      // Verifica la ventana de tiempo de 2 horas desde el registro del parto
      const tiempoTranscurrido = Date.now() - new Date(partoAEditar.fecha_registro).getTime();
      const dentroDeVentana = tiempoTranscurrido <= VENTANA_EDICION_PARTO; // 2 horas
      // Podrías añadir verificación de si el usuario actual fue quien registró (si es requisito)
      // const esMismoUsuario = partoAEditar.usuario_registro_nombre === usuario.nombre; // Compara con nombre/username
      // return dentroDeVentana && esMismoUsuario;
      return dentroDeVentana; // Por ahora, solo ventana de tiempo
    }, [usuario]); // Depende del estado 'usuario'

  // Función para verificar si un paciente (madre) pertenece al turno del usuario (si aplica)
  const perteneceATurno = useCallback((madre) => {
      // Si el usuario no tiene restricción de turno (Médico, Admin, etc.), siempre pertenece
      if (!usuario || !tienePermiso('accesoPorTurno') || !usuario.turno) {
          return true;
      }
      // Si la madre no tiene turno asignado (necesitaría campo 'turno_asignado' en Madre)
      // O si basamos el turno de la madre en quién la registró (necesitaría campo 'usuario_registro' en Madre)
      // O si basamos el turno en el parto asociado (si ya existe)
      // *** Lógica de Turno para Madre necesita definición clara ***
      // Por ahora, para simplificar, si el usuario tiene turno, filtramos por él,
      // asumiendo que los datos YA vienen filtrados del backend o que tenemos cómo filtrar aquí.
      // Si los datos de 'madres' y 'partos' en el estado no están pre-filtrados por turno,
      // esta función no será efectiva aquí, el filtrado debe hacerse en las llamadas API o en los 'useMemo'.

      // Lógica de ejemplo (asumiendo que los partos sí tienen info del turno del registrador):
      const partoAsociado = partos.find(p => p.madre === madre.id); // Busca UN parto asociado
      if (partoAsociado && partoAsociado.usuario_registro_turno) { // Asume que el backend añade este campo
          return partoAsociado.usuario_registro_turno === usuario.turno;
      }
      // Si no hay parto, o el parto no tiene info de turno, ¿qué hacemos?
      // Por defecto, permitimos verla (podría ser una madre recién admitida)
      return true;

    }, [usuario, tienePermiso, partos]); // Depende de usuario, permiso y partos


  // --- Carga Inicial de Datos (Después del Login) ---
  const cargarDatosIniciales = useCallback(async () => {
    if (!usuario) return; // No cargar si no hay usuario
    console.log(`Cargando datos para rol: ${usuario.rol}, Turno: ${usuario.turno || 'N/A'}`);
    setIsDataLoading(true); // Mostrar indicador de carga de datos
    try {
      const promesas = [];
      // Cargar Madres y Partos si tiene permiso de ver datos (clínicos o demográficos)
      if (tienePermiso('verDatosDemograficos') || tienePermiso('verDatosClinicos')) {
          // Podríamos pasar el turno como filtro si el backend lo soporta
          const filtros = {};
          // if (tienePermiso('accesoPorTurno') && usuario.turno) {
          //     filtros.turno = usuario.turno; // El backend necesita interpretar esto
          // }
          promesas.push(api.obtenerMadres(filtros).then(data => setMadres(data || [])));
          promesas.push(api.obtenerPartos(filtros).then(data => setPartos(data || [])));
          // Cargar Recien Nacidos asociados a los partos cargados
          // O hacer una sola llamada si el endpoint de partos los incluye
          // promesas.push(api.obtenerRecienNacidos(filtros).then(data => setRecienNacidos(data || [])));

          // Cargar diagnósticos para formularios si es Matrona o Médico
          if (usuario.rol === ROLES.MATRONA || usuario.rol === ROLES.MEDICO) {
              promesas.push(api.obtenerDiagnosticos().then(data => setDiagnosticos(data || [])));
          }
          // Cargar Defunciones si es Médico
          if (usuario.rol === ROLES.MEDICO) {
              promesas.push(api.obtenerDefunciones(filtros).then(data => setDefunciones(data || [])));
          }
      }
      // Cargar Usuarios y Logs si es Admin Sistema
      if (tienePermiso('gestionarUsuarios')) {
          promesas.push(api.obtenerUsuarios().then(data => setUsuariosSistema(data || [])));
      }
      if (tienePermiso('verAuditoria')) {
           promesas.push(api.obtenerEventosAuditoria().then(data => setLogsAuditoria(data || [])));
      }

      // Esperar a que todas las cargas finalicen
      await Promise.all(promesas);
      console.log('Datos iniciales cargados desde la API.');

    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      mostrarAlerta(`Error al cargar datos: ${error.message}`, 'error');
      // Si el error es por autenticación (ej. token inválido después de recargar), cerrar sesión
      if (error.message.toLowerCase().includes('sesión expirada') || error.message.toLowerCase().includes('authentication credentials')) {
          cerrarSesion(); // Llama a la función de logout
      }
    } finally {
      setIsDataLoading(false); // Ocultar indicador de carga de datos
    }
  }, [usuario, mostrarAlerta, tienePermiso]); // Dependencias: usuario y mostrarAlerta


  // --- Efecto para Verificar Sesión al Cargar la App ---
   useEffect(() => {
        const checkAuthAndLoad = async () => {
            setIsLoading(true); // Carga inicial de la app
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token && refreshToken && !api.isTokenExpired(token)) {
                 // Si hay un token válido, intentar obtener datos del usuario
                 try {
                    console.log("Verificando token existente...");
                    // Re-establecer tokens en memoria (api.js podría haber reiniciado)
                    api.setTokens(token, refreshToken);
                    const userData = await api.request('/user/me/');
                    console.log("Token válido. Usuario:", userData);

                     // Mapear turno del backend al frontend
                     let turnoFrontend = null;
                     if (userData.turno === 'Mañana') turnoFrontend = TURNOS.DIURNO;
                     else if (userData.turno === 'Tarde') turnoFrontend = TURNOS.VESPERTINO;
                     else if (userData.turno === 'Noche') turnoFrontend = TURNOS.NOCTURNO;

                    setUsuario({
                        nombre: userData.nombre_completo || userData.username,
                        rol: userData.rol_nombre.toLowerCase(),
                        turno: turnoFrontend,
                    });
                    setPantallaActual('dashboard'); // Ir al dashboard para cargar datos
                 } catch (error) {
                    console.error("Token inválido o error al obtener usuario:", error);
                    // Si falla (token expirado y refresh falla, o inválido), limpiar y mostrar login
                    api.clearTokens();
                    setUsuario(null);
                    setPantallaActual('login');
                    mostrarAlerta('Su sesión ha expirado. Por favor, inicie sesión.', 'advertencia');
                 }
            } else if (token && refreshToken && api.isTokenExpired(token)) {
                 // Si el access token expiró pero hay refresh token, intentar refrescar
                 console.log("Access token expirado, intentando refresco inicial...");
                 api.setTokens(token, refreshToken); // Asegura que api.js tenga los tokens para intentar
                 const refreshed = await api.attemptTokenRefresh(); // Llama a la función de api.js
                 if (refreshed) {
                     // Si el refresco funcionó, obtener datos del usuario
                     try {
                         const userData = await api.request('/user/me/');
                         console.log("Token refrescado. Usuario:", userData);
                          // Mapear turno
                         let turnoFrontend = null;
                         if (userData.turno === 'Mañana') turnoFrontend = TURNOS.DIURNO;
                         else if (userData.turno === 'Tarde') turnoFrontend = TURNOS.VESPERTINO;
                         else if (userData.turno === 'Noche') turnoFrontend = TURNOS.NOCTURNO;

                         setUsuario({
                             nombre: userData.nombre_completo || userData.username,
                             rol: userData.rol_nombre.toLowerCase(),
                             turno: turnoFrontend,
                         });
                         setPantallaActual('dashboard');
                     } catch (error) {
                         console.error("Error obteniendo usuario después de refresco:", error);
                         api.clearTokens(); setUsuario(null); setPantallaActual('login');
                         mostrarAlerta('No se pudo verificar su sesión. Por favor, inicie sesión.', 'error');
                     }
                 } else {
                     // Si el refresco falló, ir a login
                     setUsuario(null); setPantallaActual('login');
                     mostrarAlerta('Su sesión ha expirado. Por favor, inicie sesión.', 'advertencia');
                 }

            } else {
                 // No hay tokens válidos
                 console.log("No hay tokens válidos, mostrando login.");
                 api.clearTokens(); // Asegura que todo esté limpio
                 setUsuario(null);
                 setPantallaActual('login');
            }
            setIsLoading(false); // Fin de la carga inicial de la app
        };
        checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Ejecutar solo una vez al montar

    // --- Efecto para Cargar Datos después de que el usuario se establece ---
    useEffect(() => {
        // Solo cargar datos si hay un usuario y estamos en el dashboard
        if (usuario && pantallaActual === 'dashboard') {
            cargarDatosIniciales();
        }
        // Si el usuario cambia a null (logout), limpiar datos
        if (!usuario) {
             setMadres([]); setPartos([]); setDiagnosticos([]); setDefunciones([]);
             setUsuariosSistema([]); setLogsAuditoria([]); // Limpiar todos los estados de datos
        }
    }, [usuario, pantallaActual, cargarDatosIniciales]); // Depende de usuario y pantalla


  // --- Funciones de Autenticación ---
  const iniciarSesion = useCallback(async (usuarioBackend, turnoSeleccionado) => {
      // La validación y obtención de datos ya la hizo api.login
      // Solo actualizamos el estado local
      // El 'turnoSeleccionado' que viene de PantallaLogin solo se usa si el rol lo requiere
       const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];
       // El 'turnoSeleccionado' que viene de PantallaLogin AHORA es 'Mañana', 'Tarde' o 'Noche'
       const turnoFinal = rolesConTurno.includes(usuarioBackend.rol) ? turnoSeleccionado : null;

       const usuarioParaEstado = {
           ...usuarioBackend, 
         // El rol ya viene en minúsculas desde api.js
         // El turno del backend ('Mañana', 'Tarde', 'Noche') se mapea a las constantes del frontend en api.js
         // Aquí solo asignamos el turno seleccionado en el login si aplica
           turno: turnoFinal, 
       };

      setUsuario(usuarioParaEstado);
      setPantallaActual('dashboard'); // Cambia a dashboard para disparar carga de datos
      mostrarAlerta(`Bienvenido/a ${usuarioParaEstado.nombre}`, 'success');

      // No es necesario registrar login aquí, el backend debería hacerlo (o api.js si se decide)

    }, [mostrarAlerta]); // Quitado actualizarActividad si no se usa timeout

  const cerrarSesion = useCallback(async () => {
    // No necesitamos registrar evento aquí si el backend lo hace al invalidar token (si aplica)
    await api.logout(); // Llama a la función de api.js para limpiar tokens
    setUsuario(null); // Limpia estado de usuario
    setPantallaActual('login'); // Vuelve a pantalla de login
    // La limpieza de datos se maneja en el useEffect que depende de 'usuario'
    mostrarAlerta(MENSAJES.exito.sesionCerrada, 'info');
  }, [mostrarAlerta]);


  // --- Funciones CRUD (Llamando a la API) ---

  const agregarMadre = useCallback(async (datosFormulario) => {
     if (!tienePermiso('crearPaciente')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
     if (!validarRUT(datosFormulario.rut)) return mostrarAlerta(MENSAJES.error.rutInvalido, 'error');

     // Validación básica de duplicados en frontend (backend DEBE revalidar)
     if (madres.some((m) => m.rut_encrypted === datosFormulario.rut)) { // Compara con el campo correcto si está cifrado/hasheado
       return mostrarAlerta('Ya existe una madre registrada con este RUT', 'error');
     }

     // TODO: Cifrar/Hashear RUT, nombre, teléfono aquí antes de enviar si el backend no lo hace
     const datosParaAPI = { ...datosFormulario };
     // Ejemplo: datosParaAPI.rut_encrypted = await cifrarDato(datosFormulario.rut);
     // datosParaAPI.rut_hash = await hashearDato(datosFormulario.rut);

     setIsDataLoading(true); // Indicar carga
     try {
       const nuevaMadre = await api.crearMadre(datosParaAPI);
       setMadres(prev => [...prev, nuevaMadre]); // Actualiza estado local con respuesta de API
       mostrarAlerta(MENSAJES.exito.madreRegistrada, 'success');
       setPantallaActual('dashboard'); // Volver al dashboard
     } catch (error) {
       mostrarAlerta(`Error al registrar madre: ${error.message}`, 'error');
     } finally {
       setIsDataLoading(false); // Fin de carga
     }
  }, [tienePermiso, mostrarAlerta, madres, usuario]); // Añadido usuario si la auditoría se hace aquí

  const registrarParto = useCallback(async (datosFormulario) => {
    if (!tienePermiso('crearRegistroParto') || !madreSeleccionada) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
    // Validaciones básicas (backend DEBE revalidar)
    if (!datosFormulario.pesoRN || !datosFormulario.tallaRN || !datosFormulario.apgar1 || !datosFormulario.apgar5) {
      return mostrarAlerta(MENSAJES.error.camposObligatorios, 'error');
    }

    // Preparar datos para la API
    const datosParaAPI = {
        madre: madreSeleccionada.id, // Enviar el ID (UUID) de la madre
        fecha_parto: `${datosFormulario.fecha}T${datosFormulario.hora}:00`, // Combinar fecha y hora a ISOString o DateTimeField
        tipo_parto: datosFormulario.tipo,
        // edad_gestacional: datosFormulario.edadGestacional, // Si tienes este campo
        // anestesia: datosFormulario.anestesia, // Si tienes este campo
        // Los datos del RN irán en el serializer de RecienNacido si son modelos separados
        // Si están en el mismo serializer de Parto, añadirlos aquí:
        // rn_rut_provisorio: datosFormulario.rutProvisorio,
        // rn_sexo: datosFormulario.sexoRN,
        // rn_estado_al_nacer: datosFormulario.estadoAlNacer,
        // rn_peso_gramos: datosFormulario.pesoRN,
        // rn_talla_cm: datosFormulario.tallaRN,
        // rn_apgar_1_min: datosFormulario.apgar1,
        // rn_apgar_5_min: datosFormulario.apgar5,
        // rn_profilaxis_vit_k: datosFormulario.profilaxisVitaminaK,
        // rn_profilaxis_oftalmica: datosFormulario.profilaxisOftalmica,
         // Cómo enviar diagnósticos? Depende del serializer (PrimaryKeyRelatedField o Nested)
         // Si es PrimaryKeyRelatedField: necesita los UUIDs de los diagnósticos
         // diagnosticos_ids: obtenerUUIDsDiagnosticos(datosFormulario.diagnosticosCIE10),
         // observaciones: datosFormulario.observaciones, // Si tienes este campo
    };

     // **¡NECESITAS AJUSTAR `datosParaAPI` según tu `PartoSerializer` y `RecienNacidoSerializer`!**
     // Probablemente necesites crear el Parto primero y LUEGO el RecienNacido.

    setIsDataLoading(true);
    try {
      // --- Lógica Asumiendo Creación Separada ---
      // 1. Crear Parto
      const nuevoParto = await api.crearParto({
          madre: madreSeleccionada.id,
          fecha_parto: `${datosFormulario.fecha}T${datosFormulario.hora}:00`,
          tipo_parto: datosFormulario.tipo,
          // otros campos de Parto...
      });

      // 2. Crear RecienNacido asociado al nuevo parto
      const nuevoRN = await api.crearRecienNacido({
          parto: nuevoParto.id, // ID del parto recién creado
          rut_provisorio: datosFormulario.rutProvisorio,
          estado_al_nacer: datosFormulario.estadoAlNacer,
          sexo: datosFormulario.sexoRN,
          peso_gramos: datosFormulario.pesoRN,
          talla_cm: datosFormulario.tallaRN,
          apgar_1_min: datosFormulario.apgar1,
          apgar_5_min: datosFormulario.apgar5,
          profilaxis_vit_k: datosFormulario.profilaxisVitaminaK,
          profilaxis_oftalmica: datosFormulario.profilaxisOftalmica,
      });

      // 3. Asociar Diagnósticos (si PartoDiagnostico es un endpoint separado)
      // const diagnosticoUUIDs = await obtenerUUIDsDiagnosticos(datosFormulario.diagnosticosCIE10);
      // for (const diagId of diagnosticoUUIDs) {
      //    await api.crearPartoDiagnostico({ parto: nuevoParto.id, diagnostico_id: diagId });
      // }

      // Actualizar estado local (puede ser complejo si son modelos separados)
      // Lo más simple es recargar los datos
      await cargarDatosIniciales(); // Recarga todo para reflejar cambios

      mostrarAlerta(MENSAJES.exito.partoRegistrado, 'success');
      setPantallaActual('dashboard');
      setMadreSeleccionada(null);
    } catch (error) {
      mostrarAlerta(`Error al registrar parto: ${error.message}`, 'error');
    } finally {
      setIsDataLoading(false);
    }
   }, [tienePermiso, mostrarAlerta, madreSeleccionada, usuario, cargarDatosIniciales]); // Añadido cargarDatosIniciales

   // Función para Editar Madre (Datos Demográficos)
   const editarMadre = useCallback(async (id, datosActualizados) => {
       if (!tienePermiso('editarDatosDemograficos')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');

       // TODO: Cifrar/Hashear campos si es necesario antes de enviar
       const datosParaAPI = { ...datosActualizados };

       setIsDataLoading(true);
       try {
           const madreActualizada = await api.actualizarMadre(id, datosParaAPI);
           // Actualizar el estado local con los datos devueltos por la API
           setMadres(prev => prev.map(m => m.id === id ? madreActualizada : m));
           mostrarAlerta(MENSAJES.exito.datosActualizados, 'success');
           setPantallaActual('dashboard');
           setMadreSeleccionada(null); // Limpia selección
       } catch (error) {
           mostrarAlerta(`Error al actualizar madre: ${error.message}`, 'error');
       } finally {
           setIsDataLoading(false);
       }
   }, [tienePermiso, mostrarAlerta, usuario]); // Añadido usuario si la auditoría se hace aquí

    // Función para Editar Parto (Matrona, dentro de ventana de tiempo)
    const editarParto = useCallback(async (id, datosFormulario) => {
        const partoAEditar = partos.find(p => p.id === id);
        if (!partoAEditar) return mostrarAlerta('Parto no encontrado', 'error');

        // La validación de permisos y ventana de tiempo está en el backend (views.py)
        // Ya no es necesario 'puedeEditarParto' aquí para la *llamada* a la API,
        // pero sí lo usamos para *mostrar/ocultar* el botón de editar en el Dashboard.

        const datosParaAPI = {
            // Mapea los campos del formulario a los esperados por el serializer
             tipo_parto: datosFormulario.tipo,
             fecha_parto: `${datosFormulario.fecha}T${datosFormulario.hora}:00`,
             // ... otros campos editables del Parto ...
             // ¡Los campos del RN NO se editan aquí si son modelos separados!
             // Tendrías que llamar a actualizarRecienNacido por separado.
        };

        setIsDataLoading(true);
        try {
            const partoActualizado = await api.actualizarParto(id, datosParaAPI);

            // Si también se editan datos del RN (modelo separado):
            // const rnAsociado = recienNacidos.find(rn => rn.parto === id);
            // if (rnAsociado) {
            //    const datosRNParaAPI = { peso_gramos: datosFormulario.pesoRN, ... };
            //    await api.actualizarRecienNacido(rnAsociado.id, datosRNParaAPI);
            // }

            // Recargar datos para asegurar consistencia
            await cargarDatosIniciales();
            mostrarAlerta('Parto actualizado correctamente', 'success');
            setPantallaActual('dashboard');
            setPartoSeleccionado(null);
        } catch (error) {
            mostrarAlerta(`Error al editar parto: ${error.message}`, 'error');
            // El backend ya devuelve el mensaje específico (ej. ventana expirada)
        } finally {
            setIsDataLoading(false);
        }
    }, [partos, mostrarAlerta, usuario, cargarDatosIniciales]); // Añadido usuario, cargarDatos

    // Función para Anexar Corrección (Médico)
    const anexarCorreccionParto = useCallback(async (idParto, datosCorreccionForm) => {
       if (!tienePermiso('anexarCorreccion')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');

       // datosCorreccionForm viene de AnexarCorreccion.js: { campo, valorNuevo, justificacion }
       const datosParaAPI = {
           campo: datosCorreccionForm.campo,
           valor_nuevo: datosCorreccionForm.valorNuevo,
           justificacion: datosCorreccionForm.justificacion
       };

       setIsDataLoading(true);
       try {
           await api.anexarCorreccionParto(idParto, datosParaAPI);
           // Opcional: Recargar correcciones si tienes un estado/endpoint para ellas
           // await cargarCorrecciones();
           mostrarAlerta(MENSAJES.exito.correccionAnexada, 'success');
           setPantallaActual('dashboard');
           setPartoSeleccionado(null);
       } catch (error) {
            mostrarAlerta(`Error al anexar corrección: ${error.message}`, 'error');
       } finally {
           setIsDataLoading(false);
       }
    }, [tienePermiso, mostrarAlerta, usuario]); // Añadido usuario

    // Función para Guardar Partograma (Ejemplo con JSONB en Parto)
    const guardarPartograma = useCallback(async (datosPartograma) => {
        if (!tienePermiso('crearPartograma') || !madreSeleccionada) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        // Necesitas el ID del Parto asociado a la madreSeleccionada
        const partoAsociado = partos.find(p => p.madre === madreSeleccionada.id); // Asume relación 1 a 1 temporalmente
        if (!partoAsociado) return mostrarAlerta('No se encontró parto asociado para guardar el partograma.', 'error');

        setIsDataLoading(true);
        try {
            await api.guardarPartograma(partoAsociado.id, datosPartograma.registros); // Envía solo los registros
            // Recargar datos para ver el partograma_data actualizado en el parto
            await cargarDatosIniciales();
            mostrarAlerta('Partograma guardado exitosamente', 'success');
            setPantallaActual('dashboard');
            setMadreSeleccionada(null);
        } catch (error) {
             mostrarAlerta(`Error al guardar partograma: ${error.message}`, 'error');
        } finally {
            setIsDataLoading(false);
        }
    }, [tienePermiso, mostrarAlerta, usuario, madreSeleccionada, partos, cargarDatosIniciales]);

    // Función para Guardar Epicrisis (Ejemplo con JSONB en Parto)
    const guardarEpicrisis = useCallback(async (datosEpicrisisCompletos) => {
         if (!tienePermiso('crearEpicrisis') || !partoSeleccionado) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');

        setIsDataLoading(true);
        try {
            // Prepara el objeto JSON para enviar (solo epicrisis e indicaciones)
            const datosParaAPI = {
                epicrisis: datosEpicrisisCompletos.epicrisis,
                indicaciones: datosEpicrisisCompletos.indicaciones,
                // Puedes añadir otros metadatos si el backend los espera
                // medico_responsable: usuario.nombre,
            };
            await api.guardarEpicrisis(partoSeleccionado.id, datosParaAPI);

            // Recargar datos para ver el epicrisis_data actualizado
            await cargarDatosIniciales();
            mostrarAlerta('Epicrisis guardada exitosamente', 'success');

             // Generar PDF (sigue siendo frontend, necesita datos actualizados)
             const partoActualizado = partos.find(p => p.id === partoSeleccionado.id) || partoSeleccionado; // Usa datos actualizados si ya están
             const madre = madres.find(m => m.id === partoActualizado.madre);
             if (partoActualizado && madre) {
                 // Pasa solo los datos relevantes al PDF
                  generarEpicrisisPDF(partoActualizado, madre, {
                      epicrisis: datosEpicrisisCompletos.epicrisis,
                      indicaciones: datosEpicrisisCompletos.indicaciones,
                      medico: usuario.nombre // Añade el médico que generó
                  });
                 mostrarAlerta('Epicrisis guardada y PDF generado', 'success');
             }

            setPantallaActual('dashboard');
            setPartoSeleccionado(null);
        } catch (error) {
            mostrarAlerta(`Error al guardar epicrisis: ${error.message}`, 'error');
        } finally {
            setIsDataLoading(false);
        }
    }, [tienePermiso, mostrarAlerta, usuario, partoSeleccionado, partos, madres, cargarDatosIniciales]);


    // Función para Registrar Defunción
     const guardarDefuncion = useCallback(async (datosDefuncionForm) => {
        if (!tienePermiso('crearEpicrisis')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error'); // Asume mismo permiso

        // *** ¡Validación Crucial de IDs! ***
        // Necesitamos asegurar que enviamos los UUIDs correctos para madre/recien_nacido y causa_defuncion
        let datosParaAPI = { ...datosDefuncionForm };

        // 1. Mapear 'recienNacidoId' (que probablemente contiene ID del *Parto*) al ID del *RecienNacido*
        if (datosParaAPI.tipo === 'recien_nacido' && datosParaAPI.recienNacidoId) {
            const partoId = datosParaAPI.recienNacidoId;
            // Buscar el RN asociado a ese parto EN EL ESTADO ACTUAL O CON API
            // Esta es una limitación si no tenemos el estado de RN cargado.
            // Solución: El backend podría aceptar el parto_id y buscar el RN él mismo.
            // O: Cargar RNs en el estado `recienNacidos`
            const rn = recienNacidos.find(r => r.parto === partoId); // Asumiendo que recienNacidos está poblado
            if (!rn) return mostrarAlerta(`No se encontró Recién Nacido asociado al parto seleccionado (ID Parto: ${partoId})`, 'error');
            datosParaAPI.recienNacidoId = rn.id; // ¡Ahora sí es el ID del RN!
        }

         // 2. Mapear 'causaDefuncionCodigo' (ej. "P95") al UUID del DiagnosticoCIE10
         const diagnostico = diagnosticos.find(d => d.codigo === datosParaAPI.causaDefuncionCodigo);
         if (!diagnostico) return mostrarAlerta(`Código CIE-10 '${datosParaAPI.causaDefuncionCodigo}' no encontrado`, 'error');
         datosParaAPI.causaDefuncionCodigo = diagnostico.id; // ¡Ahora es el UUID!

        setIsDataLoading(true);
        try {
            await api.crearDefuncion(datosParaAPI); // api.js mapeará los campos a los esperados por el backend
            await cargarDatosIniciales(); // Recargar para ver la nueva defunción
            mostrarAlerta('Defunción registrada correctamente', 'success');
            setPantallaActual('dashboard');
        } catch(error) {
             mostrarAlerta(`Error al registrar defunción: ${error.message}`, 'error');
        } finally {
            setIsDataLoading(false);
        }
    }, [tienePermiso, mostrarAlerta, usuario, cargarDatosIniciales, recienNacidos, diagnosticos]); // Dependencias clave!


     // Función para Guardar/Actualizar Usuario (Admin Sistema)
     const guardarUsuario = useCallback(async (datosUsuarioForm) => {
        if (!tienePermiso('gestionarUsuarios')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');

        // *** Mapeo de Rol a ID ***
        // Necesitamos obtener el UUID del rol seleccionado en el formulario.
        // Asumimos que cargamos los roles al iniciar sesión o aquí.
        // const rolesCargados = await api.obtenerRoles(); // O tenerlos en estado
        // const rolSeleccionado = rolesCargados.find(r => r.nombre.toLowerCase() === datosUsuarioForm.rol);
        // if (!rolSeleccionado) return mostrarAlerta(`Rol '${datosUsuarioForm.rol}' inválido`, 'error');

        const datosParaAPI = {
            ...datosUsuarioForm,
            // rol: rolSeleccionado.id, // Enviar el UUID del rol
            // Necesitamos manejar la contraseña al crear
            // password: datosUsuarioForm.password || 'contraseña_temporal_segura', // Añadir campo password al form
        };
        // Quitar 'id' si es creación
        if (!datosUsuarioForm.id) delete datosParaAPI.id;

        setIsDataLoading(true);
        try {
            if (datosUsuarioForm.id) { // Actualización
                await api.actualizarUsuario(datosUsuarioForm.id, datosParaAPI);
                mostrarAlerta('Usuario actualizado', 'success');
            } else { // Creación
                await api.crearUsuario(datosParaAPI);
                mostrarAlerta('Usuario creado', 'success');
            }
             await cargarDatosIniciales(); // Recargar lista de usuarios
             setPantallaActual('gestion-usuarios'); // Volver a la lista
        } catch (error) {
            mostrarAlerta(`Error al guardar usuario: ${error.message}`, 'error');
        } finally {
            setIsDataLoading(false);
        }
    }, [tienePermiso, mostrarAlerta, usuario, cargarDatosIniciales]);

    // Función para Desactivar Usuario (Admin Sistema)
    const desactivarUsuario = useCallback(async (usuarioId) => {
       if (!tienePermiso('gestionarUsuarios')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
       const userToDeactivate = usuariosSistema.find(u => u.id === usuarioId);
       if (!userToDeactivate) return;

       // Confirmación
       if (!window.confirm(`¿Está seguro de desactivar al usuario ${userToDeactivate.username}?`)) return;

       setIsDataLoading(true);
       try {
            await api.desactivarUsuario(usuarioId); // Llama a DELETE /usuarios/{id}/
            await cargarDatosIniciales(); // Recargar lista de usuarios
            mostrarAlerta('Usuario desactivado', 'success');
       } catch (error) {
            mostrarAlerta(`Error al desactivar usuario: ${error.message}`, 'error');
       } finally {
            setIsDataLoading(false);
       }
    }, [tienePermiso, mostrarAlerta, usuario, cargarDatosIniciales, usuariosSistema]); // Añadido usuariosSistema

    // --- Funciones de Navegación y UI ---
    // (mostrarVistaPreviaPDF, imprimirBrazalete - como antes, usando api.js si es necesario)
     const mostrarVistaPreviaPDF = useCallback((parto) => {
        if (!tienePermiso('generarBrazalete')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        const madre = madres.find(m => m.id === parto.madre); // parto.madre ahora es el ID
        if (madre) {
            setVistaPrevia({ parto, madre });
        } else {
            mostrarAlerta('No se encontró la madre asociada a este parto.', 'error');
        }
    }, [tienePermiso, mostrarAlerta, madres]);

    const imprimirBrazalete = useCallback((parto, madre) => {
        if (!tienePermiso('generarBrazalete')) return mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        if (parto && madre) {
            generarBrazaletePDF(parto, madre); // Llama a la utilidad directamente
            setVistaPrevia(null); // Cierra la vista previa
            mostrarAlerta('Brazalete PDF generado', 'success');
             // Podrías registrar auditoría aquí si el backend no lo hace al generar
        } else {
            mostrarAlerta('Faltan datos para generar el brazalete.', 'error');
        }
    }, [tienePermiso, mostrarAlerta]);

    // --- Filtros y Cálculos Memoizados ---
    // (madresFiltradas, partosFiltrados, calcularDiasHospitalizacion - como antes)
     const madresFiltradas = useMemo(() => {
        return madres.filter(madre => {
             // Lógica de búsqueda
             const busquedaLower = busqueda.toLowerCase();
             const coincideBusqueda = !busqueda ||
                 (madre.rut_encrypted && madre.rut_encrypted.toLowerCase().includes(busquedaLower)) || // Asume que tienes acceso al RUT desencriptado o buscas por hash?
                 (madre.nombre_encrypted && madre.nombre_encrypted.toLowerCase().includes(busquedaLower)); // Asume acceso a nombre desencriptado

            // Lógica de turno (más compleja ahora)
            // const pertenece = perteneceATurno(madre); // Llama a la función de turno

             return coincideBusqueda; // && pertenece; // Añadir si se implementa filtro por turno
        });
    }, [madres, busqueda]); // Quitado perteneceATurno por ahora

     const partosFiltrados = useMemo(() => {
        return partos.filter(parto => {
            const madre = madres.find(m => m.id === parto.madre); // parto.madre es el ID
            // Lógica de búsqueda
             const busquedaLower = busqueda.toLowerCase();
             const coincideBusqueda = !busqueda ||
                 (madre?.rut_encrypted && madre.rut_encrypted.toLowerCase().includes(busquedaLower)) ||
                 (madre?.nombre_encrypted && madre.nombre_encrypted.toLowerCase().includes(busquedaLower)) ||
                 (parto.id && parto.id.toLowerCase().includes(busquedaLower)); // Buscar por ID de parto/RN si aplica

            // Lógica de turno (asumiendo que viene del backend o se calcula)
            // const pertenece = perteneceATurno(madre);

             return coincideBusqueda; // && pertenece;
        });
    }, [partos, madres, busqueda]); // Quitado perteneceATurno

      const calcularDiasHospitalizacion = useCallback((fechaIngreso) => {
        if (!fechaIngreso) return 0;
        try {
            const fecha = new Date(fechaIngreso);
            const hoy = new Date();
            // Ignorar la hora para calcular días completos
            fecha.setHours(0, 0, 0, 0);
            hoy.setHours(0, 0, 0, 0);
            const diferencia = Math.max(0, Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24)));
            return diferencia;
        } catch (e) {
            return 0; // En caso de fecha inválida
        }
      }, []);


  // --- Renderizado Condicional ---
   // 1. Carga inicial de la app (verificando token)
   if (isLoading) {
       return (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
               <div className="spinner"></div>
               <p style={{ marginLeft: '1rem', color: '#6b7280' }}>Verificando sesión...</p>
           </div>
       );
   }

   // 2. Si no hay usuario, mostrar Login
   if (!usuario || pantallaActual === 'login') {
       // Pasa la función iniciarSesion REAL a PantallaLogin
       return <PantallaLogin onLogin={iniciarSesion} mostrarAlerta={mostrarAlerta} />;
   }

   // 3. Si hay usuario, renderizar Layout principal
   // --- Renderizado Principal (Logueado) ---
   return (
     <Layout>
        {/* Indicador de carga de datos */}
        {isDataLoading && (
             <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 2500, background: 'rgba(255, 255, 255, 0.9)', padding: '0.5rem 1rem', borderRadius: '0.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}>
               <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '0.5rem', borderTopColor: '#2563eb' }}></div>
               <span>Cargando datos...</span>
             </div>
        )}

        {/* Contenido según pantallaActual */}
        {pantallaActual === 'dashboard' && (
             <DashboardComponent // Crear este componente separado
                 madres={madresFiltradas}
                 partos={partosFiltrados}
                 tienePermiso={tienePermiso}
                 usuario={usuario}
                 onBuscar={setBusqueda}
                 onVerMadre={(madre) => { setVistaPreviaMadre(madre); }}
                 onEditarMadre={(madre) => { setMadreSeleccionada(madre); setPantallaActual('editar-madre'); }}
                 onRegistrarParto={(madre) => { setMadreSeleccionada(madre); setPantallaActual('registrar-parto'); }}
                 onVerBrazalete={mostrarVistaPreviaPDF} // Usa la función wrapper
                 onImprimirBrazalete={imprimirBrazalete} // Usa la función wrapper
                 onEditarParto={(parto) => { setPartoSeleccionado(parto); setPantallaActual('editar-parto'); }}
                 onAnexarCorreccion={(parto) => { setPartoSeleccionado(parto); setPantallaActual('anexar-correccion'); }}
                 puedeEditarParto={puedeEditarParto} // Pasa la función de chequeo
                 calcularDiasHospitalizacion={calcularDiasHospitalizacion}
                 isLoading={isDataLoading} // Pasa el estado de carga
             />
        )}

        {pantallaActual === 'admision' && tienePermiso('crearPaciente') &&
            <FormularioAdmisionComponent onGuardar={agregarMadre} onCancelar={() => setPantallaActual('dashboard')} />
        }
         {pantallaActual === 'registrar-parto' && tienePermiso('crearRegistroParto') && madreSeleccionada &&
            <FormularioPartoComponent
                madre={madreSeleccionada}
                diagnosticos={diagnosticos} // Pasa los diagnósticos cargados de la API
                onGuardar={registrarParto}
                onCancelar={() => { setMadreSeleccionada(null); setPantallaActual('dashboard'); }}
            />
        }
         {pantallaActual === 'editar-madre' && tienePermiso('editarDatosDemograficos') && madreSeleccionada &&
             <EditarMadre
                 madre={madreSeleccionada}
                 onGuardar={(datos) => editarMadre(madreSeleccionada.id, datos)}
                 onCancelar={() => { setMadreSeleccionada(null); setPantallaActual('dashboard'); }}
             />
         }
          {pantallaActual === 'editar-parto' && partoSeleccionado &&
              <EditarParto
                  parto={partoSeleccionado}
                  madre={madres.find(m => m.id === partoSeleccionado.madre)} // Accede por ID
                  onGuardar={(datos) => editarParto(partoSeleccionado.id, datos)}
                  onCancelar={() => { setPartoSeleccionado(null); setPantallaActual('dashboard'); }}
              />
         }
         {pantallaActual === 'anexar-correccion' && tienePermiso('anexarCorreccion') && partoSeleccionado &&
              <AnexarCorreccion
                  parto={partoSeleccionado}
                  madre={madres.find(m => m.id === partoSeleccionado.madre)}
                  onGuardar={(datos) => anexarCorreccionParto(partoSeleccionado.id, datos)}
                  onCancelar={() => { setPartoSeleccionado(null); setPantallaActual('dashboard'); }}
              />
         }
         {pantallaActual === 'registrar-defuncion' && tienePermiso('crearEpicrisis') && // Asume mismo permiso
              <RegistroDefuncion
                  madres={madresFiltradas} // Pasa madres (ya filtradas por turno si aplica)
                  partos={partosFiltrados} // Pasa partos (ya filtrados por turno si aplica)
                  diagnosticos={diagnosticos} // Pasa catálogo CIE10
                  onGuardar={guardarDefuncion}
                  onCancelar={() => setPantallaActual('dashboard')}
              />
         }
         {/* ... Renderizar condicionalmente los demás formularios y vistas ... */}
         {pantallaActual === 'gestion-usuarios' && tienePermiso('gestionarUsuarios') &&
              <GestionUsuarios
                  usuarios={usuariosSistema} // Pasa usuarios cargados de la API
                  onGuardarUsuario={guardarUsuario}
                  onDesactivarUsuario={desactivarUsuario}
                  mostrarAlerta={mostrarAlerta}
                  // Necesitarás pasar la lista de roles si el formulario los necesita
              />
         }
          {pantallaActual === 'reporteREM' && tienePermiso('generarReportes') && (
              <ReporteREM partos={partos} madres={madres} /> // Pasa datos cargados
          )}
           {pantallaActual === 'auditoria' && tienePermiso('verAuditoria') && (
               <TablaAuditoria eventos={logsAuditoria} /> // Pasa logs cargados
           )}

            {/* Vistas de solo lectura (necesitan obtener sus datos) */}
            {/* Estas vistas deberían probablemente cargar sus propios datos usando IDs o filtros */}
             {pantallaActual === 'vista-correcciones' && <VistaCorrecciones correcciones={correcciones} partos={partos} madres={madres} onCerrar={() => setPantallaActual('dashboard')} />}
             {pantallaActual === 'vista-partogramas' && <VistaPartogramas partogramas={partogramas} madres={madres} onCerrar={() => setPantallaActual('dashboard')} />}
             {pantallaActual === 'vista-epicrisis' && <VistaEpicrisis epicrisis={epicrisis} partos={partos} madres={madres} onCerrar={() => setPantallaActual('dashboard')} />}
             {pantallaActual === 'vista-defunciones' && <VistaDefunciones defunciones={defunciones} partos={partos} madres={madres} onCerrar={() => setPantallaActual('dashboard')} />}

             {/* Componentes que faltan integrar con API */}
              {pantallaActual === 'notas-enfermera' && usuario?.rol === ROLES.ENFERMERA && (
                  <NotasEnfermera notas={notasEnfermera} setNotas={setNotasEnfermera} usuario={usuario} /> // Necesita API
              )}
               {pantallaActual === 'crear-partograma' && madreSeleccionada && (
                  <Partograma
                      madre={madreSeleccionada}
                      parto={partos.find(p => p.madre === madreSeleccionada.id)} // Asume 1 parto por madre para simpleza
                      onGuardar={guardarPartograma}
                      onCancelar={() => { setMadreSeleccionada(null); setPantallaActual('dashboard'); }}
                   />
               )}
                {pantallaActual === 'crear-epicrisis' && partoSeleccionado && (
                   <EpicrisisMedica
                       parto={partoSeleccionado}
                       madre={madres.find(m => m.id === partoSeleccionado.madre)}
                       onGuardar={guardarEpicrisis}
                       onCancelar={() => { setPartoSeleccionado(null); setPantallaActual('dashboard'); }}
                   />
               )}

     </Layout>
   );

};

// --- Componente Layout (Barra de Navegación y Footer) ---
// (Similar a tu versión, pero recibe props como 'usuario' y 'cerrarSesion')
const Layout = ({ children, usuario, cerrarSesion, tienePermiso, setPantallaActual, setMenuRegistrosAbierto, menuRegistrosAbierto, mostrarAlerta, madres, partos, defunciones, correcciones, partogramas, epicrisis }) => {
 // ... (JSX del Layout como lo tenías, usando las props recibidas) ...
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
        {/* Barra de Navegación */}
       <nav style={{ backgroundColor: '#2563eb', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '0.75rem 0' }}>
         <div className="contenedor">
           <div className="flex justify-between items-center">
             {/* Logo y Título */}
             <div className="flex items-center gap-3">
               <Baby size={32} />
               <div>
                 <h1 className="texto-lg font-bold">SIGN - Gestión Neonatal</h1>
                 <p className="texto-xs" style={{ opacity: 0.9 }}>
                   {usuario?.rol.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {usuario?.nombre}
                   {usuario?.turno && ` | Turno: ${usuario.turno.replace(/\b\w/g, l => l.toUpperCase())}`}
                 </p>
               </div>
             </div>

             {/* Botones de Acción */}
             <div className="flex items-center gap-2 flex-wrap">
                 <button onClick={() => setPantallaActual('dashboard')} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><Home size={18} /> Inicio</button>
                 {tienePermiso('crearPaciente') && <button onClick={() => setPantallaActual('admision')} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><PlusCircle size={18} /> Admisión</button>}
                  {/* Botón Partograma (Matrona) */}
                  {tienePermiso('crearPartograma') && (
                     <button onClick={() => {
                         if (madres.filter(m => perteneceATurno(m)).length === 0) return mostrarAlerta('No hay madres en su turno', 'info');
                         setPantallaActual('seleccionar-madre-partograma');
                     }} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><Activity size={18} /> Partograma</button>
                  )}
                  {/* Botón Epicrisis (Médico) */}
                  {tienePermiso('crearEpicrisis') && (
                      <button onClick={() => {
                           if (partos.length === 0) return mostrarAlerta('No hay partos registrados', 'info');
                          setPantallaActual('seleccionar-parto-epicrisis');
                      }} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><Stethoscope size={18} /> Epicrisis</button>
                  )}
                  {/* Botón Defunción (Médico) */}
                  {tienePermiso('crearEpicrisis') && ( // Mismo permiso que Epicrisis
                      <button onClick={() => {
                          if (madres.length === 0 && partos.length === 0) return mostrarAlerta('No hay pacientes', 'info');
                          setPantallaActual('registrar-defuncion');
                      }} className="boton" style={{ backgroundColor: '#ef4444', color: 'white' }}><Skull size={18} /> Defunción</button>
                  )}
                 {/* Menú Registros */}
                  {(tienePermiso('verEpicrisis') || tienePermiso('anexarCorreccion')) && (
                     <div style={{ position: 'relative' }}>
                       <button onClick={() => setMenuRegistrosAbierto(prev => !prev)} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><List size={18} /> Registros <ChevronDown size={16} /></button>
                       {menuRegistrosAbierto && (
                         <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', minWidth: '200px', zIndex: 1000, border: '1px solid #e5e7eb' }}>
                            {/* Opciones del menú */}
                             {tienePermiso('verEpicrisis') && <button onClick={() => { setPantallaActual('vista-epicrisis'); setMenuRegistrosAbierto(false); }} className="boton" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', color: '#1f2937', borderRadius: 0 }}><Stethoscope size={16}/> Epicrisis ({epicrisis.length})</button>}
                              {tienePermiso('verPartograma') && <button onClick={() => { setPantallaActual('vista-partogramas'); setMenuRegistrosAbierto(false); }} className="boton" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', color: '#1f2937', borderRadius: 0 }}><Activity size={16}/> Partogramas ({partogramas.length})</button>}
                              {tienePermiso('anexarCorreccion') && <button onClick={() => { setPantallaActual('vista-correcciones'); setMenuRegistrosAbierto(false); }} className="boton" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', color: '#1f2937', borderRadius: 0 }}><FileText size={16}/> Correcciones ({correcciones.length})</button>}
                              {tienePermiso('crearEpicrisis') && <button onClick={() => { setPantallaActual('vista-defunciones'); setMenuRegistrosAbierto(false); }} className="boton" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', color: '#1f2937', borderRadius: 0 }}><Skull size={16}/> Defunciones ({defunciones.length})</button>}
                         </div>
                       )}
                     </div>
                  )}
                 {/* Botones Admin */}
                 {tienePermiso('generarReportes') && <button onClick={() => setPantallaActual('reporteREM')} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><BarChart3 size={18} /> Reporte REM</button>}
                 {tienePermiso('gestionarUsuarios') && <button onClick={() => setPantallaActual('gestion-usuarios')} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><Users size={18} /> Usuarios</button>}
                 {tienePermiso('verAuditoria') && <button onClick={() => setPantallaActual('auditoria')} className="boton" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}><Shield size={18} /> Auditoría</button>}

                 {/* Botón Logout */}
                 <button onClick={cerrarSesion} className="boton boton-peligro"><LogOut size={18} /> Salir</button>
             </div>
           </div>
         </div>
       </nav>

        {/* Contenido Principal */}
       <main className="contenedor" style={{ padding: '2rem 1rem', flexGrow: 1 }}>
         {children}
       </main>

        {/* Footer */}
       <footer style={{ backgroundColor: '#1f2937', color: 'white', textAlign: 'center', padding: '1.5rem', marginTop: 'auto' }}>
         <p className="texto-sm">SIGN - Sistema Integrado de Gestión Neonatal v1.0</p>
         <p className="texto-sm" style={{ opacity: 0.8, marginTop: '0.5rem' }}>Hospital Clínico Herminda Martín - Chillán, Chile</p>
         <p className="texto-xs" style={{ opacity: 0.6, marginTop: '0.5rem' }}>Sistema RBAC - Cumplimiento Ley 20.584</p>
       </footer>
     </div>
   );
};

// --- Componente Dashboard ---
// (Similar a tu versión, pero recibe props y usa datos reales)
const DashboardComponent = ({ madres, partos, tienePermiso, usuario, onBuscar, onVerMadre, onEditarMadre, onRegistrarParto, onVerBrazalete, onImprimirBrazalete, onEditarParto, onAnexarCorreccion, puedeEditarParto, calcularDiasHospitalizacion, isLoading }) => {
   // ... (JSX del Dashboard como lo tenías, usando las props) ...
    // Filtrar partos recientes para mostrar en la tabla principal
     const partosRecientes = useMemo(() => {
         // Ordenar por fecha de registro descendente y tomar los últimos 10 o 20
         return [...partos] // Copiar array para no mutar el original
             .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
             .slice(0, 15); // Mostrar los 15 más recientes
     }, [partos]);

     // Contar partos de hoy
     const partosHoy = useMemo(() => {
         const hoyStr = new Date().toISOString().split('T')[0];
         return partos.filter(p => p.fecha_parto.startsWith(hoyStr)).length;
     }, [partos]);


    return (
      <div className="animacion-entrada">
        {/* Filtro por turno */}
        {tienePermiso('accesoPorTurno') && usuario.turno && (
          <div className="tarjeta mb-6 alerta-info">
            <Clock size={24} />
            <div>
              <p className="font-semibold">Turno Activo: {usuario.turno.replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p className="texto-sm">Solo visualiza pacientes y registros asociados a su turno.</p>
            </div>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="tarjeta mb-6">
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" className="input" placeholder="Buscar por RUT de madre, nombre o ID del RN..." onChange={(e) => onBuscar(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        {/* Estadísticas (si tiene permiso) */}
        {tienePermiso('verEstadisticas') && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="tarjeta tarjeta-hover">
              <p className="texto-sm texto-gris">Madres Registradas</p>
              <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>{madres.length}</p>
              {tienePermiso('accesoPorTurno') && <p className="texto-xs texto-gris">En mi turno</p>}
            </div>
            <div className="tarjeta tarjeta-hover">
              <p className="texto-sm texto-gris">Partos Totales</p>
              <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>{partos.length}</p>
              {tienePermiso('accesoPorTurno') && <p className="texto-xs texto-gris">En mi turno</p>}
            </div>
            <div className="tarjeta tarjeta-hover">
               <p className="texto-sm texto-gris">Partos Hoy</p>
               <p className="texto-3xl font-bold" style={{ color: '#8b5cf6' }}>{partosHoy}</p>
            </div>
          </div>
        )}

        {/* Tabla Principal: Recién Nacidos / Partos Recientes */}
        {tienePermiso('verDatosClinicos') && (
          <div className="tarjeta">
            <h2 className="texto-2xl font-bold mb-4">Partos Recientes Registrados</h2>
            {isLoading ? (
                <div className="texto-centro py-6"><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            ) : partosRecientes.length === 0 ? (
                <p className="texto-centro texto-gris py-6">No hay partos registrados que coincidan con la búsqueda o el turno.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID Parto/RN</th>
                      <th>Madre</th>
                      <th>RUT Madre</th>
                      <th>Fecha Parto</th>
                      <th>Días Hosp.</th>
                      <th>Tipo</th>
                      {/* <th>Peso</th> */}
                      {/* <th>APGAR</th> */}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partosRecientes.map((parto) => {
                      const madre = madres.find(m => m.id === parto.madre); // parto.madre es el ID
                      const diasHosp = calcularDiasHospitalizacion(madre?.fecha_registro); // Usa fecha registro de madre
                      const esAlerta = diasHosp > 7;
                      const puedeEditar = puedeEditarParto(parto);
                      const tiempoTranscurrido = Date.now() - new Date(parto.fecha_registro).getTime();
                      const horasRestantes = Math.max(0, 2 - Math.floor(tiempoTranscurrido / (1000 * 60 * 60)));

                      return (
                        <tr key={parto.id} style={{ backgroundColor: esAlerta ? '#fee2e2' : 'transparent' }}>
                          <td className="font-semibold">
                            {parto.id.substring(0, 8)}... {/* Mostrar ID corto del parto */}
                            {/* Mostrar info de edición si es Matrona */}
                            {usuario.rol === ROLES.MATRONA && (
                                <div className="texto-xs texto-gris mt-1">
                                    {puedeEditar ? (
                                        <span style={{ color: '#10b981' }}>✓ Editable ({horasRestantes}h restantes)</span>
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>🔒 Cerrado</span>
                                    )}
                                </div>
                            )}
                          </td>
                           <td>{madre?.nombre_encrypted || 'N/A'}</td> {/* Ajusta si desencriptas */}
                           <td>{madre?.rut_encrypted || 'N/A'}</td> {/* Ajusta si desencriptas */}
                           <td>{new Date(parto.fecha_parto).toLocaleDateString('es-CL')}</td>
                          <td>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: esAlerta ? '#dc2626' : '#10b981', color: 'white' }}>
                              {diasHosp} días
                            </span>
                          </td>
                          <td>
                             <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', backgroundColor: parto.tipo_parto === 'Cesárea' ? '#fef3c7' : '#d1fae5', color: parto.tipo_parto === 'Cesárea' ? '#92400e' : '#065f46' }}>
                              {parto.tipo_parto}
                            </span>
                          </td>
                          {/* Ocultamos peso/apgar para simplificar tabla */}
                          {/* <td>{parto.peso_gramos}g</td> */}
                          {/* <td>{parto.apgar_1_min}/{parto.apgar_5_min}</td> */}
                          <td>
                            {/* Botones de acción */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                 {/* Ver Madre */}
                                 <button onClick={() => onVerMadre(madre)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#6366f1', color: 'white' }} title="Ver info madre"><Eye size={16} /></button>
                                 {/* Editar Madre (si tiene permiso) */}
                                 {tienePermiso('editarDatosDemograficos') && <button onClick={() => onEditarMadre(madre)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white' }} title="Editar madre"><User size={16} /></button>}
                                 {/* Brazalete (si tiene permiso) */}
                                 {tienePermiso('generarBrazalete') && <button onClick={() => onVerBrazalete(parto)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white' }} title="Ver brazalete"><Printer size={16} /></button>}
                                 {/* Editar Parto (si puede) */}
                                 {puedeEditar && <button onClick={() => onEditarParto(parto)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#8b5cf6', color: 'white' }} title="Editar parto"><Edit3 size={16} /></button>}
                                 {/* Anexar Corrección (si tiene permiso) */}
                                 {tienePermiso('anexarCorreccion') && <button onClick={() => onAnexarCorreccion(parto)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#d97706', color: 'white' }} title="Anexar corrección"><FileText size={16} /></button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tabla Simplificada para Administrativo */}
         {tienePermiso('verDatosDemograficos') && !tienePermiso('verDatosClinicos') && (
           <div className="tarjeta mt-6">
             <h2 className="texto-2xl font-bold mb-4">Madres Admitidas Recientemente</h2>
              {isLoading ? (
                  <div className="texto-centro py-6"><div className="spinner" style={{ margin: '0 auto' }}></div></div>
              ) : madres.slice(-10).reverse().length === 0 ? (
                 <p className="texto-centro texto-gris py-6">No hay madres registradas.</p>
              ) : (
               <div style={{ overflowX: 'auto' }}>
                 <table className="tabla">
                   <thead><tr><th>RUT</th><th>Nombre</th><th>Edad</th><th>Fecha Ingreso</th><th>Acciones</th></tr></thead>
                   <tbody>
                     {madres.slice(-10).reverse().map(madre => (
                       <tr key={madre.id}>
                         <td className="font-semibold">{madre.rut_encrypted || 'N/A'}</td>
                         <td>{madre.nombre_encrypted || 'N/A'}</td>
                          {/* <td>{calcularEdad(madre.fecha_nacimiento)} años</td> */}
                          <td>{madre.fecha_nacimiento}</td> {/* Mostrar fecha por ahora */}
                         <td>{new Date(madre.fecha_registro).toLocaleDateString('es-CL')}</td>
                         <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => onVerMadre(madre)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#6366f1', color: 'white' }} title="Ver info madre"><Eye size={16} /></button>
                                {tienePermiso('editarDatosDemograficos') && <button onClick={() => onEditarMadre(madre)} className="boton" style={{ padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white' }} title="Editar madre"><User size={16} /></button>}
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
              )}
           </div>
         )}

         {/* Sección para registrar parto (si es Matrona) */}
          {tienePermiso('crearRegistroParto') && (
            <div className="tarjeta mt-6">
              <h3 className="texto-xl font-bold mb-4">Madres sin Parto Registrado (Mi Turno)</h3>
               {isLoading ? (<div className="texto-centro py-4">Buscando...</div>) :
                  madres.filter(m => !partos.some(p => p.madre === m.id) /*&& perteneceATurno(m)*/).length === 0 ? (
                   <p className="texto-centro texto-gris py-4">Todas las madres tienen parto registrado o no hay madres en su turno.</p>
               ) : (
                <div className="grid gap-3">
                  {madres.filter(m => !partos.some(p => p.madre === m.id) /*&& perteneceATurno(m)*/).map(madre => (
                    <div key={madre.id} className="flex justify-between items-center p-4" style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      <div>
                        <p className="font-semibold">{madre.nombre_encrypted || 'N/A'}</p>
                         <p className="texto-sm texto-gris">RUT: {madre.rut_encrypted || 'N/A'}</p>
                      </div>
                      <button onClick={() => onRegistrarParto(madre)} className="boton boton-secundario"><Baby size={18}/> Registrar Parto</button>
                    </div>
                  ))}
                </div>
               )}
            </div>
          )}
      </div>
    );
};


// --- Componentes de Formularios ---
// (FormularioAdmision, FormularioParto - necesitan ser componentes separados o definidos aquí)
// Ejemplo FormularioAdmision
const FormularioAdmisionComponent = ({ onGuardar, onCancelar }) => {
    const [datos, setDatos] = useState({
        rut_encrypted: '', nombre_encrypted: '', fecha_nacimiento: '', nacionalidad: 'Chilena',
        pertenece_pueblo_originario: false, telefono_encrypted: '', prevision: 'FONASA A', antecedentes_medicos: ''
    });
    const [errores, setErrores] = useState({});

    const validarFormulario = () => { /* ... lógica de validación ... */
        const nuevosErrores = {};
        if (!datos.rut_encrypted || !validarRUT(datos.rut_encrypted)) nuevosErrores.rut = 'RUT inválido';
        if (!datos.nombre_encrypted) nuevosErrores.nombre = 'Nombre obligatorio';
        if (!datos.fecha_nacimiento) nuevosErrores.fecha_nacimiento = 'Fecha Nacimiento obligatoria';
         // Calcula edad si es necesario para validar rango
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };
    const handleSubmit = (e) => { e.preventDefault(); if (validarFormulario()) onGuardar(datos); };

    return (
        <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 className="texto-2xl font-bold mb-6">Admisión de Madre</h2>
           {/* Inputs del formulario usando los nombres de campo del Modelo/Serializer */}
           {/* Ejemplo: */}
           <div className="grupo-input">
             <label className="etiqueta">RUT *</label>
             <input type="text" className={`input ${errores.rut ? 'input-error' : ''}`} placeholder="12.345.678-9" value={datos.rut_encrypted} onChange={(e) => setDatos({ ...datos, rut_encrypted: e.target.value })} />
             {errores.rut && <p className="mensaje-error">{errores.rut}</p>}
           </div>
           {/* ... otros campos ... */}
            <div className="grupo-input">
             <label className="etiqueta">Nombre Completo *</label>
             <input type="text" className={`input ${errores.nombre ? 'input-error' : ''}`} value={datos.nombre_encrypted} onChange={(e) => setDatos({ ...datos, nombre_encrypted: e.target.value })} />
             {errores.nombre && <p className="mensaje-error">{errores.nombre}</p>}
           </div>
            <div className="grupo-input">
             <label className="etiqueta">Fecha Nacimiento *</label>
             <input type="date" className={`input ${errores.fecha_nacimiento ? 'input-error' : ''}`} value={datos.fecha_nacimiento} onChange={(e) => setDatos({ ...datos, fecha_nacimiento: e.target.value })} />
             {errores.fecha_nacimiento && <p className="mensaje-error">{errores.fecha_nacimiento}</p>}
           </div>
           {/* ... resto de campos: nacionalidad, pueblo originario, telefono, prevision, antecedentes */}

           <div className="flex gap-4 mt-6">
             <button onClick={handleSubmit} className="boton boton-primario" style={{ flex: 1 }}><Save size={18}/> Registrar Madre</button>
             <button onClick={onCancelar} className="boton boton-gris" style={{ flex: 1 }}><X size={18}/> Cancelar</button>
           </div>
        </div>
    );
};

// Ejemplo FormularioParto
const FormularioPartoComponent = ({ madre, diagnosticos, onGuardar, onCancelar }) => {
     const [datos, setDatos] = useState({ /* estado inicial para campos de parto y RN */
        tipo: 'Eutócico', fecha: new Date().toISOString().split('T')[0], hora: new Date().toTimeString().slice(0, 5),
        rutProvisorio: `PROV-${Date.now()}`, sexoRN: 'Masculino', estadoAlNacer: 'Vivo',
        pesoRN: '', tallaRN: '', apgar1: '', apgar5: '', corticoides: 'no',
        profilaxisVitaminaK: true, profilaxisOftalmica: true, diagnosticosCIE10: [], observaciones: ''
    });
     const [errores, setErrores] = useState({});

     const validarFormulario = () => { /* ... lógica de validación para parto y RN ... */ return true; };
     const handleSubmit = (e) => { e.preventDefault(); if (validarFormulario()) onGuardar(datos); };
     const toggleDiagnostico = (codigo) => { /* ... */ };


    return (
        <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 className="texto-2xl font-bold mb-4">Registro de Parto</h2>
           <div className="mb-6 p-4 bg-blue-100 rounded-lg"> {/* Fondo azul claro */}
             <p className="font-semibold">Madre: {madre?.nombre_encrypted || 'N/A'}</p>
             <p className="texto-sm text-gray-600">RUT: {madre?.rut_encrypted || 'N/A'}</p>
           </div>
           {/* Inputs para Parto (tipo, fecha, hora, corticoides) */}
           {/* Inputs para RecienNacido (peso, talla, apgar, sexo, etc.) */}
           {/* Selección de Diagnósticos */}
            <div className="grupo-input">
              <label className="etiqueta">Peso RN (gramos) *</label>
              <input type="number" className={`input ${errores.pesoRN ? 'input-error' : ''}`} value={datos.pesoRN} onChange={e => setDatos({...datos, pesoRN: e.target.value})} />
              {/* ... más inputs ... */}
            </div>

           <div className="flex gap-4 mt-6">
             <button onClick={handleSubmit} className="boton boton-secundario" style={{ flex: 1 }}><Baby size={18}/> Registrar Parto</button>
             <button onClick={onCancelar} className="boton boton-gris" style={{ flex: 1 }}><X size={18}/> Cancelar</button>
           </div>
        </div>
    );
};


export default App;