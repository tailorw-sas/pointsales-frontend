<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { PageState } from 'primevue/paginator'
import { z } from 'zod'
import { GenericService } from '@/@core/services/generic-services'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import type { IFilter, IQueryRequest } from '@/@core/fields/interfaces/IFieldInterfaces'
import DynamicTable from '@/@core/table/DynamicTable.vue'
import type { FieldDefinitionType } from '~/@core/form/EditFormV3'
import EditFormV3 from '~/@core/form/EditFormV3.vue'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import type { IData } from '~/@core/table/interfaces/IModelData'

// VARIABLES -----------------------------------------------------------------------------------------
const openDialogPass = ref(false)
const toast = useToast()
const confirm = useConfirm()
const listItems = ref<any[]>([])
const formReload = ref(0)

const loadingSaveAll = ref(false)
const idItem = ref('')
const idItemToLoadFirstTime = ref('')
const loadingSearch = ref(false)
const loadingDelete = ref(false)
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})

const confPassApi = reactive({
  moduleApi: 'report',
  uriApi: 'db-connection/password',
})

const fields: Array<FieldDefinitionType> = [
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12  mt-4 required',
    validation: z.string().trim().min(1, 'El campo código es requerido').max(10, 'Máximo 10 caracteres')
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required',
    validation: z.string().trim().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {  
  field: 'url',
  header: 'Url',
  dataType: 'text',
  class: 'field col-12 required',
  validation: z.string()
    .trim()
    .min(1, 'El campo url es requerido')
    .max(255, 'Máximo 255 caracteres')
    .url('El campo debe ser una URL válida')
},
  {
    field: 'username',
    header: 'Usuario',
    dataType: 'text',
    class: 'field col-12 required',
    validation: z.string().trim().min(1, 'El campo usuario es requerido').max(20, 'Máximo 20 caracteres')
  },
  {
    field: 'password',
    header: 'Contraseña',
    dataType: 'password',
    class: 'field col-12 required',
    hidden: false,
    validation: z.string().trim().min(1, 'El campo contraseña es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'status',
    header: 'Activo',
    dataType: 'check',
    disabled: true,
    class: 'field col-12 required mb-3 mt-3',
  },
]

const fieldsEdit: Array<FieldDefinitionType> = [
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12  mt-4 required',
    validation: z.string().trim().min(1, 'El campo código es requerido').max(10, 'Máximo 10 caracteres')
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required',
    validation: z.string().trim().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
  field: 'url',
  header: 'Url',
  dataType: 'text',
  class: 'field col-12 required',
  validation: z.string()
    .trim()
    .min(1, 'El campo url es requerido')
    .max(255, 'Máximo 255 caracteres')
    .url('El campo debe ser una URL válida')  },
  {
    field: 'username',
    header: 'Usuario',
    dataType: 'text',
    class: 'field col-12 required',
    validation: z.string().trim().min(1, 'El campo usuario es requerido').max(20, 'Máximo 20 caracteres')
  },
  {
    field: 'status',
    header: 'Activo',
    dataType: 'check',
    disabled: true,
    class: 'field col-12 required mb-3 mt-3',
  },
]
const confApi = reactive({
  moduleApi: 'report',
  uriApi: 'db-connection',
})

const item = ref<GenericObject>({
  code: '',
  name: '',
  url: '',
  username: '',
  password: '',
  status: true,

})

const itemTemp = ref<GenericObject>({
  code: '',
  name: '',
  url: '',
  username: '',
  password: '',
  status: true,
})

const itemPassword = ref<GenericObject>({
  oldPassword: '',
  newPassword: '',
})

const confirmPassword = ref('')

const formTitle = computed(() => {
  return idItem.value ? 'Editar' : 'Crear'
})

/*const currentFields = computed(() => {
  return idItem.value ? fieldsEdit : fields
})*/
// -------------------------------------------------------------------------------------------------------
const currentFields = computed(() => {
      return formTitle.value === 'Editar' ? fieldsEdit : fields;
  });
// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'code', header: 'Código', type: 'text' },
  { field: 'name', header: 'Nombre', type: 'text' },
  { field: 'url', header: 'Url', type: 'text' },
  { field: 'username', header: 'Usuario', type: 'text' },
  { field: 'status', header: 'Activo', type: 'bool' },
]
// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'code', name: 'Código' },
  { id: 'username', name: 'Usuario' },
]
// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Conexión a Base de Datos',
  moduleApi: 'report',
  uriApi: 'db-connection',
  loading: false,
  actionsAsMenu: false,
  showDelete: false,
  messageToDelete: 'Desea guardar el cambio?'
})
const payloadOnChangePage = ref<PageState>()
const payload = ref<IQueryRequest>({
  filter: [],
  query: '',
  pageSize: 10,
  page: 0,
  sortBy: 'createdAt',
  sortType: 'DES'
})
const pagination = ref<IPagination>({
  page: 0,
  limit: 20,
  totalElements: 0,
  totalPages: 0,
  search: ''
})

// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------
function clearForm() {
  item.value = { ...itemTemp.value }
  idItem.value = ''
  fieldsEdit[0].disabled = false
  formReload.value++
  updateFieldProperty(fields, 'status', 'disabled', true)
}

async function getList() {
  if (options.value.loading) {
    return
  }

  try {
    idItemToLoadFirstTime.value = ''
    options.value.loading = true
    listItems.value = []
    const newListItems = []

    const response = await GenericService.search(options.value.moduleApi, options.value.uriApi, payload.value)
    const { data: dataList, page, size, totalElements, totalPages } = response
    pagination.value.page = page
    pagination.value.limit = size
    pagination.value.totalElements = totalElements
    pagination.value.totalPages = totalPages

    const existingIds = new Set(listItems.value.map(item => item.id))
    for (const iterator of dataList) {
      if (Object.prototype.hasOwnProperty.call(iterator, 'status')) {
        iterator.status = statusToBoolean(iterator.status)
      }
      if (!existingIds.has(iterator.id)) {
        newListItems.push({ ...iterator, templateCode: iterator.code, templateName: iterator.name, url: iterator.url, username: iterator.username, loadingEdit: false, loadingDelete: false })
        existingIds.add(iterator.id)
      }
    }

    listItems.value = [...listItems.value, ...newListItems]
    if (listItems.value.length > 0) {
      idItemToLoadFirstTime.value = listItems.value[0].id
    }
  }
  catch (error) {
    console.error(error)
  }
  finally {
    options.value.loading = false
  }
}
function searchAndFilter() {
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type !== 'filterSearch')]
  if (filterToSearch.value.criterial || filterToSearch.value.search) {
    payload.value.filter = [...payload.value.filter, {
      key: filterToSearch.value.criterial ? filterToSearch.value.criterial.id : '',
      operator: 'LIKE',
      value: filterToSearch.value.search,
      logicalOperation: 'AND',
      type: 'filterSearch',
    }]
  }
  getList()
}

function clearFilterToSearch() {
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type !== 'filterSearch')]
  filterToSearch.value.criterial = ENUM_FILTER[0]
  filterToSearch.value.search = ''
  getList()
}

async function resetListItems() {
  payload.value.page = 0
  getList()
}

async function getItemById(id: string) {
  if (id) {
    idItem.value = id
    loadingSaveAll.value = true
    try {
      const response = await GenericService.getById(confApi.moduleApi, confApi.uriApi, id)
      if (response) {
        item.value.code = response.code
        item.value.name = response.name
        item.value.id = response.id
        item.value.url = response.url
        item.value.username = response.username
        item.value.password = response.password
        item.value.status = statusToBoolean(response.status)
      }
      updateFieldProperty(fields, 'status', 'disabled', false)

      formReload.value += 1
      fieldsEdit[0].disabled = true
    }
    catch (error) {
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Conexión a base de datos no pudo ser cargada', life: 3000 })
      }
    }
    finally {
      loadingSaveAll.value = false
    }
  }
}

async function createItem(item: { [key: string]: any }) {
  if (item) {
    loadingSaveAll.value = true
    const payload: { [key: string]: any } = { ...item }
    payload.status = statusToString(payload.status)
    await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
  }
}

async function updateItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.status = statusToString(payload.status)

  await GenericService.update(confApi.moduleApi, confApi.uriApi, idItem.value || '', payload)
}

async function updatePassword(itemPassword: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...itemPassword }
  console.log("Id" , idItem.value)
    // Imprimir la URL completa
   
  try {
    await GenericService.update('report', 'db-connection/password', idItem.value || '', payload)
    console.log("Id",idItem.value)
    openDialogPass.value = false
    toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Transacción realizada con éxito', life: 3000 })
  }
  catch (error:any) {
    // Manejar el error de la actualización
    toast.add({ severity: 'error', summary: 'Error', detail: 'La contraseña es incorrecta', life: 3000 })
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function deleteItem(id: string) {
  try {
    loadingDelete.value = true
    await GenericService.deleteItem(options.value.moduleApi, options.value.uriApi, id)
    clearForm()
    getList()
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error eliminando el registro', life: 3000 })
    loadingDelete.value = false
  }
  finally {
    loadingDelete.value = false
  }
}

async function saveItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  let successOperation = true
  if (idItem.value) {
    try {
      await updateItem(item)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 5000 })
    }
    catch (error: any) {
      successOperation = false
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
    // idItem.value = ''
  }
  else {
    try {
      await createItem(item)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 5000 })
    }
    catch (error: any) {
      successOperation = false
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
  }
  loadingSaveAll.value = false
  if (successOperation) {
    clearForm()
    getList()
  }
}

