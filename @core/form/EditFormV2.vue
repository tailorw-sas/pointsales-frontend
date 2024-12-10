// EditForm.vue

<script setup lang="ts">
import { usePrimeVue } from 'primevue/config'
import { ZodString, type ZodStringCheck, type ZodTypeAny } from 'zod'
import type { IFileMetadata } from '../fields/interfaces/IFieldInterfaces'
import type { FieldDefinitionType } from './EditFormV2'

const props = defineProps<{
  fields: Array<FieldDefinitionType>
  item: any
  loadingSave?: boolean
  showActions?: boolean
  forceSave?: boolean
}>()

const emit = defineEmits(['update:field', 'clearField', 'submit', 'forceSave', 'cancel'])
const $primevue = usePrimeVue()
const fieldValues = reactive<{ [key: string]: any }>({})
const errors = reactive<{ [key: string]: string[] }>({})
const objFile = ref<IFileMetadata | null>(null)

const localFiles = ref<File[]>([])

props.fields.forEach((field) => {
  if (typeof field.field === 'string') {
    fieldValues[field.field] = props.item[field.field]
  }
})

function updateField(fieldKey: string, value: any) {
  fieldValues[fieldKey] = value
  emit('update:field', { fieldKey, value })
  validateField(fieldKey, value)
}

function clearField(fieldKey: string) {
  fieldValues[fieldKey] = null
  emit('clearField', fieldKey)
}

function cancelForm() {
  emit('cancel')
}

function submitForm() {
  if (validateForm()) {
    emit('submit', { ...fieldValues })
  }
}

function hasMinValidation(validation?: ZodTypeAny): boolean {
  if (!validation || !(validation instanceof ZodString)) { return false }
  const checks = validation._def.checks || []
  return checks.some((check: any) => check.kind === 'min')
}

function getMaxValidation(validation?: ZodTypeAny): number | false {
  if (!validation || !(validation instanceof ZodString)) { return false }

  const checks: ZodStringCheck[] = validation._def.checks || []
  const maxCheck: ZodStringCheck | any = checks.find((check: any) => check.kind === 'max')

  if (maxCheck) {
    return maxCheck.value
  }
  else {
    return false
  }
}

// Files helpers
function formatSize(bytes: number) {
  const k = 1024
  const dm = 3
  const sizes = $primevue.config.locale?.fileSizeTypes || ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (bytes === 0) {
    return `0 ${sizes[0]}`
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const formattedSize = Number.parseFloat((bytes / k ** i).toFixed(dm))

  return `${formattedSize} ${sizes[i]}`
}

function onSelect(event: any) {
  localFiles.value = [...event.files]
}

function onRemove(event: any) {
  const index = localFiles.value.findIndex(file => file.name === event.file.name)
  if (index !== -1) {
    localFiles.value.splice(index, 1)
  }
}

function removeFile(index: number) {
  localFiles.value.splice(index, 1)
}

// ------------------------------------------------------------------------------

async function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result) // Elimina el prefijo 'data:image/png;base64,'
    }
    reader.onerror = error => reject(error)
  })
}

async function customBase64Uploader(event: any, listFields: any, fieldKey: any) {
  const file = event.files[0]
  objFile.value = file
  // fileObj.name = file.name
  // fileObj.size = convertFromByteToKBOrMB(file.size)
  // fileObj.type = file.type

  // const base64String = await fileToBase64(file)
  listFields[fieldKey] = file
}

function openFileUpload() {
  document.getElementById('btn-choose')?.click()
}
function clearFile(listField: any, fieldKey: any) {
  listField[fieldKey] = null
  objFile.value = null
  // fileObj.name = ''
  // fileObj.size = ''
}

function hasCustomValidation(validation?: ZodTypeAny): boolean {
  if (!validation || !(validation instanceof ZodString)) { return false }
  const refinements = validation._def.checks || []
  return refinements.some((refinement: any) => refinement.kind === 'refine' && refinement.message === 'This field is required')
}

