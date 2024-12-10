<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { v4 as uuidv4 } from 'uuid'
import { onMounted, ref, watch } from 'vue'
import type { PageState } from 'primevue/paginator'
import { base64ToFile } from '@/utils/helpers'
import { GenericService } from '~/@core/services/generic-services'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import type { IFilter, IQueryRequest } from '@/@core/fields/interfaces/IFieldInterfaces'
import DynamicTable from '@/@core/table/DynamicTable.vue'

const businessStore = useBusinessStore()
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current

const route = useRoute()
const campaignId = ref('')

const toast = useToast()
const listItems = ref<any[]>([])
const fileUpload = ref()
const inputFile = ref()
const inputFileName = ref('')

const uploadComplete = ref(false)
const loadingSaveAll = ref(false)
const haveErrorImportStatus = ref(false)

const confApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'email-list/import',
})

const confShiftApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'email-list',
})
// VARIABLES -----------------------------------------------------------------------------------------
const idItem = ref('')

// -------------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'email', header: 'Correo Electrónico', type: 'text' },
  { field: 'clientName', header: 'Nombre Cliente', type: 'text' },
  { field: 'clientLastname', header: 'Apellidos Cliente', type: 'text' },
  { field: 'impSta', header: 'Estado Imp.', type: 'slot-text', frozen: true, showFilter: false },
]
// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Importar Correos',
  moduleApi: 'cloudbridges',
  uriApi: 'email-list/import',
  loading: false,
  showDelete: false,
  showFilters: true,
  actionsAsMenu: false,
  messageToDelete: '¿Estás seguro que deseas eliminar el elemento seleccionado?'
})

const payloadOnChangePage = ref<PageState>()
const payload = ref<IQueryRequest>({
  filter: [],
  query: '',
  pageSize: 10,
  page: 0,
  // sortBy: 'updatedAt',
  // sortType: 'ASC'
})

const pagination = ref<IPagination>({
  page: 0,
  limit: 20,
  totalElements: 0,
  totalPages: 0,
  search: '',
})

// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------

async function clearForm() {
  inputFile.value = null
  inputFileName.value = ''
  await navigateTo('/mailjet-campaign')
}

async function onChangeFile(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    inputFile.value = event.target.files[0]
    inputFileName.value = inputFile.value.name
    uploadComplete.value = false
    event.target.value = ''
  }
}

async function getErrorList() {
  try {
    payload.value = { ...payload.value, query: idItem.value }
    let rowError = ''
    listItems.value = []
    const newListItems = []
    const response = await GenericService.importSearch(confShiftApi.moduleApi, confShiftApi.uriApi, payload.value)
    const { data: dataList, page, size, totalElements, totalPages } = response

    pagination.value.page = page
    pagination.value.limit = size
    pagination.value.totalElements = totalElements
    pagination.value.totalPages = totalPages

    const existingIds = new Set(listItems.value.map(item => item.id))

    for (const iterator of dataList) {
      rowError = ''
      // Verificar si el ID ya existe en la lista
      if (!existingIds.has(iterator.id)) {
        for (const err of iterator.errorFields) {
          rowError += `- ${err.message} \n`
        }
        newListItems.push({ ...iterator.row, id: iterator.id, impSta: `Error fila ${iterator.rowNumber}: \n ${rowError}`, loadingEdit: false, loadingDelete: false })
        existingIds.add(iterator.id) // Añadir el nuevo ID al conjunto
      }
    }

    listItems.value = [...listItems.value, ...newListItems]
  }
  catch (error) {
    console.error('Error cargar datos:', error)
    haveErrorImportStatus.value = true
  }
}

async function importFile() {
  loadingSaveAll.value = true
  options.value.loading = true
  let successOperation = true
  uploadComplete.value = true
  try {
    if (!inputFile.value) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor seleccione un archivo', life: 10000 })
      return
    }
    const uuid = uuidv4()
    idItem.value = uuid
    const base64String: any = await fileToBase64(inputFile.value)
    const base64 = base64String.split('base64,')[1]

    const file = await base64ToFile(base64, inputFile.value.name, inputFile.value.type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('importProcessId', uuid)
    formData.append('campaignId', campaignId.value.toString())
    await GenericService.importFile(confApi.moduleApi, confApi.uriApi, formData)

    if (successOperation) {
      await validateStatusImport()
      if (!haveErrorImportStatus.value) {
        await getErrorList()
        if (!haveErrorImportStatus.value && listItems.value.length === 0) {
          toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Archivo importado correctamente', life: 3000 })
          options.value.loading = false
          await clearForm()
        }
        else {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor verifique los datos del archivo', life: 3000 })
          uploadComplete.value = false
          options.value.loading = false
        }
      }
    }
  }
  catch (error: any) {
    successOperation = false
    uploadComplete.value = false
    options.value.loading = false
    toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 10000 })
  }
  finally {
    loadingSaveAll.value = false
    options.value.loading = false
  }
}