async function savePassword(itemPassword: { [key: string]: any }) {
  loadingSaveAll.value = true
  let successOperation = null
  try {
    if (idItem.value) {
      const response: any = await updatePassword(itemPassword)

      if (response) {
        successOperation = true
      }
    }
  }
  catch (error: any) {
    successOperation = false
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.data?.data?.error?.errorMessage,
      life: 10000,
    })
  }
  finally {
    loadingSaveAll.value = false
    if (successOperation) {
      // Cerrar el diálogo y limpiar el formulario
      openDialogPass.value = false
      clearPasswordFields()
      toast.add({
        severity: 'success',
        summary: 'Exito',
        detail: 'Contraseña cambiada exitosamente',
        life: 3000,
      })
    }
  }
}

function requireConfirmationToSave(item: any) {
  const { event } = item
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Guardar registro',
    message: 'Desea guardar el registro?',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Aceptar',
    accept: () => {
      saveItem(item)
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}
function requireConfirmationToDelete(event: any) {
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Eliminar registro',
    message: 'Desea eliminar el registro?',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Aceptar',
    accept: () => {
      deleteItem(idItem.value)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 3000 })
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}



async function parseDataTableFilter(payloadFilter: any) {
  const parseFilter: IFilter[] | undefined = await getEventFromTable(payloadFilter, columns)
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type === 'filterSearch')]
  payload.value.filter = [...payload.value.filter, ...parseFilter || []]
  getList()
}

function onSortField(event: any) {
  if (event) {
    payload.value.sortBy = event.sortField
    payload.value.sortType = event.sortOrder
    parseDataTableFilter(event.filter)
  }
}

const disabledSearch = computed(() => {
  // return !(filterToSearch.value.criterial || filterToSearch.value.search)
  return false
})

const disabledClearSearch = computed(() => {
  return !(filterToSearch.value.criterial || filterToSearch.value.search)
})
// -------------------------------------------------------------------------------------------------------

// WATCH FUNCTIONS -------------------------------------------------------------------------------------
watch(payloadOnChangePage, (newValue) => {
  payload.value.page = newValue?.page ? newValue?.page : 0
  payload.value.pageSize = newValue?.rows ? newValue.rows : 10

  getList()
})

watch(() => idItemToLoadFirstTime.value, async (newValue) => {
  if (!newValue) {
    clearForm()
  }
  else {
    await getItemById(newValue)
  }
})
// -------------------------------------------------------------------------------------------------------
/* async function openModalPass() {
  openDialogPass.value = true
  clearPasswordFields();
} */

function openModalPass() {
  console.log('Esta entrando')
  openDialogPass.value = true // Abre el modal
  clearPasswordFields() // Limpia los campos de contraseña
  // Aquí puedes usar el idItem si es necesario
}

function validateAndSavePassword() {
  if (itemPassword.value.newPassword !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'La contraseña nueva y confirmar contraseña deben ser iguales.',
      life: 3000,
    })
    return
  }
  savePassword(itemPassword.value)
}

