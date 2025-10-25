import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  User,
  Baby,
  Printer,
  LogOut,
  AlertCircle,
  CheckCircle,
  Home,
  Search,
  Eye,
  PlusCircle,
  Shield,
  BarChart3,
  Users,
  Edit3,
  Clock,
  Activity,
  Stethoscope,
  List,
  ChevronDown,
  Skull,
} from 'lucide-react';
import { generarBrazaletePDF, generarEpicrisisPDF } from './utilidades/generarPDF';
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
import EditarParto from './componentes/EditarParto';
import VistaCorrecciones from './componentes/VistaCorrecciones';
import VistaPartogramas from './componentes/VistaPartogramas';
import VistaEpicrisis from './componentes/VistaEpicrisis';
import {
  PERMISOS,
  ROLES,
  MENSAJES,
  TIMEOUT_SESION,
  VENTANA_EDICION_PARTO,
  ACCIONES_AUDITORIA,
  TURNOS,
} from './utilidades/constantes';
import RegistroDefuncion from './componentes/RegistroDefuncion';
import VistaDefunciones from './componentes/VistaDefunciones';

const AlertaFlotante = React.memo(({ mensaje, tipo }) => {
  const iconos = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <AlertCircle size={20} />,
    advertencia: <AlertCircle size={20} />,
  };

  const estilos = {
    success: 'alerta-exito',
    error: 'alerta-error',
    info: 'alerta-info',
    advertencia: 'alerta-advertencia',
  };

  return (
    <div
      className={`alerta ${estilos[tipo]} animacion-entrada`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      }}
    >
      {iconos[tipo]}
      <span>{mensaje}</span>
    </div>
  );
});
AlertaFlotante.displayName = 'AlertaFlotante';

const VistaPreviaBrazalete = React.memo(({ vistaPrevia, onImprimir, onCerrar }) => {
  if (!vistaPrevia) return null;

  const { parto, madre } = vistaPrevia;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="tarjeta"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <h2 className="texto-2xl font-bold mb-4">Vista Previa del Brazalete</h2>

        <div
          style={{
            border: '2px solid #2563eb',
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h3 className="font-bold texto-xl" style={{ color: '#2563eb' }}>
              HOSPITAL CLÍNICO HERMINDA MARTÍN
            </h3>
            <p className="texto-sm">Brazalete de Identificación</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-semibold mb-2">RECIÉN NACIDO</h4>
            <p>
              <strong>ID:</strong> {parto.rnId}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(parto.fecha).toLocaleDateString('es-CL')}
            </p>
            <p>
              <strong>Hora:</strong> {parto.hora}
            </p>
            <p>
              <strong>Peso:</strong> {parto.pesoRN}g
            </p>
            <p>
              <strong>Talla:</strong> {parto.tallaRN}cm
            </p>
            <p>
              <strong>APGAR:</strong> {parto.apgar1}/{parto.apgar5}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">MADRE</h4>
            <p>
              <strong>Nombre:</strong> {madre.nombre}
            </p>
            <p>
              <strong>RUT:</strong> {madre.rut}
            </p>
            <p>
              <strong>Dirección:</strong> {madre.direccion}
            </p>
            <p>
              <strong>Teléfono:</strong> {madre.telefono}
            </p>
            <p>
              <strong>Previsión:</strong> {madre.prevision}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onImprimir(parto, madre)}
            className="boton boton-primario"
            style={{ flex: 1 }}
          >
            <Printer size={20} />
            Imprimir Brazalete
          </button>
          <button onClick={onCerrar} className="boton boton-gris" style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
});
VistaPreviaBrazalete.displayName = 'VistaPreviaBrazalete';

