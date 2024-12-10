import dayjs from 'dayjs'

export function esURLValida(url: string) {
  // Expresión regular para validar una URL que comienza con http o https
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/

  return urlRegex.test(url)
}

export function isValidURL(url: string) {
  try {
    new URL(url)
    return true
  }
  catch (error) {
    return false
  }
}

export function esURLValidaNotRequired(url: string) {
  // Expresión regular para validar una URL que comienza con http o https
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/

  return url ? urlRegex.test(url) : true
}

export function onlyLetters(value: string) {
  return /^[A-Za-z]+$/.test(value)
}

export function validUrl(value: string) {
  if (!(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value))) { return 'Por favor, ingresa una url válida' }
}
export function validEmail(value: string) {
  if (!(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))) { return 'Por favor, ingresa una dirección de correo electrónico válida' }
}
export function maxLength(value: string, cant: number) {
  if (value && value.length > Number(cant)) {
    return `Este campo no puede tener más de ${cant} caracteres`
  }
}

export function minLength(value: string, cant: number) {
  if (value && value.length < Number(cant)) {
    return `Este campo debe tener al menos ${cant} caracteres`
  }
}

export function onlyNumbers(value: string) {
  if (!(/^\d+$/.test(value))) { return 'Este campo solo admite números.' }
}

export function onlyAlphanumeric(value: string) {
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return 'Este campo solo admite letras y números.'
  }
  return null
}

export function validLatitud(value: string) {
  if (!(/^(\+|-)?(?:90(\.0{1,6})?|(?:[1-8]?\d(\.\d{1,6})?))$/.test(value))) { return 'Ingresa una latitud válida.' }
}

export function validLongitud(value: string) {
  if (!(/^(\+|-)?(?:180(\.0{1,6})?|(?:1[0-7]\d(\.\d{1,6})?|(?:[1-9]?\d(\.\d{1,6})?)))$/.test(value))) { return 'Ingresa una longitud válida.' }
}

export function generatePassword(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|\\:;<>,.?/~'
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length))
    password += randomCharacter
  }

  return password
}

export function onlyLettersCommasAndHyphens(value: string) {
  return /^(?!.*(?:^|,|-)[,-]|.*(?:,|-)$)[\p{L}\s]+(?:[,-][\p{L}\s]+)*$/u.test(value)
}

export function onlyLettersWithSpacesAndAccents(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ]+( [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(value)
}

export function validateUSPhoneNumber(phoneNumber: string) {
  // Eliminar todos los caracteres que no sean dígitos
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Verificar si el número limpio tiene 10 o 12 dígitos
  const isValidLength = cleaned.length === 10 || cleaned.length === 12

  // Verificar si el número comienza con 0, 1 o +1
  const isValidPrefix = /^(0|1|\+1)/.test(cleaned)

  // Retornar true si el número cumple con los criterios, false en caso contrario
  return isValidLength && isValidPrefix
}

export function validatePhoneNumber(phoneNumber: string) {
  if (phoneNumber === '' || phoneNumber === null) {
    return true
  }
  else {
    // Eliminar todos los caracteres que no sean dígitos
    const cleaned = phoneNumber.replace(/\D/g, '')

    // Verificar si el número limpio tiene de 10 a 12 dígitos
    const isValidLength = cleaned.length >= 10 && cleaned.length <= 12

    // Verificar si el número comienza con "+" o no
    const isValidPrefix = /^\+?\d{10,12}$/.test(cleaned)

    // Retornar true si el número cumple con los criterios, false en caso contrario
    return isValidLength && isValidPrefix
  }
}

export function convertOneDate(date: (string | Date)): Date | void {
  if (date) {
    if (typeof date === 'string') {
      return new Date(`${date}T00:00:00`)
    }
    else if (date instanceof Date) {
      return date
    }
    else {
      console.error('El elemento no es una fecha válida:', date)
    }
  }
}

export function convertDates(arrayDates: (string | Date)[]): Date[] {
  let arrayConvertedDate: Date[] = []

  for (const date of arrayDates) {
    if (typeof date === 'string') {
      const convertedDate = new Date(`${date}T00:00:00`)
      arrayConvertedDate = [...arrayConvertedDate, convertedDate]
    }
    else if (date instanceof Date) {
      arrayConvertedDate = [...arrayConvertedDate, date]
    }
    else {
      console.error('El elemento del array no es una fecha válida:', date)
    }
  }
  return arrayConvertedDate
}

export function filterDatesByMonth(arrayDates: (string | Date)[]): Date[] {
  const temporalDates = []
  const monthsSet = new Set<number>()

  for (const dateStr of arrayDates) {
    const date = dayjs(dateStr)
    const month = date.month() + 1 // Sumamos 1 para ajustar el índice del mes

    if (!monthsSet.has(month)) {
      monthsSet.add(month)

      // Agregar todas las fechas del mes al array temporal
      const daysInMonth = date.daysInMonth()
      const firstDayOfMonth = date.startOf('month')

      for (let i = 0; i < daysInMonth; i++) {
        temporalDates.push(firstDayOfMonth.add(i, 'day').format('YYYY-MM-DD'))
      }
    }
  }
  // Filtra las fechas del array temporal que no están presentes en fechasMesActual
  const filteredTemporalDates = temporalDates.filter(date => !arrayDates.includes(date)) || []

  return convertDates(filteredTemporalDates)
}

export function convertFromByteToKBOrMB(sizeInBytes: number) {
  // Definimos las constantes para los valores de 1 KB y 1 MB
  const BYTES_POR_KB = 1024
  const BYTES_POR_MB = 1024 * 1024

  // Comprobar si el tamaño en bytes es mayor o igual a 1 MB
  if (sizeInBytes >= BYTES_POR_MB) {
    // Convertir el tamaño a MB y redondear a 2 decimales
    const sizeInMB = sizeInBytes / BYTES_POR_MB
    return `${sizeInMB.toFixed(2)} MB`
  }
  else {
    // Convertir el tamaño a KB y redondear a 2 decimales
    const sizeInKB = sizeInBytes / BYTES_POR_KB
    return `${sizeInKB.toFixed(2)} KB`
  }
}
