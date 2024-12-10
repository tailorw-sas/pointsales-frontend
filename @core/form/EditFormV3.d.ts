import type { z } from 'zod'

export declare type FieldDefinitionType = FieldDefinition
export declare type ValidationErrorType = ValidationError

interface FieldDefinition {
  field: string
  dataType: string | null
  header?: string | Function
  footer?: string | null
  style?: any
  class?: any
  headerStyle?: any | null
  headerClass?: any | null
  footerStyle?: any | null
  footerClass?: any | null
  errorClass?: any | null
  containerFieldClass?: any | null
  showClearButton?: boolean | null
  maxConstraints?: number | null
  hidden?: boolean
  disabled?: boolean
  toUppercase?: boolean
  toCapitalize?: boolean
  placeholder?: string | null | undefined
  mask?: string
  validation?: z.ZodTypeAny
  rowsTextarea?: number
  backendValidation?: Array<ValidationErrorType>
  onUpdate?: (value: any) => void
}

interface ValidationError {
  [key: string]: string[]
}
