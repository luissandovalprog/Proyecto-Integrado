// Validaciones del sistema

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT en formato XX.XXX.XXX-X o XXXXXXXX-X
 * @returns {boolean} - true si el RUT es válido
 */
export const validarRUT = (rut) => {
    if (!rut || typeof rut !== 'string') return false;
    
    // Limpiar el RUT de puntos y guiones
    const rutLimpio = rut.replace(/[.-]/g, '');
    
    // Verificar longitud mínima
    if (rutLimpio.length < 8) return false;
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toLowerCase();
    
    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(cuerpo)) return false;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : dvEsperado.toString();
    
    return dv === dvFinal;
  };
  
  /**
   * Formatea un RUT con puntos y guión
   * @param {string} rut - RUT sin formato
   * @returns {string} - RUT formateado
   */
  export const formatearRUT = (rut) => {
    if (!rut) return '';
    
    // Limpiar el RUT
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length < 2) return rutLimpio;
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Agregar puntos al cuerpo
    let cuerpoFormateado = '';
    let contador = 0;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      if (contador === 3) {
        cuerpoFormateado = '.' + cuerpoFormateado;
        contador = 0;
      }
      cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
      contador++;
    }
    
    return `${cuerpoFormateado}-${dv}`;
  };
  
  /**
   * Valida que un campo no esté vacío
   * @param {any} valor - Valor a validar
   * @returns {boolean}
   */
  export const campoRequerido = (valor) => {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    return true;
  };
  
  /**
   * Valida que un número esté en un rango
   * @param {number} valor - Valor a validar
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @returns {boolean}
   */
  export const validarRango = (valor, min, max) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  };
  
  /**
   * Valida una fecha
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {boolean}
   */
  export const validarFecha = (fecha) => {
    if (!fecha) return false;
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date);
  };
  
  /**
   * Valida que una fecha no sea futura
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {boolean}
   */
  export const validarFechaNoFutura = (fecha) => {
    if (!validarFecha(fecha)) return false;
    const fechaIngresada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fechaIngresada <= hoy;
  };
  
  /**
   * Valida formato de email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  export const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  /**
   * Valida peso de recién nacido
   * @param {number} peso - Peso en gramos
   * @returns {object} - { valido, mensaje }
   */
  export const validarPesoRN = (peso) => {
    const pesoNum = parseFloat(peso);
    
    if (isNaN(pesoNum)) {
      return { valido: false, mensaje: 'El peso debe ser un número' };
    }
    
    if (pesoNum < 500) {
      return { valido: false, mensaje: 'Peso muy bajo (mínimo 500g)' };
    }
    
    if (pesoNum > 6000) {
      return { valido: false, mensaje: 'Peso muy alto (máximo 6000g)' };
    }
    
    return { valido: true, mensaje: '' };
  };
  
  /**
   * Valida talla de recién nacido
   * @param {number} talla - Talla en centímetros
   * @returns {object} - { valido, mensaje }
   */
  export const validarTallaRN = (talla) => {
    const tallaNum = parseFloat(talla);
    
    if (isNaN(tallaNum)) {
      return { valido: false, mensaje: 'La talla debe ser un número' };
    }
    
    if (tallaNum < 30) {
      return { valido: false, mensaje: 'Talla muy baja (mínimo 30cm)' };
    }
    
    if (tallaNum > 70) {
      return { valido: false, mensaje: 'Talla muy alta (máximo 70cm)' };
    }
    
    return { valido: true, mensaje: '' };
  };
  
  /**
   * Valida puntuación APGAR
   * @param {number} apgar - Puntuación APGAR (0-10)
   * @returns {boolean}
   */
  export const validarAPGAR = (apgar) => {
    const apgarNum = parseInt(apgar);
    return !isNaN(apgarNum) && apgarNum >= 0 && apgarNum <= 10;
  };