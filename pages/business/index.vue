<script setup lang="ts">
import type { PageState } from 'primevue/paginator'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref, watch } from 'vue'
import type { IFilter, IFormField, IQueryRequest } from '@/@core/fields/interfaces/IFieldInterfaces'
import CreateForm from '@/@core/form/CreateForm.vue'
import EditForm from '@/@core/form/EditForm.vue'
import { GenericService } from '@/@core/services/generic-services'
import DynamicTable from '@/@core/table/DynamicTable.vue'
import type { IBusiness, IData } from '@/@core/table/interfaces/IModelData'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import BusinessQrCodeDialog from '~/app/business/components/businessQrCodeDialog.vue'

// VARIABLES -----------------------------------------------------------------------------------------
const listItems = ref<IBusiness[]>([])

const dialogReload = ref(0)
const idItem = ref('')
const showQRDialog = ref(false)
const loadingSearch = ref(false)
const isEdit = ref(false)
const dialogConfig = ref({
  visible: false,
  header: ''
})
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})

// FORM CONFIG -------------------------------------------------------------------------------------------
const formConfig = ref<IFormField>(
  {
    logo: {
      value: '',
      label: 'Logo',
      type: 'image',
      isRequired: false,
      showRequiredLabel: true,
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
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    ruc: {
      value: '',
      label: 'Ruc',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    description: {
      value: '',
      label: 'Descripción',
      type: 'textarea',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      validationKeywords: [],
      col: '12'
    },
    latitude: {
      value: '',
      label: 'Latitud',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    longitude: {
      value: '',
      label: 'Longitud',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: true,
      validationKeywords: [],
      col: '6'
    },
    provinceDto: {
      value: '',
      label: 'Provincia',
      type: 'select',
      isRequired: false,
      moduleApi: 'patients',
      uriApi: 'locations',
      filter: [
        {
          key: 'type',
          operator: 'EQUALS',
          value: 'PROVINCE',
          logicalOperation: 'AND'
        },
      ],
      showRequiredLabel: false,
      placeholder: 'Seleccione una provincia',
      errorMessage: [],
      haveError: false,
      col: '6'
    },
    cantonDto: {
      keyRef: 0,
      keyValue: 'provinceDto',
      value: '',
      label: 'Cantón',
      type: 'dependent-select',
      isRequired: false,
      moduleApi: 'patients',
      uriApi: 'locations',
      filter: [
        {
          key: 'type',
          operator: 'EQUALS',
          value: 'CANTON',
          logicalOperation: 'AND'
        },
      ],
      showRequiredLabel: false,
      placeholder: 'Seleccione un cantón',
      errorMessage: [],
      haveError: false,
      col: '6'
    },
    parroquiaDto: {
      keyRef: 0,
      keyValue: 'cantonDto',
      value: '',
      label: 'Parroquia',
      type: 'dependent-select',
      isRequired: false,
      moduleApi: 'patients',
      uriApi: 'locations',
      filter: [
        {
          key: 'type',
          operator: 'EQUALS',
          value: 'PARROQUIA',
          logicalOperation: 'AND'
        },
      ],
      showRequiredLabel: false,
      placeholder: 'Seleccione una parroquia',
      errorMessage: [],
      haveError: false,
      col: '12'
    },
  }
)

const formOptions = ref({
  moduleApi: 'identity',
  uriApi: 'business',
})

const formOptionsToEdit = ref({
  moduleApi: 'identity',
  uriApi: 'business',
  itemId: ''
})

// -------------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'ruc', name: 'RUC' },
  { id: 'name', name: 'Nombre' },
]
// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'image', header: '', type: 'image' },
  { field: 'ruc', header: 'RUC', type: 'text' },
  { field: 'name', header: 'Nombre', type: 'text' },
  { field: 'balance', header: 'Balance', type: 'text' },
  { field: 'description', header: 'Descripción', type: 'text' },
  { field: 'createdAt', header: 'Fecha de Creación', type: 'date' },
]
// -------------------------------------------------------------------------------------------------------

// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Empresa',
  moduleApi: 'identity',
  uriApi: 'business',
  loading: false,
  actionsAsMenu: false,
  showAcctions: true,
  showEdit: true,
  showDelete: false,
  onlyOneItem: false,
  showGenerateQr: true,
  showHeaderToolBar: false,
  messageToDelete: '¿Estás seguro que deseas eliminar la empresa: {{name}}?'
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
const payloadToList = ref<any>(
  {
    pagination: {
      page: 0,
      limit: 5,
      totalElements: 0,
      totalPages: 0,
    },
    filters: {

    }
  }
)
// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------
async function getList() {
  if (options.value.loading) {
    return
  }
  try {
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
        newListItems.push({ ...iterator, createdAt: new Date(iterator.createdAt), loadingEdit: false, loadingDelete: false })
        existingIds.add(iterator.id)
      }
    }

    listItems.value = [...listItems.value, ...newListItems]
  }
  catch (error) {
    console.error(error)
  }
  finally {
    options.value.loading = false
    if (listItems.value.length > 0) {
      idItem.value = listItems.value[0].id ?? ''
    }
  }
}

