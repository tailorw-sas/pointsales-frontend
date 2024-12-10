<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import type { PageState } from 'primevue/paginator'
import type { IFormField } from '@/@core/fields/interfaces/IFieldInterfaces'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import { GenericService } from '@/@core/services/generic-services'
import { ModulesService } from '@/app/modules/services'
import { ServicesService } from '@/app/customers/services'
import DynamicTable from '@/@core/table/DynamicTable.vue'
import { type FilterCriteria, getList } from '~/composables/list'
import EditFormV2WithImage from '~/@core/form/EditFormV2WithImage.vue'

const route = useRoute()
const toast = useToast()

const dialogReload = ref(0)
const loadingSaveBusiness = ref(false)
const listModules = ref<any>([[], []])
const listServices = ref<any>([[], []])
const listProvince = ref<any[]>([])
const listCanton = ref<any[]>([])
const listParroquia = ref<any[]>([])
const listServicesItems = ref<any[]>([])

const itemsServicesList = ref<any[]>([])
const itemsServicesListTable = ref<any[]>([])
const realoadServices = ref(0)
const realoadPrice = ref(0)
const formService = ref(0)
const submitFormServices = ref(false)
const loadingSaveAll = ref(false)
const forceSave = ref(false)

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
})

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
    disabled: true,
    validation: z.string()
      .min(1, 'El campo ruc es requerido')
      .max(13, 'Máximo 13 caracteres')
      .length(13, 'El campo debe contener 13 caracteres')
      .regex(/^\d{13}$/, 'El campo ruc debe ser numérico'),
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    disabled: true,
    validation: z.string().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    disabled: true,
    validation: z.string().min(1, 'El campo descripción es requerido').max(250, 'Máximo 250 caracteres')
  },
  {
    field: 'address',
    header: 'Dirección',
    dataType: 'textarea',
    class: 'field col-12 required md:col-6',
    headerClass: 'mb-1',
    disabled: true,
    validation: z.string().min(1, 'El campo dirección es requerido').max(250, 'Máximo 250 caracteres')
  },
  {
    field: 'longitude',
    header: 'Longitud',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    disabled: true,
    validation: z.string().min(1, 'El campo longitud es requerido').max(8, 'Máximo 8 caracteres')
  },
  {
    field: 'latitude',
    header: 'Latitud',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    disabled: true,
    validation: z.string().min(1, 'El campo latitud es requerido').max(8, 'Máximo 8 caracteres')
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

const errorInTab = ref({
  tabGeneralData: false,
  tabMedicalInfo: false,
  tabServices: false,
  tabPermissions: false
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
      col: '6',
      disabled: true
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
      col: '6',
      disabled: true
    },
  }
)

const columnsServices: IColumn[] = [
  { field: 'service', header: 'Servicio', type: 'text', sortable: false },
  { field: 'price', header: 'Precio', type: 'text', sortable: false },
]

const options = ref({
  tableName: 'Servicio',
  moduleApi: 'calendar',
  uriApi: 'service',
  loading: false,
  showAcctions: false,
  actionsAsMenu: false,
  showToolBar: false,
  showTitleBar: false,
  showFilters: false,
  showEdit: false,
  showDelete: false,
  showLocalDelete: false,
  messageToDelete: '¿Estás seguro que deseas eliminar el Servicio: {{service}}?'
})

const formOptionsToEdit = ref({
  moduleApi: 'identity',
  uriApi: 'business',
  itemId: route.params ? route.params.id.toString() : '',
  btnTextSave: 'Siguiente',
  btnTextCancel: 'Cancelar',
  showBtnSave: false,
  showBtnCancel: false,
  showBtnActions: false,
  formWithImage: ['image', 'name', 'description']
})

const pagination = ref<IPagination>({
  page: 0,
  limit: 20,
  totalElements: 0,
  totalPages: 0,
  search: ''
})
const payloadOnChangePage = ref<PageState>()

const goToList = async () => await navigateTo('/')

async function assignModules() {
  try {
    loadingSaveBusiness.value = true
    loadingSaveAll.value = true

    const listIds = listModules.value[1].map((item: any) => item.id) || []
    const payloadData = {
      idBusiness: route.params ? route.params.id.toString() : '',
      modules: [...listIds]
    }
    await GenericService.updateWithOutId('identity', 'business-module', payloadData)
  }
  catch (error) {
  }
  finally {
    loadingSaveBusiness.value = false
    loadingSaveAll.value = false
  }
}

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

async function getListSelectedModules() {
  let listTemp = []
  listTemp = await ModulesService.getListSelected(formOptionsToEdit.value.itemId)

  if (listTemp.length > 0) {
    listTemp = listTemp.sort((a, b) => {
      const fa = a.name.toLowerCase()
      const fb = b.name.toLowerCase()
      if (fa < fb) {
        return -1
      }
      if (fa > fb) {
        return 1
      }
      return 0
    })
    for (const iterator of listTemp) {
      moveObjectToSecondList(iterator.id)
    }
  }
}

