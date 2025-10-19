import React, { useState, useEffect } from 'react';
import { FileText, User, Baby, Printer, LogOut, AlertCircle, CheckCircle, Home, Search, Eye, PlusCircle, Shield, BarChart3, Users, Edit3, Clock, Activity, Stethoscope } from 'lucide-react';
import { generarBrazaletePDF } from './utilidades/generarPDF';
import { validarRUT } from './servicios/validaciones';
import { datosMock } from './mocks/datos';
import { registrarEventoAuditoria } from './servicios/api';
import TablaAuditoria from './componentes/TablaAuditoria';
import ReporteREM from './componentes/ReporteREM';
import NotasEnfermera from './componentes/NotasEnfermera';
import EditarMadre from './componentes/EditarMadre';
import GestionUsuarios from './componentes/GestionUsuarios';
import AnexarCorreccion from './componentes/AnexarCorreccion';
import Partograma from './componentes/Partograma';
import EpicrisisMedica from './componentes/EpicrisisMedica';
import { PERMISOS, ROLES, MENSAJES, TIMEOUT_SESION, VENTANA_EDICION_PARTO, ACCIONES_AUDITORIA, TURNOS } from './utilidades/constantes';

const App = () => {
  // Estados globales
  const [usuario, setUsuario] = useState(null);
  const [pantallaActual, setPantallaActual] = useState('login');
  const [madres, setMadres] = useState(datosMock.madres);
  const [partos, setPartos] = useState(datosMock.partos);
  const [partogramas, setPartogramas] = useState([]);
  const [epicrisis, setEpicrisis] = useState([]);
  const [madreSeleccionada, setMadreSeleccionada] = useState(null);
  const [partoSeleccionado, setPartoSeleccionado] = useState(null);
  const [ultimaSesion, setUltimaSesion] = useState(Date.now());
  const [alerta, setAlerta] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [notasEnfermera, setNotasEnfermera] = useState([]);
  const [vistaPreviaMadre, setVistaPreviaMadre] = useState(null);
  const [usuariosSistema, setUsuariosSistema] = useState([]);
  const [correcciones, setCorrecciones] = useState([]);

  // Función para verificar permisos
  const tienePermiso = (permiso) => {
    if (!usuario) return false;
    return PERMISOS[usuario.rol]?.[permiso] || false;
  };

  // Verificar si un parto puede ser editado (ventana de 2 horas para matrona)
  const puedeEditarParto = (parto) => {
    if (!usuario) return false;
    
    // Médicos usan anexarCorreccion, no edición directa
    if (usuario.rol === ROLES.MEDICO) return false;
    
    // Matronas solo pueden editar dentro de 2 horas
    if (usuario.rol === ROLES.MATRONA) {
      const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
      const dentroDeVentana = tiempoTranscurrido <= VENTANA_EDICION_PARTO;
      const esDelMismoUsuario = parto.registradoPor === usuario.nombre;
      return dentroDeVentana && esDelMismoUsuario && tienePermiso('editarRegistroParto');
    }
    
    return false;
  };

  // Verificar si el paciente pertenece al turno del usuario
  const perteneceATurno = (paciente) => {
    if (!usuario || !tienePermiso('accesoPorTurno')) return true; // Sin restricción de turno
    
    // Si el usuario tiene turno asignado, verificar
    if (usuario.turno && paciente.turno) {
      return usuario.turno === paciente.turno;
    }
    
    return true; // Por defecto permitir si no hay turno definido
  };

  // Control de timeout de sesión
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (usuario && Date.now() - ultimaSesion > TIMEOUT_SESION) {
        mostrarAlerta(MENSAJES.error.sesionExpirada, "error");
        cerrarSesion();
      }
    }, 60000);
    return () => clearInterval(intervalo);
  }, [usuario, ultimaSesion]);

  // Actualizar actividad del usuario
  const actualizarActividad = () => {
    setUltimaSesion(Date.now());
  };

  // Funciones auxiliares
  const mostrarAlerta = (mensaje, tipo = 'info') => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  const iniciarSesion = (rol, nombreUsuario, turno = null) => {
    setUsuario({ rol, nombre: nombreUsuario, turno });
    setPantallaActual('dashboard');
    actualizarActividad();
    mostrarAlerta(`Bienvenido/a ${nombreUsuario}`, 'success');
    
    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.LOGIN,
      detalle: `Inicio de sesión: ${nombreUsuario} (${rol})`,
      usuario: nombreUsuario
    });
  };

  const cerrarSesion = () => {
    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.LOGOUT,
      detalle: `Cierre de sesión: ${usuario?.nombre}`,
      usuario: usuario?.nombre || 'desconocido'
    });
    
    setUsuario(null);
    setPantallaActual('login');
    setMadreSeleccionada(null);
    mostrarAlerta(MENSAJES.exito.sesionCerrada, 'info');
  };

  const agregarMadre = (datos) => {
    // Verificar permiso
    if (!tienePermiso('crearPaciente')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.INTENTO_ACCESO_DENEGADO,
        detalle: `Intento de crear paciente sin permiso por ${usuario?.nombre}`,
        usuario: usuario?.nombre || 'desconocido'
      });
      return;
    }

    if (!validarRUT(datos.rut)) {
      mostrarAlerta(MENSAJES.error.rutInvalido, 'error');
      return;
    }
    
    const rutExiste = madres.some(m => m.rut === datos.rut);
    if (rutExiste) {
      mostrarAlerta('Ya existe una madre registrada con este RUT', 'error');
      return;
    }
    
    const nuevaMadre = {
      id: madres.length + 1,
      ...datos,
      fechaIngreso: new Date().toISOString(),
      registradoPor: usuario.nombre,
      turno: usuario.turno || null // Asignar turno del usuario
    };

    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.CREAR_PACIENTE,
      detalle: `Admisión de madre: ${datos.rut} (${datos.nombre}) por usuario ${usuario?.nombre || 'desconocido'}`,
      usuario: usuario?.nombre || 'desconocido',
    });
    
    setMadres([...madres, nuevaMadre]);
    mostrarAlerta(MENSAJES.exito.madreRegistrada, 'success');
    setPantallaActual('dashboard');
  };

  const registrarParto = (datos) => {
    // Verificar permiso
    if (!tienePermiso('crearRegistroParto')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }

    if (!datos.pesoRN || !datos.tallaRN || !datos.apgar1 || !datos.apgar5) {
      mostrarAlerta(MENSAJES.error.camposObligatorios, 'error');
      return;
    }

    const nuevoParto = {
      id: partos.length + 1,
      madreId: madreSeleccionada.id,
      rnId: `RN-${Date.now()}-${madreSeleccionada.id}`,
      rutRN: 'Pendiente Registro Civil',
      ...datos,
      fechaRegistro: new Date().toISOString(),
      fechaIngreso: datos.fecha,
      registradoPor: usuario.nombre,
      turno: usuario.turno || null
    };

    const madre = madres.find(m => m.id === madreSeleccionada.id);

    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.CREAR_PARTO,
      detalle: `✅ REGISTRO DE PARTO: RN ${nuevoParto.rnId} - Madre: ${madre?.nombre} (${madre?.rut}) | Tipo: ${datos.tipo} | Peso: ${datos.pesoRN}g | Talla: ${datos.tallaRN}cm | APGAR: ${datos.apgar1}/${datos.apgar5} | Corticoides: ${datos.corticoides} | Registrado por: ${usuario?.nombre}`,
      usuario: usuario?.nombre || 'desconocido',
    });
    
    setPartos([...partos, nuevoParto]);
    mostrarAlerta(MENSAJES.exito.partoRegistrado, 'success');
    setPantallaActual('dashboard');
    setMadreSeleccionada(null);
  };

  const guardarPartograma = (datosPartograma) => {
    if (!tienePermiso('crearPartograma')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }

    const nuevoPartograma = {
      ...datosPartograma,
      id: partogramas.length + 1,
      usuario: usuario.nombre,
      turno: usuario.turno
    };

    setPartogramas([...partogramas, nuevoPartograma]);

    const madre = madres.find(m => m.id === datosPartograma.madreId);
    
    registrarEventoAuditoria({
      accion: 'CREAR_PARTOGRAMA',
      detalle: `📊 PARTOGRAMA CREADO: Madre: ${madre?.nombre} (${madre?.rut}) | ${datosPartograma.registros.length} registros | Última dilatación: ${datosPartograma.registros[datosPartograma.registros.length - 1]?.dilatacion}cm | Por: ${usuario.nombre}`,
      usuario: usuario.nombre
    });

    mostrarAlerta('Partograma guardado exitosamente', 'success');
    setPantallaActual('dashboard');
    setMadreSeleccionada(null);
  };

  const guardarEpicrisis = (datosEpicrisis) => {
    if (!tienePermiso('crearEpicrisis')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }

    const nuevaEpicrisis = {
      ...datosEpicrisis,
      id: epicrisis.length + 1,
      medico: usuario.nombre
    };

    setEpicrisis([...epicrisis, nuevaEpicrisis]);

    const madre = madres.find(m => m.id === datosEpicrisis.madreId);
    
    registrarEventoAuditoria({
      accion: 'CREAR_EPICRISIS',
      detalle: `🏥 EPICRISIS CREADA: Madre: ${madre?.nombre} (${madre?.rut}) | Diagnóstico: ${datosEpicrisis.epicrisis.diagnosticoEgreso.substring(0, 100)}... | Condición: ${datosEpicrisis.epicrisis.condicionEgreso} | ${datosEpicrisis.indicaciones.length} indicaciones médicas | Por: ${usuario.nombre}`,
      usuario: usuario.nombre
    });

    mostrarAlerta('Epicrisis e indicaciones guardadas exitosamente', 'success');
    setPantallaActual('dashboard');
    setPartoSeleccionado(null);
  };

  const anexarCorreccionParto = (datosCorreccion) => {
    if (!tienePermiso('anexarCorreccion')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }

    const nuevaCorreccion = {
      id: correcciones.length + 1,
      ...datosCorreccion,
      usuarioCorreccion: usuario.nombre,
      rolUsuario: usuario.rol,
      fechaCorreccion: new Date().toISOString()
    };

    setCorrecciones([...correcciones, nuevaCorreccion]);

    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.ANEXAR_CORRECCION,
      detalle: `Corrección anexada al parto ${datosCorreccion.partoId}: ${datosCorreccion.campo} por ${usuario.nombre}. Justificación: ${datosCorreccion.justificacion}`,
      usuario: usuario.nombre
    });

    mostrarAlerta(MENSAJES.exito.correccionAnexada, 'success');
    setPantallaActual('dashboard');
    setPartoSeleccionado(null);
  };

  const mostrarVistaPreviaPDF = (parto) => {
    // Verificar permiso
    if (!tienePermiso('generarBrazalete')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }
    const madre = madres.find(m => m.id === parto.madreId);
    setVistaPrevia({ parto, madre });
  };

  const imprimirBrazalete = (parto, madre) => {
    // Verificar permiso
    if (!tienePermiso('generarBrazalete')) {
      mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
      return;
    }
    generarBrazaletePDF(parto, madre);
    setVistaPrevia(null);
    mostrarAlerta('Brazalete generado correctamente', 'success');
  };

  const guardarUsuario = (datosUsuario) => {
    const usuarioExiste = usuariosSistema.find(u => u.id === datosUsuario.id);
    
    if (usuarioExiste) {
      setUsuariosSistema(usuariosSistema.map(u => 
        u.id === datosUsuario.id ? datosUsuario : u
      ));
      mostrarAlerta('Usuario actualizado correctamente', 'success');
      
      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.MODIFICAR_USUARIO,
        detalle: `Usuario modificado: ${datosUsuario.username} por ${usuario.nombre}`,
        usuario: usuario.nombre
      });
    } else {
      setUsuariosSistema([...usuariosSistema, datosUsuario]);
      mostrarAlerta('Usuario creado correctamente', 'success');
      
      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.CREAR_USUARIO,
        detalle: `Usuario creado: ${datosUsuario.username} (${datosUsuario.rol}) por ${usuario.nombre}`,
        usuario: usuario.nombre
      });
    }
  };

  const desactivarUsuario = (usuarioId) => {
    setUsuariosSistema(usuariosSistema.map(u =>
      u.id === usuarioId ? { ...u, activo: false } : u
    ));
    
    const usuarioDesactivado = usuariosSistema.find(u => u.id === usuarioId);
    mostrarAlerta(`Usuario ${usuarioDesactivado?.nombre} desactivado`, 'success');
    
    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.DESACTIVAR_USUARIO,
      detalle: `Usuario desactivado: ${usuarioDesactivado?.username} por ${usuario.nombre}`,
      usuario: usuario.nombre
    });
  };

  // Calcular días de hospitalización
  const calcularDiasHospitalizacion = (fechaIngreso) => {
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  // Filtrar datos según permisos y turno
  const madresFiltradas = madres.filter(madre => {
    // Filtro de búsqueda
    if (busqueda && !madre.rut.toLowerCase().includes(busqueda.toLowerCase()) &&
        !madre.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    
    // Filtro por turno
    if (!perteneceATurno(madre)) {
      return false;
    }
    
    return true;
  });

  const partosFiltrados = partos.filter(parto => {
    if (!busqueda) {
      // Solo filtro de turno
      const madre = madres.find(m => m.id === parto.madreId);
      return perteneceATurno(madre);
    }
    
    const madre = madres.find(m => m.id === parto.madreId);
    const coincideBusqueda = madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
           madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           parto.rnId.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideBusqueda && perteneceATurno(madre);
  });

  // ============== COMPONENTES ==============

  // Alerta flotante
  const AlertaFlotante = ({ mensaje, tipo }) => {
    const iconos = {
      success: <CheckCircle size={20} />,
      error: <AlertCircle size={20} />,
      info: <AlertCircle size={20} />,
      advertencia: <AlertCircle size={20} />
    };

    const estilos = {
      success: 'alerta-exito',
      error: 'alerta-error',
      info: 'alerta-info',
      advertencia: 'alerta-advertencia'
    };

    return (
      <div className={`alerta ${estilos[tipo]} animacion-entrada`} style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {iconos[tipo]}
        <span>{mensaje}</span>
      </div>
    );
  };

  // Vista previa del brazalete
  const VistaPreviaBrazalete = () => {
    if (!vistaPrevia) return null;

    const { parto, madre } = vistaPrevia;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div className="tarjeta" style={{ 
          maxWidth: '600px', 
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <h2 className="texto-2xl font-bold mb-4">Vista Previa del Brazalete</h2>
          
          <div style={{ 
            border: '2px solid #2563eb', 
            padding: '1.5rem', 
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 className="font-bold texto-xl" style={{ color: '#2563eb' }}>
                HOSPITAL CLÍNICO HERMINDA MARTÍN
              </h3>
              <p className="texto-sm">Brazalete de Identificación</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 className="font-semibold mb-2">RECIÉN NACIDO</h4>
              <p><strong>ID:</strong> {parto.rnId}</p>
              <p><strong>Fecha:</strong> {new Date(parto.fecha).toLocaleDateString('es-CL')}</p>
              <p><strong>Hora:</strong> {parto.hora}</p>
              <p><strong>Peso:</strong> {parto.pesoRN}g</p>
              <p><strong>Talla:</strong> {parto.tallaRN}cm</p>
              <p><strong>APGAR:</strong> {parto.apgar1}/{parto.apgar5}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">MADRE</h4>
              <p><strong>Nombre:</strong> {madre.nombre}</p>
              <p><strong>RUT:</strong> {madre.rut}</p>
              <p><strong>Dirección:</strong> {madre.direccion}</p>
              <p><strong>Teléfono:</strong> {madre.telefono}</p>
              <p><strong>Previsión:</strong> {madre.prevision}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => imprimirBrazalete(parto, madre)}
              className="boton boton-primario"
              style={{ flex: 1 }}
            >
              <Printer size={20} />
              Imprimir Brazalete
            </button>
            <button
              onClick={() => setVistaPrevia(null)}
              className="boton boton-gris"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Vista previa de información de la madre (solo datos demográficos para administrativos)
  const VistaPreviaMadre = () => {
    if (!vistaPreviaMadre) return null;

    const mostrarDatosClinicos = tienePermiso('verDatosClinicos');

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div className="tarjeta" style={{ 
          maxWidth: '600px', 
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <h2 className="texto-2xl font-bold mb-4">Información del Paciente</h2>
          
          <div style={{ 
            border: '2px solid #2563eb', 
            padding: '1.5rem', 
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>DATOS DEMOGRÁFICOS</h4>
              <p className="mb-2"><strong>Nombre:</strong> {vistaPreviaMadre.nombre}</p>
              <p className="mb-2"><strong>RUT:</strong> {vistaPreviaMadre.rut}</p>
              <p className="mb-2"><strong>Edad:</strong> {vistaPreviaMadre.edad} años</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>CONTACTO</h4>
              <p className="mb-2"><strong>Dirección:</strong> {vistaPreviaMadre.direccion}</p>
              <p className="mb-2"><strong>Teléfono:</strong> {vistaPreviaMadre.telefono}</p>
              <p className="mb-2"><strong>Previsión:</strong> {vistaPreviaMadre.prevision}</p>
            </div>

            {mostrarDatosClinicos && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>ANTECEDENTES CLÍNICOS</h4>
                <p className="mb-2">{vistaPreviaMadre.antecedentes || 'Sin antecedentes registrados'}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>REGISTRO</h4>
              <p className="mb-2"><strong>Fecha de Ingreso:</strong> {new Date(vistaPreviaMadre.fechaIngreso).toLocaleDateString('es-CL')}</p>
              <p className="mb-2"><strong>Registrado por:</strong> {vistaPreviaMadre.registradoPor}</p>
            </div>
          </div>

          {!mostrarDatosClinicos && (
            <div className="mt-4 p-3" style={{ backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
              <p className="texto-sm" style={{ color: '#92400e' }}>
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Su rol solo permite ver datos demográficos según Ley 20.584
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setVistaPreviaMadre(null)}
              className="boton boton-primario"
              style={{ flex: 1 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de Login
  const PantallaLogin = () => {
    const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '', turno: TURNOS.DIURNO });

    const handleLogin = (e, rol) => {
      e.preventDefault();
      if (!credenciales.usuario) {
        mostrarAlerta('Ingrese su nombre de usuario', 'error');
        return;
      }
      
      // Roles que requieren selección de turno
      const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];
      const turnoAsignado = rolesConTurno.includes(rol) ? credenciales.turno : null;
      
      iniciarSesion(rol, credenciales.usuario, turnoAsignado);
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div className="tarjeta" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="texto-centro mb-6">
            <div style={{
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Baby size={40} />
            </div>
            <h1 className="texto-3xl font-bold mb-4">SIGN - Sistema de Partos</h1>
            <p className="texto-gris">Hospital Clínico Herminda Martín</p>
            <p className="texto-sm texto-gris">Chillán, Chile</p>
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Nombre de Usuario</label>
            <input
              type="text"
              className="input"
              placeholder="Ingrese su nombre"
              value={credenciales.usuario}
              onChange={(e) => setCredenciales({ ...credenciales, usuario: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Contraseña (Simulada)</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={credenciales.contrasena}
              onChange={(e) => setCredenciales({ ...credenciales, contrasena: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Turno (Enfermera/Matrona)</label>
            <select
              className="select"
              value={credenciales.turno}
              onChange={(e) => setCredenciales({ ...credenciales, turno: e.target.value })}
            >
              <option value={TURNOS.DIURNO}>Diurno (08:00 - 20:00)</option>
              <option value={TURNOS.NOCTURNO}>Nocturno (20:00 - 08:00)</option>
              <option value={TURNOS.VESPERTINO}>Vespertino (14:00 - 22:00)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={(e) => handleLogin(e, ROLES.ADMINISTRATIVO)}
              className="boton boton-primario boton-completo"
            >
              <User size={20} />
              Acceder como Administrativo
            </button>
            <button
              onClick={(e) => handleLogin(e, ROLES.MATRONA)}
              className="boton boton-secundario boton-completo"
            >
              <FileText size={20} />
              Acceder como Matrona
            </button>
            <button
              onClick={(e) => handleLogin(e, ROLES.MEDICO)}
              className="boton boton-completo"
              style={{ backgroundColor: '#7c3aed', color: 'white' }}
            >
              <FileText size={20} />
              Acceder como Médico
            </button>
            <button
              onClick={(e) => handleLogin(e, ROLES.ENFERMERA)}
              className="boton boton-completo"
              style={{ backgroundColor: '#00bddfff', color: 'white' }}
            >
              <User size={20} />
              Acceder como Enfermera
            </button>
            <button
              onClick={(e) => handleLogin(e, ROLES.ADMIN_SISTEMA)}
              className="boton boton-completo"
              style={{ backgroundColor: '#5d00ffff', color: 'white' }}
            >
              <Shield size={20} />
              Acceder como Admin Sistema
            </button>
          </div>
          
          <p className="texto-xs texto-gris texto-centro mt-4">
            Demo v1.0 - Sistema RBAC según Ley 20.584
          </p>
        </div>
      </div>
    );
  };

  // Dashboard principal
  const Dashboard = () => {
    const partosHoy = partosFiltrados.filter(p => {
      const hoy = new Date().toISOString().split('T')[0];
      return p.fecha === hoy;
    });
    const partosRecientes = partosFiltrados.slice(-10).reverse();
    
    return (
      <div className="animacion-entrada">
        {/* Indicador de turno para roles con restricción */}
        {tienePermiso('accesoPorTurno') && usuario.turno && (
          <div className="tarjeta mb-6" style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #2563eb' }}>
            <div className="flex items-center gap-3">
              <Clock size={24} style={{ color: '#2563eb' }} />
              <div>
                <p className="font-semibold" style={{ color: '#1e40af' }}>
                  Turno Activo: {usuario.turno.charAt(0).toUpperCase() + usuario.turno.slice(1)}
                </p>
                <p className="texto-sm" style={{ color: '#1e40af' }}>
                  Solo visualiza pacientes asignados a su turno según Ley 20.584
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="tarjeta mb-6">
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Buscar por RUT de madre, nombre o ID del RN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Tarjetas de estadísticas - Solo si tiene permiso */}
        {tienePermiso('verEstadisticas') && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="tarjeta tarjeta-hover">
              <div className="flex justify-between items-center">
                <div>
                  <p className="texto-sm texto-gris">Madres Registradas</p>
                  <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>{madresFiltradas.length}</p>
                  {tienePermiso('accesoPorTurno') && (
                    <p className="texto-xs texto-gris">En mi turno</p>
                  )}
                </div>
                <User size={48} color="#2563eb" />
              </div>
            </div>
            
            <div className="tarjeta tarjeta-hover">
              <div className="flex justify-between items-center">
                <div>
                  <p className="texto-sm texto-gris">Partos Totales</p>
                  <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>{partosFiltrados.length}</p>
                  {tienePermiso('accesoPorTurno') && (
                    <p className="texto-xs texto-gris">En mi turno</p>
                  )}
                </div>
                <Baby size={48} color="#10b981" />
              </div>
            </div>
            
            <div className="tarjeta tarjeta-hover">
              <div className="flex justify-between items-center">
                <div>
                  <p className="texto-sm texto-gris">Partos Hoy</p>
                  <p className="texto-3xl font-bold" style={{ color: '#8b5cf6' }}>{partosHoy.length}</p>
                </div>
                <FileText size={48} color="#8b5cf6" />
              </div>
            </div>
          </div>
        )}

        {/* Tabla de RN hospitalizados - Solo si tiene permiso de ver partos */}
        {tienePermiso('verDatosClinicos') && (
          <div className="tarjeta">
            <h2 className="texto-2xl font-bold mb-4">Recién Nacidos Hospitalizados</h2>
            {partosRecientes.length === 0 ? (
              <p className="texto-centro texto-gris py-6">No hay partos registrados en su turno</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID Recién Nacido</th>
                      <th>Madre</th>
                      <th>RUT Madre</th>
                      <th>Fecha Ingreso</th>
                      <th>Días</th>
                      <th>Tipo</th>
                      <th>Peso</th>
                      <th>APGAR</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partosRecientes.map(parto => {
                      const madre = madres.find(m => m.id === parto.madreId);
                      const diasHospitalizacion = calcularDiasHospitalizacion(parto.fechaIngreso);
                      const esAlerta = diasHospitalizacion > 7;
                      const puedeEditar = puedeEditarParto(parto);
                      const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
                      const horasTranscurridas = Math.floor(tiempoTranscurrido / (1000 * 60 * 60));
                      
                      return (
                        <tr 
                          key={parto.id}
                          style={{ 
                            backgroundColor: esAlerta ? '#fee2e2' : 'transparent'
                          }}
                        >
                          <td className="font-semibold">
                            {parto.rnId}
                            {usuario.rol === ROLES.MATRONA && parto.registradoPor === usuario.nombre && (
                              <div className="texto-xs texto-gris mt-1">
                                {puedeEditar ? (
                                  <span style={{ color: '#10b981' }}>✓ Editable ({2 - horasTranscurridas}h restantes)</span>
                                ) : (
                                  <span style={{ color: '#ef4444' }}>🔒 Registro cerrado</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>{madre?.nombre || 'N/A'}</td>
                          <td>{madre?.rut || 'N/A'}</td>
                          <td>{new Date(parto.fechaIngreso).toLocaleDateString('es-CL')}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              backgroundColor: esAlerta ? '#dc2626' : '#10b981',
                              color: 'white'
                            }}>
                              {diasHospitalizacion} días
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              backgroundColor: parto.tipo === 'Cesárea' ? '#fef3c7' : '#d1fae5',
                              color: parto.tipo === 'Cesárea' ? '#92400e' : '#065f46'
                            }}>
                              {parto.tipo}
                            </span>
                          </td>
                          <td>{parto.pesoRN}g</td>
                          <td>{parto.apgar1}/{parto.apgar5}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {tienePermiso('generarBrazalete') && (
                                <>
                                  <button
                                    onClick={() => mostrarVistaPreviaPDF(parto)}
                                    className="boton"
                                    style={{
                                      padding: '0.5rem',
                                      backgroundColor: '#3b82f6',
                                      color: 'white'
                                    }}
                                    title="Vista previa del brazalete"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const madreInfo = madres.find(m => m.id === parto.madreId);
                                      imprimirBrazalete(parto, madreInfo);
                                    }}
                                    className="boton"
                                    style={{
                                      padding: '0.5rem',
                                      backgroundColor: '#10b981',
                                      color: 'white'
                                    }}
                                    title="Imprimir brazalete"
                                  >
                                    <Printer size={18} />
                                  </button>
                                </>
                              )}
                              
                              {tienePermiso('anexarCorreccion') && (
                                <button
                                  onClick={() => {
                                    setPartoSeleccionado(parto);
                                    setPantallaActual('anexar-correccion');
                                  }}
                                  className="boton"
                                  style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#f59e0b',
                                    color: 'white'
                                  }}
                                  title="Anexar corrección (no sobrescribe)"
                                >
                                  <Edit3 size={18} />
                                </button>
                              )}
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

        {/* Vista solo para administrativos - Lista de madres (solo datos demográficos) */}
        {tienePermiso('verDatosDemograficos') && !tienePermiso('verDatosClinicos') && (
          <div className="tarjeta">
            <div className="flex justify-between items-center mb-4">
              <h2 className="texto-2xl font-bold">Listado de Madres (Datos Demográficos)</h2>
              <div className="p-2" style={{ backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <p className="texto-xs" style={{ color: '#92400e' }}>
                  <Shield size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Sin acceso a datos clínicos (Ley 20.584)
                </p>
              </div>
            </div>
            {madresFiltradas.length === 0 ? (
              <p className="texto-centro texto-gris py-6">No hay madres registradas</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>RUT</th>
                      <th>Nombre</th>
                      <th>Edad</th>
                      <th>Teléfono</th>
                      <th>Previsión</th>
                      <th>Fecha Ingreso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {madresFiltradas.map(madre => (
                      <tr key={madre.id}>
                        <td className="font-semibold">{madre.rut}</td>
                        <td>{madre.nombre}</td>
                        <td>{madre.edad} años</td>
                        <td>{madre.telefono}</td>
                        <td>{madre.prevision}</td>
                        <td>{new Date(madre.fechaIngreso).toLocaleDateString('es-CL')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setVistaPreviaMadre(madre)}
                              className="boton"
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#6366f1',
                                color: 'white'
                              }}
                              title="Ver información demográfica"
                            >
                              <Eye size={18} />
                            </button>
                            {tienePermiso('editarDatosDemograficos') && (
                              <button
                                onClick={() => {
                                  setMadreSeleccionada(madre);
                                  setPantallaActual('editar-madre');
                                }}
                                className="boton"
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#f59e0b',
                                  color: 'white'
                                }}
                                title="Editar datos demográficos"
                              >
                                <User size={18} />
                              </button>
                            )}
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

        {/* Lista de madres sin parto registrado - Solo para matrona */}
        {tienePermiso('crearRegistroParto') && (
          <div className="tarjeta mt-6">
            <h3 className="texto-xl font-bold mb-4">Madres sin Parto Registrado (Mi Turno)</h3>
            {madresFiltradas.filter(madre => !partos.some(p => p.madreId === madre.id)).length === 0 ? (
              <p className="texto-centro texto-gris py-4">Todas las madres de su turno tienen partos registrados</p>
            ) : (
              <div className="grid gap-3">
                {madresFiltradas.filter(madre => !partos.some(p => p.madreId === madre.id)).map(madre => (
                  <div key={madre.id} className="flex justify-between items-center p-4" style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}>
                    <div>
                      <p className="font-semibold">{madre.nombre}</p>
                      <p className="texto-sm texto-gris">RUT: {madre.rut} - Edad: {madre.edad} años</p>
                    </div>
                    <button
                      onClick={() => {
                        setMadreSeleccionada(madre);
                        setPantallaActual('registrar-parto');
                      }}
                      className="boton boton-secundario"
                    >
                      Registrar Parto
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Formulario de admisión de madre
  const FormularioAdmision = () => {
    const [datos, setDatos] = useState({
      rut: '',
      nombre: '',
      edad: '',
      direccion: '',
      telefono: '',
      prevision: '',
      antecedentes: ''
    });
    const [errores, setErrores] = useState({});

    const validarFormulario = () => {
      const nuevosErrores = {};
      
      if (!datos.rut) nuevosErrores.rut = 'El RUT es obligatorio';
      else if (!validarRUT(datos.rut)) nuevosErrores.rut = 'RUT inválido';
      
      if (!datos.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
      if (!datos.edad) nuevosErrores.edad = 'La edad es obligatoria';
      else if (datos.edad < 15 || datos.edad > 60) {
        nuevosErrores.edad = 'La edad debe estar entre 15 y 60 años';
      }
      
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validarFormulario()) {
        agregarMadre(datos);
      }
    };

    return (
      <div className="tarjeta animacion-entrada" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 className="texto-2xl font-bold mb-6">Admisión de Madre</h2>
        
        <div className="grupo-input">
          <label className="etiqueta">RUT *</label>
          <input
            type="text"
            className={`input ${errores.rut ? 'input-error' : ''}`}
            placeholder="12.345.678-9"
            value={datos.rut}
            onChange={(e) => setDatos({ ...datos, rut: e.target.value })}
          />
          {errores.rut && <p className="mensaje-error">{errores.rut}</p>}
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Nombre Completo *</label>
          <input
            type="text"
            className={`input ${errores.nombre ? 'input-error' : ''}`}
            placeholder="Nombre completo de la paciente"
            value={datos.nombre}
            onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
          />
          {errores.nombre && <p className="mensaje-error">{errores.nombre}</p>}
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Dirección</label>
          <input
            type="text"
            className="input"
            placeholder="Dirección de residencia"
            value={datos.direccion}
            onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
          />
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Edad *</label>
          <input
            type="number"
            className={`input ${errores.edad ? 'input-error' : ''}`}
            placeholder="Edad en años"
            value={datos.edad}
            onChange={(e) => setDatos({ ...datos, edad: e.target.value })}
            min="15"
            max="60"
          />
          {errores.edad && <p className="mensaje-error">{errores.edad}</p>}
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Teléfono de Contacto</label>
          <input 
            type="tel"
            className="input"
            placeholder="Número de teléfono"
            value={datos.telefono}
            onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
          />
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Previsión de Salud</label>
          <input
            type="text"
            className="input"
            placeholder="Ej: FONASA, ISAPRE, etc."
            value={datos.prevision}
            onChange={(e) => setDatos({ ...datos, prevision: e.target.value })}
          />
        </div>
        
        {tienePermiso('verDatosClinicos') && (
          <div className="grupo-input">
            <label className="etiqueta">Antecedentes Médicos</label>
            <textarea
              className="textarea"
              rows="4"
              placeholder="Ingrese antecedentes médicos relevantes"
              value={datos.antecedentes}
              onChange={(e) => setDatos({ ...datos, antecedentes: e.target.value })}
            />
          </div>
        )}
        
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="boton boton-primario" style={{ flex: 1 }}>
            Registrar Madre
          </button>
          <button
            onClick={() => setPantallaActual('dashboard')}
            className="boton boton-gris"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  // Formulario de registro de parto
  const FormularioParto = () => {
    const [datos, setDatos] = useState({
      tipo: 'Vaginal',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      pesoRN: '',
      tallaRN: '',
      apgar1: '',
      apgar5: '',
      corticoides: 'no',
      observaciones: ''
    });
    const [errores, setErrores] = useState({});

    const validarFormulario = () => {
      const nuevosErrores = {};
      
      if (!datos.pesoRN) nuevosErrores.pesoRN = 'El peso es obligatorio';
      else if (datos.pesoRN < 500 || datos.pesoRN > 6000) {
        nuevosErrores.pesoRN = 'Peso fuera del rango válido (500-6000g)';
      }
      
      if (!datos.tallaRN) nuevosErrores.tallaRN = 'La talla es obligatoria';
      else if (datos.tallaRN < 30 || datos.tallaRN > 70) {
        nuevosErrores.tallaRN = 'Talla fuera del rango válido (30-70cm)';
      }
      
      if (!datos.apgar1) nuevosErrores.apgar1 = 'APGAR 1min es obligatorio';
      if (!datos.apgar5) nuevosErrores.apgar5 = 'APGAR 5min es obligatorio';
      
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validarFormulario()) {
        registrarParto(datos);
      }
    };

    return (
      <div className="tarjeta animacion-entrada" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="texto-2xl font-bold mb-4">Registro de Parto</h2>
        <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <p className="font-semibold">Madre: {madreSeleccionada?.nombre}</p>
          <p className="texto-sm texto-gris">RUT: {madreSeleccionada?.rut}</p>
          <p className="texto-xs" style={{ color: '#2563eb', marginTop: '0.5rem' }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Tendrá 2 horas para editar este registro después de guardarlo
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Tipo de Parto *</label>
            <select
              className="select"
              value={datos.tipo}
              onChange={(e) => setDatos({ ...datos, tipo: e.target.value })}
            >
              <option value="Vaginal">Vaginal</option>
              <option value="Cesárea">Cesárea</option>
              <option value="Fórceps">Fórceps</option>
              <option value="Ventosa">Ventosa</option>
            </select>
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Fecha *</label>
            <input
              type="date"
              className="input"
              value={datos.fecha}
              onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Hora *</label>
            <input
              type="time"
              className="input"
              value={datos.hora}
              onChange={(e) => setDatos({ ...datos, hora: e.target.value })}
            />
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Peso del RN (gramos) *</label>
            <input
              type="number"
              className={`input ${errores.pesoRN ? 'input-error' : ''}`}
              placeholder="3500"
              value={datos.pesoRN}
              onChange={(e) => setDatos({ ...datos, pesoRN: e.target.value })}
              min="500"
              max="6000"
            />
            {errores.pesoRN && <p className="mensaje-error">{errores.pesoRN}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Talla del RN (cm) *</label>
            <input
              type="number"
              className={`input ${errores.tallaRN ? 'input-error' : ''}`}
              placeholder="50"
              value={datos.tallaRN}
              onChange={(e) => setDatos({ ...datos, tallaRN: e.target.value })}
              min="30"
              max="70"
            />
            {errores.tallaRN && <p className="mensaje-error">{errores.tallaRN}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              APGAR 1 min *
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px'
                }}
                title="Puntuación al primer minuto de vida"
              >
                al 1 min
              </span>
            </label>
            <input
              type="number"
              className={`input ${errores.apgar1 ? 'input-error' : ''}`}
              placeholder="9"
              value={datos.apgar1}
              onChange={(e) => setDatos({ ...datos, apgar1: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar1 && <p className="mensaje-error">{errores.apgar1}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              APGAR 5 min *
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px'
                }}
                title="Puntuación a los cinco minutos de vida"
              >
                a los 5 min
              </span>
            </label>
            <input
              type="number"
              className={`input ${errores.apgar5 ? 'input-error' : ''}`}
              placeholder="10"
              value={datos.apgar5}
              onChange={(e) => setDatos({ ...datos, apgar5: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar5 && <p className="mensaje-error">{errores.apgar5}</p>}
          </div>
        </div>

        <div className="grupo-input">
          <label className="etiqueta">¿La madre recibió corticoides durante la gestación? *</label>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="corticoides"
                value="si"
                checked={datos.corticoides === 'si'}
                onChange={(e) => setDatos({ ...datos, corticoides: e.target.value })}
              />
              <span>Sí</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="corticoides"
                value="no"
                checked={datos.corticoides === 'no'}
                onChange={(e) => setDatos({ ...datos, corticoides: e.target.value })}
              />
              <span>No</span>
            </label>
          </div>
        </div>
        
        <div className="grupo-input">
          <label className="etiqueta">Observaciones</label>
          <textarea
            className="textarea"
            rows="3"
            placeholder="Observaciones adicionales del parto"
            value={datos.observaciones}
            onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
          />
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="boton boton-secundario" style={{ flex: 1 }}>
            Guardar y Generar Brazalete
          </button>
          <button
            onClick={() => {
              setPantallaActual('dashboard');
              setMadreSeleccionada(null);
            }}
            className="boton boton-gris"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  // Layout principal
  const Layout = ({ children }) => (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {alerta && <AlertaFlotante mensaje={alerta.mensaje} tipo={alerta.tipo} />}
      {vistaPrevia && <VistaPreviaBrazalete />}
      {vistaPreviaMadre && <VistaPreviaMadre />}
      
      <nav style={{
        backgroundColor: '#2563eb',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="contenedor py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Baby size={36} />
              <div>
                <h1 className="texto-xl font-bold">SIGN - Sistema de Gestión Neonatal</h1>
                <p className="texto-sm" style={{ opacity: 0.9 }}>
                  {usuario?.rol.charAt(0).toUpperCase() + usuario?.rol.slice(1)} - {usuario?.nombre}
                  {usuario?.turno && ` | Turno: ${usuario.turno.charAt(0).toUpperCase() + usuario.turno.slice(1)}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPantallaActual('dashboard')}
                className="boton"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <Home size={20} />
                Inicio
              </button>
              
              {tienePermiso('generarReportes') && (
                <button 
                  onClick={() => {
                    registrarEventoAuditoria({
                      accion: ACCIONES_AUDITORIA.GENERAR_REPORTE,
                      detalle: `📊 GENERACIÓN DE REPORTE REM: Acceso a reporte REM Neonatal por ${usuario.nombre} (${usuario.rol})`,
                      usuario: usuario.nombre
                    });
                    setPantallaActual('reporteREM');
                  }}
                  className='boton'
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <BarChart3 size={18} />
                  Reporte REM
                </button>
              )}
              
              {tienePermiso('crearPaciente') && (
                <button
                  onClick={() => setPantallaActual('admision')}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <PlusCircle size={20} />
                  Nueva Admisión
                </button>
              )}

              {tienePermiso('crearPartograma') && (
                <button
                  onClick={() => {
                    if (madres.length === 0) {
                      mostrarAlerta('No hay madres registradas para crear partograma', 'error');
                      return;
                    }
                    setPantallaActual('seleccionar-madre-partograma');
                  }}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <Activity size={20} />
                  Partograma
                </button>
              )}

              {tienePermiso('crearEpicrisis') && (
                <button
                  onClick={() => {
                    if (partos.length === 0) {
                      mostrarAlerta('No hay partos registrados para crear epicrisis', 'error');
                      return;
                    }
                    setPantallaActual('seleccionar-parto-epicrisis');
                  }}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <Stethoscope size={20} />
                  Epicrisis
                </button>
              )}

              {usuario?.rol === ROLES.ENFERMERA && (
                <button
                  onClick={() => setPantallaActual('notas-enfermera')}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <FileText size={20} />
                  Notas Enfermera
                </button>
              )}

              {tienePermiso('gestionarUsuarios') && (
                <button
                  onClick={() => setPantallaActual('gestion-usuarios')}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <Users size={20} />
                  Gestión Usuarios
                </button>
              )}
              
              <button
                onClick={cerrarSesion}
                className="boton boton-peligro"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="contenedor" style={{ padding: '2rem 1rem' }}>
        {children}
      </div>
      
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        textAlign: 'center',
        padding: '1.5rem',
        marginTop: '3rem'
      }}>
        <p className="texto-sm">SIGN - Sistema Integrado de Gestión Neonatal v1.0</p>
        <p className="texto-sm" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
          Hospital Clínico Herminda Martín - Chillán, Chile
        </p>
        <p className="texto-xs" style={{ opacity: 0.6, marginTop: '0.5rem' }}>
          Sistema RBAC - Cumplimiento Ley 20.584
        </p>
      </footer>
    </div>
  );

  // Renderizado principal
  if (!usuario) {
    return <PantallaLogin />;
  }

  return (
    <Layout>
      {pantallaActual === 'dashboard' && (
        <>
          <Dashboard />
          {tienePermiso('verAuditoria') && (
            <>
              <h2 className="texto-2xl font-bold mt-6 mb-4">Historial de Auditoría del Sistema</h2>
              <div className="tarjeta mb-4" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                <p className="texto-sm" style={{ color: '#92400e' }}>
                  <Shield size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Como Admin del Sistema, NO tiene acceso a datos clínicos de pacientes.
                  Solo puede ver logs técnicos del sistema.
                </p>
              </div>
              <TablaAuditoria />
            </>
          )}
        </>
      )}
      
      {pantallaActual === 'editar-madre' && madreSeleccionada && (
        <EditarMadre
          madre={madreSeleccionada}
          soloDemo={!tienePermiso('editarDatosDemograficos')}
          onGuardar={datosActualizados => {
            if (!tienePermiso('editarDatosDemograficos')) {
              mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
              return;
            }

            const madreAnterior = madres.find(m => m.id === madreSeleccionada.id);
            const cambios = [];
            
            // Detectar cambios
            Object.keys(datosActualizados).forEach(key => {
              if (madreAnterior[key] !== datosActualizados[key]) {
                cambios.push(`${key}: "${madreAnterior[key]}" → "${datosActualizados[key]}"`);
              }
            });
            
            setMadres(madres.map(m =>
              m.id === madreSeleccionada.id ? { ...m, ...datosActualizados } : m
            ));
            
            registrarEventoAuditoria({
              accion: ACCIONES_AUDITORIA.EDITAR_PACIENTE,
              detalle: `✏️ EDICIÓN DE DATOS: Madre ${madreSeleccionada.nombre} (${madreSeleccionada.rut}) | Cambios: ${cambios.join(' | ')} | Por: ${usuario.nombre}`,
              usuario: usuario.nombre
            });
            
            setMadreSeleccionada(null);
            setPantallaActual('dashboard');
            mostrarAlerta(MENSAJES.exito.datosActualizados, 'success');
          }}
          onCancelar={() => {
            setMadreSeleccionada(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'anexar-correccion' && partoSeleccionado && (
        <AnexarCorreccion
          parto={partoSeleccionado}
          madre={madres.find(m => m.id === partoSeleccionado.madreId)}
          onGuardar={anexarCorreccionParto}
          onCancelar={() => {
            setPartoSeleccionado(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'reporteREM' && tienePermiso('generarReportes') && (
        <>
          <div className="tarjeta mb-4" style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
            <p className="font-semibold" style={{ color: '#991b1b' }}>
              ⚠️ Alto Riesgo de Fuga de Datos
            </p>
            <p className="texto-sm mt-1" style={{ color: '#991b1b' }}>
              La generación de reportes consolidados es un privilegio de alto nivel.
              Toda exportación queda registrada en auditoría.
            </p>
          </div>
          <ReporteREM partos={partos} madres={madres} />
        </>
      )}
      
      {pantallaActual === 'admision' && tienePermiso('crearPaciente') && <FormularioAdmision />}
      
      {pantallaActual === 'registrar-parto' && tienePermiso('crearRegistroParto') && <FormularioParto />}
      
      {pantallaActual === 'notas-enfermera' && usuario.rol === ROLES.ENFERMERA && (
        <NotasEnfermera
          notas={notasEnfermera}
          setNotas={setNotasEnfermera}
          usuario={usuario}
        />
      )}

      {pantallaActual === 'gestion-usuarios' && tienePermiso('gestionarUsuarios') && (
        <GestionUsuarios
          usuarios={usuariosSistema}
          onGuardarUsuario={guardarUsuario}
          onDesactivarUsuario={desactivarUsuario}
          mostrarAlerta={mostrarAlerta}
        />
      )}

      {pantallaActual === 'seleccionar-madre-partograma' && tienePermiso('crearPartograma') && (
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Seleccionar Madre para Partograma</h2>
          <p className="texto-gris mb-6">Seleccione la madre para iniciar el registro del partograma</p>
          <div className="grid gap-3">
            {madresFiltradas.map(madre => (
              <div
                key={madre.id}
                className="flex justify-between items-center p-4"
                style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              >
                <div>
                  <p className="font-semibold">{madre.nombre}</p>
                  <p className="texto-sm texto-gris">RUT: {madre.rut} - Edad: {madre.edad} años</p>
                </div>
                <button
                  onClick={() => {
                    setMadreSeleccionada(madre);
                    setPantallaActual('crear-partograma');
                  }}
                  className="boton boton-secundario"
                >
                  <Activity size={18} />
                  Crear Partograma
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPantallaActual('dashboard')}
            className="boton boton-gris mt-4"
          >
            Cancelar
          </button>
        </div>
      )}

      {pantallaActual === 'crear-partograma' && madreSeleccionada && (
        <Partograma
          madre={madreSeleccionada}
          parto={partos.find(p => p.madreId === madreSeleccionada.id)}
          onGuardar={guardarPartograma}
          onCancelar={() => {
            setMadreSeleccionada(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'seleccionar-parto-epicrisis' && tienePermiso('crearEpicrisis') && (
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Seleccionar Parto para Epicrisis</h2>
          <p className="texto-gris mb-6">Seleccione el parto para crear la epicrisis e indicaciones médicas</p>
          <div className="grid gap-3">
            {partosFiltrados.map(parto => {
              const madre = madres.find(m => m.id === parto.madreId);
              return (
                <div
                  key={parto.id}
                  className="flex justify-between items-center p-4"
                  style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                >
                  <div>
                    <p className="font-semibold">RN: {parto.rnId}</p>
                    <p className="texto-sm texto-gris">
                      Madre: {madre?.nombre} ({madre?.rut})
                    </p>
                    <p className="texto-sm texto-gris">
                      Fecha: {new Date(parto.fecha).toLocaleDateString('es-CL')} - {parto.tipo}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPartoSeleccionado(parto);
                      setPantallaActual('crear-epicrisis');
                    }}
                    className="boton boton-secundario"
                  >
                    <Stethoscope size={18} />
                    Crear Epicrisis
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setPantallaActual('dashboard')}
            className="boton boton-gris mt-4"
          >
            Cancelar
          </button>
        </div>
      )}

      {pantallaActual === 'crear-epicrisis' && partoSeleccionado && (
        <EpicrisisMedica
          parto={partoSeleccionado}
          madre={madres.find(m => m.id === partoSeleccionado.madreId)}
          onGuardar={guardarEpicrisis}
          onCancelar={() => {
            setPartoSeleccionado(null);
            setPantallaActual('dashboard');
          }}
        />
      )}
    </Layout>
  );
};

export default App;