const VistaPreviaMadre = React.memo(({ vistaPreviaMadre, mostrarDatosClinicos, onCerrar }) => {
  if (!vistaPreviaMadre) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="tarjeta"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <h2 className="texto-2xl font-bold mb-4">Información del Paciente</h2>

        <div
          style={{
            border: '2px solid #2563eb',
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>
              DATOS DEMOGRÁFICOS
            </h4>
            <p className="mb-2">
              <strong>Nombre:</strong> {vistaPreviaMadre.nombre}
            </p>
            <p className="mb-2">
              <strong>RUT:</strong> {vistaPreviaMadre.rut}
            </p>
            <p className="mb-2">
              <strong>Edad:</strong> {vistaPreviaMadre.edad} años
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>
              CONTACTO
            </h4>
            <p className="mb-2">
              <strong>Dirección:</strong> {vistaPreviaMadre.direccion}
            </p>
            <p className="mb-2">
              <strong>Teléfono:</strong> {vistaPreviaMadre.telefono}
            </p>
            <p className="mb-2">
              <strong>Previsión:</strong> {vistaPreviaMadre.prevision}
            </p>
          </div>

          {mostrarDatosClinicos && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>
                ANTECEDENTES CLÍNICOS
              </h4>
              <p className="mb-2">
                {vistaPreviaMadre.antecedentes || 'Sin antecedentes registrados'}
              </p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3" style={{ color: '#2563eb' }}>
              REGISTRO
            </h4>
            <p className="mb-2">
              <strong>Fecha de Ingreso:</strong>{' '}
              {new Date(vistaPreviaMadre.fechaIngreso).toLocaleDateString('es-CL')}
            </p>
            <p className="mb-2">
              <strong>Registrado por:</strong> {vistaPreviaMadre.registradoPor}
            </p>
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
          <button onClick={onCerrar} className="boton boton-primario" style={{ flex: 1 }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});
VistaPreviaMadre.displayName = 'VistaPreviaMadre';

const PantallaLogin = React.memo(({ onLogin, mostrarAlerta }) => {
  const [credenciales, setCredenciales] = useState({
    usuario: '',
    contrasena: '',
    turno: TURNOS.DIURNO,
  });

  const handleLogin = useCallback(
    (e, rol) => {
      e.preventDefault();
      if (!credenciales.usuario) {
        mostrarAlerta('Ingrese su nombre de usuario', 'error');
        return;
      }

      const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];
      const turnoAsignado = rolesConTurno.includes(rol) ? credenciales.turno : null;

      onLogin(rol, credenciales.usuario, turnoAsignado);
    },
    [credenciales, onLogin, mostrarAlerta]
  );

  const handleInputChange = useCallback((field, value) => {
    setCredenciales((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="tarjeta" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="texto-centro mb-6">
          <div
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
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
            onChange={(e) => handleInputChange('usuario', e.target.value)}
          />
        </div>

        <div className="grupo-input">
          <label className="etiqueta">Contraseña (Simulada)</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={credenciales.contrasena}
            onChange={(e) => handleInputChange('contrasena', e.target.value)}
          />
        </div>

        <div className="grupo-input">
          <label className="etiqueta">Turno (Enfermera/Matrona)</label>
          <select
            className="select"
            value={credenciales.turno}
            onChange={(e) => handleInputChange('turno', e.target.value)}
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
});
PantallaLogin.displayName = 'PantallaLogin';

// ======= COMPONENTE PRINCIPAL APP =======

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
  const [menuRegistrosAbierto, setMenuRegistrosAbierto] = useState(false);
  const [defunciones, setDefunciones] = useState([]);

  // Funciones memoizadas para verificar permisos
  const tienePermiso = useCallback(
    (permiso) => {
      if (!usuario) return false;
      return PERMISOS[usuario.rol]?.[permiso] || false;
    },
    [usuario]
  );

  const puedeEditarParto = useCallback(
    (parto) => {
      if (!usuario) return false;

      if (usuario.rol === ROLES.MEDICO) return false;

      if (usuario.rol === ROLES.MATRONA) {
        const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
        const dentroDeVentana = tiempoTranscurrido <= VENTANA_EDICION_PARTO;
        const esDelMismoUsuario = parto.registradoPor === usuario.nombre;
        return dentroDeVentana && esDelMismoUsuario && tienePermiso('editarRegistroParto');
      }

      return false;
    },
    [usuario, tienePermiso]
  );

  const perteneceATurno = useCallback(
    (paciente) => {
      if (!usuario || !tienePermiso('accesoPorTurno')) return true;

      if (usuario.turno && paciente.turno) {
        return usuario.turno === paciente.turno;
      }

      return true;
    },
    [usuario, tienePermiso]
  );

  // Datos filtrados memoizados
  const madresFiltradas = useMemo(() => {
    return madres.filter((madre) => {
      if (
        busqueda &&
        !madre.rut.toLowerCase().includes(busqueda.toLowerCase()) &&
        !madre.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ) {
        return false;
      }

      if (!perteneceATurno(madre)) {
        return false;
      }

      return true;
    });
  }, [madres, busqueda, perteneceATurno]);

  const partosFiltrados = useMemo(() => {
    return partos.filter((parto) => {
      if (!busqueda) {
        const madre = madres.find((m) => m.id === parto.madreId);
        return perteneceATurno(madre);
      }

      const madre = madres.find((m) => m.id === parto.madreId);
      const coincideBusqueda =
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        parto.rnId.toLowerCase().includes(busqueda.toLowerCase());

      return coincideBusqueda && perteneceATurno(madre);
    });
  }, [partos, madres, busqueda, perteneceATurno]);

  // Control de timeout de sesión
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (usuario && Date.now() - ultimaSesion > TIMEOUT_SESION) {
        mostrarAlerta(MENSAJES.error.sesionExpirada, 'error');
        cerrarSesion();
      }
    }, 60000);
    return () => clearInterval(intervalo);
  }, [usuario, ultimaSesion]);

  // Funciones de utilidad memoizadas
  const actualizarActividad = useCallback(() => {
    setUltimaSesion(Date.now());
  }, []);

  const mostrarAlerta = useCallback((mensaje, tipo = 'info') => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 4000);
  }, []);

  const calcularDiasHospitalizacion = useCallback((fechaIngreso) => {
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diferencia;
  }, []);

  // Funciones principales optimizadas
  const iniciarSesion = useCallback(
    (rol, nombreUsuario, turno = null) => {
      setUsuario({ rol, nombre: nombreUsuario, turno });
      setPantallaActual('dashboard');
      actualizarActividad();
      mostrarAlerta(`Bienvenido/a ${nombreUsuario}`, 'success');

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.LOGIN,
        detalle: `Inicio de sesión: ${nombreUsuario} (${rol})`,
        usuario: nombreUsuario,
      });
    },
    [actualizarActividad, mostrarAlerta]
  );

  const cerrarSesion = useCallback(() => {
    registrarEventoAuditoria({
      accion: ACCIONES_AUDITORIA.LOGOUT,
      detalle: `Cierre de sesión: ${usuario?.nombre}`,
      usuario: usuario?.nombre || 'desconocido',
    });

    setUsuario(null);
    setPantallaActual('login');
    setMadreSeleccionada(null);
    mostrarAlerta(MENSAJES.exito.sesionCerrada, 'info');
  }, [usuario, mostrarAlerta]);

  const agregarMadre = useCallback(
    (datos) => {
      if (!tienePermiso('crearPaciente')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        registrarEventoAuditoria({
          accion: ACCIONES_AUDITORIA.INTENTO_ACCESO_DENEGADO,
          detalle: `Intento de crear paciente sin permiso por ${usuario?.nombre}`,
          usuario: usuario?.nombre || 'desconocido',
        });
        return;
      }

      if (!validarRUT(datos.rut)) {
        mostrarAlerta(MENSAJES.error.rutInvalido, 'error');
        return;
      }

      const rutExiste = madres.some((m) => m.rut === datos.rut);
      if (rutExiste) {
        mostrarAlerta('Ya existe una madre registrada con este RUT', 'error');
        return;
      }

      const nuevaMadre = {
        id: madres.length + 1,
        ...datos,
        fechaIngreso: new Date().toISOString(),
        registradoPor: usuario.nombre,
        turno: usuario.turno || null,
      };

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.CREAR_PACIENTE,
        detalle: `Admisión de madre: ${datos.rut} (${datos.nombre}) por usuario ${usuario?.nombre || 'desconocido'}`,
        usuario: usuario?.nombre || 'desconocido',
      });

      setMadres((prev) => [...prev, nuevaMadre]);
      mostrarAlerta(MENSAJES.exito.madreRegistrada, 'success');
      setPantallaActual('dashboard');
    },
    [tienePermiso, mostrarAlerta, usuario, madres]
  );

  const registrarParto = useCallback(
    (datos) => {
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
        turno: usuario.turno || null,
      };

      const madre = madres.find((m) => m.id === madreSeleccionada.id);

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.CREAR_PARTO,
        detalle: `✅ REGISTRO DE PARTO: RN ${nuevoParto.rnId} - Madre: ${madre?.nombre} (${madre?.rut}) | Tipo: ${datos.tipo} | Peso: ${datos.pesoRN}g | Talla: ${datos.tallaRN}cm | APGAR: ${datos.apgar1}/${datos.apgar5} | Corticoides: ${datos.corticoides} | Registrado por: ${usuario?.nombre}`,
        usuario: usuario?.nombre || 'desconocido',
      });

      setPartos((prev) => [...prev, nuevoParto]);
      mostrarAlerta(MENSAJES.exito.partoRegistrado, 'success');
      setPantallaActual('dashboard');
      setMadreSeleccionada(null);
    },
    [tienePermiso, mostrarAlerta, usuario, partos, madreSeleccionada, madres]
  );

  const editarParto = useCallback(
    (datosActualizados) => {
      if (!tienePermiso('editarRegistroParto')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }

      if (!puedeEditarParto(partoSeleccionado)) {
        mostrarAlerta(MENSAJES.error.ventanaEdicionCerrada, 'error');
        return;
      }

      const partoAnterior = partos.find((p) => p.id === partoSeleccionado.id);
      const cambios = [];

      Object.keys(datosActualizados).forEach((key) => {
        if (partoAnterior[key] !== datosActualizados[key]) {
          cambios.push(`${key}: "${partoAnterior[key]}" → "${datosActualizados[key]}"`);
        }
      });

      setPartos((prev) =>
        prev.map((p) => (p.id === partoSeleccionado.id ? { ...p, ...datosActualizados } : p))
      );

      const madre = madres.find((m) => m.id === partoSeleccionado.madreId);

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.EDITAR_PARTO,
        detalle: `✏️ EDICIÓN DE PARTO: RN ${partoSeleccionado.rnId} - Madre: ${madre?.nombre} (${madre?.rut}) | Cambios: ${cambios.join(' | ')} | Por: ${usuario.nombre}`,
        usuario: usuario.nombre,
      });

      mostrarAlerta('Parto actualizado correctamente', 'success');
      setPantallaActual('dashboard');
      setPartoSeleccionado(null);
    },
    [tienePermiso, puedeEditarParto, mostrarAlerta, partoSeleccionado, partos, madres, usuario]
  );

  const guardarPartograma = useCallback(
    (datosPartograma) => {
      if (!tienePermiso('crearPartograma')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }

      const nuevoPartograma = {
        ...datosPartograma,
        id: partogramas.length + 1,
        usuario: usuario.nombre,
        turno: usuario.turno,
      };

      setPartogramas((prev) => [...prev, nuevoPartograma]);

      const madre = madres.find((m) => m.id === datosPartograma.madreId);

      registrarEventoAuditoria({
        accion: 'CREAR_PARTOGRAMA',
        detalle: `📊 PARTOGRAMA CREADO: Madre: ${madre?.nombre} (${madre?.rut}) | ${datosPartograma.registros.length} registros | Última dilatación: ${datosPartograma.registros[datosPartograma.registros.length - 1]?.dilatacion}cm | Por: ${usuario.nombre}`,
        usuario: usuario.nombre,
      });

      mostrarAlerta('Partograma guardado exitosamente', 'success');
      setPantallaActual('dashboard');
      setMadreSeleccionada(null);
    },
    [tienePermiso, mostrarAlerta, usuario, partogramas, madres]
  );

  const guardarEpicrisis = useCallback(
    (datosEpicrisis) => {
      if (!tienePermiso('crearEpicrisis')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }

      const nuevaEpicrisis = {
        ...datosEpicrisis,
        id: epicrisis.length + 1,
        medico: usuario.nombre,
      };

      setEpicrisis((prev) => [...prev, nuevaEpicrisis]);

      const madre = madres.find((m) => m.id === datosEpicrisis.madreId);
      const parto = partos.find((p) => p.id === datosEpicrisis.partoId);

      registrarEventoAuditoria({
        accion: 'CREAR_EPICRISIS',
        detalle: `🏥 EPICRISIS CREADA: Madre: ${madre?.nombre} (${madre?.rut}) | Diagnóstico: ${datosEpicrisis.epicrisis.diagnosticoEgreso.substring(0, 100)}... | Condición: ${datosEpicrisis.epicrisis.condicionEgreso} | ${datosEpicrisis.indicaciones.length} indicaciones médicas | Por: ${usuario.nombre}`,
        usuario: usuario.nombre,
      });

      // Generar PDF automáticamente
      if (parto && madre) {
        generarEpicrisisPDF(parto, madre, nuevaEpicrisis);
        mostrarAlerta('Epicrisis guardada y PDF generado exitosamente', 'success');
      } else {
        mostrarAlerta('Epicrisis guardada exitosamente', 'success');
      }

      setPantallaActual('dashboard');
      setPartoSeleccionado(null);
    },
    [tienePermiso, mostrarAlerta, usuario, epicrisis, madres, partos]
  );

  const guardarDefuncion = useCallback(
    (datosDefuncion) => {
      if (!tienePermiso('crearEpicrisis')) {
        // Solo médicos pueden registrar defunciones
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }

      const nuevaDefuncion = {
        ...datosDefuncion,
        id: defunciones.length + 1,
        medico: usuario.nombre,
        fechaRegistro: new Date().toISOString(),
      };

      setDefunciones((prev) => [...prev, nuevaDefuncion]);

      let detalleAuditoria = '';
      if (datosDefuncion.tipo === 'recien_nacido') {
        const parto = partos.find((p) => p.id === parseInt(datosDefuncion.recienNacidoId));
        const madre = madres.find((m) => m.id === parto?.madreId);
        detalleAuditoria = `☠️ DEFUNCIÓN REGISTRADA: RN ${parto?.rnId} - Madre: ${madre?.nombre} (${madre?.rut}) | Fecha: ${datosDefuncion.fechaDefuncion} ${datosDefuncion.horaDefuncion} | Causa: ${datosDefuncion.causaDefuncionCodigo} | Por: ${usuario.nombre}`;
      } else {
        const madre = madres.find((m) => m.id === parseInt(datosDefuncion.madreId));
        detalleAuditoria = `☠️ DEFUNCIÓN MATERNA REGISTRADA: ${madre?.nombre} (${madre?.rut}) | Fecha: ${datosDefuncion.fechaDefuncion} ${datosDefuncion.horaDefuncion} | Causa: ${datosDefuncion.causaDefuncionCodigo} | Por: ${usuario.nombre}`;
      }

      registrarEventoAuditoria({
        accion: 'REGISTRAR_DEFUNCION',
        detalle: detalleAuditoria,
        usuario: usuario.nombre,
      });

      mostrarAlerta('Defunción registrada correctamente', 'success');
      setPantallaActual('dashboard');
    },
    [tienePermiso, mostrarAlerta, usuario, defunciones, partos, madres]
  );

  const anexarCorreccionParto = useCallback(
    (datosCorreccion) => {
      if (!tienePermiso('anexarCorreccion')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }

      const nuevaCorreccion = {
        id: correcciones.length + 1,
        ...datosCorreccion,
        usuarioCorreccion: usuario.nombre,
        rolUsuario: usuario.rol,
        fechaCorreccion: new Date().toISOString(),
      };

      setCorrecciones((prev) => [...prev, nuevaCorreccion]);

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.ANEXAR_CORRECCION,
        detalle: `Corrección anexada al parto ${datosCorreccion.partoId}: ${datosCorreccion.campo} por ${usuario.nombre}. Justificación: ${datosCorreccion.justificacion}`,
        usuario: usuario.nombre,
      });

      mostrarAlerta(MENSAJES.exito.correccionAnexada, 'success');
      setPantallaActual('dashboard');
      setPartoSeleccionado(null);
    },
    [tienePermiso, mostrarAlerta, usuario, correcciones]
  );

  const mostrarVistaPreviaPDF = useCallback(
    (parto) => {
      if (!tienePermiso('generarBrazalete')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }
      const madre = madres.find((m) => m.id === parto.madreId);
      setVistaPrevia({ parto, madre });
    },
    [tienePermiso, mostrarAlerta, madres]
  );

  const imprimirBrazalete = useCallback(
    (parto, madre) => {
      if (!tienePermiso('generarBrazalete')) {
        mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
        return;
      }
      generarBrazaletePDF(parto, madre);
      setVistaPrevia(null);
      mostrarAlerta('Brazalete generado correctamente', 'success');
    },
    [tienePermiso, mostrarAlerta]
  );

  const guardarUsuario = useCallback(
    (datosUsuario) => {
      const usuarioExiste = usuariosSistema.find((u) => u.id === datosUsuario.id);

      if (usuarioExiste) {
        setUsuariosSistema((prev) =>
          prev.map((u) => (u.id === datosUsuario.id ? datosUsuario : u))
        );
        mostrarAlerta('Usuario actualizado correctamente', 'success');

        registrarEventoAuditoria({
          accion: ACCIONES_AUDITORIA.MODIFICAR_USUARIO,
          detalle: `Usuario modificado: ${datosUsuario.username} por ${usuario.nombre}`,
          usuario: usuario.nombre,
        });
      } else {
        setUsuariosSistema((prev) => [...prev, datosUsuario]);
        mostrarAlerta('Usuario creado correctamente', 'success');

        registrarEventoAuditoria({
          accion: ACCIONES_AUDITORIA.CREAR_USUARIO,
          detalle: `Usuario creado: ${datosUsuario.username} (${datosUsuario.rol}) por ${usuario.nombre}`,
          usuario: usuario.nombre,
        });
      }
    },
    [usuariosSistema, mostrarAlerta, usuario]
  );

  const desactivarUsuario = useCallback(
    (usuarioId) => {
      setUsuariosSistema((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, activo: false } : u))
      );

      const usuarioDesactivado = usuariosSistema.find((u) => u.id === usuarioId);
      mostrarAlerta(`Usuario ${usuarioDesactivado?.nombre} desactivado`, 'success');

      registrarEventoAuditoria({
        accion: ACCIONES_AUDITORIA.DESACTIVAR_USUARIO,
        detalle: `Usuario desactivado: ${usuarioDesactivado?.username} por ${usuario.nombre}`,
        usuario: usuario.nombre,
      });
    },
    [usuariosSistema, mostrarAlerta, usuario]
  );

  // Dashboard principal con tabla de RN
  const Dashboard = useMemo(() => {
    const partosHoy = partosFiltrados.filter((p) => {
      const hoy = new Date().toISOString().split('T')[0];
      return p.fecha === hoy;
    });
    const partosRecientes = partosFiltrados.slice(-10).reverse();

    return (
      <div className="animacion-entrada">
        {tienePermiso('accesoPorTurno') && usuario.turno && (
          <div
            className="tarjeta mb-6"
            style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #2563eb' }}
          >
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

        <div className="tarjeta mb-6">
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
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

        {tienePermiso('verEstadisticas') && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="tarjeta tarjeta-hover">
              <div className="flex justify-between items-center">
                <div>
                  <p className="texto-sm texto-gris">Madres Registradas</p>
                  <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>
                    {madresFiltradas.length}
                  </p>
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
                  <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>
                    {partosFiltrados.length}
                  </p>
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
                  <p className="texto-3xl font-bold" style={{ color: '#8b5cf6' }}>
                    {partosHoy.length}
                  </p>
                </div>
                <FileText size={48} color="#8b5cf6" />
              </div>
            </div>
          </div>
        )}

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
                    {partosRecientes.map((parto) => {
                      const madre = madres.find((m) => m.id === parto.madreId);
                      const diasHospitalizacion = calcularDiasHospitalizacion(parto.fechaIngreso);
                      const esAlerta = diasHospitalizacion > 7;
                      const puedeEditar = puedeEditarParto(parto);
                      const tiempoTranscurrido =
                        Date.now() - new Date(parto.fechaRegistro).getTime();
                      const horasTranscurridas = Math.floor(tiempoTranscurrido / (1000 * 60 * 60));

                      return (
                        <tr
                          key={parto.id}
                          style={{
                            backgroundColor: esAlerta ? '#fee2e2' : 'transparent',
                          }}
                        >
                          <td className="font-semibold">
                            {parto.rnId}
                            {usuario.rol === ROLES.MATRONA &&
                              parto.registradoPor === usuario.nombre && (
                                <div className="texto-xs texto-gris mt-1">
                                  {puedeEditar ? (
                                    <span style={{ color: '#10b981' }}>
                                      ✓ Editable ({2 - horasTranscurridas}h restantes)
                                    </span>
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
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                backgroundColor: esAlerta ? '#dc2626' : '#10b981',
                                color: 'white',
                              }}
                            >
                              {diasHospitalizacion} días
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                backgroundColor: parto.tipo === 'Cesárea' ? '#fef3c7' : '#d1fae5',
                                color: parto.tipo === 'Cesárea' ? '#92400e' : '#065f46',
                              }}
                            >
                              {parto.tipo}
                            </span>
                          </td>
                          <td>{parto.pesoRN}g</td>
                          <td>
                            {parto.apgar1}/{parto.apgar5}
                          </td>
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
                                      color: 'white',
                                    }}
                                    title="Vista previa del brazalete"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const madreInfo = madres.find((m) => m.id === parto.madreId);
                                      imprimirBrazalete(parto, madreInfo);
                                    }}
                                    className="boton"
                                    style={{
                                      padding: '0.5rem',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                    }}
                                    title="Imprimir brazalete"
                                  >
                                    <Printer size={18} />
                                  </button>
                                </>
                              )}

                              {puedeEditar && (
                                <button
                                  onClick={() => {
                                    setPartoSeleccionado(parto);
                                    setPantallaActual('editar-parto');
                                  }}
                                  className="boton"
                                  style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                  }}
                                  title="Editar parto (ventana de 2h)"
                                >
                                  <Edit3 size={18} />
                                </button>
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
                                    color: 'white',
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
                    {madresFiltradas.map((madre) => (
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
                                color: 'white',
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
                                  color: 'white',
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

        {tienePermiso('crearRegistroParto') && (
          <div className="tarjeta mt-6">
            <h3 className="texto-xl font-bold mb-4">Madres sin Parto Registrado (Mi Turno)</h3>
            {madresFiltradas.filter((madre) => !partos.some((p) => p.madreId === madre.id))
              .length === 0 ? (
              <p className="texto-centro texto-gris py-4">
                Todas las madres de su turno tienen partos registrados
              </p>
            ) : (
              <div className="grid gap-3">
                {madresFiltradas
                  .filter((madre) => !partos.some((p) => p.madreId === madre.id))
                  .map((madre) => (
                    <div
                      key={madre.id}
                      className="flex justify-between items-center p-4"
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <div>
                        <p className="font-semibold">{madre.nombre}</p>
                        <p className="texto-sm texto-gris">
                          RUT: {madre.rut} - Edad: {madre.edad} años
                        </p>
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
  }, [
    partosFiltrados,
    tienePermiso,
    usuario,
    busqueda,
    madresFiltradas,
    madres,
    partos,
    calcularDiasHospitalizacion,
    puedeEditarParto,
    mostrarVistaPreviaPDF,
    imprimirBrazalete,
  ]);

  // Formulario de admisión de madre
  const FormularioAdmision = () => {
    const [datos, setDatos] = useState({
      rut: '',
      nombre: '',
      edad: '',
      fechaNacimiento: '',
      nacionalidad: 'Chilena',
      perteneceaPuebloOriginario: false,
      direccion: '',
      telefono: '',
      prevision: 'FONASA A',
      antecedentes: '',
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

      if (!datos.fechaNacimiento)
        nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';

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
      <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="texto-2xl font-bold mb-6">Admisión de Madre</h2>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Fecha de Nacimiento *</label>
            <input
              type="date"
              className={`input ${errores.fechaNacimiento ? 'input-error' : ''}`}
              value={datos.fechaNacimiento}
              onChange={(e) => setDatos({ ...datos, fechaNacimiento: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
            {errores.fechaNacimiento && <p className="mensaje-error">{errores.fechaNacimiento}</p>}
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Nacionalidad *</label>
            <select
              className="select"
              value={datos.nacionalidad}
              onChange={(e) => setDatos({ ...datos, nacionalidad: e.target.value })}
            >
              <option value="Chilena">Chilena</option>
              <option value="Argentina">Argentina</option>
              <option value="Boliviana">Boliviana</option>
              <option value="Colombiana">Colombiana</option>
              <option value="Haitiana">Haitiana</option>
              <option value="Peruana">Peruana</option>
              <option value="Venezolana">Venezolana</option>
              <option value="Otra">Otra</option>
            </select>
            <p className="texto-xs texto-gris mt-1">Para estadísticas REM de migrantes</p>
          </div>

          <div className="grupo-input">
            <label className="etiqueta">¿Pertenece a pueblo originario?</label>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={datos.perteneceaPuebloOriginario}
                  onChange={(e) =>
                    setDatos({ ...datos, perteneceaPuebloOriginario: e.target.checked })
                  }
                />
                <span>Sí, pertenece a pueblo originario</span>
              </label>
            </div>
            <p className="texto-xs texto-gris mt-1">Para estadísticas REM</p>
          </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Teléfono de Contacto</label>
            <input
              type="tel"
              className="input"
              placeholder="+56 9 1234 5678"
              value={datos.telefono}
              onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Previsión de Salud</label>
            <select
              className="select"
              value={datos.prevision}
              onChange={(e) => setDatos({ ...datos, prevision: e.target.value })}
            >
              <option value="FONASA A">FONASA A</option>
              <option value="FONASA B">FONASA B</option>
              <option value="FONASA C">FONASA C</option>
              <option value="FONASA D">FONASA D</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="Particular">Particular</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
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
      rutProvisorio: `PROV-${Date.now()}`,
      sexoRN: 'Masculino',
      estadoAlNacer: 'Vivo',
      pesoRN: '',
      tallaRN: '',
      apgar1: '',
      apgar5: '',
      corticoides: 'no',
      profilaxisVitaminaK: true,
      profilaxisOftalmica: true,
      diagnosticosCIE10: [],
      observaciones: '',
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

      if (datos.diagnosticosCIE10.length === 0) {
        nuevosErrores.diagnosticosCIE10 = 'Debe seleccionar al menos un diagnóstico';
      }

      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validarFormulario()) {
        registrarParto(datos);
      }
    };

    const toggleDiagnostico = (codigo) => {
      setDatos((prev) => ({
        ...prev,
        diagnosticosCIE10: prev.diagnosticosCIE10.includes(codigo)
          ? prev.diagnosticosCIE10.filter((c) => c !== codigo)
          : [...prev.diagnosticosCIE10, codigo],
      }));
    };

    return (
      <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="texto-2xl font-bold mb-4">Registro de Parto</h2>
        <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <p className="font-semibold">Madre: {madreSeleccionada?.nombre}</p>
          <p className="texto-sm texto-gris">RUT: {madreSeleccionada?.rut}</p>
          <p className="texto-xs" style={{ color: '#2563eb', marginTop: '0.5rem' }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Tendrá 2 horas para editar este registro después de guardarlo
          </p>
        </div>

        {/* DATOS DEL PARTO */}
        <div className="mb-6">
          <h3 className="texto-lg font-bold mb-3" style={{ color: '#2563eb' }}>
            Datos del Parto
          </h3>

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
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

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
            <label className="etiqueta">
              ¿La madre recibió corticoides durante la gestación? *
            </label>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="corticoides"
                  value="si"
                  checked={datos.corticoides === 'si'}
                  onChange={(e) => setDatos({ ...datos, corticoides: e.target.value })}
                />
                <span>Sí</span>
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
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
        </div>

        {/* DATOS DEL RECIÉN NACIDO */}
        <div className="mb-6">
          <h3 className="texto-lg font-bold mb-3" style={{ color: '#10b981' }}>
            Datos del Recién Nacido
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">RUT Provisorio *</label>
              <input
                type="text"
                className="input"
                value={datos.rutProvisorio}
                onChange={(e) => setDatos({ ...datos, rutProvisorio: e.target.value })}
                placeholder="PROV-2025-001"
              />
              <p className="texto-xs texto-gris mt-1">
                Se asignará RUT definitivo después del registro civil
              </p>
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Sexo *</label>
              <select
                className="select"
                value={datos.sexoRN}
                onChange={(e) => setDatos({ ...datos, sexoRN: e.target.value })}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Indeterminado">Indeterminado</option>
              </select>
            </div>
          </div>

          <div className="grupo-input">
            <label className="etiqueta">Estado al Nacer *</label>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="estadoAlNacer"
                  value="Vivo"
                  checked={datos.estadoAlNacer === 'Vivo'}
                  onChange={(e) => setDatos({ ...datos, estadoAlNacer: e.target.value })}
                />
                <span>Vivo</span>
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="estadoAlNacer"
                  value="Nacido Muerto"
                  checked={datos.estadoAlNacer === 'Nacido Muerto'}
                  onChange={(e) => setDatos({ ...datos, estadoAlNacer: e.target.value })}
                />
                <span>Nacido Muerto</span>
              </label>
            </div>
            <p className="texto-xs texto-gris mt-1">Crítico para reportes REM A09</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Peso (gramos) *</label>
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

            <div className="grupo-input">
              <label className="etiqueta">Talla (cm) *</label>
              <input
                type="number"
                className={`input ${errores.tallaRN ? 'input-error' : ''}`}
                placeholder="50"
                value={datos.tallaRN}
                onChange={(e) => setDatos({ ...datos, tallaRN: e.target.value })}
                min="30"
                max="70"
                step="0.1"
              />
              {errores.tallaRN && <p className="mensaje-error">{errores.tallaRN}</p>}
            </div>

            <div className="grupo-input">
              <label className="etiqueta">APGAR 1 min *</label>
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
          </div>

          <div className="grupo-input">
            <label className="etiqueta">APGAR 5 min *</label>
            <input
              type="number"
              className={`input ${errores.apgar5 ? 'input-error' : ''}`}
              placeholder="10"
              value={datos.apgar5}
              onChange={(e) => setDatos({ ...datos, apgar5: e.target.value })}
              min="0"
              max="10"
              style={{ maxWidth: '200px' }}
            />
            {errores.apgar5 && <p className="mensaje-error">{errores.apgar5}</p>}
          </div>

          {/* PROFILAXIS */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '0.5rem',
              border: '1px solid #10b981',
            }}
          >
            <h4 className="font-semibold mb-3" style={{ color: '#166534' }}>
              Profilaxis Aplicadas
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={datos.profilaxisVitaminaK}
                  onChange={(e) => setDatos({ ...datos, profilaxisVitaminaK: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <div>
                  <span className="font-semibold">Vitamina K</span>
                  <p className="texto-xs texto-gris">Prevención de hemorragia</p>
                </div>
              </label>

              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={datos.profilaxisOftalmica}
                  onChange={(e) => setDatos({ ...datos, profilaxisOftalmica: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <div>
                  <span className="font-semibold">Profilaxis Oftálmica</span>
                  <p className="texto-xs texto-gris">Prevención de conjuntivitis neonatal</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* DIAGNÓSTICOS CIE-10 */}
        <div className="mb-6">
          <h3 className="texto-lg font-bold mb-3" style={{ color: '#8b5cf6' }}>
            Diagnósticos CIE-10 *
          </h3>
          {errores.diagnosticosCIE10 && (
            <p className="mensaje-error mb-3">{errores.diagnosticosCIE10}</p>
          )}

          <div
            className="p-4"
            style={{
              backgroundColor: '#f5f3ff',
              borderRadius: '0.5rem',
              border: '1px solid #8b5cf6',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <p className="texto-sm texto-gris mb-3">
              Seleccione uno o más diagnósticos (requerido para reportes REM)
            </p>

            <div className="grid gap-2">
              {datosMock.diagnosticosCIE10.map((diagnostico) => (
                <label
                  key={diagnostico.codigo}
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: datos.diagnosticosCIE10.includes(diagnostico.codigo)
                      ? '#ddd6fe'
                      : '#fff',
                    borderRadius: '0.5rem',
                    border: datos.diagnosticosCIE10.includes(diagnostico.codigo)
                      ? '2px solid #8b5cf6'
                      : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={datos.diagnosticosCIE10.includes(diagnostico.codigo)}
                    onChange={() => toggleDiagnostico(diagnostico.codigo)}
                    style={{ width: '18px', height: '18px', marginTop: '2px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span className="font-semibold" style={{ color: '#6d28d9' }}>
                      {diagnostico.codigo}
                    </span>
                    <p className="texto-sm">{diagnostico.descripcion}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {datos.diagnosticosCIE10.length > 0 && (
            <div
              className="mt-3 p-3"
              style={{ backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}
            >
              <p className="texto-sm font-semibold" style={{ color: '#166534' }}>
                Diagnósticos seleccionados ({datos.diagnosticosCIE10.length}):
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {datos.diagnosticosCIE10.map((codigo) => {
                  const diag = datosMock.diagnosticosCIE10.find((d) => d.codigo === codigo);
                  return (
                    <span
                      key={codigo}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {diag?.codigo}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* OBSERVACIONES */}
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
      {vistaPrevia && (
        <VistaPreviaBrazalete
          vistaPrevia={vistaPrevia}
          onImprimir={imprimirBrazalete}
          onCerrar={() => setVistaPrevia(null)}
        />
      )}
      {vistaPreviaMadre && (
        <VistaPreviaMadre
          vistaPreviaMadre={vistaPreviaMadre}
          mostrarDatosClinicos={tienePermiso('verDatosClinicos')}
          onCerrar={() => setVistaPreviaMadre(null)}
        />
      )}

      <nav
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="contenedor py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Baby size={36} />
              <div>
                <h1 className="texto-xl font-bold">SIGN - Sistema de Gestión Neonatal</h1>
                <p className="texto-sm" style={{ opacity: 0.9 }}>
                  {usuario?.rol.charAt(0).toUpperCase() + usuario?.rol.slice(1)} - {usuario?.nombre}
                  {usuario?.turno &&
                    ` | Turno: ${usuario.turno.charAt(0).toUpperCase() + usuario.turno.slice(1)}`}
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
                      usuario: usuario.nombre,
                    });
                    setPantallaActual('reporteREM');
                  }}
                  className="boton"
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

              {tienePermiso('crearEpicrisis') && (
                <button
                  onClick={() => {
                    if (madres.length === 0) {
                      mostrarAlerta('No hay pacientes registrados', 'error');
                      return;
                    }
                    setPantallaActual('registrar-defuncion');
                  }}
                  className="boton"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  <Skull size={20} />
                  Registro Defunción
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

              {/* Menú desplegable de Registros */}
              {(tienePermiso('crearEpicrisis') || // ← Siempre mostrar para médicos
                correcciones.length > 0 ||
                partogramas.length > 0 ||
                epicrisis.length > 0 ||
                defunciones.length > 0) && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenuRegistrosAbierto(!menuRegistrosAbierto)}
                    className="boton"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <List size={20} />
                    Registros
                    <ChevronDown size={16} />
                  </button>

                  {menuRegistrosAbierto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        minWidth: '200px',
                        zIndex: 1000,
                      }}
                    >
                      {tienePermiso('crearEpicrisis') &&
                        correcciones.length === 0 &&
                        partogramas.length === 0 &&
                        epicrisis.length === 0 &&
                        defunciones.length === 0 && (
                          <div
                            style={{
                              padding: '1.5rem 1.25rem',
                              textAlign: 'center',
                              color: '#9ca3af',
                              fontSize: '0.875rem',
                            }}
                          >
                            <List size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                            <p>No hay registros disponibles</p>
                          </div>
                        )}

                      {tienePermiso('crearEpicrisis') && defunciones.length > 0 && (
                        <button
                          onClick={() => {
                            setPantallaActual('vista-defunciones');
                            setMenuRegistrosAbierto(false);
                          }}
                          className="boton"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: 'transparent',
                            color: '#1f2937',
                            borderRadius: 0,
                          }}
                        >
                          <Skull size={18} />
                          Defunciones ({defunciones.length})
                        </button>
                      )}

                      {correcciones.length > 0 && tienePermiso('anexarCorreccion') && (
                        <button
                          onClick={() => {
                            setPantallaActual('vista-correcciones');
                            setMenuRegistrosAbierto(false);
                          }}
                          className="boton"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: 'transparent',
                            color: '#1f2937',
                            borderRadius: 0,
                          }}
                        >
                          <FileText size={18} />
                          Correcciones ({correcciones.length})
                        </button>
                      )}

                      {partogramas.length > 0 && (
                        <button
                          onClick={() => {
                            setPantallaActual('vista-partogramas');
                            setMenuRegistrosAbierto(false);
                          }}
                          className="boton"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: 'transparent',
                            color: '#1f2937',
                            borderRadius: 0,
                          }}
                        >
                          <Activity size={18} />
                          Partogramas ({partogramas.length})
                        </button>
                      )}

                      {epicrisis.length > 0 && (
                        <button
                          onClick={() => {
                            setPantallaActual('vista-epicrisis');
                            setMenuRegistrosAbierto(false);
                          }}
                          className="boton"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: 'transparent',
                            color: '#1f2937',
                            borderRadius: 0,
                          }}
                        >
                          <Stethoscope size={18} />
                          Epicrisis ({epicrisis.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
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

              <button onClick={cerrarSesion} className="boton boton-peligro">
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

      <footer
        style={{
          backgroundColor: '#1f2937',
          color: 'white',
          textAlign: 'center',
          padding: '1.5rem',
          marginTop: '3rem',
        }}
      >
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
    return <PantallaLogin onLogin={iniciarSesion} mostrarAlerta={mostrarAlerta} />;
  }

  return (
    <Layout>
      {pantallaActual === 'dashboard' && (
        <>
          {Dashboard}
          {tienePermiso('verAuditoria') && (
            <>
              <h2 className="texto-2xl font-bold mt-6 mb-4">Historial de Auditoría del Sistema</h2>
              <div
                className="tarjeta mb-4"
                style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}
              >
                <p className="texto-sm" style={{ color: '#92400e' }}>
                  <Shield size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Como Admin del Sistema, NO tiene acceso a datos clínicos de pacientes. Solo puede
                  ver logs técnicos del sistema.
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
          onGuardar={(datosActualizados) => {
            if (!tienePermiso('editarDatosDemograficos')) {
              mostrarAlerta(MENSAJES.error.sinPermiso, 'error');
              return;
            }

            const madreAnterior = madres.find((m) => m.id === madreSeleccionada.id);
            const cambios = [];

            Object.keys(datosActualizados).forEach((key) => {
              if (madreAnterior[key] !== datosActualizados[key]) {
                cambios.push(`${key}: "${madreAnterior[key]}" → "${datosActualizados[key]}"`);
              }
            });

            setMadres((prev) =>
              prev.map((m) => (m.id === madreSeleccionada.id ? { ...m, ...datosActualizados } : m))
            );

            registrarEventoAuditoria({
              accion: ACCIONES_AUDITORIA.EDITAR_PACIENTE,
              detalle: `✏️ EDICIÓN DE DATOS: Madre ${madreSeleccionada.nombre} (${madreSeleccionada.rut}) | Cambios: ${cambios.join(' | ')} | Por: ${usuario.nombre}`,
              usuario: usuario.nombre,
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

      {pantallaActual === 'editar-parto' && partoSeleccionado && (
        <EditarParto
          parto={partoSeleccionado}
          madre={madres.find((m) => m.id === partoSeleccionado.madreId)}
          onGuardar={editarParto}
          onCancelar={() => {
            setPartoSeleccionado(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'anexar-correccion' && partoSeleccionado && (
        <AnexarCorreccion
          parto={partoSeleccionado}
          madre={madres.find((m) => m.id === partoSeleccionado.madreId)}
          onGuardar={anexarCorreccionParto}
          onCancelar={() => {
            setPartoSeleccionado(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'reporteREM' && tienePermiso('generarReportes') && (
        <>
          <div
            className="tarjeta mb-4"
            style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444' }}
          >
            <p className="font-semibold" style={{ color: '#991b1b' }}>
              ⚠️ Alto Riesgo de Fuga de Datos
            </p>
            <p className="texto-sm mt-1" style={{ color: '#991b1b' }}>
              La generación de reportes consolidados es un privilegio de alto nivel. Toda
              exportación queda registrada en auditoría.
            </p>
          </div>
          <ReporteREM partos={partos} madres={madres} />
        </>
      )}

      {pantallaActual === 'admision' && tienePermiso('crearPaciente') && <FormularioAdmision />}

      {pantallaActual === 'registrar-parto' && tienePermiso('crearRegistroParto') && (
        <FormularioParto />
      )}

      {pantallaActual === 'notas-enfermera' && usuario.rol === ROLES.ENFERMERA && (
        <NotasEnfermera notas={notasEnfermera} setNotas={setNotasEnfermera} usuario={usuario} />
      )}

      {pantallaActual === 'gestion-usuarios' && tienePermiso('gestionarUsuarios') && (
        <GestionUsuarios
          usuarios={usuariosSistema}
          onGuardarUsuario={guardarUsuario}
          onDesactivarUsuario={desactivarUsuario}
          mostrarAlerta={mostrarAlerta}
        />
      )}

      {pantallaActual === 'vista-correcciones' && (
        <VistaCorrecciones
          correcciones={correcciones}
          partos={partos}
          madres={madres}
          onCerrar={() => setPantallaActual('dashboard')}
        />
      )}

      {pantallaActual === 'vista-partogramas' && (
        <VistaPartogramas
          partogramas={partogramas}
          madres={madres}
          onCerrar={() => setPantallaActual('dashboard')}
        />
      )}

      {pantallaActual === 'vista-epicrisis' && (
        <VistaEpicrisis
          epicrisis={epicrisis}
          partos={partos}
          madres={madres}
          onCerrar={() => setPantallaActual('dashboard')}
        />
      )}

      {pantallaActual === 'vista-defunciones' && (
        <VistaDefunciones
          defunciones={defunciones}
          partos={partos}
          madres={madres}
          onCerrar={() => setPantallaActual('dashboard')}
        />
      )}

      {pantallaActual === 'seleccionar-madre-partograma' && tienePermiso('crearPartograma') && (
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Seleccionar Madre para Partograma</h2>
          <p className="texto-gris mb-6">
            Seleccione la madre para iniciar el registro del partograma
          </p>
          <div className="grid gap-3">
            {madresFiltradas.map((madre) => (
              <div
                key={madre.id}
                className="flex justify-between items-center p-4"
                style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              >
                <div>
                  <p className="font-semibold">{madre.nombre}</p>
                  <p className="texto-sm texto-gris">
                    RUT: {madre.rut} - Edad: {madre.edad} años
                  </p>
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
          <button onClick={() => setPantallaActual('dashboard')} className="boton boton-gris mt-4">
            Cancelar
          </button>
        </div>
      )}

      {pantallaActual === 'crear-partograma' && madreSeleccionada && (
        <Partograma
          madre={madreSeleccionada}
          parto={partos.find((p) => p.madreId === madreSeleccionada.id)}
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
          <p className="texto-gris mb-6">
            Seleccione el parto para crear la epicrisis e indicaciones médicas
          </p>
          <div className="grid gap-3">
            {partosFiltrados.map((parto) => {
              const madre = madres.find((m) => m.id === parto.madreId);
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
          <button onClick={() => setPantallaActual('dashboard')} className="boton boton-gris mt-4">
            Cancelar
          </button>
        </div>
      )}

      {pantallaActual === 'crear-epicrisis' && partoSeleccionado && (
        <EpicrisisMedica
          parto={partoSeleccionado}
          madre={madres.find((m) => m.id === partoSeleccionado.madreId)}
          onGuardar={guardarEpicrisis}
          onCancelar={() => {
            setPartoSeleccionado(null);
            setPantallaActual('dashboard');
          }}
        />
      )}

      {pantallaActual === 'registrar-defuncion' && tienePermiso('crearEpicrisis') && (
        <RegistroDefuncion
          madres={madresFiltradas}
          partos={partosFiltrados}
          onGuardar={guardarDefuncion}
          onCancelar={() => setPantallaActual('dashboard')}
        />
      )}
    </Layout>
  );
};

export default App;
