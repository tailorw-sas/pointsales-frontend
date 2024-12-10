<script setup lang="ts">
import { ref } from 'vue'
import { usePrimeVue } from 'primevue/config'
import type { PageState } from 'primevue/paginator'
import type { DataTableFilterMeta } from 'primevue/datatable'
import dayjs from 'dayjs'
import CreateFormConsultation from '~/components/new-patient/CreateFormConsultation.vue'
import { GenericService } from '~/@core/services/generic-services'

const props = defineProps({
  openDialog: {
    type: Boolean,
    required: true
  },
  reportType: {
    type: String as () => 'RECETA' | 'ORDEN_EXAMEN' | 'MEDICAL_CERTIFICATE' | 'INFOMED',
    required: true,
  },
  consultationId: {
    type: String,
    required: true
  }
})

const emits = defineEmits<{
  (e: 'on-close-dialog', value: boolean): void // Evento para cerrar el diálogo
  (e: 'onSave', value: boolean): void

}>()

const payloadReport = ref<any>({
  RECIPE: {
    jasperReportCode: props.reportType,
    reportFormatType: 'PDF',
    parameters: {
      id_consulta: props.consultationId,
      fecha_prox_cita: '10/12/2024'
    }
  }
})

const reportFormatType = ref<any>({ id: 'PDF', name: 'PDF' })
const reportDate = ref<any>(dayjs().format('YYYY-MM-DD'))
const textContent = ref('')
const titleReport = ref('')
const loadingReport = ref(false)
const cantCopy = ref(1)

const $primevue = usePrimeVue()
defineExpose({ $primevue })

const dialogVisible = ref(props.openDialog)

type ReportTitleId = keyof typeof REPORT_TITLE_MAP
const getTitleById = (id: ReportTitleId) => REPORT_TITLE_MAP[id] || 'Título no encontrado'