async function resetListItems() {
  payload.value.page = 0
  getList()
}

async function openQRDialog(event: any) {
  idItem.value = event.id
  showQRDialog.value = true
}

const openCreateDialog = async () => await navigateTo({ path: 'business/create' })

const openEditDialog = async (item: any) => await navigateTo({ path: `business/edit/${item}` })

function onCloseDialog($event: Event) {
  dialogReload.value += 1
  dialogConfig.value.visible = false
}

function createFilter(formConfig: IFormField, keyValue: string) {
  const value = formConfig[keyValue].value?.id // Obtener el valor de la propiedad "id"
  return {
    key: 'parent.id',
    operator: 'EQUALS',
    value,
    logicalOperation: 'AND'
  }
}

function handleFormConfigChange(newValue: IFormField) {
  const keysWithKeyValue = Object.keys(newValue).filter(key => newValue[key].hasOwnProperty('keyValue'))

  keysWithKeyValue.forEach((key) => {
    const filter = createFilter(newValue, key)
    if (filter.value) {
      newValue[key].filter?.push(filter)
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

// -------------------------------------------------------------------------------------------------------
const disabledSearch = computed(() => {
  // return !(filterToSearch.value.criterial || filterToSearch.value.search)
  return false
})

const disabledClearSearch = computed(() => {
  return !(filterToSearch.value.criterial || filterToSearch.value.search)
})
// WATCH FUNCTIONS -------------------------------------------------------------------------------------
watch(payloadOnChangePage, (newValue) => {
  payload.value.page = newValue?.page ? newValue?.page : 0
  payload.value.pageSize = newValue?.rows ? newValue.rows : 10

  getList()
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
      Empresas
    </h3>
    <div class="flex my-2 px-0">
      <IfCan :perms="['ADMINISTRACION:GESTION-EMPRESAS']">
        <div v-if="options?.hasOwnProperty('showCreate') ? options?.showCreate : true" class="pr-2">
          <Button v-tooltip.left="'Nuevo'" label="Nuevo" icon="pi pi-plus" severity="primary" @click="openCreateDialog" />
        </div>
      </IfCan>
    </div>
  </div>
  <div class="grid">
    <div class="col-12">
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
              <div class="w-full lg:w-auto">
                <IconField icon-position="left" class="w-full">
                  <InputText v-model="filterToSearch.search" type="text" placeholder="Escriba un texto" class="w-full" />
                  <InputIcon class="pi pi-search" />
                </IconField>
              </div>

              <div class="flex align-items-center">
                <Button v-tooltip.top="'Buscar'" class="w-3rem mx-2" icon="pi pi-search" :disabled="disabledSearch" :loading="loadingSearch" @click="searchAndFilter" />
                <Button v-tooltip.top="'Limpiar'" outlined class="w-3rem" icon="pi pi-filter-slash" :disabled="disabledClearSearch" :loading="loadingSearch" @click="clearFilterToSearch" />
              </div>
            </div>
          </accordionTab>
        </accordion>
      </div>
      <DynamicTable
        :data="listItems"
        :columns="columns"
        :options="options"
        :pagination="pagination"
        :show-edit="true"
        :show-delete="false"
        :show-actions="true"
        :actions-width="140"
        @open-edit-dialog="openEditDialog($event)"
        @on-change-pagination="payloadOnChangePage = $event"
        @on-change-filter="parseDataTableFilter"
        @on-list-item="resetListItems"
        @on-sort-field="onSortField"
        @open-generate-qr-dialog="openQRDialog($event)"
      />
    </div>
  </div>

  <div class="12">
    <Dialog
      v-model:visible="dialogConfig.visible"
      modal
      :header="dialogConfig.header || ''"
      class="mx-3 sm:mx-0 sm:w-full md:w-6 lg:w-5"
      content-class="border-round-bottom border-top-1 surface-border p-0"
      @hide="dialogConfig.visible = false"
    >
      <CreateForm
        v-if="isEdit === false"
        :key="dialogReload"
        :list-fields="formConfig"
        :form-options="formOptions"
        @close="onCloseDialog($event)"
        @save="getList"
      />
      <EditForm
        v-if="isEdit === true"
        :key="dialogReload"
        :list-fields="formConfig"
        :form-options="formOptionsToEdit"
        @close="onCloseDialog($event)"
        @save="getList"
      />
      <!-- <template #footer>
                    <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cancelar" @click="onClose()"></Button>
                    <Button class="w-8rem" icon="pi pi-check" label="Save" :loading="loadingForm" :disabled="disabledForm" @click="saveItem()"></Button>
                </template> -->
    </Dialog>
    <div v-if="showQRDialog" class="col-12">
      <BusinessQrCodeDialog :open-dialog="showQRDialog" :business-id="idItem" @close="() => showQRDialog = false" />
    </div>
  </div>
</template>
