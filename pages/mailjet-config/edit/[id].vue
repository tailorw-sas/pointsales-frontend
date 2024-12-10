<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { GenericService } from '@/@core/services/generic-services'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import EditFormV2 from '~/@core/form/EditFormV2.vue'

const toast = useToast()
const loadingSaveAll = ref(false)
const formReload = ref(0)

const confApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'mailjet-config',
})

const route = useRoute()

const fields: Array<FieldDefinitionType> = [
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'email',
    header: 'Email',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(30, 'Máximo 30 caracteres').email('Correo inválido')
  },
  {
    field: 'mailjetApiKey',
    header: 'Api Key',
    dataType: 'password',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(20, 'Máximo 20 caracteres')
  },
  {
    field: 'mailjetApiSecret',
    header: 'Api Secret',
    dataType: 'password',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(20, 'Máximo 20 caracteres')
  },
]

const item = ref<GenericObject>({
  name: '',
  email: '',
  mailjetApiKey: '',
  mailjetApiSecret: '',
})

async function getObjectValues($event: any) {
  item.value = $event
}

async function getItemById() {
  loadingSaveAll.value = true
  try {
    const response = await GenericService.getById(confApi.moduleApi, confApi.uriApi, route.params ? route.params.id.toString() : '')
    if (response) {
      item.value.name = response.name
      item.value.email = response.email
      item.value.mailjetApiKey = response.mailjetApiKey
      item.value.mailjetApiSecret = response.mailjetApiSecret
    }
    formReload.value += 1
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos de la configuración de Mailjet', life: 3000 })
    }
  }
  finally {
    loadingSaveAll.value = false
  }
}

async function goToList() {
  await navigateTo('/mailjet-config')
}

async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  try {
    await GenericService.update(confApi.moduleApi, confApi.uriApi, route.params ? route.params.id.toString() : '', payload)
    goToList()
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

watch(() => item.value, (newValue) => {
  if (newValue) {
    save(newValue)
  }
})

onMounted (async () => {
  await getItemById()
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
        />
      </div>
    </div>
  </div>
</template>
