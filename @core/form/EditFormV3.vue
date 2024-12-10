// EditForm.vue

<script setup lang="ts">
import { usePrimeVue } from 'primevue/config'
import type { IFileMetadata } from '../fields/interfaces/IFieldInterfaces'
import type { FieldDefinitionType } from './EditFormV3'

const props = defineProps<{
  fields: Array<FieldDefinitionType>
  item: any
  loadingSave?: boolean
  loadingDelete?: boolean
  showActions?: boolean
  formClass?: string
  backendValidation?: { [key: string]: string[] }
  hideSaveButton?: boolean
  hideDeleteButton?: boolean
  showCancelButton?: boolean
  showConfigButton?: boolean
  disabledSaveButton?: boolean

  permissionSave?: any
  permissionDelete?: any
  showExternalConsultation?: boolean
  showConfirmAppointment?: boolean
  showConfirmTurner?: boolean
  showCancelTurner?: boolean
  showCancelAppointment?: boolean
  forceSave?: boolean
  showSendCampaign?: boolean
  showCancelCampaign?: boolean
  showLinkUserBussiness?: boolean
  showChangePass?: boolean
}>()

const emit = defineEmits(['update:field', 'clearField', 'submit', 'cancel', 'delete', 'openExternalConsultation', 'confirmAppointment', 'openModalPass', 'confirmTurner', 'cancelAppointment', 'cancelTurner', 'forceSave', 'sendCampaign', 'cancelCampaign', 'linkUserBussiness', 'changePassByAdmin'])

const $primevue = usePrimeVue()
const fieldValues = reactive<{ [key: string]: any }>({})
const errors = reactive<{ [key: string]: string[] }>({})
const objFile = ref<IFileMetadata | null>(null)

props.fields.forEach((field) => {
  if (typeof field.field === 'string') {
    fieldValues[field.field] = props.item[field.field]
  }
})

function updateField(fieldKey: string, value: any) {
  // const field = props.fields.find(f => f.field === fieldKey)
  // if (field?.dataType === 'code' || field?.toUppercase) {
  //   fieldValues[fieldKey] = value.toUpperCase()
  // }
  // else if (field?.dataType !== 'code' && field?.toCapitalize) {
  //   const temp = capitalizeWords(value)
  //   fieldValues[fieldKey] = temp
  // }
  // else {
  //   fieldValues[fieldKey] = value
  // }
  fieldValues[fieldKey] = typeof value === 'string' ? value.trim().toUpperCase() : value
  emit('update:field', { fieldKey, value: fieldValues[fieldKey] })
  validateField(fieldKey, value)
}

function capitalizeWords(value: string) {
  if (!value) { return '' }

  // Divide el texto en palabras y procesa cada una individualmente
  return value.split(' ').map((word) => {
    // Convierte el primer carácter a mayúscula considerando acentos
    const firstChar = word[0] ? word[0].toLocaleUpperCase('es') : ''
    const restChars = word.slice(1).toLocaleLowerCase('es') // Convierte el resto a minúsculas
    return firstChar + restChars
  }).join(' ')
}

function clearField(fieldKey: string) {
  fieldValues[fieldKey] = null
  emit('clearField', fieldKey)
}

function cancelForm() {
  emit('cancel')
}

function deleteItem($event: Event) {
  $event.preventDefault()
  emit('delete', { ...props.item, event: $event })
}

function submitForm($event: Event = new Event('')) {
  // $event.preventDefault()
  if (validateForm()) {
    emit('submit', { ...fieldValues, event: $event })
  }
}
// section Turner
function confirmTurnerItem($event: Event) {
  $event.preventDefault()
  emit('confirmTurner', { ...props.item, event: $event })
}

function cancelTurnerItem($event: Event) {
  $event.preventDefault()
  emit('cancelTurner', { ...props.item, event: $event })
}

// section Appointment
function confirmAppointmentItem($event: Event) {
  $event.preventDefault()
  emit('confirmAppointment', { ...props.item, event: $event })
}

function cancelAppointmentItem($event: Event) {
  $event.preventDefault()
  emit('cancelAppointment', { ...props.item, event: $event })
}

