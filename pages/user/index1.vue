<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { PageState } from 'primevue/paginator'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import DynamicTable from '@/@core/table/DynamicTable'
import { GenericService } from '@/@core/services/generic-services'
import type { IFilter, IFormField, IQueryRequest } from '@/@core/fields/interfaces/IFieldInterfaces'
import type { IPatient } from '@/@core/table/interfaces/IModelData'
import CreateForm from '@/@core/form/CreateForm.vue'
import EditForm from '@/@core/form/EditForm.vue'
import { ENUM_STATUS, ENUM_USER_TYPE } from '@/@core/utils/Enums'

// VARIABLES -----------------------------------------------------------------------------------------
const toast = useToast()
const listItems = ref<IPatient[]>([])

const loadingForm = ref(false)
const dialogReload = ref(0)
const filters = ref(null)
const isEdit = ref(false)
const dialogConfig = ref({
  visible: false,
  header: ''
})

// FORM CONFIG -------------------------------------------------------------------------------------------
const formConfig = ref<IFormField>(
  {
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
      col: '12'
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
      col: '12'
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
      validationKeywords: [],
      col: '12'
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
      col: '12'
    },
  }
)

const formOptions = ref({
  moduleApi: 'identity',
  uriApi: 'users',
})

const formOptionsToEdit = ref({
  moduleApi: 'identity',
  uriApi: 'users',
  itemId: ''
})

// -------------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------

// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'image', header: '', type: 'image' },
  { field: 'name', header: 'Nombre', type: 'text' },
  { field: 'lastName', header: 'Apellidos', type: 'text' },
  { field: 'email', header: 'Correo Electrónico', type: 'text' },
  { field: 'userName', header: 'Usuario', type: 'text' },
  { field: 'userType', header: 'Tipo', type: 'local-select', localItems: ENUM_USER_TYPE },
  { field: 'status', header: 'Estado', type: 'local-select', localItems: ENUM_STATUS },
  { field: 'createdAt', header: 'Fecha de Creación', type: 'date' },
]
// -------------------------------------------------------------------------------------------------------

// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Usuarios',
  moduleApi: 'identity',
  uriApi: 'users',
  loading: false,
  actionsAsMenu: false
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
  options.value.loading = true
  listItems.value = []

  const response = await GenericService.search(options.value.moduleApi, options.value.uriApi, payload.value)

  const { data: dataList, page, size, totalElements, totalPages } = response

  pagination.value.page = page
  pagination.value.limit = size
  pagination.value.totalElements = totalElements
  pagination.value.totalPages = totalPages

  for (const iterator of dataList) {
    listItems.value = [...listItems.value, { ...iterator, loadingEdit: false, loadingDelete: false }]
  }
  options.value.loading = false
}

async function resetListItems() {
  payload.value.page = 0
  getList()
}

async function openCreateDialog() {
  await navigateTo({ path: 'user/create' })
}

async function openEditDialog(item: any) {
  await navigateTo({ path: `user/edit/${item}` })
}

function onCloseDialog($event) {
  dialogReload.value += 1
  dialogConfig.value.visible = false
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

// -------------------------------------------------------------------------------------------------------

// WATCH FUNCTIONS -------------------------------------------------------------------------------------
watch(payloadOnChangePage, (newValue) => {
  payload.value.page = newValue?.page ? newValue?.page : 0
  payload.value.pageSize = newValue?.rows ? newValue.rows : 10

  getList()
})
// -------------------------------------------------------------------------------------------------------

// TRIGGER FUNCTIONS -------------------------------------------------------------------------------------
onMounted(() => {
  getList()
})
// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <DynamicTable
        :data="listItems"
        :columns="columns"
        :options="options"
        :pagination="pagination"
        @on-confirm-create="openCreateDialog"
        @open-edit-dialog="openEditDialog($event)"
        @on-change-pagination="payloadOnChangePage = $event"
        @on-change-filter="parseDataTableFilter"
        @on-list-item="resetListItems"
        @on-sort-field="onSortField"
      />
    </div>

    <div class="12">
      <Dialog
        v-model:visible="dialogConfig.visible"
        modal
        :header="dialogConfig.header || ''"
        class="mx-3 sm:mx-0 sm:w-full md:w-6 lg:w-3"
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
      </Dialog>
    </div>
  </div>
</template>
