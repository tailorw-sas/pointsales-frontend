<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import html2pdf from 'html2pdf.js'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import EditFormV3 from '~/@core/form/EditFormV3.vue'
import type { FieldDefinitionType } from '~/@core/form/EditFormV3'
import { GenericService } from '~/@core/services/generic-services'
import Ticket from '~/app/shift/components/ticket.vue'

const props = defineProps({
  message: {
    type: String,
    required: false,
    default: '¿Estás seguro que desea eliminar el registro seleccionado?'
  },
  openDialog: {
    type: Boolean,
    required: true
  },
  value: {
    type: String,
    required: true,
    default: ''
  },
  serviceId: {
    type: String,
    required: true,
    default: ''
  }
})

const emits = defineEmits(['submit', 'close'])
const businessStore = useBusinessStore()
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current

const dialogVisible = ref(props.openDialog)
const showTicket = ref(false)
const showFormShift = ref(true)

// VARIABLES -----------------------------------------------------------------------------------------
const toast = useToast()
const confirm = useConfirm()
const formReload = ref(0)
const resultObject = ref({})
const ticketComponent = ref()
const ticketObject = ref({
  shiftCode: '',
  serviceName: '',
  identification: ''
})

const loadingSaveAll = ref(false)
const confApi = reactive({
  moduleApi: 'shift',
  uriApi: 'turn',
})

const resourceList = ref<any[]>([])
const confResourceApi = reactive({
  moduleApi: 'shift',
  uriApi: 'resource',
})

const fields: Array<FieldDefinitionType> = [
  {
    field: 'identification',
    header: 'Identificación',
    disabled: false,
    dataType: 'text',
    class: 'field col-12 mt-3 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'La identificación es requerida').max(13, 'Maximum 13 characters')
  }
]

const item = ref<GenericObject>({
  identification: '',
  doctor: null,
  service: null,
  business: null,
})

function closeDialog() {
  emits('close')
}

async function saveItem(item: { [key: string]: any }) {
  try {
    const payload: { [key: string]: any } = { ...item }
    const turn = {
      business: currentBussiness.value.businessId,
      service: props.serviceId,
      doctor: payload.doctor !== null && typeof payload.doctor === 'object' ? payload.doctor.id : payload.doctor,
      identification: payload.identification
    }

    const response: any = await GenericService.create(confApi.moduleApi, confApi.uriApi, turn)

    resultObject.value = { ...payload, id: response.id }
    // await getItemById()
    if (resultObject.value) {
      const response1 = await GenericService.getById(confApi.moduleApi, confApi.uriApi, response.id)
      if (response1) {
        ticketObject.value.shiftCode = `${response1.services.code} - ${response1.orderNumber}`
        ticketObject.value.serviceName = response1.services.name
        ticketObject.value.identification = payload.identification
      }
    }

    showFormShift.value = false // Cerrar el diálogo
    showTicket.value = true
  }
  catch (error: any) {
    // successOperation = false
    toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 10000 })
  }

  loadingSaveAll.value = false
}

async function getResourceList(param?: any) {
  try {
    resourceList.value = []
    const response = await GenericService.getById(confResourceApi.moduleApi, `resource/business/${currentBussiness.value.businessId}/services`, param)
    const { data: dataList } = response
    for (const iterator of dataList) {
      resourceList.value = [...resourceList.value, { id: iterator.id, name: iterator.name }]
    }
  }
  catch (error) {
    console.error('Error cargando los doctores:', error)
  }
}

async function printTicket() {
  const printContents = ticketComponent.value.$el.innerHTML

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.width = '0px'
  iframe.style.height = '0px'
  iframe.style.border = 'none'
  document.body.appendChild(iframe)
  iframe.contentWindow!.document.write(printContents)
  iframe.contentWindow!.document.close()
  iframe.contentWindow!.focus()
  iframe.contentWindow!.print()
  document.body.removeChild(iframe)
  window.location.reload()
}
</script>

<template>
  <div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      class="mx-3 sm:mx-0 sm:w-full md:w-3"
      content-class="border-round-bottom border-top-1 surface-border"
      @hide="closeDialog"
    >
      <template #header>
        <div class="flex justify-content-between">
          <h5 class="m-0">
            Nuevo Turno
          </h5>
        </div>
      </template>

      <div v-if="showFormShift" class="grid p-fluid mt-3">
        <div class="col-12 order-1 md:order-0">
          <EditFormV3
            :key="formReload"
            :fields="fields"
            :item="item"
            :show-actions="true"
            :loading-save="loadingSaveAll"
            :hide-delete-button="true"
            :hide-save-button="false"
            :show-cancel-button="true"
            :permission-save="['TURNERO:GENERATE-TURN']"
            @submit="saveItem($event)"
            @cancel="closeDialog"
          >
            <template #field-doctor="{ item: data, onUpdate }">
              <DebouncedAutoCompleteComponent
                v-if="!loadingSaveAll"
                id="autocomplete"
                field="name"
                item-value="id"
                :model="data.doctor"
                :suggestions="resourceList"
                @change="($event) => {
                  onUpdate('doctor', $event)
                }"
                @load="($event) => getResourceList(serviceId)"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>

            <template #field-priority="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"
                v-model="data.priority"
                :options="[...ENUM_PRIORITY]"
                option-label="name"
                return-object="false"
                class="h-2rem align-items-center"
                show-clear
                @update:model-value="($event) => {
                  onUpdate('priority', $event)
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>
          </EditFormV3>
        </div>
      </div>

      <Ticket v-if="showTicket" ref="ticketComponent" class="justify-content-center mt-3" :shift-code="ticketObject.shiftCode" :service-name="ticketObject.serviceName" :identification="ticketObject.identification" />
      <!-- <template #footer> -->
      <div class="flex justify-content-center">
        <Button
          v-if="showTicket"
          label="Imprimir Ticket"
          icon="pi pi-print"
          class="p-button-outlined mt-3 justify-content-center"
          @click="printTicket()"
        />
      </div>
      <!-- </template> -->
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
  #ticket {
    width: auto; /* Ancho típico de un ticket */
    height: auto; /* Altura automática para ajustarse al contenido */
    padding: 10mm; /* Espacio alrededor del contenido */
    border: 1px solid #000;
    text-align: center;
    font-size: 12px;
    margin-top: 5px;
  }

  @media print {
    @page {
    size: 80mm 80mm; /* Configurar tamaño de página para impresión */
    margin: 0; /* Sin márgenes */
  }
  #printable {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  #ticket, #ticket * {
    visibility: visible;
  }
  #ticket {
    width: 80mm;
    height: 80mm;
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: 4mm;
    font-family: 'Arial', sans-serif;
    color: #000;
    background: #fff;
    image-rendering: optimizeQuality; /* Mejora la calidad de las imágenes */
    -webkit-font-smoothing: antialiased; /* Mejora la claridad del texto en WebKit */
    -moz-osx-font-smoothing: grayscale;
  }
  h1, p {
    margin: 0;
    padding: 0;
  }
    button {
      display: none;
    }

  }
</style>
