<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { PageState } from 'primevue/paginator'
import { z } from 'zod'
import { filter } from 'lodash'
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

const loadingSaveAll = ref(false)
const idItem = ref('')
const idItemToLoadFirstTime = ref('')
const loadingSearch = ref(false)
const loadingDelete = ref(false)
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})

const urlRegex = /^(http(s)?:\/\/.)?(www\.)?[-\w@:%.+~#=]{2,256}\.[a-z]{2,6}\b([-\w@:%+.~#?&/=]*)$/

const fieldsWithImage = ['image', 'title', 'type', 'link', 'description']
const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    header: '',
    disabled: false,
    dataType: 'image',
    class: 'field col-12 required mt-3',
    headerClass: 'mb-1',
  },
  {
    field: 'title',
    header: 'Título',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo título es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'type',
    header: 'Tipo',
    dataType: 'select',
    class: 'field col-12 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo tipo es requerido'),
      name: z.string().min(1, 'El campo tipo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo tipo es requerido' }),
  },
  {
    field: 'link',
    header: 'Link',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo link es requerido').regex(urlRegex, 'Url no válida').nullable().optional()
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12',
    headerClass: 'mb-1'
  },
]

const confApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'advertising-content',
})

const item = ref<GenericObject>({
  image: '',
  title: '',
  type: null,
  link: '',
  description: '',
})

const itemTemp = ref<GenericObject>({
  image: '',
  title: '',
  type: null,
  link: '',
  description: '',
})

const formTitle = computed(() => {
  return idItem.value ? 'Editar' : 'Crear'
})
// -------------------------------------------------------------------------------------------------------

// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'image', header: '', type: 'image', sortable: false },
  { field: 'title', header: 'Título', type: 'text' },
  { field: 'type', header: 'Tipo', type: 'local-select', localItems: ENUM_GUIDE },
  { field: 'description', header: 'Descripción', type: 'text' },
]
// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'title', name: 'Título' },
  { id: 'type', name: 'Tipo' },
]
// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Publicidad',
  moduleApi: 'cloudbridges',
  uriApi: 'advertising-content',
  loading: false,
  actionsAsMenu: false,
  showAcctions: false,
  showHeaderToolBar: false,
  messageToDelete: '¿Estás seguro que deseas eliminar la publicación: {{title}}?'
})
const payloadOnChangePage = ref<PageState>()
const payload = ref<IQueryRequest>({
  filter: [],
  query: '',
  pageSize: 10,
  page: 0,
  sortBy: 'title',
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
        newListItems.push({ ...iterator, loadingEdit: false, loadingDelete: false })
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
  if (filterToSearch.value.criterial?.id === ENUM_FILTER[0].id && filterToSearch.value.search) {
    payload.value.filter = [...payload.value.filter, {
      key: filterToSearch.value.criterial ? filterToSearch.value.criterial.id : '',
      operator: 'LIKE',
      value: filterToSearch.value.search,
      logicalOperation: 'AND',
      type: 'filterSearch',
    }]
  }
  if (filterToSearch.value.criterial?.id === ENUM_FILTER[1].id && filterToSearch.value.search) {
    payload.value.filter = [...payload.value.filter, {
      key: 'type',
      operator: 'EQUALS',
      value: filterToSearch.value.search.id,
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
        item.value.image = response.image
        item.value.title = response.title
        item.value.type = ENUM_GUIDE.find(item => item.id === response.type)
        item.value.link = response.link
        item.value.description = response.description
      }

      formReload.value += 1
    }
    catch (error) {
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Publicación no pudo ser cargada', life: 3000 })
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
    if (payload.image) {
      const imageURL = await getUrlByImage(payload.image)
      if (imageURL) {
        payload.image = imageURL
      }
    }
    payload.type = typeof payload.type === 'object' ? payload.type.id : payload.type
    await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
  }
}

async function updateItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  if (typeof payload.image === 'object') {
    const imageURL = await getUrlByImage(payload.image)
    if (imageURL) {
      payload.image = imageURL
    }
  }
  payload.type = typeof payload.type === 'object' ? payload.type.id : payload.type
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
function requireConfirmationToDelete(item: any) {
  const { event } = item
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
      Publicidad
    </h3>
    <IfCan :perms="['ADMINISTRACION:GESTION-PUBLICIDAD']">
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
                <div v-if="filterToSearch.criterial?.id === ENUM_FILTER[1].id" class="w-full lg:w-auto">
                  <Dropdown
                    v-if="!loadingSaveAll"
                    v-model="filterToSearch.search"
                    :options="[...ENUM_GUIDE]"
                    option-label="name"
                    placeholder="Seleccione una opción"
                    return-object="false"
                    class="align-items-center w-full"
                    show-clear
                  />
                  <Skeleton v-else height="2rem" class="mb-2" />
                </div>
                <div v-if="filterToSearch.criterial?.id === ENUM_FILTER[0].id" class="w-full lg:w-auto">
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
            :field-with-image="[...fieldsWithImage]"
            :fields="fields"
            :item="item"
            :show-actions="true"
            :loading-save="loadingSaveAll"
            :permission-save="idItem ? ['ADMINISTRACION:GESTION-PUBLICIDAD'] : ['ADMINISTRACION:GESTION-PUBLICIDAD']"
            :permission-delete="['ADMINISTRACION:GESTION-PUBLICIDAD']"
            @cancel="clearForm"
            @delete="requireConfirmationToDelete($event)"
            @submit="requireConfirmationToSave($event)"
          >
            <template #field-type="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"
                v-model="data.type"
                :options="[...ENUM_GUIDE]"
                option-label="name"
                return-object="false"
                show-clear
                @update:model-value="($event) => {
                  onUpdate('type', $event)
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>
          </EditFormV3>
        </div>
      </div>
    </div>
  </div>
</template>
