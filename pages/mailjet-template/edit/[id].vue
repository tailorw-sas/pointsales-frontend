<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { z } from 'zod'
import type { IFormField, IQueryRequest, IStandardObject } from '~/@core/fields/interfaces/IFieldInterfaces'
import EditForm from '~/@core/form/EditForm.vue'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import { GenericService } from '~/@core/services/generic-services'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import EditFormV2 from '~/@core/form/EditFormV2.vue'

const route = useRoute()
const toast = useToast()
const dialogReload = ref(0)
const formReload = ref(0)
const loadingSaveAll = ref(false)
const listConfigMailjet = ref<any[]>([])
const confApi = reactive({
  moduleApi: 'cloudbridges',
  uriApi: 'template',
})

const formConfig = ref<IFormField>(
  {
    mailjetConfigId: {
      value: '',
      label: 'Configuración de Mailjet',
      type: 'select',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: 'Seleccione una configuración',
      moduleApi: 'cloudbridges',
      uriApi: 'mailjet-config',
      filter: [],
      errorMessage: [],
      haveError: false,
      returnObject: true,
      showCounter: true,
      validationKeywords: [],
      col: '4'
    },
    templateCode: {
      value: '',
      label: 'Código',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 50,
      showCounter: true,
      validationKeywords: ['maxLength'],
      col: '4'
    },
    name: {
      value: '',
      label: 'Nombre',
      type: 'text',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      maxLength: 50,
      showCounter: true,
      validationKeywords: ['maxLength'],
      col: '4'
    },
    description: {
      value: '',
      label: 'Descripción',
      type: 'textarea',
      isRequired: true,
      showRequiredLabel: true,
      placeholder: '',
      errorMessage: [],
      haveError: false,
      showCounter: true,
      maxLength: 255,
      validationKeywords: ['maxLength'],
      col: '12'
    },
  }
)

const fields: Array<FieldDefinitionType> = [
  {
    field: 'mailjetConfigId',
    header: 'Configuración de Mailjet',
    dataType: 'select',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'Este campo es requerido'),
      name: z.string().min(1, 'Este campo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'Este campo es requerido' }),
  },
  {
    field: 'templateCode',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'description',
    header: 'Descripción',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(150, 'Máximo 150 caracteres')
  },
]

const item = ref<GenericObject>({
  name: '',
  description: '',
  mailjetConfigId: '',
  templateCode: '',
})

const formOptionsToEdit = ref({
  moduleApi: 'cloudbridges',
  uriApi: 'template',
  itemId: route.params ? route.params.id.toString() : '',
  btnTextSave: 'Aceptar',
  btnTextCancel: 'Cancelar',
})

async function getObjectValues($event: any) {
  item.value = $event
}

async function goToList() {
  await navigateTo('/mailjet-template')
}

async function getListMeijetConfig() {
  try {
    let listItems: IStandardObject[] = []
    const payload: IQueryRequest = {
      filter: [],
      query: '',
      page: 0,
      pageSize: 1000
    }
    const response = await GenericService.search('cloudbridges', 'mailjet-config', payload)

    for (const iterator of response.data) {
      const item = {
        id: iterator.id,
        name: iterator.name,
      }
      listItems = [...listItems, item]
    }
    return listItems
  }
  catch (error) {
    console.error(error)
    return []
  }
}

async function getItemById() {
  loadingSaveAll.value = true
  try {
    const response = await GenericService.getById(confApi.moduleApi, confApi.uriApi, route.params ? route.params.id.toString() : '')
    if (response) {
      item.value.mailjetConfigId = typeof response.mailjetConfigId === 'object' ? { id: response.mailjetConfigId.id, name: response.mailjetConfigId.name } : response.mailjetConfigId
      item.value.templateCode = response.templateCode
      item.value.name = response.name
      item.value.description = response.description
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

async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.mailjetConfigId = typeof payload.mailjetConfigId === 'object' ? payload.mailjetConfigId.id : payload.mailjetConfigId
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

watch(() => item.value, async (newValue) => {
  if (newValue) {
    save(newValue)
  }
})

onMounted (async () => {
  listConfigMailjet.value = await getListMeijetConfig()
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
          :loading-save="loadingSaveAll"
          @cancel="goToList"
          @submit="getObjectValues($event)"
        >
          <template #field-mailjetConfigId="{ item: data, onUpdate }">
            <Dropdown
              v-if="!loadingSaveAll"
              v-model="data.mailjetConfigId"
              :options="[...listConfigMailjet]"
              option-label="name"
              return-object
              placeholder="Seleccione una configuración de Mailjet"
              class="h-3rem align-items-center"
              @update:model-value="($event) => {
                onUpdate('mailjetConfigId', $event)
              }"
            />
            <Skeleton v-else height="3rem" class="mb-2" />
          </template>
        </EditFormV2>
      </div>
    </div>
  </div>
</template>
