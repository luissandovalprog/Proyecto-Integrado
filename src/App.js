import React, { useState, useEffect } from 'react';
import { FileText, User, Baby, Printer, LogOut, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { generarBrazaletePDF } from './utilidades/generarPDF';
import { validarRUT } from './servicios/validaciones';
import { datosMock } from './mocks/datos';

const App = () => {
  // Estados globales
  const [usuario, setUsuario] = useState(null);
  const [pantallaActual, setPantallaActual] = useState('login');
  const [madres, setMadres] = useState(datosMock.madres);
  const [partos, setPartos] = useState(datosMock.partos);
  const [madreSeleccionada, setMadreSeleccionada] = useState(null);
  const [ultimaSesion, setUltimaSesion] = useState(Date.now());
  const [alerta, setAlerta] = useState(null);

  // Control de timeout de sesión (30 minutos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (usuario && Date.now() - ultimaSesion > 30 * 60 * 1000) {
        mostrarAlerta('Sesión expirada por inactividad', 'error');
        cerrarSesion();
      }
    }, 60000); // Revisar cada minuto

    return () => clearInterval(intervalo);
  }, [usuario, ultimaSesion]);

  // Actualizar actividad del usuario
  const actualizarActividad = () => {
    setUltimaSesion(Date.now());
  };

  useEffect(() => {
    if (usuario) {
      window.addEventListener('click', actualizarActividad);
      window.addEventListener('keypress', actualizarActividad);
      
      return () => {
        window.removeEventListener('click', actualizarActividad);
        window.removeEventListener('keypress', actualizarActividad);
      };
    }
  }, [usuario]);

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
    
    setMadres([...madres, nuevaMadre]);
    mostrarAlerta('Madre registrada exitosamente', 'success');
    setPantallaActual('dashboard');
  };

  const registrarParto = (datos) => {
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
      registradoPor: usuario.nombre
    };
    
    setPartos([...partos, nuevoParto]);
    mostrarAlerta('Parto registrado exitosamente', 'success');
    setPantallaActual('dashboard');
    setMadreSeleccionada(null);
  };

  const imprimirBrazalete = (parto) => {
    const madre = madres.find(m => m.id === parto.madreId);
    generarBrazaletePDF(parto, madre);
    mostrarAlerta('Brazalete generado correctamente', 'success');
  };

  // ============== COMPONENTES ==============

  // Alerta flotante
  const AlertaFlotante = ({ mensaje, tipo }) => {
    const iconos = {
      success: <CheckCircle size={20} />,
      error: <AlertCircle size={20} />,
      info: <AlertCircle size={20} />
    };

    const estilos = {
      success: 'alerta-exito',
      error: 'alerta-error',
      info: 'alerta-info'
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
            <h1 className="texto-3xl font-bold mb-4">Sistema de Partos</h1>
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
          </div>
          
          <p className="texto-xs texto-gris texto-centro mt-4">
            Demo v1.0 - Autenticación simulada para pruebas
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
    const partosRecientes = partos.slice(-5).reverse();
    
    return (
      <div className="animacion-entrada">
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

        {/* Tabla de partos recientes */}
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Partos Recientes</h2>
          {partosRecientes.length === 0 ? (
            <p className="texto-centro texto-gris py-6">No hay partos registrados</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID Recién Nacido</th>
                    <th>Madre</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    {usuario.rol !== 'administrativo' && (
                      <>
                        <th>Peso (g)</th>
                        <th>APGAR</th>
                      </>
                    )}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partosRecientes.map(parto => {
                    const madre = madres.find(m => m.id === parto.madreId);
                    return (
                      <tr key={parto.id}>
                        <td className="font-semibold">{parto.rnId}</td>
                        <td>{madre?.nombre || 'N/A'}</td>
                        <td>{new Date(parto.fecha).toLocaleDateString('es-CL')}</td>
                        <td>{parto.hora}</td>
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
                          <button
                            onClick={() => imprimirBrazalete(parto)}
                            className="boton"
                            style={{ 
                              padding: '0.5rem',
                              backgroundColor: '#3b82f6',
                              color: 'white'
                            }}
                            title="Imprimir Brazalete"
                          >
                            <Printer size={18} />
                          </button>
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
            />
            {errores.apgar5 && <p className="mensaje-error">{errores.apgar5}</p>}
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
            Registrar Parto
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
                <h1 className="texto-xl font-bold">Sistema de Partos - HHMM</h1>
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
        <p className="texto-sm">Sistema de Trazabilidad de Partos v1.0</p>
        <p className="texto-sm" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
          Hospital Clínico Herminda Martín - Chillán, Chile
        </p>
        <p className="texto-xs" style={{ opacity: 0.6, marginTop: '0.5rem' }}>
          Proyecto Integrado - Ingeniería en Ciberseguridad
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
      {pantallaActual === 'dashboard' && <Dashboard />}
      {pantallaActual === 'admision' && <FormularioAdmision />}
      {pantallaActual === 'registrar-parto' && <FormularioParto />}
    </Layout>
  );
};

export default App;