const pdfUrl = ref('')
function loadPDF(base64Report: string) {
  pdfUrl.value = ''
  // Convertir base64 a un ArrayBuffer
  const byteCharacters = atob(base64Report)
  const byteNumbers = Array.from({ length: byteCharacters.length })
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  if (reportFormatType.value?.id === 'XLS') {
    // Crear un Blob del ArrayBuffer con tipo MIME 'application/pdf'
  // const blob = new Blob([byteArray], { type: 'application/pdf' })
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Crear una URL del Blob y asignarla a pdfUrl
    pdfUrl.value = URL.createObjectURL(blob)

    // Abrir el PDF en una nueva ventana
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report-file-${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
  }
  else if (reportFormatType.value?.id === 'PDF') {
    // Crear un Blob del ArrayBuffer con tipo MIME 'application/pdf'
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    // Crear una URL del Blob y asignarla a pdfUrl
    pdfUrl.value = URL.createObjectURL(blob)

    // Abrir el PDF en una nueva ventana
    window.open(pdfUrl.value, '_blank')
  }
}

async function getReport() {
  try {
    loadingReport.value = true
    const payload = {
      jasperReportCode: props.reportType,
      reportFormatType: 'id' in reportFormatType.value ? reportFormatType.value.id : 'PDF',
      cantCopy: cantCopy.value,
      parameters: {
        id_consulta: props.consultationId,
        // fecha_prox_cita: reportDate.value ? dayjs(reportDate.value).format('YYYY-MM-DD') : '',
        // texto: textContent.value,
        // titulo: titleReport.value,
      }
    }
    switch (props.reportType) {
      case 'RECETA':
        payload.parameters = {
          ...payload.parameters,
          fecha_prox_cita: reportDate.value ? dayjs(reportDate.value).format('YYYY-MM-DD') : '',
        }
        break
      case 'ORDEN_EXAMEN':
        payload.parameters = {
          ...payload.parameters,
          fecha_prox_cita: reportDate.value ? dayjs(reportDate.value).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        }
        break
      case 'MEDICAL_CERTIFICATE':
        payload.parameters = {
          ...payload.parameters,
          texto: textContent.value,
          titulo: REPORT_TYPE_FOR_INFO.find(item => item.id === props.reportType)?.name,
        }
        break
      case 'INFOMED':
        payload.parameters = {
          ...payload.parameters,
          texto: textContent.value,
          titulo: REPORT_TYPE_FOR_INFO.find(item => item.id === props.reportType)?.name,
        }
        break
    }

    payload.jasperReportCode = payload.jasperReportCode === 'MEDICAL_CERTIFICATE' ? 'INFOMED' : payload.jasperReportCode

    const response = await GenericService.create('report', 'reports/generate', payload)
    if (response) {
      loadPDF(response.base64Report)
    }
  }
  catch (error) {
    loadingReport.value = false
  }
  finally {
    loadingReport.value = false
    // onClose(false)
  }
}

// Observa los cambios en la prop openDialog
watch(() => props.openDialog, (newValue) => {
  dialogVisible.value = newValue // Sincroniza el estado del diálogo
})

function onClose(isCancel: boolean) {
  dialogVisible.value = false // Cierra el diálogo
  emits('on-close-dialog', isCancel) // Emite el evento para notificar el cierre
}

function onSave(isSave: boolean) {
  dialogVisible.value = false // Cierra el diálogo
  emits('onSave', isSave) // Emite el evento para notificar el cierre
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="getTitleById('RECIPE')"
    class="w-6 lg:w-6"
    content-class="border-round-bottom border-top-1 surface-border"
    @hide="onClose(false)"
  >
    <template #header>
      <div class="flex justify-content-between align-items-center w-full p-0 m-0">
        <h6 class="font-bold p-0 m-0">
          {{ getTitleById(props.reportType) }}
        </h6>
      </div>
    </template>
    <template #default>
      <div class="flex align-items-center justify-content-center mt-4">
        <div class="grid p-fluid formgrid align-items-center gap-2 m-0 p-0" style="width: 100%">
          <div class="col-12 md:col-2 p-0 m-0">
            <label for="reportFormatType" class="font-bold block">Formato </label>
            <Dropdown
              v-model="reportFormatType"
              input-id="reportFormatType"
              :options="[...REPORT_FORMAT_TYPE]"
              option-label="name"
              return-object="false"
              class="h-2.1rem align-items-center"
              placeholder="Formato de reporte"
              show-clear
              @update:model-value="($event) => {
                reportFormatType = $event
              }"
            />
          </div>
          <div class="col-12 md:col-2 p-0 m-0">
            <label for="integeronly" class="font-bold block">Cant. copias </label>
            <InputNumber v-model="cantCopy" input-id="integeronly" />
          </div>
          <div v-if="props.reportType === 'RECETA' || props.reportType === 'ORDEN_EXAMEN'" class="col-12 md:col-3 p-0 m-0">
            <label for="reportDate" class="font-bold block">Fecha de reporte </label>
            <Calendar
              v-model="reportDate"
              input-id="reportDate"
              date-format="dd/mm/yy"
              placeholder="Fecha de reporte"
              @update:model-value="($event) => {
                reportDate = $event
              }"
            />
          </div>
          <!-- v-if="props.reportType === 'MEDICAL_CERTIFICATE' || props.reportType === 'INFOMED'" -->
          <div v-if="false" class="col-12 md:col-3 p-0 m-0">
            <label for="titleReport" class="font-bold block">Título </label>
            <InputText
              id="titleReport"
              v-model="titleReport"
              type="text"
              placeholder="Ingrese el título del documento"
            />
          </div>
          <div v-if="props.reportType === 'MEDICAL_CERTIFICATE' || props.reportType === 'INFOMED'" class="col-12 p-0 m-0">
            <!-- <Editor v-model="textContent" editor-style="height: 250px " /> -->
            <label for="textContent" class="font-bold block">Texto </label>
            <Textarea
              id="textContent"
              v-model="textContent"
              rows="25"

              placeholder="Ingrese un texto"
            />
          </div>
        </div>
      </div>
      <Divider />
      <div class="flex justify-content-end w-full gap-2">
        <Button label="Cancelar" class="p-button-sm" severity="secondary" @click="() => { onClose(true) }" />
        <Button label="Aceptar" class="p-button-sm" :loading="loadingReport" @click="getReport" />
      </div>

      <!-- <div v-if="reportFormatType?.id === 'PDF'" class="card p-2 w-full h-full">
        <object :data="pdfUrl" type="application/pdf" width="100%" style="height: 70vh;">
          <p>Your browser does not support PDF. <a :href="pdfUrl">Download PDF</a>.</p>
        </object>
      </div> -->
    </template>
  </Dialog>
</template>

<style scoped>
.no-padding {
    padding: 0 !important;
}
</style>
