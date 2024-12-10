<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import type { IFormField } from '@/@core/fields/interfaces/IFieldInterfaces'
import CreateForm from '@/@core/form/CreateForm.vue'
import { GenericService } from '@/@core/services/generic-services'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import { ENUM_USER_TYPE } from '~/@core/utils/Enums'
import EditFormV2WithImage from '~/@core/form/EditFormV2WithImage.vue'
import getUrlByImage from '~/composables/files'

const toast = useToast()
const loadingSaveAll = ref(false)
const fieldsWithImage = ['image', 'name', 'description']
const confApi = reactive({
  moduleApi: 'identity',
  uriApi: 'module',
})
const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    dataType: 'image',
    class: 'field col-12',
    headerClass: 'mb-1',
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'textarea',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(150, 'Máximo 150 caracteres')
  },
]

const item = ref<GenericObject>({
  image: '',
  name: '',
  description: '',
})

const goToList = async () => await navigateTo('/modules')

async function getObjectValues($event: any) {
  item.value = $event
}
async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.image = typeof payload.image === 'object' ? await getUrlByImage(payload.image) : payload.image
  try {
    await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
    goToList()
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el modulo', life: 3000 })
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
</script>

<template>
  <div class="flex justify-content-center align-center">
    <div class="p-4 w-full">
      <div class="card">
        <EditFormV2WithImage
          :field-with-image="[...fieldsWithImage]"
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
