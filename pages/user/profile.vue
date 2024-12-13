<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { IFormField } from '@/@core/fields/interfaces/IFieldInterfaces'
import EditForm from '@/@core/form/EditForm.vue'
import { ENUM_STATUS, ENUM_USER_TYPE } from '@/@core/utils/Enums'

const route = useRoute()
const toast = useToast()
const { data } = useAuth()

const dialogReload = ref(0)
const loadingSaveAll = ref(false)
const forceSaveFormGeneralData = ref(false)

const errorInTab = ref({
  tabGeneralData: false
})

const formConfig = ref<IFormField>(
  {
    image: {
      value: '',
      label: 'Logo',
      type: 'image',
      isRequired: false,
      showRequiredLabel: false,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: false,
      validationKeywords: [],
      col: '12'
    },
    name: {
      value: '',
      label: 'Nombre',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      validationKeywords: [],
      col: '6'
    },
    lastName: {
      value: '',
      label: 'Apellidos',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      validationKeywords: [],
      col: '6'
    },
    email: {
      value: '',
      label: 'Correo Electrónico',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      validationKeywords: ['isEmail'],
      col: '6'
    },
    userName: {
      value: '',
      label: 'Usuario',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      validationKeywords: [],
      col: '6'
    },
    // password: {
    //     value: '',
    //     label: 'Contraseña',
    //     type: 'password',
    //     isRequired: true,
    //     showRequiredLabel: true,
    //     placeholder: '',
    //     errorMessage: [],
    //     haveError: false,
    //     maxLength: 5,
    //     validationKeywords: [],
    //     col: '6',
    // },
    userType: {
      value: '',
      label: 'Tipo de Usuario',
      type: 'select',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: 'Seleccione un tipo de usuario',
      localItems: ENUM_USER_TYPE,
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    status: {
      value: '',
      label: 'Estado',
      type: 'select',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: 'Seleccione un estado',
      localItems: ENUM_STATUS,
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    // roles: {
    //     value: [],
    //     label: 'Roles',
    //     type: 'multi-select',
    //     isRequired: true,
    //     visible: false,
    //     showRequiredLabel: true,
    //     placeholder: 'Seleccione un rol',
    //     localItems: [],
    //     errorMessage: [],
    //     haveError: false,
    //     maxLength: 5,
    //     showCounter: true,
    //     validationKeywords: [],
    //     col: '6'
    // },
  }
)

const userId = (data.value as any).user.userId
const formOptionsToEdit = ref({
  moduleApi: 'identity',
  uriApi: 'users',
  itemId: userId,
  btnTextSave: 'Siguiente',
  btnTextCancel: 'Cancelar',
  showBtnCancel: false,
  showBtnSave: false,
  showBtnActions: false,
  formWithImage: ['image', 'name', 'lastName', 'email', 'userType', 'userName', 'status']
})

function messageSaveProfile() {
  toast.add({ severity: 'success', summary: 'Guardado', detail: 'Perfil de usuario guardado correctamente.', life: 3000 })
  dialogReload.value += 1
}

async function saveAll() {
  loadingSaveAll.value = true
  forceSaveFormGeneralData.value = true
  loadingSaveAll.value = false
}

async function cancelEdit() {
  dialogReload.value += 1
  navigateTo('/')
}

function errorInfForm() {
  if (errorInTab.value.tabGeneralData) {
    return true
  }
  else {
    return false
  }
}
</script>

<template>
  <div class="flex justify-content-center align-center">
    <div class="p-4" style="width: 100%;">
      <div class="card">
        <EditForm
          :key="dialogReload"
          :list-fields="formConfig"
          :form-options="formOptionsToEdit"
          :force-save="forceSaveFormGeneralData"
          @save="messageSaveProfile"
          @have-error-in-form="errorInTab.tabGeneralData = $event"
        />
      </div>

      <div class="card">
        <div class="flex justify-content-end">
          <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cancelar" @click="cancelEdit()" />
          <Button class="w-8rem" label="Modificar" :loading="loadingSaveAll" :disabled="errorInfForm()" @click="saveAll" />
        </div>
      </div>
    </div>
  </div>
</template>