function validateField(fieldKey: string, value: any) {
  const field = props.fields.find(f => f.field === fieldKey)
  if (field && field.validation) {
    const result = field.validation.safeParse(value)
    if (!result.success) {
      errors[fieldKey] = result.error.issues.map(e => e.message)
    }
    else {
      delete errors[fieldKey]
    }
  }
}

function validateForm() {
  let isValid = true
  props.fields.forEach((field) => {
    if (field.validation) {
      const result = field.validation.safeParse(fieldValues[field.field])
      if (!result.success) {
        isValid = false
        const messages = result.error.issues.map(e => e.message)
        errors[field.field] = messages
      }
      else {
        delete errors[field.field]
      }
    }
  })
  return isValid
}
</script>

<template>
  <div class="p-fluid formgrid grid p-4">
    <div
      v-for="(field, index) in fields" v-show="!field.hidden" :key="field.field || index" :style="field.style"
      :class="field.class"
    >
      <!-- Header slot -->
      <div v-if="field.header && field.dataType !== 'check'" :style="field.headerStyle" :class="field.headerClass">
        <slot :name="`header-${field.field}`" :field="field">
          {{ typeof field.header === 'function' ? field.header() : field.header }}
          <span v-if="field.class.includes('required')" class="p-error">*</span>
        </slot>
      </div>

      <!-- Field slot -->
      <div :class="field.containerFieldClass">
        <slot :name="`field-${field.field}`" :item="fieldValues" :field="field.field" :fields="fields" :on-update="updateField">
          <div v-if="field.dataType === 'image'" class="flex flex-wrap justify-content-center">
            <FileUpload hidden auto custom-upload accept="image/*" choose-label="Seleccione" cancel-label="Cancelar" :max-file-size="1000000" @uploader="customBase64Uploader($event, fieldValues, field.field)">
              <template #header="{ chooseCallback }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                  <div class="flex gap-2">
                    <Button id="btn-choose" class="p-2" icon="pi pi-images" rounded outlined @click="chooseCallback()" />
                  </div>
                </div>
              </template>
            </FileUpload>
            <div v-if="!loadingSave" class="border-2 surface-border border-round-xl border-400 p-1 flex align-items-center justify-content-center" style="width: 180px; height: 180px;">
              <i v-if="!fieldValues[field.field]" class="pi pi-image p-5 text-8xl text-400 border-400" />
              <div
                v-else
                class="relative bg-imagen border-round flex align-items-center justify-content-center"
                style="width: 100%; height: 100%;"
                :style="{ backgroundImage: `url(${typeof fieldValues[field.field] === 'string' ? fieldValues[field.field] : (fieldValues[field.field].hasOwnProperty('objectURL') ? fieldValues[field.field].objectURL : '')})`, backgroundSize: (objFile !== null && typeof objFile === 'object' && objFile.type === 'image/svg+xml') ? 'contain' : 'cover' }"
              />
            </div>
            <Skeleton v-else height="3rem" class="mb-2" />
            <div class="col-12">
              <div class="flex justify-content-center align-items-center my-2">
                <span>
                  <Button icon="pi pi-upload" class="ml-2" text @click="openFileUpload" />
                  <Button icon="pi pi-times" class="ml-2" severity="danger" :disabled="!objFile" text @click="clearFile(fieldValues, field.field)" />
                </span>
              </div>
            </div>
          </div>

          <span v-if="field.dataType === 'text'">
            <InputText
              v-if="!loadingSave" v-model="fieldValues[field.field]"
              show-clear :disabled="field?.disabled" class="h-2rem"
              @update:model-value="updateField(field.field, $event)"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </span>

          <span v-else-if="field.dataType === 'textarea'">
            <Textarea
              v-if="!loadingSave" v-model="fieldValues[field.field]" rows="5"
              :disabled="field?.disabled"
              show-clear @update:model-value="updateField(field.field, $event)"
            />
            <Skeleton v-else height="6rem" class="mb-2" />
          </span>

          <span v-else-if="field.dataType === 'date'">
            <Calendar
              v-if="!loadingSave"
              v-model="fieldValues[field.field]"
              date-format="yy-mm-dd" :disabled="field?.disabled"
              @update:model-value="(value) => updateField(field.field, value)"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </span>

          <span v-else-if="field.dataType === 'number'">
            <InputNumber
              v-if="!loadingSave"
              v-model="fieldValues[field.field]"
              class="h-2rem" :disabled="field?.disabled"
              @update:model-value="updateField(field.field, $event)"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </span>

          <span v-else-if="field.dataType === 'password'">
            <Password
              v-if="!loadingSave"
              v-model="fieldValues[field.field]" :disabled="field?.disabled"
              toggle-mask class="h-2rem"
              @update:model-value="updateField(field.field, $event)"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </span>

          <span v-else-if="field.dataType === 'file'">
            <FileUpload
              v-if="!loadingSave" accept=".jrxml" :max-file-size="1000000" :multiple="false" auto custom-upload
              @uploader="customBase64Uploader($event, fieldValues, field.field)"
            >
              <template v-if="!fieldValues[field.field]" #empty>
                <div class="flex align-items-center justify-content-center">
                  <p>Arrastre y suelte el archivo <strong>.jrxml</strong> aquí.</p>
                </div>
              </template>

              <template #content="{ files }">
                <ul v-if="files[0] || fieldValues[field.field]" class="list-none p-0 m-0">
                  <li class="p-3 surface-border flex align-items-start sm:align-items-center">
                    <img src="../../assets/images/xml.png" class="avatar w-4rem h-4rem mr-3" alt="Avatar">
                    <div class="flex flex-column">
                      <span class="text-900 font-semibold text-xl mb-2">{{ fieldValues[field.field].name }}</span>
                      <span class="text-900 font-medium">
                        <Badge severity="warning">
                          {{ formatSize(fieldValues[field.field].size) }}
                        </Badge>
                      </span>
                    </div>
                  </li>
                </ul>
              </template>

            </FileUpload>
            <Skeleton v-else height="7rem" />
          </span>

          <span v-else-if="field.dataType === 'check'">
            <Checkbox
              :id="field.field"
              v-model="fieldValues[field.field]"
              :binary="true"
              :disabled="field?.disabled"
              @update:model-value="updateField(field.field, $event)"
            />
            <label :for="field.field" class="ml-2"> {{ typeof field.header === 'function' ? field.header() : field.header }} </label>
          </span>
        </slot>

        <!-- Validation errors -->
        <div class="flex">
          <div class="w-full">
            <div v-if="errors[field.field]" :class="field.errorClass ? field.errorClass : 'p-error text-xs'" class="w-full">
              <div v-for="error in errors[field.field]" :key="error" class="error-message">
                {{ error }}
              </div>
            </div>
          </div>
          <div v-if="(field.dataType === 'text' || field.dataType === 'textarea' || field.dataType === 'password') && getMaxValidation(field.validation)" class="flex justify-content-end py-0 my-0" style="font-size: 10px;">
            {{ fieldValues[field.field].length }}/{{ getMaxValidation(field.validation) }}
          </div>
        </div>

        <!-- Footer slot -->
        <div v-if="field.footer" :style="field.footerStyle" :class="field.footerClass ? field.footerClass : ''">
          <slot :name="`footer-${field.field}`" :field="field">
            <small>{{ field.footer }}</small>
          </slot>
        </div>
      </div>

      <!-- Footer slot -->

      <!-- Clear button -->
      <button v-if="field.showClearButton" @click="clearField(field.field)">
        Limpiar
      </button>
    </div>
    <!-- General Footer slot of the form -->
    <div class="col-12 form-footer mt-4 flex justify-content-between md:justify-content-end">
      <slot name="form-footer">
        <Button v-tooltip.top="'Cancelar'" class="w-8rem mr-3" severity="secondary" label="Cancel" icon="pi pi-times" @click="cancelForm" />
        <Button v-tooltip.top="'Guardar'" class="w-8rem" icon="pi pi-check" label="Save" :loading="loadingSave" @click="submitForm" />
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
</style>
