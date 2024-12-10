export const ENUM_PERMISSIONS = [
  { id: 'list', name: 'LIST' },
  { id: 'create', name: 'CREATE' },
  { id: 'edit', name: 'EDIT' },
  { id: 'delete', name: 'DELETE' },
  { id: 'show', name: 'SHOW' },
]

export const ENUM_STATUS = [
  { id: 'ACTIVE', name: 'ACTIVO' },
  { id: 'INACTIVE', name: 'INACTIVO' },
]

// PRE_RESERVE, CONFIRMED, ATTENDED, CANCEL,PENDING_PAY,REJECTED,APPROVED, PENDING
export const ENUM_STATUS_FILTER = [
  { id: 'PRE_RESERVE', name: 'PRE RESERVADA' },
  { id: 'RESERVED', name: 'RESERVADA' },
  { id: 'PENDING', name: 'PENDIENTE' },
  { id: 'PENDING_PAY', name: 'PENDIENTE DE PAGO' },
  { id: 'PAYMENT', name: 'PAGADA' },
  { id: 'REJECTED', name: 'RECHAZADA' },
  { id: 'CONFIRMED', name: 'CONFIRMADA' },
  { id: 'ATTENDED', name: 'ATENDIDA' },
  { id: 'CANCEL', name: 'CANCELADA' },
]

export const ENUM_REPORT_TYPE = [
  { id: 'TEMPLATES', name: 'PLANTILLA' },
  { id: 'REPORT', name: 'REPORTE' },
]

export const ENUM_ROUTEOFADMINISTRATIONS = [
  { id: 'ORAL', name: 'ORAL' },
  { id: 'INTRAVENOUS', name: 'INTRAVENOUS' },
  { id: 'INTRAMUSCULAR', name: 'INTRAMUSCULAR' },
  { id: 'SUBCUTANEOUS', name: 'SUBCUTANEOUS' },
  { id: 'TOPICAL', name: 'TOPICAL' },
  { id: 'INHALATION', name: 'INHALATION' },
  { id: 'RECTAL', name: 'RECTAL' },
  { id: 'SUBLINGUAL', name: 'SUBLINGUAL' },
  { id: 'TRANSDERMAL', name: 'TRANSDERMAL' },
  { id: 'NASAL', name: 'NASAL' },
  { id: 'OPHTHALMIC', name: 'OPHTHALMIC' },
]

export const ENUM_USER_TYPE = [
  { id: 'DOCTORS', name: 'DOCTOR' },
  { id: 'ASSISTANTS', name: 'ASISTENTE' },
  { id: 'PATIENTS', name: 'PACIENTE' },
  { id: 'SYSTEM', name: 'SISTEMA' },
]

export const ENUM_GUIDE = [
  { id: 'GUIDE', name: 'GUIAS' },
  { id: 'VIDEO', name: 'VIDEOS' },
  { id: 'PODCAST', name: 'PODCAST' },
]

export const ENUM_GENDER = [
  { id: 'MALE', name: 'MASCULINO' },
  { id: 'FEMALE', name: 'FEMENINO' },
  { id: 'OTHER', name: 'OTRO' },
]

export const ENUM_DISABILITY_TYPE = [
  { id: 'PHYSICAL', name: 'FÍSICA' },
  { id: 'INTELLECTUAL', name: 'INTELECTUAL' },
  { id: 'VISUAL', name: 'VISUAL' },
  { id: 'HEARING', name: 'AUDITIVA' },
  { id: 'PSYCHOSOCIAL', name: 'PSICOSOCIAL' },
  { id: 'NEURODIVERSITY', name: 'NEURODIVERSIDAD' },
  { id: 'SPEECH', name: 'HABLA' },
  { id: 'LEARNING', name: 'APRENDIZAJE' },
  { id: 'UNDEFINED', name: 'NA' },
]

export const ENUM_PROCEDURE_TYPE = [
  { id: 'IMAGING', name: 'IMAGEN' },
  { id: 'LAB_TESTS', name: 'PRUEBAS DE LABORATORIO' },
  { id: 'CARDIAC_NEURO', name: 'NEURO_CARDIACA' },
  { id: 'ENDOSCOPIC', name: 'ENDOSCÓPICA' },
  { id: 'ORGAN_SPECIFIC', name: 'ÓRGANO ESPECÍFICO' },
  { id: 'ALLERGY_SENSITIVITY', name: 'SENSIBILIDAD ALERGICA' },
  { id: 'OPHTHALMOLOGY', name: 'OFTALMOLOGÍA' },
]