function clearPasswordFields() {
  itemPassword.value.oldPassword = ''
  itemPassword.value.newPassword = ''
  confirmPassword.value = ''
}
// TRIGGER FUNCTIONS -------------------------------------------------------------------------------------
onMounted(() => {
  filterToSearch.value.criterial = ENUM_FILTER[0]
  getList()
})
// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="flex justify-content-between align-items-center">
    <h3 class="mb-0">
      Conexión a Base de Datos
    </h3>

    <div v-if="options?.hasOwnProperty('showCreate') ? options?.showCreate : true" class="my-2 flex justify-content-end px-0">
      <Button v-tooltip.left="'Nuevo'" label="Nuevo" icon="pi pi-plus" severity="primary" @click="clearForm" />
    </div>
  </div>
  <div class="grid">
    <div class="col-12 order-0 md:order-1 md:col-6 xl:col-9">
      <div class="card p-0">
        <Accordion :active-index="0" class="mb-2">
          <AccordionTab>
            <template #header>
              <div class="text-white font-bold custom-accordion-header">
                Filtros
              </div>
            </template>
            <div class="flex gap-4 flex-column lg:flex-row">
              <div class="flex align-items-center gap-2">
                <label for="email3">Criterio</label>
                <div class="w-full lg:w-auto">
                  <Dropdown
                    v-model="filterToSearch.criterial"
                    :options="[...ENUM_FILTER]"
                    option-label="name"
                    placeholder="Criterio"
                    return-object="false"
                    class="align-items-center w-full"
                    show-clear
                  />
                </div>
              </div>
              <div class="flex align-items-center gap-2">
                <label for="email">Buscar</label>
                <div class="w-full lg:w-auto">
                  <IconField icon-position="left" class="w-full">
                    <InputText v-model="filterToSearch.search" type="text" placeholder="Escriba un texto" class="w-full" />
                    <InputIcon class="pi pi-search" />
                  </IconField>
                </div>
              </div>
              <div class="flex align-items-center">
                <Button v-tooltip.top="'Buscar'" class="w-3rem mx-2" icon="pi pi-search" :disabled="disabledSearch" :loading="loadingSearch" @click="searchAndFilter" />
                <Button v-tooltip.top="'Limpiar'" outlined class="w-3rem" icon="pi pi-filter-slash" :disabled="disabledClearSearch" :loading="loadingSearch" @click="clearFilterToSearch" />
              </div>
            <!-- <div class="col-12 md:col-3 sm:mb-2 flex align-items-center">
            </div> -->
            <!-- <div class="col-12 md:col-5 flex justify-content-end">
            </div> -->
            </div>
          </AccordionTab>
        </Accordion>
      </div>
      <DynamicTable

        :data="listItems"
        :columns="columns"
        :options="options"
        :pagination="pagination"
        @on-confirm-create="clearForm"
        @open-edit-dialog="getItemById($event)"
        @update:clicked-item="getItemById($event)"
        @on-change-pagination="payloadOnChangePage = $event"
        @on-change-filter="parseDataTableFilter"
        @on-list-item="resetListItems"
        @on-sort-field="onSortField"
      />
    </div>
    <div class="col-12 order-1 md:order-0 md:col-6 xl:col-3">
      <div class="bg-white">
        <div class="font-bold text-lg px-4 bg-primary custom-card-header" style="padding-top: 10px; padding-bottom: 10px">
          {{ formTitle }}
        </div>
        <div class="card">
          <EditFormV3
            :key="formReload"
            :fields="currentFields"
            :item="item"
            :show-actions="true"
            :loading-save="loadingSaveAll"
            :show-config-button="true"
            @cancel="clearForm"
            @open-modal-pass="openModalPass"
            @delete="requireConfirmationToDelete($event)"
            @submit="requireConfirmationToSave($event)"
          />
          <Dialog
            v-model:visible="openDialogPass"
            :id-item="idItem"
            modal
            class="mx-3 sm:mx-0"

            content-class="border-round-bottom border-top-1 surface-border"
            :style="{ width: '30%' }"
            :pt="{
              root: {
                class: 'custom-dialog',
              },
              header: {
                style: 'padding-top: 0.5rem; padding-bottom: 0.5rem',
              },
              mask: {
                style: 'backdrop-filter: blur(5px)',
              },
            }"
            @update:password="savePassword"
            @hide="openDialogPass = false"
          >
            <template #header>
              <div class="flex justify-content-between">
                <h5 class="m-0">
                  Cambiar contraseña
                </h5>
              </div>
            </template>
            <template #default>
              <form @submit.prevent="validateAndSavePassword">
                <div class="field mb-4 mt-4 ">
                  <label for="old-password" class="block font-bold mb-2 required">Contraseña Anterior <span class="required-indicator ml-2"> * </span></label>

                  <InputText
                    id="old-password"
                    v-model="itemPassword.oldPassword"
                    type="password"
                    class="w-full"
                    placeholder="Introduzca la contraseña"
                    required
                  />
                </div>
                <div class="field mb-4">
                  <label for="new-password" class="block font-bold mb-2 required">Nueva contraseña <span class="required-indicator ml-2"> * </span></label>
                  <InputText
                    id="new-password"
                    v-model="itemPassword.newPassword"
                    type="password"
                    class="w-full "
                    placeholder="Introduzca su nueva contraseña"
                    required
                  />
                </div>
                <div class="field mb-4">
                  <label for="confirm-password" class="block font-bold mb-2 required">Confirmar nueva contraseña <span class="required-indicator ml-2"> * </span></label>
                  <InputText
                    id="confirm-password"
                    v-model="confirmPassword"
                    type="password"
                    class="w-full"
                    placeholder="Confirme la nueva contraseña"
                    required
                  />
                </div>
                <div class="field flex justify-content-end">
                  <Button type="submit" label="Guardar" class="p-button-primary mr-2" />
                  <Button label="Cancelar" severity="danger" @click="openDialogPass = false" />
                </div>
              </form>
            </template>
          </Dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .required {
  position: relative;
}
.required-indicator {
  color: rgba(199, 17, 17, 0.863);
  font-size: 16px;
  position: absolute;
  top: 0;
}
  </style>
