<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PageState } from 'primevue/paginator'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import type { IFormField } from '@/@core/fields/interfaces/IFieldInterfaces'
import { GenericService } from '@/@core/services/generic-services'
import { ModulesService } from '@/app/modules/services'
import { ServicesService } from '@/app/customers/services'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import TextFieldComponnent from '@/@core/fields/TextFieldComponnent.vue'
import DynamicTable from '@/@core/table/DynamicTable.vue'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import EditFormV2WithImage from '~/@core/form/EditFormV2WithImage.vue'
import { type FilterCriteria, getList } from '~/composables/list'
import getUrlByImage from '~/composables/files'

const toast = useToast()
const businessStore = useBusinessStore()
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current

const forceSave = ref(false)
const active = ref(0)
const loadingSaveModules = ref(false)
const loadingSaveServices = ref(false)
const loadingSaveAll = ref(false)
const idBusiness = ref('')
const listProvince = ref<any[]>([])
const listCanton = ref<any[]>([])
const listParroquia = ref<any[]>([])
const listModules = ref<any>([[], []])
const listServices = ref<any>([[], []])
const listServicesItems = ref<any[]>([])

const errorInTab = ref({
  tabGeneralData: false,
  tabMedicalInfo: false,
  tabServices: false,
  tabPermissions: false
})

const itemsServicesList = ref<any[]>([])
const itemsServicesListTable = ref<any[]>([])
const realoadServices = ref(0)
const realoadPrice = ref(0)
const formService = ref(0)
const submitFormServices = ref(false)

const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    dataType: 'image',
    class: 'field col-12 md:col-3',
    headerClass: 'mb-1',
  },
  {
    field: 'ruc',
    header: 'RUC',
    dataType: 'text',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    validation: z.string()
      .min(1, 'El campo ruc es requerido')
      .max(13, 'Máximo 13 caracteres')
      .length(13, 'El campo debe contener 13 caracteres')
      .regex(/^\d{13}$/, 'El campo debe ser numérico'),
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo descripción es requerido').max(250, 'Máximo 250 caracteres')
  },
  {
    field: 'address',
    header: 'Dirección',
    dataType: 'textarea',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo dirección es requerido').max(250, 'Máximo 250 caracteres')
  },
  {
    field: 'longitude',
    header: 'Longitud',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo longitud es requerido').max(15, 'Máximo 15 caracteres')
  },
  {
    field: 'latitude',
    header: 'Latitud',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'El campo latitud es requerido').max(15, 'Máximo 15 caracteres')
  },
  {
    field: 'provinceDto',
    header: 'Provincia',
    dataType: 'select',
    class: 'field col-12 md:col-3 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo provincia es requerido'),
      name: z.string().min(1, 'El campo provincia es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo provincia es requerido' }),
  },
  {
    field: 'cantonDto',
    header: 'Cantón',
    dataType: 'select',
    class: 'field col-12 md:col-3 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo cantón es requerido'),
      name: z.string().min(1, 'El campo cantón es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo cantón es requerido' }),
  },
  {
    field: 'parroquiaDto',
    header: 'Parroquia',
    dataType: 'select',
    class: 'field col-12 md:col-3 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'El campo parroquia es requerido'),
      name: z.string().min(1, 'El campo parroquia es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'El campo parroquia es requerido' }),
  },
]

const item = ref({
  image: '',
  name: '',
  description: '',
  ruc: '',
  address: '',
  longitude: '',
  latitude: '',
  provinceDto: null,
  cantonDto: null,
  parroquiaDto: null,
})

const fieldsWithImage = ['image', 'name', 'ruc', 'description', 'address', 'longitude', 'latitude', 'provinceDto', 'cantonDto', 'parroquiaDto']

const confApi = reactive({
  generalData: {
    moduleApi: 'identity',
    uriApi: 'business',
  },
  tabModules: {
    moduleApi: 'identity',
    uriApi: 'business-module',
  },
  tabServices: {
    moduleApi: 'calendar',
    uriApi: 'business-services',
  },
  tabShiftServices: {
    moduleApi: 'shift',
    uriApi: 'business-services',
  },
})

const formConfigService = ref<IFormField>(
  {
    service: {
      value: '',
      label: 'Servicios',
      type: 'select',
      isRequired: true,
      moduleApi: 'calendar',
      uriApi: 'service',
      filter: [
        {
          key: 'name',
          operator: 'LIKE',
          value: '',
          logicalOperation: 'OR'
        }
      ],
      showRequiredLabel: true,
      returnObject: true,
      placeholder: 'Escriba el nombre del servicio...',
      errorMessage: [],
      haveError: false,
      col: '6'
    },
    price: {
      value: '',
      label: '',
      type: 'number',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: 'Precio',
      errorMessage: [],
      haveError: false,
      maxLength: 5,
      showCounter: false,
      validationKeywords: ['maxLength'],
      col: '6'
    },
  }
)

