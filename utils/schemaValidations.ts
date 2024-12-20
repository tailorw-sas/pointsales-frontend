import { z } from 'zod'

interface FieldProperty {
  id: string
  name: string
  status: string
}
function isActive(value: FieldProperty | null) {
  if (!value) {
    return true
  }
  else {
    return value.status === 'ACTIVE'
  }
}

const stringSchemaMerchant = z.string().refine(value => typeof value !== 'string', { message: 'Select a merchant' })
const objectSchemaMerchant = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'The status must be either ACTIVE or INACTIVE' })
}).nullable()
  .refine(value => value && value.id && value.name, { message: 'The merchant field is required' })
  .refine(value => isActive(value), {
    message: 'This merchant is not active'
  })

export const merchantSchema = z.union([stringSchemaMerchant, objectSchemaMerchant])

const objectSchemaCreditCardType = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'The status must be either ACTIVE or INACTIVE' })
}).nullable()
  .refine(value => value && value.id && value.name, { message: 'The credit card type field is required' })
  .refine(value => isActive(value), {
    message: 'This credit card type is not active'
  })

export const creditCardTypeSchema = objectSchemaCreditCardType

const objectSchemaLanguage = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'The language must be either ACTIVE or INACTIVE' })
}).nullable()
  .refine(value => value && value.id && value.name, { message: 'The language field is required' })
  .refine(value => isActive(value), {
    message: 'This language is not active'
  })

export const languageSchema = objectSchemaLanguage

export function validateEntityStatus(fieldName: string) {
  return z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE'], { message: `The ${fieldName} must be either ACTIVE or INACTIVE` })
  }).nullable()
    .refine(value => value && value.id && value.name, { message: `The ${fieldName} field is required` })
    .refine(value => isActive(value), {
      message: `This ${fieldName} is not active`
    })
}
export function validateEntitiesForSelectMultiple(fieldName: string) {
  const entitySchema = z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE'], { message: `The ${fieldName} must be either ACTIVE or INACTIVE` })
  })

  return z.array(
    entitySchema.nullable()
      .refine(value => value && value.id && value.name, { message: `The ${fieldName} field is required` })
      .refine(value => value === null || isActive(value), {
        message: `This ${fieldName} has inactive elements`
      })
  )
}
