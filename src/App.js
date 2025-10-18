import React, { useState, useEffect } from 'react';
import { FileText, User, Baby, Printer, LogOut, AlertCircle, CheckCircle, Home, Search, Eye, PlusCircle, Shield } from 'lucide-react';
import { generarBrazaletePDF } from './utilidades/generarPDF';
import { validarRUT } from './servicios/validaciones';
import { datosMock } from './mocks/datos';
import { registrarEventoAuditoria } from './servicios/api';
import TablaAuditoria from './componentes/TablaAuditoria';
import ReporteREM from './componentes/ReporteREM';
import NotasEnfermera from './componentes/NotasEnfermera';
import EditarMadre from './componentes/EditarMadre';




const App = () => {
  // Estados globales
  const [usuario, setUsuario] = useState(null);
  const [pantallaActual, setPantallaActual] = useState('login');
  const [madres, setMadres] = useState(datosMock.madres);
  const [partos, setPartos] = useState(datosMock.partos);
  const [madreSeleccionada, setMadreSeleccionada] = useState(null);
  const [ultimaSesion, setUltimaSesion] = useState(Date.now());
  const [alerta, setAlerta] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [notasEnfermera, setNotasEnfermera] = useState([]);
  const [vistaPreviaMadre, setVistaPreviaMadre] = useState(null);



  // Control de timeout de sesión (30 minutos)
  useEffect(() => {

  const intervalo = setInterval(() => {
    if (usuario && Date.now() - ultimaSesion > 45 * 60 * 1000) {
      mostrarAlerta("Sesión expirada por inactividad", "error");
      cerrarSesion();
    }
  }, 60000);
}, [usuario]);

  // Actualizar actividad del usuario
  const actualizarActividad = () => {
    setUltimaSesion(Date.now());
  };


  // Funciones auxiliares
  const mostrarAlerta = (mensaje, tipo = 'info') => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  const iniciarSesion = (rol, nombreUsuario) => {
    setUsuario({ rol, nombre: nombreUsuario });
    setPantallaActual('dashboard');
    actualizarActividad();
    mostrarAlerta(`Bienvenido/a ${nombreUsuario}`, 'success');
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setPantallaActual('login');
    setMadreSeleccionada(null);
    mostrarAlerta('Sesión cerrada correctamente', 'info');
  };

  const agregarMadre = (datos) => {
    if (!validarRUT(datos.rut)) {
      mostrarAlerta('El RUT ingresado no es válido', 'error');
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
      registradoPor: usuario.nombre
    };

    // Registrar acción de auditoría:
  registrarEventoAuditoria({
    accion: 'ADMISION_MADRE',
    detalle: `Admisión de madre: ${datos.rut} (${datos.nombre}) por usuario ${usuario?.nombre || 'desconocido'}`,
    usuario: usuario?.nombre || 'desconocido',
  });
    
    setMadres([...madres, nuevaMadre]);
    mostrarAlerta('Madre registrada exitosamente', 'success');
    setPantallaActual('dashboard');
  };

  const registrarParto = (datos) => {

     setPartos([...partos, nuevoParto]);
  const madre = madres.find(m => m.id === madreSeleccionada.id);

  registrarEventoAuditoria({
    accion: 'REGISTRO_PARTO',
    detalle: `Registro de parto: ${madre?.rut || ''} (${madre?.nombre || ''}) por usuario ${usuario?.nombre || 'desconocido'}`,
    usuario: usuario?.nombre || 'desconocido',
  });

    if (!datos.pesoRN || !datos.tallaRN || !datos.apgar1 || !datos.apgar5) {
      mostrarAlerta('Complete todos los campos obligatorios', 'error');
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
      registradoPor: usuario.nombre
    };
    
    setPartos([...partos, nuevoParto]);
    mostrarAlerta('Parto registrado exitosamente', 'success');
    setPantallaActual('dashboard');
    setMadreSeleccionada(null);
  };

  const mostrarVistaPreviaPDF = (parto) => {
    const madre = madres.find(m => m.id === parto.madreId);
    setVistaPrevia({ parto, madre });
  };

  const imprimirBrazalete = (parto, madre) => {
    generarBrazaletePDF(parto, madre);
    setVistaPrevia(null);
    mostrarAlerta('Brazalete generado correctamente', 'success');
  };

  // Calcular días de hospitalización
  const calcularDiasHospitalizacion = (fechaIngreso) => {
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  // Filtrar partos por búsqueda
  const partosFiltrados = partos.filter(parto => {
    if (!busqueda) return true;
    const madre = madres.find(m => m.id === parto.madreId);
    return madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
           madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           parto.rnId.toLowerCase().includes(busqueda.toLowerCase());
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
    // Pantalla de Login
  const PantallaLogin = () => {
    const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' });

    const handleLogin = (e, rol) => {
      e.preventDefault();
      if (!credenciales.usuario) {
        mostrarAlerta('Ingrese su nombre de usuario', 'error');
        return;
      }
      iniciarSesion(rol, credenciales.usuario);
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={(e) => handleLogin(e, 'administrativo')}
              className="boton boton-primario boton-completo"
            >
              <User size={20} />
              Acceder como Administrativo
            </button>
            <button
              onClick={(e) => handleLogin(e, 'matrona')}
              className="boton boton-secundario boton-completo"
            >
              <FileText size={20} />
              Acceder como Matrona
            </button>
            <button
              onClick={(e) => handleLogin(e, 'medico')}
              className="boton boton-completo"
              style={{ backgroundColor: '#7c3aed', color: 'white' }}
            >
              <FileText size={20} />
              Acceder como Médico
            </button>
                        <button
              onClick={(e) => handleLogin(e, 'enfermera')}
              className="boton boton-completo"
              style={{ backgroundColor: '#00bddfff', color: 'white' }}
            >
              <User size={20} />
              Acceder como Enfermera
            </button>
                        <button
              onClick={(e) => handleLogin(e, 'admin_sistema')}
              className="boton boton-completo"
              style={{ backgroundColor: '#5d00ffff', color: 'white' }}
            >
              <User size={20} />
              Acceder como Administrador del Sistema
            </button>
          </div>
          
          <p className="texto-xs texto-gris texto-centro mt-4">
            Demo v1.0 - Autenticación simulada para pruebas UAT
          </p>
        </div>
      </div>
    );
  };

  // Dashboard principal
  const Dashboard = () => {
    const partosHoy = partos.filter(p => {
      const hoy = new Date().toISOString().split('T')[0];
      return p.fecha === hoy;
    });
    const partosRecientes = partosFiltrados.slice(-10).reverse();
    
    return (
      <div className="animacion-entrada">
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

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="tarjeta tarjeta-hover">
            <div className="flex justify-between items-center">
              <div>
                <p className="texto-sm texto-gris">Madres Registradas</p>
                <p className="texto-3xl font-bold" style={{ color: '#2563eb' }}>{madres.length}</p>
              </div>
              <User size={48} color="#2563eb" />
            </div>
          </div>
          
          <div className="tarjeta tarjeta-hover">
            <div className="flex justify-between items-center">
              <div>
                <p className="texto-sm texto-gris">Partos Totales</p>
                <p className="texto-3xl font-bold" style={{ color: '#10b981' }}>{partos.length}</p>
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

        {/* Tabla de RN hospitalizados con código de colores */}
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Recién Nacidos Hospitalizados</h2>
          {partosRecientes.length === 0 ? (
            <p className="texto-centro texto-gris py-6">No hay partos registrados</p>
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
                    {usuario.rol !== 'administrativo' && (
                      <>
                        <th>Peso</th>
                        <th>APGAR</th>
                      </>
                    )}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partosRecientes.map(parto => {
                    const madre = madres.find(m => m.id === parto.madreId);
                    const diasHospitalizacion = calcularDiasHospitalizacion(parto.fechaIngreso);
                    const esAlerta = diasHospitalizacion > 7;
                    
                    return (
                      <tr 
                        key={parto.id}
                        style={{ 
                          backgroundColor: esAlerta ? '#fee2e2' : 'transparent'
                        }}
                      >
                        <td className="font-semibold">{parto.rnId}</td>
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
                        {usuario.rol !== 'administrativo' && (
                          <>
                            <td>{parto.pesoRN}g</td>
                            <td>{parto.apgar1}/{parto.apgar5}</td>
                          </>
                        )}
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' 
                          }}>
                            {usuario.rol !== 'administrativo' && (
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
  )}

  {usuario.rol === 'administrativo' && (
    <button
      onClick={() => setVistaPreviaMadre(madre)}
      className="boton"
      style={{
        padding: '0.5rem',
        backgroundColor: '#6366f1',
        color: 'white'
      }}
      title="Vista previa de la madre"
    >
      <Eye size={18} />
    </button>
  )}
  {usuario.rol === 'administrativo' ? (
    <button
      onClick={() => {
        setMadreSeleccionada(madre); // o madres.find(...) según tu lógica
        setPantallaActual('editar-madre');
      }}
      className="boton"
      style={{
        padding: '0.5rem',
        backgroundColor: '#f59e0b', // Ejemplo color diferente para distinguir la acción administrativa
        color: 'white'
      }}
      title="Actualizar información de la madre"
    >
      <User size={18} />
    </button>
  ) : (
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

        {/* Lista de madres sin parto registrado */}
        {usuario.rol === 'matrona' && (
          <div className="tarjeta mt-6">
            <h3 className="texto-xl font-bold mb-4">Madres sin Parto Registrado</h3>
            {madres.filter(madre => !partos.some(p => p.madreId === madre.id)).length === 0 ? (
              <p className="texto-centro texto-gris py-4">Todas las madres tienen partos registrados</p>
            ) : (
              <div className="grid gap-3">
                {madres.filter(madre => !partos.some(p => p.madreId === madre.id)).map(madre => (
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
            type="number"
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

  // Formulario de registro de parto con MEJORAS UAT
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
          
          {/* MEJORA UAT: Tooltips en APGAR */}
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

        {/* MEJORA UAT: Campo de Corticoides */}
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
              
              {(usuario?.rol === 'medico') && (
              <button 
              onClick={() => setPantallaActual('reporteREM')}
              className='boton'
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <FileText size={18} />
                  Reporte REM Neonatal
              </button>
              )}
              
              {(usuario?.rol === 'administrativo' || usuario?.rol === 'matrona') && (
                <button
                  onClick={() => setPantallaActual('admision')}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <User size={20} />
                  Nueva Admisión
                </button>
              )}

              {(usuario?.rol === 'enfermera') && (
                <button
                  onClick={() => setPantallaActual('notas-enfermera')}
                  className="boton"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <User size={20} />
                  Notas Enfermera
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
        {/* Aquí agregas la tabla ade auditoría */}
        <h2>Historial de Auditoría</h2>
        <TablaAuditoria />
      </>
    )}
    {pantallaActual === 'editar-madre' && madreSeleccionada && (
      <EditarMadre
        madre={madreSeleccionada}
        onGuardar={datosActualizados => {
          // Actualiza la madre en el estado de madres
          setMadres(madres.map(m =>
            m.id === madreSeleccionada.id ? { ...m, ...datosActualizados } : m
          ));
          setMadreSeleccionada(null);
          setPantallaActual('dashboard');
          mostrarAlerta('Datos actualizados correctamente', 'success');
        }}
        onCancelar={() => {
          setMadreSeleccionada(null);
          setPantallaActual('dashboard');
        }}
      />
    )}

    {pantallaActual === 'reporteREM' && <ReporteREM partos={partos} madres={madres} />}
    {pantallaActual === 'admision' && <FormularioAdmision />}
    {pantallaActual === 'registrar-parto' && <FormularioParto />}
    {pantallaActual === 'notas-enfermera' && usuario.rol === 'enfermera' && (
  <NotasEnfermera
    notas={notasEnfermera}
    setNotas={setNotasEnfermera}
    usuario={usuario}
  />
)}

  </Layout>
);
};


export default App;