const columnsServices: IColumn[] = [
  { field: 'service', header: 'Servicio', type: 'text', sortable: false },
  { field: 'price', header: 'Precio', type: 'text', sortable: false },
]

const options = ref({
  tableName: 'Servicio',
  moduleApi: '',
  uriApi: '',
  loading: false,
  showAcctions: true,
  actionsAsMenu: false,
  showToolBar: false,
  showTitleBar: false,
  showFilters: false,
  showEdit: false,
  showDelete: false,
  showLocalDelete: true,
  messageToDelete: '¿Estás seguro que deseas eliminar el Servicio: {{service}}?'
})

const pagination = ref<IPagination>({
  page: 0,
  limit: 20,
  totalElements: 0,
  totalPages: 0,
  search: ''
})

const payloadOnChangePage = ref<PageState>()

async function getObjectValues($event: any) {
  forceSave.value = false
  item.value = $event
}

async function getCantonById(id: string) {
  if (id && id !== '') {
    const filter: FilterCriteria[] = [
      {
        key: 'type',
        operator: 'EQUALS',
        value: 'CANTON',
        logicalOperation: 'AND'
      },
    ]
    listCanton.value = await getList(id, filter)
  }
  else {
    listCanton.value = []
  }
}

async function getParroquiaById(id: string) {
  if (id) {
    const filter: FilterCriteria[] = [
      {
        key: 'type',
        operator: 'EQUALS',
        value: 'PARROQUIA',
        logicalOperation: 'AND'
      },
    ]
    listParroquia.value = await getList(id, filter)
  }
  else {
    listParroquia.value = []
  }
}

function cancelReceipt(event: any) {
  formConfigService.value.service.value = ''
  formConfigService.value.price.value = ''
  realoadServices.value += 1
  realoadPrice.value += 1
  formService.value += 1
}

function addItemToListServices() {
  if (!formConfigService.value.service.value || formConfigService.value.service.value === null || formConfigService.value.service.value === '') {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un servicio', life: 3000 })
    return
  }

  const existService = itemsServicesListTable.value.some(item => item.service === formConfigService.value.service.value.name)
  if (existService) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Ya existe el servicio en la lista', life: 3000 })
    return
  }

  submitFormServices.value = true
  const payload: { [key: string]: any } = {}
  let countError = 0
  for (const key in formConfigService.value) {
    if (formConfigService.value.hasOwnProperty(key)) {
      if (formConfigService.value[key].haveError) {
        countError += 1
      }
      const value = formConfigService.value[key].value
      payload[key] = value
    }
  }

  if (countError === 0) {
    formConfigService.value.price.value = formConfigService.value.price.value !== '' ? formConfigService.value.price.value : 0
    itemsServicesListTable.value = [...itemsServicesListTable.value, { ...payload, service: formConfigService.value.service.value.name, price: formConfigService.value.price.value }]
    pagination.value.totalElements = itemsServicesListTable.value.length

    itemsServicesListTable.value = itemsServicesListTable.value.sort((a, b) => {
      const fa = a.service.toLowerCase()
      const fb = b.service.toLowerCase()
      if (fa < fb) {
        return -1
      }
      if (fa > fb) {
        return 1
      }
      return 0
    })

    formConfigService.value.service.value = ''
    formConfigService.value.price.value = 0
    realoadServices.value += 1
    realoadPrice.value += 1
    formService.value += 1
  }
}

function deleteItemReceipt(event: any) {
  const index = itemsServicesListTable.value.findIndex(item => item.service === event.service)
  if (index !== -1) {
    itemsServicesListTable.value.splice(index, 1)
    formConfigService.value.service.value = ''
    formConfigService.value.price.value = ''
    realoadServices.value += 1
    realoadPrice.value += 1
    formService.value += 1
  }
}

const goToList = async () => await navigateTo('/business')

async function getListModules() {
  try {
    const payload = {
      filter: [],
      query: '',
      pageSize: 300,
      page: 0,
      sortBy: 'name',
      sortType: 'ASC'
    }
    listModules.value[0] = await ModulesService.getListModules(payload)
  }
  catch (error) {

  }
}

async function getListServices() {
  try {
    const payload = {
      filter: [
        {
          key: 'businessServices.business.id',
          operator: 'EQUALS',
          value: currentBussiness.value.businessId, // 'cf4457a4-06b3-4285-a89e-700f0101f2d0',
          logicalOperation: 'AND'
        }
      ],
      query: '',
      pageSize: 300,
      page: 0
    }
    listServices.value[0] = await ServicesService.getList(payload)
  }
  catch (error) {

  }
}

