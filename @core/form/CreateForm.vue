<script setup lang="ts">
import { type PropType, reactive, ref, watch } from 'vue'
import pkg from 'lodash'
import type { IFormField } from '../fields/interfaces/IFieldInterfaces'
import TextFieldComponnent from '../fields/TextFieldComponnent.vue'
import { GenericService } from '../services/generic-services'
import SelectFieldComponnent from '../fields/SelectFieldComponnent.vue'
import SelectFieldDependedComponnent from '../fields/SelectFieldDependedComponnent.vue'
import TextAreaFieldComponnent from '../fields/TextAreaFieldComponnent.vue'
import ImageFieldComponnent from '../fields/ImageFieldComponnent.vue'
import TextFieldCustomComponnent from '../fields/TextFieldCustomComponnent.vue'
import MultiSelectFieldComponnent from '../fields/MultiSelectFieldComponnent.vue'
import CheckBoxFieldComponnent from '../fields/CheckBoxFieldComponnent.vue'
import DateFieldComponent from '../fields/DateFieldComponent.vue'
import InputMaskFieldComponnent from '../fields/InputMaskFieldComponnent.vue'
import SearchSelectFieldComponnent from '../fields/SearchSelectFieldComponnent.vue'
import { generatePassword } from '../utils/valid_form_fields'
import PasswordFieldComponnent from '~/@core/fields/PasswordFieldComponnent.vue'

const props = defineProps({
  listFields: {
    type: Object as PropType<IFormField>,
    default: {}
  },
  formOptions: {
    type: Object as PropType<{
      moduleApi: string
      uriApi: string
      btnTextSave?: string
      btnTextCancel?: string
      formWithImage?: string[]
      showBtnCancel?: boolean
      showBtnSave?: boolean
      showBtnActions?: boolean
      showSecondGrid?: boolean
      saveExternally?: boolean
    }>,
    required: true
  },
  forceSave: {
    type: Boolean,
    required: false
  }
})
const emit = defineEmits(['close', 'save', 'update:formConfig', 'forceSave', 'haveErrorInForm', 'getPayload'])
const toast = useToast()
const { cloneDeep } = pkg

const loadingForm = ref(false)
const submitForm = ref(false)
const haveAnyError = ref(false)
const disabledForm = ref(false)
const refKey = ref(0)
const objModelValue = reactive<IFormField>(cloneDeep({ ...props.listFields }))
const listKeyFormWithImage = ref<string[]>(cloneDeep(props.formOptions.formWithImage || []))

async function submitAndReloadForm() {
  submitForm.value = true
}

function base64ToFile(base64String: string, filename: string, mimeType: string) {
  const byteCharacters = atob(base64String)
  const byteNumbers = Array.from({ length: byteCharacters.length })

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })

  return new File([blob], filename, { type: mimeType })
}

async function saveItem() {
  try {
    loadingForm.value = true
    await submitAndReloadForm()
    const payload: { [key: string]: any } = {}
    let countError = 0
    for (const key in objModelValue) {
      if (objModelValue.hasOwnProperty(key)) {
        if (objModelValue[key].haveError) {
          countError += 1
        }
        if ((objModelValue[key].type === 'image' || objModelValue[key].type === 'file') && objModelValue[key].value.value) {
          const fileCovnerted = await base64ToFile(objModelValue[key].value.value, objModelValue[key].value.name, objModelValue[key].value.type)

          objModelValue[key].value = await getUrlByImage(fileCovnerted)
        }

        if (objModelValue[key].type === 'password' && objModelValue[key].generatePassword) {
          objModelValue[key].value = generatePassword(8)
        }

        if (key === 'userName' && (objModelValue[key].hasOwnProperty('keyValue') && objModelValue[key].keyValue !== '')) {
          objModelValue[key].value = objModelValue[objModelValue[key].keyValue].value
        }

        const value = objModelValue[key].value
        if (key === 'parroquiaDto') {
          payload.geographicLocation = value
        }
        else if (key !== 'provinceDto' && key !== 'cantonDto') {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            payload[key] = value.id
          }
          else {
            payload[key] = value
          }
        }
      }
    }

    if (props.formOptions.hasOwnProperty('saveExternally') ? props.formOptions.saveExternally : false) {
      emit('getPayload', payload)
    }

    if (countError === 0 && (props.formOptions.hasOwnProperty('saveExternally') ? props.formOptions.saveExternally : true)) {
      if (props.formOptions.moduleApi === 'gateway') {
        const response = await GenericService.apiGatewayCreate(props.formOptions.uriApi, payload)
        if (response.data && response.data.data && response.data.data.id) {
          emit('save', response.data.data.id)
          emit('forceSave', false)
        }
        else {
          emit('save', response.data.data)
          emit('forceSave', false)
        }
      }
      else {
        if (props.formOptions.uriApi === 'business' || props.formOptions.uriApi === 'module') {
          const response = await GenericService.create(props.formOptions.moduleApi, props.formOptions.uriApi, payload)

          if (response && response.hasOwnProperty('id')) {
            emit('save', response.id)
            emit('forceSave', false)
          }
          else {
            emit('save', response)
            emit('forceSave', false)
          }
        }
        else {
          const response = await GenericService.create(props.formOptions.moduleApi, props.formOptions.uriApi, payload)
          if (response && response.hasOwnProperty('id')) {
            emit('save', response.id)
            emit('forceSave', false)
          }
          else {
            emit('save', response)
            emit('forceSave', false)
          }
        }
      }
      // onClose()
    }
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el elemento', life: 3000 })
  }
  finally {
    loadingForm.value = false
    submitForm.value = false
    emit('forceSave', false)
  }
}

