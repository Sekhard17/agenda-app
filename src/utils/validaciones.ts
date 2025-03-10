/**
 * Valida un RUT chileno
 * @param rut RUT en formato 12345678-9 o 12.345.678-9
 * @returns boolean indicando si el RUT es válido
 */
export const validarRut = (rut: string): boolean => {
  // Eliminar puntos y guiones
  const rutLimpio = rut.replace(/[.-]/g, '')
  
  // Verificar longitud mínima
  if (rutLimpio.length < 2) {
    return false
  }
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1).toUpperCase()
  
  // Validar que el cuerpo solo contenga números
  if (!/^\d+$/.test(cuerpo)) {
    return false
  }
  
  // Calcular dígito verificador
  let suma = 0
  let multiplicador = 2
  
  // Recorrer el cuerpo de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  
  const dvEsperado = 11 - (suma % 11)
  let dvCalculado: string
  
  if (dvEsperado === 11) {
    dvCalculado = '0'
  } else if (dvEsperado === 10) {
    dvCalculado = 'K'
  } else {
    dvCalculado = dvEsperado.toString()
  }
  
  // Comparar dígito verificador calculado con el proporcionado
  return dv === dvCalculado
}

/**
 * Formatea un RUT chileno
 * @param rut RUT sin formato
 * @returns RUT formateado (12.345.678-9)
 */
export const formatearRut = (rut: string): string => {
  // Eliminar puntos y guiones
  const rutLimpio = rut.replace(/[.-]/g, '')
  
  if (rutLimpio.length < 2) {
    return rutLimpio
  }
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  
  // Formatear cuerpo con puntos
  let rutFormateado = ''
  let contador = 0
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    rutFormateado = cuerpo[i] + rutFormateado
    contador++
    
    if (contador === 3 && i !== 0) {
      rutFormateado = '.' + rutFormateado
      contador = 0
    }
  }
  
  // Agregar guión y dígito verificador
  return rutFormateado + '-' + dv
}

/**
 * Valida un correo electrónico
 * @param email Correo electrónico a validar
 * @returns boolean indicando si el correo es válido
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida que una cadena no esté vacía
 * @param valor Cadena a validar
 * @returns boolean indicando si la cadena no está vacía
 */
export const noVacio = (valor: string): boolean => {
  return valor.trim().length > 0
}

/**
 * Valida que una cadena tenga al menos cierta longitud
 * @param valor Cadena a validar
 * @param longitud Longitud mínima requerida
 * @returns boolean indicando si la cadena cumple con la longitud mínima
 */
export const longitudMinima = (valor: string, longitud: number): boolean => {
  return valor.length >= longitud
}