async function getListServicesOnDemand(query: string = '') {
  try {
    const payload
        = {
          filter: [
            {
              key: 'name',
              operator: 'LIKE',
              value: query,
              logicalOperation: 'OR'
            },
            {
              key: 'description',
              operator: 'LIKE',
              value: query,
              logicalOperation: 'OR'
            },
          ],
          query: '',
          pageSize: 200,
          page: 0,
          sortBy: 'name',
          sortType: 'ASC'
        }

    const response = await GenericService.search('calendar', 'service', payload)
    const { data: dataList, page, size, totalElements, totalPages } = response
    pagination.value.page = page
    pagination.value.limit = size
    pagination.value.totalElements = totalElements
    pagination.value.totalPages = totalPages
    listServicesItems.value = []
    for (const iterator of dataList) {
      listServicesItems.value = [...listServicesItems.value, { id: iterator.id, name: iterator.name, status: iterator.status }]
    }

    const temporal = listServicesItems.value.filter(itemA =>
      !itemsServicesListTable.value.some(itemB => itemB.service === itemA.name)
    )
    listServicesItems.value = temporal
  }
  catch (error) {
    console.error('Error on loading module list:', error)
  }
}

async function assignModules() {
  try {
    loadingSaveModules.value = true

    if (listModules.value[1].length > 0) {
      const listIds = listModules.value[1].map((item: any) => item.id)
      const payloadData = {
        idBusiness: idBusiness.value,
        modules: [...listIds]
      }
      await GenericService.create(confApi.tabModules.moduleApi, confApi.tabModules.uriApi, payloadData)
    }
  }
  catch (error) {

  }
  finally {
    loadingSaveModules.value = false
  }
}