async function getUrlByImage(file: File) {
  if (file) {
    const response = await GenericService.uploadFile('cloudbridges', 'files', file)
    return response.data.url
  }
}

function onClose() {
  emit('close')
}

function hasErrorInObject(obj) {
  for (const value of Object.values(obj)) {
    if (value.haveError === true) {
      return true
    }
  }
  return false
}

function onFormDataChanged(newValue: any, oldValue: any) {
  emit('update:formConfig', newValue)
  disabledForm.value = hasErrorInObject(newValue)
  emit('haveErrorInForm', disabledForm.value)
}

function showFileOrImage() {
  if (listKeyFormWithImage.value.includes('image')) {
    return 'image'
  }
  if (listKeyFormWithImage.value.includes('file')) {
    return 'file'
  }
}

function resizeFormColum() {
  if (showFileOrImage() === 'image' && objModelValue.hasOwnProperty('image')) {
    return objModelValue.image
  }
  else {
    return 'no tiene image'
  }
}

watch(objModelValue, onFormDataChanged)

watch(() => props.forceSave, (newValue) => {
  if (newValue) {
    saveItem()
  }
})
</script>

<template>
  <div class="p-4">
    <div v-if="listKeyFormWithImage.includes('image') || listKeyFormWithImage.includes('file')" class="grid p-fluid formgrid" style="margin-bottom: -25px !important;">
      <div class="col-12 xl:col-3 flex align-items-center justify-content-center">
        <ImageFieldComponnent
          v-if="listKeyFormWithImage.includes('image') && showFileOrImage() === 'image'"
          :key="refKey"
          :submit="submitForm"
          :properties="objModelValue.image"
          @update:model-value="objModelValue.image.value = $event"
          @update:error-messages="objModelValue.image.errorMessage = $event"
          @invalid-field="objModelValue.image.haveError = $event; haveAnyError = $event"
        />
        <ImageFieldComponnent
          v-if="listKeyFormWithImage.includes('file') && showFileOrImage() === 'file'"
          :key="refKey"
          :submit="submitForm"
          :properties="objModelValue.file"
          @update:model-value="objModelValue.file.value = $event"
          @update:error-messages="objModelValue.file.errorMessage = $event"
          @invalid-field="objModelValue.file.haveError = $event; haveAnyError = $event"
        />
      </div>
      <div class="col-12" :class="resizeFormColum() ? 'xl:col-9' : ''">
        <div class="grid p-fluid formgrid">
          <div v-for="item of listKeyFormWithImage" :key="item" :class="`col-12 lg:col-${objModelValue[item].col} field`">
            <TextFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'text' || objModelValue[item].type === 'time'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :parent-value="objModelValue[item].hasOwnProperty('keyValue') ? objModelValue[objModelValue[item].keyValue].value : ''"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <TextFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'number'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="[...objModelValue[item].validationKeywords, 'onlyNumbers']"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <!--            <TextFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'password'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            /> -->
            <PasswordFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'password'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <TextAreaFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'textarea'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <SelectFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'select'"
              :key="refKey"
              :properties="objModelValue[item]"
              :submit="submitForm"
              :local-items="objModelValue[item].localItems"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <SearchSelectFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'select-search'"
              :key="refKey"
              :properties="objModelValue[item]"
              :submit="submitForm"
              :local-items="objModelValue[item].localItems"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <MultiSelectFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'multi-select' && objModelValue[item].visible"
              :key="refKey"
              :properties="objModelValue[item]"
              :submit="submitForm"
              :local-items="objModelValue[item].localItems"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <SelectFieldDependedComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'dependent-select'"
              :key="refKey"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              :parent-value="objModelValue[item].keyValue ? (typeof objModelValue[objModelValue[item].keyValue].value === 'object' ? objModelValue[objModelValue[item].keyValue].value.id : 'null') : 'null'"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <TextFieldCustomComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'text-custom'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :parent-value="objModelValue[item].parentValues && objModelValue[item].parentValues[0] && objModelValue[item].parentValues[1] ? `${objModelValue[objField.parentValues[0]].value ? `${objModelValue[objField.parentValues[0]].value.name.toLocaleUpperCase()}:` : ''}${objModelValue[objField.parentValues[1]].value ? objModelValue[objField.parentValues[1]].value.toLocaleUpperCase() : ''}` : '' "
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <CheckBoxFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'check'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              class="mt-4 mb-4"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <DateFieldComponent
              v-if="item !== 'image' && objModelValue[item].type === 'date'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              locale="es"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
            <InputMaskFieldComponnent
              v-if="item !== 'image' && objModelValue[item].type === 'text-mask'"
              :key="refKey"
              :submit="submitForm"
              :properties="objModelValue[item]"
              :validation-keywords="objModelValue[item].validationKeywords"
              @update:model-value="objModelValue[item].value = $event"
              @update:error-messages="objModelValue[item].errorMessage = $event"
              @invalid-field="objModelValue[item].haveError = $event; haveAnyError = $event"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="formOptions.hasOwnProperty('showSecondGrid') ? formOptions.showSecondGrid : true" class="grid p-fluid formgrid">
      <div v-for="(objField, index) of objModelValue" :key="index" :class="`col-12 lg:col-${objField.col}`" class="field">
        <TextFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && ((objField.type === 'text' || objField.type === 'time') && (objField.hasOwnProperty('visible') ? objField.visible : true))"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :parent-value="objField.hasOwnProperty('keyValue') ? objModelValue[objField.keyValue].value : ''"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <TextFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'number')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="[...objField.validationKeywords, 'onlyNumbers']"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <TextAreaFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'textarea')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <SelectFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'select') && (objField.hasOwnProperty('visible') ? objField.visible : true)"
          :key="refKey"
          :properties="objField"
          :submit="submitForm"
          :local-items="objField.localItems"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <SearchSelectFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'select-search') && (objField.hasOwnProperty('visible') ? objField.visible : true)"
          :key="refKey"
          :properties="objField"
          :submit="submitForm"
          :local-items="objField.localItems"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <MultiSelectFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'multi-select' && objField.visible)"
          :key="refKey"
          :properties="objField"
          :submit="submitForm"
          :local-items="objField.localItems"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <SelectFieldDependedComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'dependent-select')"
          :key="refKey"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          :parent-value="objField.keyValue ? ((typeof objModelValue[objField.keyValue].value === 'object' && objModelValue[objField.keyValue].value !== null) ? objModelValue[objField.keyValue].value.id : objModelValue[objField.keyValue].value) : ''"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <!-- <ImageFieldComponnent
                    v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'image' || objField.type === 'file')"
                    :key="refKey"
                    :submit="submitForm"
                    :properties="objField"
                    :validation-keywords="objField.validationKeywords"
                    @update:model-value="objField.value = $event"
                    @update:error-messages="objField.errorMessage = $event"
                    @invalid-field="objField.haveError = $event; haveAnyError = $event"
                /> -->
        <!-- <FileFieldComponnent
                    v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'file')"
                    :key="refKey"
                    :submit="submitForm"
                    :properties="objField"
                    :validation-keywords="objField.validationKeywords"
                    @update:model-value="objField.value = $event"
                    @update:error-messages="objField.errorMessage = $event"
                    @invalid-field="objField.haveError = $event; haveAnyError = $event"
                /> -->
        <TextFieldCustomComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'text-custom')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :parent-value="objField.parentValues && objField.parentValues[0] && objField.parentValues[1] ? `${objModelValue[objField.parentValues[0]].value ? `${objModelValue[objField.parentValues[0]].value.name.toLocaleUpperCase()}:` : ''}${objModelValue[objField.parentValues[1]].value ? objModelValue[objField.parentValues[1]].value.toLocaleUpperCase() : ''}` : '' "
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <PasswordFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'password') && (objField.hasOwnProperty('visible') ? objField.visible : true)"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <!--        <TextFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'password') && (objField.hasOwnProperty('visible') ? objField.visible : true)"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        /> -->
        <CheckBoxFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'check')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          class="mt-4"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />

        <DateFieldComponent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'date')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
        <InputMaskFieldComponnent
          v-if="!listKeyFormWithImage.includes(index.toString()) && (objField.type === 'text-mask')"
          :key="refKey"
          :submit="submitForm"
          :properties="objField"
          :validation-keywords="objField.validationKeywords"
          @update:model-value="objField.value = $event"
          @update:error-messages="objField.errorMessage = $event"
          @invalid-field="objField.haveError = $event; haveAnyError = $event"
        />
      </div>
    </div>
    <div v-if="props.formOptions.hasOwnProperty('showBtnActions') ? props.formOptions.showBtnActions : true" class="grid p-fluid formgrid">
      <div class="col-12 flex justify-content-end mt-4">
        <Button v-if="props.formOptions.hasOwnProperty('showBtnCancel') ? props.formOptions.showBtnCancel : true" v-tooltip.top="'Cancelar'" class="w-8rem mr-3" severity="secondary" icon="pi pi-times" :label="props.formOptions.btnTextCancel ? props.formOptions.btnTextCancel : 'Cancel'" @click="onClose()" />
        <Button v-if="props.formOptions.hasOwnProperty('showBtnSave') ? props.formOptions.showBtnSave : true" v-tooltip.top="'Guardar'" class="w-8rem" icon="pi pi-check" :label="props.formOptions.btnTextSave ? props.formOptions.btnTextSave : 'Save'" :loading="loadingForm" :disabled="disabledForm" @click="saveItem()" />
      </div>
    </div>
  </div>
</template>