function moveObjectToSecondList(objectId) {
  const index = listModules.value[0].findIndex(obj => obj.id === objectId)
  if (index !== -1) {
    const objectToMove = listModules.value[0].splice(index, 1)[0]
    listModules.value[1].push(objectToMove)
  }
}

async function getListServices() {
  try {
    listServices.value[0] = []
    const payload = {
      filter: [],
      query: '',
      pageSize: 300,
      page: 0
    }
    listServices.value[0] = await ServicesService.getList(payload)
  }
  catch (error) {

  }
}

async function getListSelectedServices() {
  try {
    options.value.loading = true
    itemsServicesList.value = []
    let newListItems = []

    const response = await GenericService.getById('calendar', 'business-services/services', formOptionsToEdit.value.itemId)

    const { data: dataList, page, size, totalElements, totalPages } = response

    pagination.value.page = page
    pagination.value.limit = size
    pagination.value.totalElements = totalElements
    pagination.value.totalPages = totalPages

    const existingIds = new Set(itemsServicesList.value.map(item => item.id))
    for (const iterator of dataList) {
      if (!existingIds.has(iterator.service.id)) {
        newListItems.push({ ...iterator, service: iterator.service.name, loadingEdit: false, loadingDelete: false })
        existingIds.add(iterator.id)
      }
    }

    newListItems = newListItems.sort((a, b) => {
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

    itemsServicesListTable.value = [...itemsServicesListTable.value, ...newListItems]
  }
  catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 3000 })
  }
  finally {
    options.value.loading = false
  }
}

async function assignServices() {
  try {
    loadingSaveBusiness.value = true
    loadingSaveAll.value = true

    if (itemsServicesListTable.value.length > 0) {
      let listTemp: any[] = []
      for (const iterator of itemsServicesListTable.value) {
        const serv = listServices.value[0].find((item: { name: any }) => item.name === iterator.service)
        const obj = {
          service: typeof serv === 'object' ? serv.id : '',
          price: iterator.price
        }
        listTemp = [...listTemp, obj]
      }
      const payloadData = {
        idBusiness: route.params ? route.params.id.toString() : '',
        services: [...listTemp]
      }
      await GenericService.updateWithOutId('calendar', 'business-services', payloadData)
      goToList()
    }
  }
  catch (error) {

  }
  finally {
    loadingSaveBusiness.value = false
    loadingSaveAll.value = false
  }
}

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
    const { data: dataList } = response
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error cargando el listado de servicios', life: 5000 })
    console.error('Error on loading module list:', error)
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

async function getItemById() {
  loadingSaveAll.value = true
  try {
    const response = await GenericService.getById(confApi.generalData.moduleApi, confApi.generalData.uriApi, route.params ? route.params.id.toString() : '')
    if (response) {
      item.value.image = response.image
      item.value.name = response.name
      item.value.description = response.description
      item.value.ruc = response.ruc
      item.value.address = response.address
      item.value.longitude = response.longitude
      item.value.latitude = response.latitude

      const parrquiaId = response.geolocation.id
      const responseLocations = await GenericService.getById('identity', 'locations', parrquiaId)

      if (responseLocations) {
        const geolocation = responseLocations
        await getCantonById(geolocation.parent.parent.id)
        await getParroquiaById(geolocation.parent.id)

        item.value.provinceDto = listProvince.value.find(item => item.id === geolocation.parent.parent.id)
        item.value.cantonDto = listCanton.value.find(item => item.id === geolocation.parent.id)
        item.value.parroquiaDto = listParroquia.value.find(item => item.id === geolocation.id)
      }
    }
    dialogReload.value += 1
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos de la empresa', life: 3000 })
    }
  }
  finally {
    loadingSaveAll.value = false
  }
}

onMounted(async () => {
  listProvince.value = await getList('', [
    {
      key: 'type',
      operator: 'EQUALS',
      value: 'PROVINCE',
      logicalOperation: 'AND'
    },
  ])
  await getItemById()
  await getListServices()
  await getListSelectedServices()
})
</script>

<template>
  <div class="justify-content-center align-center">
    <div class="p-4" style="width: 100%; max-height: device-height; height: 78vh; overflow-y: auto">
      <b>Perfil de la Empresa</b>
      <Divider class="mt-1" align="left" type="solid" />

      <div class="card mb-5">
        <EditFormV2WithImage
          :key="dialogReload"
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
              disabled
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
              disabled
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
              disabled
              @change="($event) => {
                onUpdate('parroquiaDto', $event.value)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
        </EditFormV2WithImage>
      </div>

      <b>Servicios</b>
      <Divider class="mt-1" align="left" type="solid" />

      <div class="card">
        <div class="grid p-fluid formgrid">
          <div class="col-12">
            <DynamicTable
              :data="itemsServicesListTable"
              :columns="columnsServices"
              :options="options"
              :pagination="pagination"
              :show-local-delete="false"
              @on-change-pagination="payloadOnChangePage = $event"
            />
          </div>
        </div>
      </div>

      <div class="px-4 mt-3">
        <div class="card">
          <div class="flex justify-content-end">
            <Button class="w-8rem mr-3" severity="secondary" icon="pi pi-times" label="Cerrar" @click="goToList()" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
