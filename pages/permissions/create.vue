<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { ENUM_PERMISSIONS } from '@/@core/utils/Enums'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import EditFormV2 from '~/@core/form/EditFormV2.vue'
import { GenericService } from '~/@core/services/generic-services'

const toast = useToast()
const loadingSaveAll = ref(false)
const listModulesItems = ref<any[]>([])

const confApi = reactive({
  moduleApi: 'identity',
  uriApi: 'permission',
})
const fields: Array<FieldDefinitionType> = [
  {
    field: 'moduleId',
    header: 'Módulo',
    dataType: 'select',
    class: 'field col-12 md:col-6 required',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'Este campo es requerido'),
      name: z.string().min(1, 'Este campo es requerido'),
    }).nullable().refine(value => value && value.id && value.name, { message: 'Este campo es requerido' }),
  },
  {
    field: 'action',
    header: 'Acción',
    dataType: 'select',
    class: 'field col-12 md:col-6 required',
    disabled: true,
    hidden: false,
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
    class: 'field col-12 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(150, 'Máximo 150 caracteres')
  },
  {
    field: 'code',
    header: 'Código',
    dataType: 'text',
    class: 'field col-12 required',
    disabled: true,
    headerClass: 'mb-1',
    validation: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres')
  },

]

const item = ref<GenericObject>({
  moduleId: null,
  action: null,
  code: '',
  description: '',
})

async function getObjectValues($event: any) {
  item.value = $event
}

async function getListMoules(query: string = '') {
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
          pageSize: 20,
          page: 0,
          sortBy: 'name',
          sortType: 'DES'
        }

    const response = await GenericService.search('identity', 'module', payload)
    const { data: dataList } = response
    listModulesItems.value = []
    for (const iterator of dataList) {
      listModulesItems.value = [...listModulesItems.value, { id: iterator.id, name: iterator.name, status: iterator.status }]
    }
  }
  catch (error) {
    console.error('Error on loading module list:', error)
  }
}

async function goToList() {
  await navigateTo('/permissions')
}

async function save(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  payload.moduleId = typeof payload.moduleId === 'object' ? payload.moduleId.id : payload.moduleId
  payload.action = typeof payload.action === 'object' ? payload.action.id : payload.action
  try {
    await GenericService.create(confApi.moduleApi, confApi.uriApi, payload)
    goToList()
  }
  catch (error) {
    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el permiso', life: 3000 })
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
    <div class="card w-full">
      <EditFormV2
        :fields="fields"
        :item="item"
        :show-actions="true"
        class-first-grid="col-12 md:col-3"
        class-second-grid="col-12 md:col-9"
        :loading-save="loadingSaveAll"
        @cancel="goToList"
        @submit="getObjectValues($event)"
      >
        <template #field-moduleId="{ item: data, onUpdate }">
          <DebouncedAutoCompleteComponent
            v-if="!loadingSaveAll"
            id="autocomplete"
            field="name"
            item-value="id"
            :model="data.moduleId"
            :suggestions="listModulesItems"
            @change="($event) => {
              onUpdate('moduleId', $event)
            }"
            @load="($event) => getListMoules($event)"
          />
          <Skeleton v-else height="2rem" class="mb-2" />
        </template>

        <template #field-action="{ item: data, onUpdate }">
          <Dropdown
            v-if="!loadingSaveAll"
            v-model="data.action"
            :options="[...ENUM_PERMISSIONS]"
            option-label="name"
            return-object="false"
            class="h-3rem align-items-center"
            show-clear
            @update:model-value="($event) => {
              onUpdate('action', $event)
              onUpdate('code', `${data.moduleId ? `${data.moduleId.name}:` : ''}${$event ? $event.name : ''}`)
            }"
          />
          <Skeleton v-else height="2rem" class="mb-2" />
        </template>
      </EditFormV2>
    </div>
  </div>
  <Toast position="top-center" :base-z-index="5" group="tc" />
</template>
