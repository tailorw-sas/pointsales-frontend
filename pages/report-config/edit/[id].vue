<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { z } from 'zod'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import EditFormV2 from '~/@core/form/EditFormV2.vue'
import { GenericService } from '~/@core/services/generic-services'
import { ENUM_REPORT_TYPE } from '~/@core/utils/Enums'

const route = useRoute()
const formReload = ref(0)

const toast = useToast()
const loadingSaveAll = ref(false)
const confApi = reactive({
  moduleApi: 'report',
  uriApi: 'jasper-report-template',
})

const item = ref<GenericObject>({
  file: '',
  code: '',
  name: '',
  type: '',
  description: '',
  parameters: '',
})

const fields: Array<FieldDefinitionType> = [
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12 md:col-4 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres').email('Correo inválido')
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-4 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'type',
    header: 'Tipo',
    dataType: 'select',
    class: 'field col-12 md:col-4 required',
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'Este campo es requerido'),
      name: z.string().min(1, 'Este campo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'Este campo es requerido' }),
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12 md:col-12 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'file',
    header: 'Reporte',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
  },
]

async function getObjectValues($event: any) {
  item.value = $event
}

async function getItemById() {
  loadingSaveAll.value = true
  try {
    const response = await GenericService.getById(confApi.moduleApi, confApi.uriApi, route.params ? route.params.id.toString() : '')
    if (response) {
      item.value.file = response.file
      item.value.code = response.code
      item.value.name = response.name
      item.value.type = ENUM_REPORT_TYPE.find(x => x.id === response.type)
      item.value.description = response.description
    }
    formReload.value += 1
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos del usuario', life: 3000 })
    }
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.type = typeof payload.type === 'object' ? payload.type.id : payload.type
  try {
    await GenericService.update(confApi.moduleApi, confApi.uriApi, route.params ? route.params.id.toString() : '', payload)
    goToList()
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo modificar el elememto', life: 3000 })
    }
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function goToList() {
  await navigateTo('/report-config')
}
watch(() => item.value, (newValue) => {
  if (newValue) {
    save(newValue)
  }
})

onMounted(async () => {
  getItemById()
})
</script>

<template>
  <div class="flex justify-content-center align-center">
    <div class="p-4" style="width: 100%;">
      <div class="card">
        <EditFormV2
          :key="formReload"
          :fields="fields"
          :item="item"
          :show-actions="true"
          class-first-grid="col-12 md:col-3"
          class-second-grid="col-12 md:col-9"
          :loading-save="loadingSaveAll"
          @cancel="goToList"
          @submit="getObjectValues($event)"
        >
          <template #field-type="{ item: data, onUpdate }">
            <Dropdown
              v-if="!loadingSaveAll"
              v-model="data.type"
              :options="[...ENUM_REPORT_TYPE]"
              option-label="name"
              return-object="false"
              class="h-3rem align-items-center"
              @update:model-value="($event) => {
                onUpdate('type', $event)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
        </EditFormV2>
      </div>
    </div>
  </div>
</template>