async function assignServices() {
  loadingSaveServices.value = true
  let listTemp: any[] = []
  for (const data of itemsServicesListTable.value) {
    // Si lo que viene es un objeto, modifica su valor por el id de dicho objeto
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        data[key] = data[key].id
      }
    }
    const serv = listServices.value[0].find((item: { name: any }) => item.name === data.service)
    const obj = {
      service: typeof serv === 'object' ? serv.id : '',
      price: data.price
    }
    listTemp = [...listTemp, obj]
  }
  const payload = {
    idBusiness: idBusiness.value,
    services: [...listTemp]
  }
  await GenericService.create(confApi.tabServices.moduleApi, confApi.tabServices.uriApi, { ...payload })
  await GenericService.create(confApi.tabShiftServices.moduleApi, confApi.tabShiftServices.uriApi, { ...payload })
  loadingSaveServices.value = false
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
  payload.image = typeof payload.image === 'object' ? await getUrlByImage(payload.image) : payload.image
  payload.geographicLocation = typeof payload.parroquiaDto === 'object' ? payload.parroquiaDto.id : payload.parroquiaDto
  delete payload.provinceDto
  delete payload.cantonDto
  delete payload.parroquiaDto

  try {
    const response = await GenericService.create(confApi.generalData.moduleApi, confApi.generalData.uriApi, payload)
    if (response) {
      idBusiness.value = response.id
      await assignModules()
      await assignServices()
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

onMounted(async () => {
  listProvince.value = await getList('', [
    {
      key: 'type',
      operator: 'EQUALS',
      value: 'PROVINCE',
      logicalOperation: 'AND'
    },
  ])
  await getListModules()
  // getListServices()
})
</script>

<template>
  <div class="justify-content-center align-center">
    <div class="p-4" style="width: 100%; max-height: device-height; height: 78vh; overflow-y: auto">
      <b>Datos Generales</b>
      <Divider class="mt-1" align="left" type="solid" />

      <div class="card mb-5">
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
          <template #field-provinceDto="{ item: data, onUpdate }">
            <Dropdown
              v-if="!loadingSaveAll"
              v-model="data.provinceDto"
              :options="[...listProvince]"
              option-label="name"
              return-object="false"
              show-clear
              class="h-2rem align-items-center"
              @update:model-value="($event) => {
                if ($event) {
                  getCantonById($event.id)
                }
                else {
                  listCanton = []
                  listParroquia = []
                }
                onUpdate('cantonDto', null)
                onUpdate('parroquiaDto', null)
                onUpdate('provinceDto', $event)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
          <template #field-cantonDto="{ item: data, onUpdate }">
            <Dropdown
              v-if="!loadingSaveAll"
              v-model="data.cantonDto"
              :options="[...listCanton]"
              option-label="name"
              return-object="false"
              show-clear
              class="h-2rem align-items-center"
              @update:model-value="($event) => {
                if ($event && $event.id) {
                  getParroquiaById($event.id)
                }
                else {
                  listParroquia = []
                }
                onUpdate('parroquiaDto', null)
                onUpdate('cantonDto', $event)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
          <template #field-parroquiaDto="{ item: data, onUpdate }">
            <Dropdown
              v-if="!loadingSaveAll"
              v-model="data.parroquiaDto"
              :options="[...listParroquia]"
              option-label="name"
              return-object="false"
              class="h-2rem align-items-center"
              show-clear
              @change="($event) => {
                onUpdate('parroquiaDto', $event.value)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
        </EditFormV2WithImage>
      </div>

      <!-- ----------------------------------------------------------------- -->
      <span v-if="false">
        <b>Servicios</b>
        <Divider class="mt-1" align="left" type="solid" />

        <div key="formReceipt" class="card pb-0">
          <div class="grid p-fluid formgrid p-0">
            <div class="col-12 md:col-8 field">
              <DebouncedAutoCompleteComponent
                v-if="!loadingSaveAll"
                id="autocomplete"
                field="name"
                item-value="id"
                :placeholder="formConfigService.service.placeholder"
                :model="formConfigService.service.value"
                :suggestions="listServicesItems"
                @update:model-value="formConfigService.service.value = $event"
                @load="($event) => getListServicesOnDemand($event)"
              />
            </div>
            <div class="col-12 md:col-2 field">
              <TextFieldComponnent
                :key="realoadPrice"
                class="h-2rem"
                :properties="formConfigService.price"
                :submit="submitFormServices"
                :validation-keywords="[...formConfigService.price.validationKeywords, 'onlyNumbers']"
                @update:model-value="formConfigService.price.value = $event"
                @update:error-messages="formConfigService.price.errorMessage = $event"
                @invalid-field="formConfigService.price.haveError = $event"
              />
            </div>
            <div class="col-12 md:col-2 field flex justify-content-end align-items-end">
              <Button class="w-3rem h-2rem mx-1 flex align-items-center justify-content-center" label="" @click="addItemToListServices">
                <i class="pi pi-plus" style="font-size: 1.3rem" />
              </Button>
              <Button v-if="true" class="w-3rem h-2rem mx-1 flex align-items-center justify-content-center" label="" severity="secondary" @click="cancelReceipt">
                <i class="pi pi-filter-slash" style="font-size: 1.3rem" />
              </Button>
            </div>
            <div v-if="false" class="col-12 md:col-12 flex justify-content-end">
              <Button
                severity="secondary"
                outlined
                class="w-8rem mt-2 mx-3"
                icon="pi pi-check"
                label="Cancelar"
                @click="cancelReceipt"
              />
              <Button
                class="w-8rem mt-2"
                icon="pi pi-check"
                label="Aceptar"
                @click="addItemToListServices"
              />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="grid p-fluid formgrid">
            <div class="col-12">
              <DynamicTable
                :data="itemsServicesListTable"
                :columns="columnsServices"
                :options="options"
                :pagination="pagination"
                :show-local-delete="true"
                @on-local-delete="deleteItemReceipt"
              />
            </div>
          </div>
        </div>
      </span>

      <b>Asignar Módulos</b>
      <Divider class="mt-1" align="left" type="solid" />

      <div class="card mb-5">
        <PickList v-model="listModules" :show-target-controls="false" :show-source-controls="false" list-style="height:442px" data-key="id" breakpoint="1400px">
          <template #sourceheader>
            Lista de Módulos
          </template>
          <template #targetheader>
            Módulos Seleccionados
          </template>
          <template #item="slotProps">
            <div class="flex flex-wrap p-2 align-items-center gap-3">
              <div class="flex-1 flex flex-column gap-2">
                <span class="font-bold">{{ slotProps.item.name }}</span>
                <div v-if="false" class="flex align-items-center gap-2">
                  <i class="pi pi-tag text-sm" />
                  <span>{{ slotProps.item.desc }}</span>
                </div>
              </div>
              <!-- acctions -->
              <span class="font-bold">{{ slotProps.item.cantPermissions }}</span>
            </div>
          </template>
        </PickList>

        <div v-if="false" class="p-card-footer flex justify-content-end mt-5">
          <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cancelar" @click="goToList()" />
          <Button class="w-8rem" label="Asignar" :loading="loadingSaveModules" @click="assignModules" />
        </div>
      </div>
      <div class="px-4 mt-3">
        <div class="card">
          <div class="flex justify-content-end">
            <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cancelar" @click="goToList()" />
            <Button class="w-8rem" label="Aceptar" :loading="loadingSaveAll" :disabled="errorInfForm()" @click="forceSave = true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
