<script setup lang="ts">
import { ref, watch } from 'vue'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { GenericService } from '@/@core/services/generic-services'
import type { ITreeNode } from '@/app/user/interfaces/IInterfaces'
import { ENUM_USER_TYPE } from '@/@core/utils/Enums'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import getImage from '~/composables/files'
import EditFormV2WithImage from '~/@core/form/EditFormV2WithImage.vue'

const tableReload = ref(0)
const treeTableValue = ref<ITreeNode[]>([])
const toast = useToast()
const active = ref(0)
const userId = ref('')
const disabledForm = ref(false)
const loadingPermissions = ref(false)
const loadingSavePermissions = ref(false)
const loadingSaveAll = ref(false)
const selectedTreeTableValue = ref({})
const forceSave = ref(false)
const currentBussiness = ref<any>({})
const businessStore = useBusinessStore()
const confApi = reactive({
  moduleApi: 'identity',
  uriApi: 'users',
})
const fieldsWithImage = ['image', 'name', 'lastName', 'email', 'userName', 'userType', 'password']
currentBussiness.value = businessStore.current

const errorInTab = ref({
  tabGeneralData: false,
  tabMedicalInfo: false,
  tabServices: false,
  tabPermissions: false
})

const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    dataType: 'image',
    class: 'field col-12 md:col-3',
    headerClass: 'mb-1',
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'lastName',
    header: 'Apellidos',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'email',
    header: 'Email',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres').email('Correo inválido')
  },
  {
    field: 'userType',
    header: 'Tipo de Usuario',
    dataType: 'select',
    class: 'field col-12 md:col-6 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'Este campo es requerido'),
      name: z.string().min(1, 'Este campo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'Este campo es requerido' }),
  },
  {
    field: 'userName',
    header: 'Usuario',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(20, 'Máximo 20 caracteres')
  },
  {
    field: 'password',
    header: 'Password',
    dataType: 'password',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(20, 'Máximo 20 caracteres')
  },
]

const item = ref({
  image: '',
  name: '',
  lastName: '',
  email: '',
  userName: '',
  userType: null,
  password: '',
})

const textSearchPermissions = ref('')

async function getObjectValues($event: any) {
  forceSave.value = false
  item.value = $event
}

async function getListPermissionsByBusiness(idBusiness: string) {
  if (idBusiness) {
    getListModulesAndPermissions(idBusiness)
  }
}

async function getListModulesAndPermissions(idBusiness: string) {
  loadingPermissions.value = true
  treeTableValue.value = []

  const response = await GenericService.getById('identity', 'module', idBusiness, 'build')

  for (const iterator of response.data) {
    const objNode: ITreeNode = {
      key: iterator.id,
      data: {
        name: iterator.name,
        type: 'Modules'
      },
      children: []
    }
    for (const item of iterator.permissions) {
      objNode.children?.push({
        key: item.id,
        data: {
          name: item.code,
          type: 'Permission'
        }
      })
    }
    treeTableValue.value = [...treeTableValue.value, { ...objNode }]
  }

  tableReload.value += 1
  loadingPermissions.value = false
}

const goToList = async () => await navigateTo('/user')

async function assignPermissions() {
  loadingSavePermissions.value = true
  const hasProperties = Object.keys(selectedTreeTableValue.value).length > 0
  if (hasProperties) {
    const keys = Object.keys(selectedTreeTableValue.value)
    const payload = {
      filter: [
        {
          key: 'id',
          operator: 'IN',
          value: keys,
          logicalOperation: 'AND'
        }
      ],
      query: '',
      pageSize: 10,
      page: 0
    }
    const response = await GenericService.search('identity', 'permission', payload)
    if (response.data.length > 0) {
      const listIds = response.data.map((item: any) => item.id)
      const payload = {
        userId: userId.value,
        businessId: currentBussiness.value.businessId,
        permissionIds: listIds
      }
      await GenericService.create('identity', 'user-permission-business', { ...payload })
      goToList()
    }
  }
  goToList()
  loadingSavePermissions.value = false
}

function errorInfForm() {
  if (errorInTab.value.tabGeneralData || errorInTab.value.tabMedicalInfo || errorInTab.value.tabServices || errorInTab.value.tabPermissions) {
    return true
  }
  else {
    return false
  }
}

async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.userType = typeof payload.userType === 'object' ? payload.userType.id : payload.userType
  payload.image = typeof payload.image === 'object' ? await getImage(payload.image) : payload.image
  try {
    const response = await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
    if (response) {
      userId.value = response.id
      await assignPermissions()
      goToList()
    }
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
  }
  finally {
    loadingSaveAll.value = false
  }
}

watch(() => item.value, async (newValue) => {
  if (newValue) {
    save(newValue)
  }
})

getListPermissionsByBusiness(currentBussiness.value.businessId)
</script>

<template>
  <div class="flex justify-content-center align-center">
    <div class="p-4" style="width: 100%;">
      <b>Datos Generales</b>
      <Divider class="mt-1" align="left" type="solid" />
      <div class="card">
        <EditFormV2WithImage
          :field-with-image="[...fieldsWithImage]"
          :fields="fields"
          :item="item"
          class-first-grid="col-12 md:col-3"
          class-second-grid="col-12 md:col-9"
          :force-save="forceSave"
          :show-actions="false"
          :loading-save="loadingSaveAll"
          @force-save="forceSave = $event"
          @submit="getObjectValues($event)"
        >
          <template #field-userType="{ item: data, onUpdate }">
            <Dropdown
              v-if="loadingSaveAll === false"
              v-model="data.userType"
              :options="[...ENUM_USER_TYPE]"
              option-label="name"
              return-object="false"
              class="h-3rem align-items-center"
              show-clear
              @update:model-value="($event) => {
                onUpdate('userType', $event)
              }"
            />
            <Skeleton v-else height="2rem" class="mb-2" />
          </template>
        </EditFormV2WithImage>
      </div>

      <b>Asignar Permisos</b>
      <Divider class="mt-1" align="left" type="solid" />
      <div class="card">
        <div class="grid p-fluid formgrid">
          <div class="col-12 field">
            <TreeTable :key="tableReload" v-model:selectionKeys="selectedTreeTableValue" :value="treeTableValue" selection-mode="checkbox">
              <template #header>
                <div class="flex justify-content-between">
                  <div class="flex align-items-center">
                    <div>
                      <InputText v-model="textSearchPermissions" class="w-full sm:w-auto" placeholder="Presiona enter para buscar..." />
                      <Button label="Buscar" icon="pi pi-plus" class="mx-2 w-auto" severity="primary">
                        <i class="pi pi-search" />
                      </Button>
                    </div>
                    <Divider layout="vertical" />
                    <span>Selecciona los permisos del usuario para la empresa seleccionada.</span>
                  </div>
                </div>
              </template>
              <Column field="name" header="Name" :expander="true" />
              <Column field="code" header="Code" />
              <Column field="type" header="Type" />
            </TreeTable>
          </div>
          <div v-if="false" class="col-3 field flex align-items-center justify-content-center">
            <Button class="w-8rem mt-3 mr-2" severity="secondary" icon="pi pi-times" label="Cancelar" @click="goToList()" />
            <Button class="w-8rem mt-3" label="Asignar" :loading="loadingSavePermissions" :disabled="disabledForm" @click="assignPermissions" />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex justify-content-end">
          <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cancelar" @click="goToList()" />
          <Button class="w-8rem" label="Aceptar" :loading="loadingSaveAll" :disabled="errorInfForm()" @click="forceSave = true" />
        </div>
      </div>
    </div>
  </div>
</template>