function openExternalConsultationItem($event: Event) {
  $event.preventDefault()
  emit('openExternalConsultation', { ...props.item, event: $event })
}
function openConfig() {
  emit('openModalPass')
}

function sendCampaign($event: Event) {
  $event.preventDefault()
  emit('sendCampaign', { ...props.item, event: $event })
}

function cancelCampaign($event: Event) {
  $event.preventDefault()
  emit('cancelCampaign', { ...props.item, event: $event })
}

function linkUserBussiness($event: Event) {
  $event.preventDefault()
  emit('linkUserBussiness', { ...props.item, event: $event })
}

function changePassByAdmin($event: Event) {
  $event.preventDefault()
  emit('changePassByAdmin', { ...props.item, event: $event })
}

// end section Appointment
async function customBase64Uploader(event: any, listFields: any, fieldKey: any) {
  const file = event.files[0]
  objFile.value = file
  listFields[fieldKey] = file
}

function openFileUpload() {
  document.getElementById('btn-choose')?.click()
}
function clearFile(listField: any, fieldKey: any) {
  listField[fieldKey] = null
  objFile.value = null
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

watch(() => props.forceSave, () => {
  if (props.forceSave) {
    submitForm()
    emit('forceSave')
  }
})
</script>

<template>
  <div :class="formClass || 'p-fluid formgrid grid flex justify-content-center'">
    <div class="col-12 p-0 grid" style="max-height: 65vh; overflow-y: auto;">
      <div
        v-for="(field, index) in fields" v-show="!field.hidden" :key="field.field || index" :style="field.style"
        :class="field.class ? `${field.class} mb-2` : 'mb-2'"
      >
        <!-- Header slot -->
        <div v-if="field.header && field.dataType !== 'check'" :style="field.headerStyle" :class="field.headerClass">
          <slot :name="`header-${field.field}`" :field="field">
            <strong>
              {{ typeof field.header === 'function' ? field.header() : field.header }}
            </strong>
            <span v-if="field.class.includes('required')" class="p-error">*</span>
          </slot>
        </div>

        <!-- Field slot -->
        <div :class="field.containerFieldClass">
          <slot
            :name="`field-${field.field}`" :item="fieldValues" :field="field.field" :fields="fields"
            :on-update="updateField"
          >
            <div v-if="field.dataType === 'image'" class="flex flex-wrap justify-content-center">
              <FileUpload
                hidden auto custom-upload accept="image/*" choose-label="Seleccione" cancel-label="Cancelar"
                :show-upload-button="false" :max-file-size="1000000"
                @uploader="customBase64Uploader($event, fieldValues, field.field)"
              >
                <template #header="{ chooseCallback }">
                  <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                      <Button
                        id="btn-choose" class="p-2" icon="pi pi-images" rounded outlined
                        @click="chooseCallback()"
                      />
                    </div>
                  </div>
                </template>
              </FileUpload>
              <div
                v-if="!loadingSave"
                class="border-2 surface-border border-round-xl border-400 p-1 flex align-items-center justify-content-center"
                style="width: 180px; height: 180px;"
              >
                <i v-if="!fieldValues[field.field]" class="pi pi-image p-5 text-8xl text-400 border-400" />
                <div
                  v-else class="relative bg-imagen border-round flex align-items-center justify-content-center"
                  style="width: 100%; height: 100%;"
                  :style="{ backgroundImage: `url(${typeof fieldValues[field.field] === 'string' ? fieldValues[field.field] : (fieldValues[field.field].hasOwnProperty('objectURL') ? fieldValues[field.field].objectURL : '')})`, backgroundSize: (objFile !== null && typeof objFile === 'object' && objFile.type === 'image/svg+xml') ? 'contain' : 'cover' }"
                />
              </div>
              <div
                v-else
                class="border-2 surface-border border-round-xl border-400 p-1 flex align-items-center justify-content-center"
                style="width: 180px; height: 180px;"
              >
                <Skeleton class="w-full h-full" />
              </div>
              <div class="col-12">
                <div class="flex justify-content-center align-items-center my-2">
                  <span>
                    <Button icon="pi pi-upload" class="ml-2" text @click="openFileUpload" />
                    <Button
                      icon="pi pi-times" class="ml-2" severity="danger" :disabled="!fieldValues[field.field]" text
                      @click="clearFile(fieldValues, field.field)"
                    />
                  </span>
                </div>
              </div>
            </div>

            <span v-if="field.dataType === 'text' || field.dataType === 'code'">
              <InputText
                v-if="!loadingSave" v-model="fieldValues[field.field]" show-clear :disabled="field?.disabled"
                @update:model-value="updateField(field.field, $event)"
              />
              <Skeleton v-else height="2rem" />
            </span>

            <span v-if="field.dataType === 'mask'">
              <InputMask
                v-if="!loadingSave" v-model="fieldValues[field.field]" :mask="field.mask" show-clear
                :disabled="field?.disabled" :placeholder="field.placeholder"
                @update:model-value="updateField(field.field, $event)"
              />
              <Skeleton v-else height="2rem" />
            </span>

            <span v-else-if="field.dataType === 'textarea'">
              <Textarea
                v-if="!loadingSave" v-model="fieldValues[field.field]" :rows="field.rowsTextarea ? field.rowsTextarea : 5" :disabled="field?.disabled"
                show-clear @update:model-value="updateField(field.field, $event)"
              />
              <Skeleton v-else height="6rem" />
            </span>

            <span v-else-if="field.dataType === 'date'">
              <Calendar
                v-if="!loadingSave" v-model="fieldValues[field.field]" date-format="yy-mm-dd"
                :disabled="field?.disabled" @update:model-value="(value) => updateField(field.field, value)"
              />
              <Skeleton v-else height="2rem" />
            </span>

            <span v-else-if="field.dataType === 'number'">
              <InputNumber
                v-if="!loadingSave" v-model="fieldValues[field.field]" :disabled="field?.disabled"
                @update:model-value="updateField(field.field, $event)"
              />
              <Skeleton v-else height="2rem" />
            </span>

            <span v-else-if="field.dataType === 'password'">
              <Password
                v-if="!loadingSave" v-model="fieldValues[field.field]" :disabled="field?.disabled" toggle-mask
                :feedback="false" @update:model-value="updateField(field.field, $event)"
              />
              <Skeleton v-else height="2rem" />
            </span>

            <span v-else-if="field.dataType === 'file'">
              <FileUpload
                v-if="!loadingSave" accept=".jrxml" choose-label="Seleccione" cancel-label="Cancelar"
                :show-upload-button="false" :max-file-size="1000000" :multiple="false" :auto="false" custom-upload
                @uploader="customBase64Uploader($event, fieldValues, field.field)"
              >
                <!-- <template #header="{ chooseCallback }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                  <div class="flex gap-2">
                    <Button id="btn-choose" class="p-2" icon="pi pi-images" rounded outlined @click="chooseCallback()" />
                  </div>
                </div>
              </template> -->
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
                v-model="fieldValues[field.field]" :binary="true" :disabled="field?.disabled"
                @update:model-value="updateField(field.field, $event)"
              />
              <label :for="field.field" class="ml-2"> {{ typeof field.header === 'function' ? field.header()
                : field.header }}
              </label>
            </span>
          </slot>

          <!-- Validation errors -->
          <div v-if="true" class="flex">
            <div class="w-full">
              <div
                v-if="errors[field.field]" :class="field.errorClass ? field.errorClass : 'p-error text-xs'"
                class="w-full"
              >
                <div v-for="error in errors[field.field]" :key="error" class="error-message">
                  {{ error }}
                </div>
              </div>
            </div>
            <!-- <div v-if="(field.dataType === 'text' || field.dataType === 'textarea' || field.dataType === 'password') && getMaxValidation(field.validation)" class="flex justify-content-end py-0 my-0" style="font-size: 10px;">
            {{ fieldValues[field.field].length }}/{{ getMaxValidation(field.validation) }}
          </div> -->
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
          Clear
        </button>
      </div>
    </div>
    <!-- <div class="col-12 p-0" style="max-height: 65vh; overflow-y: auto;">
    </div> -->
    <!-- General Footer slot of the form -->
    <div v-if="showActions" class="col-12 form-footer mt-4 flex justify-content-between md:justify-content-end">
      <slot name="form-footer" :item="fieldValues">
        <IfCan :perms="permissionSave">
          <Button
            v-if="!hideSaveButton"
            v-tooltip.top="'Guardar'"
            label="Guardar"
            class="w-6rem mx-2"
            :loading="loadingSave"
            :disabled="props?.disabledSaveButton || false"
            @click="submitForm($event)"
          />
        </IfCan>
        <Button
          v-if="showConfigButton" v-tooltip.top="'Configurar Contraseña'" class="w-auto mx-2" label="Contraseña"
          :loading="loadingSave" severity="success" @click="openConfig"
        />
        <IfCan :perms="permissionDelete || []">
          <Button
            v-if="!hideDeleteButton" v-tooltip.top="'Eliminar'" outlined class="w-6rem" label="Eliminar"
            severity="danger" :disabled="item?.id === null || item?.id === undefined || item?.id === ''"
            :loading="loadingDelete" @click="deleteItem($event)"
          />
        </IfCan>
        <IfCan :perms="permissionSave || []">
          <Button
            v-if="showConfirmTurner" v-tooltip.top="'Notificar Siguiente'" class="w-6rem mx-2" label="Notificar"
            severity="success" :loading="loadingSave" @click="confirmTurnerItem"
          />
        </IfCan>
        <Button
          v-if="showCancelButton" v-tooltip.top="'Cancelar'" class="w-6rem mx-2" label="Cancelar"
          severity="secondary" :loading="loadingSave" @click="cancelForm"
        />
        <Button
          v-if="showExternalConsultation" v-tooltip.top="'Consulta externa'" class="w-10rem mx-2"
          label="Atender" :loading="loadingSave" @click="openExternalConsultationItem"
        />
        <Button
          v-if="showConfirmAppointment" v-tooltip.top="'Confirmar cita'" class="w-6rem mx-2" label="Confirmar"
          severity="success" :loading="loadingSave" @click="confirmAppointmentItem"
        />
        <Button
          v-if="showCancelAppointment" v-tooltip.top="'Cancelar cita'" class="w-6rem mx-2" label="Cancelar"
          severity="danger" :loading="loadingSave" @click="cancelAppointmentItem"
        />
        <Button
          v-if="showCancelTurner" v-tooltip.top="'Cancelar turno'" class="w-6rem mx-2" label="Cancelar"
          severity="danger" :loading="loadingSave" @click="cancelTurnerItem"
        />
        <Button
          v-if="showSendCampaign" v-tooltip.top="'Ejecutar campaña'" class="w-6rem mx-2" label="Ejecutar"
          severity="success" :loading="loadingSave" @click="sendCampaign"
        />
        <Button
          v-if="showCancelCampaign" v-tooltip.top="'Cancelar campaña'" class="w-6rem mx-2" label="Cancelar"
          severity="danger" :loading="loadingSave" @click="cancelCampaign"
        />
        <Button
          v-if="showLinkUserBussiness" v-tooltip.top="'Vincular usuario'" class="w-6rem mx-2" label="Vincular"
          severity="secondary" :loading="loadingSave" @click="linkUserBussiness"
        />
        <Button
          v-if="showChangePass" v-tooltip.top="'Cambiar contraseña'" class="w-9rem mx-2" label="Contraseña"
          severity="danger" :loading="loadingSave" @click="changePassByAdmin"
        />
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
::-webkit-scrollbar {
  width: 8px;
  /* Ancho del scrollbar vertical */
  height: 12px;
  /* Altura del scrollbar horizontal */
}

/* Estilo para la track del scrollbar (la base de la barra de desplazamiento) */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Estilo para el handle del scrollbar (la parte que se puede mover) */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
  /* Bordes redondeados */
}

/* Estilo para el handle del scrollbar al pasar el mouse sobre él */
::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>