async function validateStatusImport() {
  options.value.loading = true
  return new Promise<void>((resolve) => {
    let status = 'RUNNING'
    const intervalID = setInterval(async () => {
      try {
        const response = await GenericService.getById(confShiftApi.moduleApi, confShiftApi.uriApi, idItem.value, 'import-status')
        status = response.status
      }
      catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
        haveErrorImportStatus.value = true
        clearInterval(intervalID)
        uploadComplete.value = false
        options.value.loading = false
        resolve() // Resuelve la promesa cuando el estado es FINISHED
      }

      if (status === 'FINISHED') {
        clearInterval(intervalID)
        options.value.loading = false
        resolve() // Resuelve la promesa cuando el estado es FINISHED
      }
    }, 5000)
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

async function resetListItems() {
  payload.value.page = 0
  getErrorList()
}

watch(payloadOnChangePage, (newValue) => {
  payload.value.page = newValue?.page ? newValue?.page : 0
  payload.value.pageSize = newValue?.rows ? newValue.rows : 10

  getErrorList()
})

onMounted(async () => {
  listItems.value = []

  campaignId.value = route.query.id?.toString() || ''
})
</script>

<template>
  <div class="grid">
    <div class="col-12 order-0 w-full md:order-1 md:col-6 xl:col-9">
      <div class=" p-0">
        <Accordion :active-index="0" class="mb-2">
          <AccordionTab>
            <template #header>
              <div
                class="text-white font-bold custom-accordion-header flex justify-content-between w-full align-items-center"
              >
                <div>
                  Importar correos
                </div>
              </div>
            </template>
            <div class="grid p-0 m-0" style="margin: 0 auto;">
              <div class="col-12 md:col-6 lg:col-6 align-items-center my-0 py-0">
                <div class="flex align-items-center mb-2">
                  <label class="w-7rem">Importar archivo: </label>

                  <div class="w-full ">
                    <div class="p-inputgroup w-full">
                      <InputText
                        ref="fileUpload" v-model="inputFileName" placeholder="Seleccione archivo" class="w-full"
                        show-clear aria-describedby="inputtext-help"
                      />
                      <span class="p-inputgroup-addon p-0 m-0">
                        <Button
                          icon="pi pi-file-import" severity="secondary" class="w-2rem h-2rem p-0 m-0"
                          @click="fileUpload.click()"
                        />
                      </span>
                    </div>
                    <small id="username-help" style="color: #808080;">seleccione un archivo de tipo XLS o XLSX</small>
                    <input
                      ref="fileUpload" type="file" style="display: none;"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      @change="onChangeFile"
                    >
                  </div>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>

      <DynamicTable
        :data="listItems" :columns="columns" :options="options" :pagination="pagination"
        @on-confirm-create="clearForm" @on-change-pagination="payloadOnChangePage = $event"
        @on-change-filter="parseDataTableFilter" @on-list-item="resetListItems" @on-sort-field="onSortField"
      >
        <template #column-impSta="{ data }">
          <div id="fieldError" v-tooltip.bottom="data.impSta" class="ellipsis-text">
            <span style="color: red;">{{ data.impSta }}</span>
          </div>
        </template>
      </DynamicTable>

      <div class="flex align-items-end justify-content-end">
        <Button
          v-tooltip.top="'Importar correos'" class="w-3rem mx-2" icon="pi pi-check" :disabled="uploadComplete"
          @click="importFile"
        />
        <Button
          v-tooltip.top="'Cancelar'" severity="secondary" class="w-3rem p-button" icon="pi pi-times"
          @click="clearForm"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.custom-file-upload {
  background-color: transparent !important;
  border: none !important;
  text-align: left !important;
}

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 250px;
  /* Ajusta el ancho máximo según tus necesidades */
}
</style>
