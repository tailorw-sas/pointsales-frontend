<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { PageState } from 'primevue/paginator'
import { z } from 'zod'
import dayjs from 'dayjs'
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
const businessStore = useBusinessStore()
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current
const { data } = useAuth()
const currentUser = (data.value as any).user
// const isAdmin = (data.value?.user as any)?.isAdmin === true

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

const fields: Array<FieldDefinitionType> = [
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12 mt-3 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo código es requerido').max(50, 'Máximo 50 caracteres')
      .regex(/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/i, 'Solo letras y números permitidos')
  },
  {
    field: 'subject',
    header: 'Asunto',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo asunto es requerido').max(50, 'Máximo 50 caracteres')
      .regex(/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/i, 'Solo letras y números permitidos')
  },
  {
    field: 'campaignDate',
    header: 'Fecha',
    dataType: 'date',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.date({
      required_error: 'El campo fecha es requerido',
      invalid_type_error: 'El campo fecha es requerido',
    })
  },
  {
    field: 'templateId',
    header: 'Plantilla',
    dataType: 'select',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo plantilla es requerido'),
      name: z.string().min(1, 'El campo plantilla es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo plantilla es requerido' }),
  },
  {
    field: 'amountEmailSent',
    header: 'Cant. Correos Enviados',
    dataType: 'number',
    class: 'field col-12 mb-3 mt-3',
    headerClass: 'mb-1',
    hidden: true
  },
  {
    field: 'amountEmailOpen',
    header: 'Cant. Correos Abiertos',
    dataType: 'number',
    class: 'field col-12 mb-3 mt-3',
    headerClass: 'mb-1',
    hidden: true
  },
  {
    field: 'status',
    header: 'Estado',
    dataType: 'select',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    disabled: true,
  },
]

const confCampaignApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'campaign',
})

const item = ref<GenericObject>({
  code: '',
  subject: '',
  campaignDate: '',
  templateId: null,
  amountEmailSent: 0,
  amountEmailOpen: 0,
  status: null

})

const itemTemp = ref<GenericObject>({
  code: '',
  subject: '',
  campaignDate: '',
  templateId: null,
  amountEmailSent: 0,
  amountEmailOpen: 0,
  status: null
})

const formTitle = computed(() => {
  return idItem.value ? 'Editar' : 'Crear'
})
// -------------------------------------------------------------------------------------------------------
const templateList = ref<any[]>([])
const confMailjetTemplateApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'template',
})
// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'code', header: 'Código', type: 'text' },
  { field: 'subject', header: 'Asunto', type: 'text' },
  { field: 'campaignDate', header: 'Fecha', type: 'date' },
  { field: 'status', header: 'Estado', type: 'local-select', localItems: ENUM_STATUS_CAMPAIGN },
]
// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'code', name: 'Código' },
  { id: 'subject', name: 'Asunto' },
]
// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Campañas',
  moduleApi: 'cloudbridges',
  uriApi: 'campaign',
  loading: false,
  actionsAsMenu: false,
  showAcctions: true,
  showHeaderToolBar: false,
  showEdit: true,
  toolTipEdit: 'Cargar',
  showDelete: false,
  iconEdit: 'pi pi-upload',
  messageToDelete: '¿Estás seguro que deseas eliminar la campaña: {{name}}?'
})
const payloadOnChangePage = ref<PageState>()
const payload = ref<IQueryRequest>({
  filter: [],
  query: '',
  pageSize: 10,
  page: 0,
  sortBy: 'updateDate',
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
async function clearForm() {
  item.value = { ...itemTemp.value }
  idItem.value = ''
  item.value.status = ENUM_STATUS_CAMPAIGN[0]
  fields[6].disabled = true
  formReload.value++
  // await getList()
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
        iterator.status = ENUM_STATUS_CAMPAIGN.find(x => x.id === iterator.status)
        iterator.campaignDate = new Date(iterator.campaignDate)
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
      const response = await GenericService.getById(options.value.moduleApi, options.value.uriApi, id)
      if (response) {
        item.value.id = response.campaignDto.id
        item.value.code = response.campaignDto.code
        item.value.subject = response.campaignDto.subject
        item.value.campaignDate = response.campaignDto.campaignDate ? dayjs(response.campaignDto.campaignDate).format('YYYY-MM-DD') : null
        item.value.templateId = templateList.value.find(x => x.id === response.campaignDto.template.id)
        item.value.status = ENUM_STATUS_CAMPAIGN.find(x => x.id === response.campaignDto.status)
        item.value.amountEmailSent = response.campaignDto.amountEmailSent
        item.value.amountEmailOpen = response.campaignDto.amountEmailOpen

        updateFieldProperty(fields, 'status', 'disabled', false)
      }

      formReload.value += 1
      // fields[0].disabled = true
    }
    catch (error) {
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Campaña no pudo ser cargada', life: 3000 })
      }
    }
    finally {
      loadingSaveAll.value = false
    }
  }
}

