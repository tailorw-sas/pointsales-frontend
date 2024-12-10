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
import getUrlByImage from '~/composables/files'

// VARIABLES -----------------------------------------------------------------------------------------
const toast = useToast()
const confirm = useConfirm()
const listItems = ref<any[]>([])
const formReload = ref(0)
const dbConnectionList = ref<any[]>([])
const loadingSaveAll = ref(false)
const idItem = ref('')
const idItemToLoadFirstTime = ref('')
const loadingSearch = ref(false)
const loadingDelete = ref(false)
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})

const fields: Array<FieldDefinitionType> = [
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12 mt-3 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo código es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'dbConection',
    header: 'DB Connection',
    dataType: 'select',
    class: 'field col-12 required',
    validation: validateEntityStatus('Conexión a Base de Datos'),

  },
  {
    field: 'type',
    header: 'Tipo',
    dataType: 'select',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo tipo es requerido'),
      name: z.string().min(1, 'El campo tipo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo tipo es requerido' }),
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12',
    headerClass: 'mb-1'
  },
  {
    field: 'query',
    header: 'Consulta',
    dataType: 'textarea',
    class: 'field col-12 required',
    validation: z.string().trim().min(1, 'El campo consulta es requerido').max(150, 'Máximo 150 caracteres')
  },
  {
    field: 'file',
    header: 'Reporte',
    dataType: 'file',
    class: 'field col-12 required',
    headerClass: 'mb-1',
  },
  {
    field: 'status',
    header: 'Activo',
    dataType: 'check',
    class: 'field col-12 required',

  },
]

const confApi = reactive({
  moduleApi: 'report',
  uriApi: 'jasper-report-template',
})

const item = ref<GenericObject>({
  code: '',
  name: '',
  type: null,
  description: '',
  file: '',
  query: '',
  dbConection: null,
  status: true

})

const itemTemp = ref<GenericObject>({
  code: '',
  name: '',
  type: null,
  description: '',
  file: '',
  query: '',
  dbConection: null,
  status: true
})

const formTitle = computed(() => {
  return idItem.value ? 'Editar' : 'Crear'
})
// -------------------------------------------------------------------------------------------------------

// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'templateCode', header: 'Código', type: 'text' },
  { field: 'templateName', header: 'Nombre', type: 'text' },
  { field: 'templateDescription', header: 'Descripción', type: 'text' },
  { field: 'type', header: 'Tipo', type: 'local-select', localItems: ENUM_REPORT_TYPE },
  { field: 'createdAt', header: 'Fecha', type: 'text' },
  { field: 'status', header: 'Activo', type: 'bool' },
]
// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'templateCode', name: 'Código' },
  { id: 'templateName', name: 'Nombre' },
]
// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Configuración de reporte',
  moduleApi: 'report',
  uriApi: 'jasper-report-template',
  loading: false,
  actionsAsMenu: false,
  showAcctions: false,
  showHeaderToolBar: false,
  messageToDelete: '¿Estás seguro que deseas eliminar la configuración: {{name}}?'
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
  fields[0].disabled = false
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
      if (!existingIds.has(iterator.id)) {
        newListItems.push({ ...iterator, templateCode: iterator.code, templateName: iterator.name, templateDescription: iterator.description, loadingEdit: false, loadingDelete: false })
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
        item.value.id = response.id
        item.value.code = response.code
        item.value.name = response.name
        item.value.type = ENUM_REPORT_TYPE.find(item => item.id === response.type)
        item.value.description = response.description
        item.value.query = response.query
        item.value.status = statusToBoolean(response.status)
        if (response.dbConection) {
          item.value.dbConection = {
            id: response.dbConection.id,
            name: response.dbConection.name,
            code: response.dbConection.code,
            status: response.dbConection.status
          }
        }
      }

      formReload.value += 1
      fields[0].disabled = true
      updateFieldProperty(fields, 'status', 'disabled', false)
    }
    catch (error) {
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Configuración de reporte no pudo ser cargada', life: 3000 })
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
    payload.file = typeof payload.file === 'object' ? await getUrlByImage(payload.file) : payload.file
    payload.type = typeof payload.type === 'object' ? payload.type.id : payload.type
    payload.dbConection = typeof payload.dbConection === 'object' ? payload.dbConection.id : payload.dbConection
    payload.status = statusToString(payload.status)
    await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
  }
}

async function updateItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.file = typeof payload.file === 'object' ? await getUrlByImage(payload.file) : payload.file
  payload.type = typeof payload.type === 'object' ? payload.type.id : payload.type
  payload.dbConection = typeof payload.dbConection === 'object' ? payload.dbConection.id : payload.dbConection
  payload.status = statusToString(payload.status)

  await GenericService.update(confApi.moduleApi, confApi.uriApi, idItem.value || '', payload)
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

async function getConnectionList(query: string = '') {
  try {
    const payload: IQueryRequest = {
      filter: [{
        key: 'name',
        operator: 'LIKE',
        value: query,
        logicalOperation: 'OR'
      }, {
        key: 'code',
        operator: 'LIKE',
        value: query,
        logicalOperation: 'OR'
      }],
      query: '',
      pageSize: 20,
      page: 0,

    }

    const response = await GenericService.search('report', 'db-connection', payload)
    const { data: dataList } = response
    dbConnectionList.value = []
    for (const iterator of dataList) {
      dbConnectionList.value = [...dbConnectionList.value, { id: iterator.id, name: `${iterator.code} - ${iterator.name}`, status: iterator.status }]
    }
  }
  catch (error) {
    console.error('Error cargando lista de conexiones:', error)
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
      Configuración de Reporte
    </h3>
    <IfCan :perms="['ADMINISTRACION:GESTION-REPORTE']">
      <div v-if="options?.hasOwnProperty('showCreate') ? options?.showCreate : true" class="my-2 flex justify-content-end px-0">
        <Button v-tooltip.left="'Nuevo'" label="Nuevo" icon="pi pi-plus" severity="primary" @click="clearForm" />
      </div>
    </IfCan>
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
            :fields="fields"
            :item="item"
            :show-actions="true"
            :loading-save="loadingSaveAll"
            :permission-save="idItem ? ['ADMINISTRACION:GESTION-REPORTE'] : ['ADMINISTRACION:GESTION-REPORTE']"
            :permission-delete="['ADMINISTRACION:GESTION-REPORTE']"
            @cancel="clearForm"
            @delete="requireConfirmationToDelete($event)"
            @submit="requireConfirmationToSave($event)"
          >
            <template #field-type="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"
                v-model="data.type"
                :options="[...ENUM_REPORT_TYPE]"
                option-label="name"
                return-object="false"
                show-clear
                @update:model-value="($event) => {
                  onUpdate('type', $event)
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>
            <template #field-dbConection="{ item: data, onUpdate }">
              <DebouncedAutoCompleteComponent
                v-if="!loadingSaveAll" id="autocomplete" field="name"
                item-value="id" :model="data.dbConection" :suggestions="dbConnectionList" @change="($event) => {
                  onUpdate('dbConection', $event)
                }" @load="($event) => getConnectionList($event)"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>
          </EditFormV3>
        </div>
      </div>
    </div>
  </div>
</template>
