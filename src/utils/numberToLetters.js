/**
 * Convierte un número en formato moneda a texto en español
 * Ejemplo: 423.40 -> "CUATROCIENTOS VEINTITRÉS PESOS 40/100 M.N."
 */
export function numeroALetras(monto) {
  if (isNaN(monto) || monto === null) return 'CERO PESOS 00/100 M.N.'

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
  const decenas = [
    '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
    'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ]
  const especiales = {
    11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
    16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
    21: 'VEINTIÚN', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
    25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
  }
  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ]

  const partes = Number(monto).toFixed(2).split('.')
  let entero = parseInt(partes[0], 10)
  const centavos = partes[1] || '00'

  if (entero === 0) {
    return `CERO PESOS ${centavos}/100 M.N.`
  }

  function convertirGrupo(n) {
    let salida = ''
    if (n === 100) return 'CIEN'
    if (n > 99) {
      salida += centenas[Math.floor(n / 100)] + ' '
      n %= 100
    }
    if (n > 0) {
      if (especiales[n]) {
        salida += especiales[n] + ' '
      } else if (n < 10) {
        salida += unidades[n] + ' '
      } else {
        const dec = Math.floor(n / 10)
        const uni = n % 10
        if (uni === 0) {
          salida += decenas[dec] + ' '
        } else {
          salida += decenas[dec] + ' Y ' + unidades[uni] + ' '
        }
      }
    }
    return salida.trim()
  }

  let resultado = ''

  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000)
    resultado += (millones === 1 ? 'UN MILLÓN ' : convertirGrupo(millones) + ' MILLONES ')
    entero %= 1000000
  }

  if (entero >= 1000) {
    const miles = Math.floor(entero / 1000)
    resultado += (miles === 1 ? 'MIL ' : convertirGrupo(miles) + ' MIL ')
    entero %= 1000
  }

  if (entero > 0) {
    resultado += convertirGrupo(entero) + ' '
  }

  const textoPesos = parseInt(partes[0], 10) === 1 ? 'PESO' : 'PESOS'
  return `${resultado.trim()} ${textoPesos} ${centavos}/100 M.N.`
}
