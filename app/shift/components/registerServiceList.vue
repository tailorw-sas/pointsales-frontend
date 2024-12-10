<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RegisterShiftWithDoctorDialog from '~/app/shift/components/registerShiftWithDoctorDialog.vue'
import { GenericService } from '~/@core/services/generic-services'
import type { IFilter, IQueryRequest } from '~/@core/fields/interfaces/IFieldInterfaces'
import type { IData } from '~/@core/table/interfaces/IModelData'

const businessStore = useBusinessStore()
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})
const showTurnDialog = ref(false)
const serviceIdSelected = ref('')

// CONSTANTS -----------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'externalConsultation', name: 'Consulta externa' }
]
// -------------------------------------------------------------------------------------------------------

const serviceList = ref<any[]>([])
const confServiceApi = reactive({
  moduleApi: 'calendar',
  uriApi: 'service',
})

const payload = ref<IQueryRequest>({
  filter: [
    {
      key: 'businessServices.business.id',
      operator: 'EQUALS',
      value: currentBussiness.value.businessId, // 'cf4457a4-06b3-4285-a89e-700f0101f2d0',
      logicalOperation: 'AND'
    }
  ],
  query: '',
  pageSize: 10,
  page: 0,
  sortBy: 'updatedAt',
  sortType: 'DES'
})
// TABLE OPTIONS -----------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------
async function getServiceList() {
  try {
    serviceList.value = []
    const response = await GenericService.search(confServiceApi.moduleApi, confServiceApi.uriApi, payload.value)

    const { data: dataList } = response
    for (const iterator of dataList) {
      if (iterator.type.code !== 'BSERV') {
        serviceList.value = [...serviceList.value, { id: iterator.id, name: iterator.name, image: iterator.image }]
      }
    }
  }
  catch (error) {
    console.error('Error cargando los servicios:', error)
  }
}

async function searchAndFilter() {
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type !== 'filterSearch')]
  if (filterToSearch.value.search) {
    payload.value.filter = [...payload.value.filter, {
      key: 'name',
      operator: 'LIKE',
      value: filterToSearch.value.search,
      logicalOperation: 'AND',
      type: 'filterSearch',
    }]
  }
  await getServiceList()
}

async function openTurnDialog(item: any) {
  serviceIdSelected.value = item.id
  showTurnDialog.value = true
}

async function handleTurnSubmit() {
  showTurnDialog.value = false
}

async function handleCloseDialog() {
  showTurnDialog.value = false
}
// -------------------------------------------------------------------------------------------------------

// TRIGGER FUNCTIONS -------------------------------------------------------------------------------------
onMounted(async () => {
  filterToSearch.value.criterial = ENUM_FILTER[0]
  await getServiceList()
})

// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="card p-0" style="background-color: transparent !important;">
    <div class="card p-0">
      <Accordion :active-index="0">
        <AccordionTab>
          <template #header>
            <div class="text-white font-bold custom-accordion-header">
              Servicios
            </div>
          </template>
          <div class="flex gap-4 flex-column lg:flex-row">
            <div class="flex align-items-center gap-2">
              <div class="w-full">
                <IconField icon-position="right" class="w-full">
                  <InputText v-model="filterToSearch.search" type="text" placeholder="Escriba un nombre" class="w-full" @keyup.enter="searchAndFilter" />
                  <InputIcon class="pi pi-search" @click="searchAndFilter" />
                </IconField>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
  <div class="flex flex-wrap mt-3 lg:mt-2" style="max-height: 65vh; overflow-y: auto;">
    <div v-for="(item, index) of serviceList" :key="index" class="gap-4 col-6 w-auto sm:col-4 md:col-3 lg:col-2 xl:col-2">
      <div
        class="p-ripple card card-container card-hover flex flex-column lx:flex-row justify-content-center align-items-center py-8 card-border cursor-pointer"
        style="max-width: 140px; max-height: 140px; width: 130px; height: 130px; text-align: center; margin: 0 auto"
        :style="{ backgroundColor: '#effbfc91', color: '#2399b5' }" @click="openTurnDialog(item)"
      >
        <img v-if="item.image" :src="item.image" alt="Servicio" class="w-3rem h-3rem border-circle shadow-2">
        <div v-else>
          <Avatar icon="pi pi-image" style="background-color: #dee9fc; color: #1a2551" shape="circle" size="large" class="w-4rem h-4rem border-circle shadow-2" />
        </div>
        <div
          v-if="item.name !== ''" class="flex select-none justify-content-center align-items-center border-round font-bold mt-3"
          style="align-items: center; font-size: 11px;"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>

  <div v-if="showTurnDialog" class="col-12">
    <RegisterShiftWithDoctorDialog :open-dialog="showTurnDialog" :service-id="serviceIdSelected" @submit="handleTurnSubmit" @close="handleCloseDialog" />
  </div>
</template>

<style scoped lang="scss">
.p-container {
    min-height: 75vh;
}

.card-hover {
  transition: transform 0.3s ease-in-out !important;
}

.card-hover:hover {
  transform: scale(0.8) !important;
}
.card-border {
    border: 2px solid;
    border-color: #0f8afd00;
  }

  .card-container {
  background-color: rgba(255, 255, 255, 0.1); /* Fondo blanco con opacidad baja */
  backdrop-filter: blur(10px); /* Efecto de desenfoque */
  -webkit-backdrop-filter: blur(10px); /* Efecto de desenfoque para Safari */
  border-radius: 15px; /* Bordes redondeados */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Borde sutil */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra para dar profundidad */
  padding: 15px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
</style>