export const ENUM_UM = [
  { id: 'MG', name: 'MILIGRAMOS' },
  { id: 'G', name: 'GRAMOS' },
  { id: 'UG', name: 'MICROGRAMOS' },
  { id: 'ML', name: 'MILILITROS' },
  { id: 'IU', name: 'UNIDADES INTERNACIONALES' },
  { id: 'PERCENTAGE', name: 'PORCENTAJE' },
  { id: 'L', name: 'LITROS' },
  { id: 'DROPS', name: 'GOTAS' },
  { id: 'PUFFS', name: 'PUFFS' },
  { id: 'TABLETS', name: 'TABLETAS' }

]

export const ENUM_DAY_OF_WEEK = [
  { id: 'MONDAY', name: 'LUNES' },
  { id: 'TUESDAY', name: 'MARTES' },
  { id: 'WEDNESDAY', name: 'MIÉRCOLES' },
  { id: 'THURSDAY', name: 'JUEVES' },
  { id: 'FRIDAY', name: 'VIERNES' },
  { id: 'SATURDAY', name: 'SÁBADO' },
  { id: 'SUNDAY', name: 'DOMINGO' },
]

export const ENUM_LANGUAGE = [
  { id: 'Español', name: 'Español' },
  { id: 'Ingles', name: 'Ingles' },
]

export const ENUM_DURATION_OF_CITE = [
  { id: '1', name: '15 MIN', value: 15, um: 'MIN' },
  { id: '2', name: '30 MIN', value: 30, um: 'MIN' },
  { id: '3', name: '45 MIN', value: 45, um: 'MIN' },
  { id: '4', name: '60 MIN', value: 60, um: 'MIN' },
  { id: '5', name: '1.5 H', value: 90, um: 'H' },
  { id: '6', name: '2 H', value: 120, um: 'H' },
  { id: '7', name: '2.5 H', value: 150, um: 'H' },
  { id: '8', name: '3 H', value: 180, um: 'H' },
]

export const ENUM_REPEAT = [
  { id: 'DAILY', name: 'DIAMENTE' },
  { id: 'WEEKLY', name: 'SEMANALMENTE' },
  { id: 'MONTHLY', name: 'MENSUALMENTE' },
]

export const ENUM_HOURS = [
  { id: '08:00am', name: '08:00am' },
  { id: '08:30am', name: '08:30am' },
  { id: '09:00am', name: '09:00am' },
  { id: '09:30am', name: '09:30am' },
  { id: '10:00am', name: '10:00am' },
  { id: '10:30am', name: '10:30am' },
  { id: '11:00am', name: '11:00am' },
  { id: '11:30am', name: '11:30am' },
  { id: '12:00pm', name: '12:00pm' },
  { id: '12:30pm', name: '12:30pm' },
  { id: '01:00pm', name: '01:00pm' },
  { id: '01:30pm', name: '01:30pm' },
  { id: '02:00pm', name: '02:00pm' },
  { id: '02:30pm', name: '02:30pm' },
  { id: '03:00pm', name: '03:00pm' },
  { id: '03:30pm', name: '03:30pm' },
  { id: '04:00pm', name: '04:00pm' },
  { id: '04:30pm', name: '04:30pm' },
  { id: '05:00pm', name: '05:00pm' },
  { id: '05:30pm', name: '05:30pm' },
  { id: '06:00pm', name: '06:00pm' },
  { id: '06:30pm', name: '06:30pm' },
  { id: '07:00pm', name: '07:00pm' },
  { id: '07:30pm', name: '07:30pm' },
  { id: '08:00pm', name: '08:00pm' },
  { id: '08:30pm', name: '08:30pm' },
  { id: '09:00pm', name: '09:00pm' },
  { id: '09:30pm', name: '09:30pm' },
  { id: '10:00pm', name: '10:00pm' },
  { id: '10:30pm', name: '10:30pm' },
  { id: '11:00pm', name: '11:00pm' },
  { id: '11:30pm', name: '11:30pm' },
  { id: '12:00am', name: '12:00am' },
  { id: '12:30am', name: '12:30am' },
  { id: '01:00am', name: '01:00am' },
  { id: '01:30am', name: '01:30am' },
  { id: '02:00am', name: '02:00am' },
  { id: '02:30am', name: '02:30am' },
  { id: '03:00am', name: '03:00am' },
  { id: '03:30am', name: '03:30am' },
  { id: '04:00am', name: '04:00am' },
  { id: '04:30am', name: '04:30am' },
  { id: '05:00am', name: '05:00am' },
  { id: '05:30am', name: '05:30am' },
  { id: '06:00am', name: '06:00am' },
  { id: '06:30am', name: '06:30am' },
  { id: '07:00am', name: '07:00am' },
  { id: '07:30am', name: '07:30am' },
  { id: '08:00am', name: '08:00am' },
]

export const ENUM_PRIORITY = [
  { id: 'LOW', name: 'BAJA' },
  { id: 'MEDIUM', name: 'MEDIA' },
  { id: 'HIGH', name: 'ALTA' },
]