async function createItem(item: { [key: string]: any }) {
  try {
    if (item) {
      loadingSaveAll.value = true
      const payload = {
        userId: currentUser.userId,
        code: item.code,
        subject: item.subject,
        campaignDate: dayjs(item.campaignDate).format('YYYY-MM-DD'),
        templateId: typeof item.templateId === 'object' ? item.templateId.id : item.templateId,
        tenantId: currentBussiness.value.businessId,
        status: typeof item.status === 'object' ? item.status.id : item.status,
      }

      const response = await GenericService.create(confCampaignApi.moduleApi, confCampaignApi.uriApi, payload)
      return response
    }
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error creando el registro', life: 3000 })
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function updateItem(item: { [key: string]: any }) {
  try {
    if (item) {
      loadingSaveAll.value = true
      const payload = {
        userId: currentUser.userId,
        code: item.code,
        subject: item.subject,
        campaignDate: dayjs(item.campaignDate).format('YYYY-MM-DD'),
        templateId: typeof item.templateId === 'object' ? item.templateId.id : item.templateId,
        tenantId: currentBussiness.value.businessId,
        amountEmailSent: item.amountEmailSent,
        amountEmailOpen: item.amountEmailOpen,
        status: typeof item.status === 'object' ? item.status.id : item.status,
      }

      await GenericService.update(confCampaignApi.moduleApi, confCampaignApi.uriApi, idItem.value || '', payload)
    }
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error actualizando el registro', life: 3000 })
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function deleteItem(id: string) {
  try {
    loadingDelete.value = true
    await GenericService.deleteItem(confCampaignApi.moduleApi, confCampaignApi.uriApi, id)
    clearForm()
    getList()
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error eliminando el registro', life: 5000 })
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
    }
    catch (error: any) {
      successOperation = false
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
  }
  loadingSaveAll.value = false
  if (successOperation) {
    clearForm()
    await getList()
  }
}

function requireConfirmationToSave(item: any) {
  const { event } = item
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Guardar',
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

async function getTemplateList() {
  try {
    const payload
        = {
          filter: [],
          query: '',
          pageSize: 200,
          page: 0,
          sortBy: 'name',
          sortType: 'ASC'
        }

    templateList.value = []
    const response = await GenericService.search(confMailjetTemplateApi.moduleApi, confMailjetTemplateApi.uriApi, payload)
    const { data: dataList } = response
    for (const iterator of dataList) {
      templateList.value = [...templateList.value, { id: iterator.id, name: iterator.name }]
    }
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error cargando las plantillas', life: 3000 })
  }
}

async function redirectToUpload(item: string) {
  navigateTo({ path: `/mailjet-campaign/import`, query: { id: item } })
}

async function sendCampaign(id: string) {
  try {
    loadingDelete.value = true
    await GenericService.sendItem(options.value.moduleApi, options.value.uriApi, { campaignId: id })
    toast.add({ severity: 'info', summary: 'Enviado', detail: 'Su campaña fue enviada', life: 3000 })
    await getList()
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la campaña', life: 3000 })
    loadingDelete.value = false
  }
  finally {
    loadingDelete.value = false
  }
}

// function requireConfirmationToCancelCampaign(item: any) {
//   const { event } = item
//   confirm.require({
//     target: event.currentTarget,
//     group: 'headless',
//     header: 'Cancelar campaña',
//     message: 'Desea cancelar la campaña?',
//     acceptClass: 'p-button-danger',
//     rejectLabel: 'Cancelar',
//     acceptLabel: 'Aceptar',
//     accept: () => {
//       cancelCampaign()
//     },
//     reject: () => {
//       // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
//     }
//   })
// }

function requireConfirmationToSendCampaign(item: any) {
  const { event } = item
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Enviar campaña',
    message: 'Desea enviar la campaña?',
    acceptClass: 'p-button-success',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Aceptar',
    accept: () => {
      sendCampaign(item.id)
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
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
onMounted(async () => {
  filterToSearch.value.criterial = ENUM_FILTER[0]
  await getTemplateList()
  await getList()
})
// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="flex justify-content-between align-items-center">
    <h3 class="mb-0">
      Campañas
    </h3>
    <IfCan :perms="['ADMINISTRACION:GESTION-MAILJET']">
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
        @open-edit-dialog="redirectToUpload($event)"
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
            :permission-save="idItem ? ['ADMINISTRACION:GESTION-MAILJET'] : ['ADMINISTRACION:GESTION-MAILJET']"
            :permission-delete="['ADMINISTRACION:GESTION-MAILJET']"
            :hide-save-button="idItem !== '' && item.status?.id === 'EXECUTED'"
            :show-send-campaign="idItem !== '' && item.status?.id === 'PENDING'"
            :hide-delete-button="true"
            @cancel="clearForm"
            @delete="requireConfirmationToDelete($event)"
            @submit="requireConfirmationToSave($event)"
            @send-campaign="requireConfirmationToSendCampaign($event)"
          >
            <template #field-templateId="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"

                v-model="data.templateId"
                :options="[...templateList]"
                option-label="name"
                return-object="false"
                placeholder="Seleccione una plantilla"
                empty-message="No existe datos"
                show-clear
                @update:model-value="($event) => {
                  onUpdate('templateId', $event)
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>

            <template #field-status="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"
                v-model="data.status"
                :options="[...ENUM_STATUS_CAMPAIGN]"
                option-label="name"
                return-object="false"
                placeholder="Seleccione un estado"
                empty-message="No existe datos"
                show-clear
                @update:model-value="($event) => {
                  onUpdate('status', $event)
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
