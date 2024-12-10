<script setup lang="ts">
import dayjs from 'dayjs'
// import EditFormV2 from '@/@core/form/EditFormV2.vue'
import { z } from 'zod'
import EditFormV2WithImage from '@/@core/form/EditFormV2WithImage.vue'
import type { FieldDefinitionType } from '~/@core/form/EditFormV2'
import { GenericService } from '~/@core/services/generic-services'
import { ENUM_DISABILITY_TYPE } from '~/@core/utils/Enums'

interface FilterCriteria {
  key: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' // Puedes añadir más operadores si es necesario
  value: string // Puedes cambiar el tipo según sea necesario (por ejemplo, string | number)
  logicalOperation: 'AND' | 'OR'
}

const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    dataType: 'image',
    class: 'field',
    headerClass: 'mb-1',
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-4 required',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'This field is required').max(10, 'Max length is 10')
  },
  {
    field: 'lastName',
    header: 'Apellidos',
    dataType: 'text',
    class: 'field col-12  md:col-4',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'This field is required').max(10, 'Max length is 10')
  },
  {
    field: 'date',
    header: 'Fecha',
    dataType: 'date',
    class: 'field col-12 md:col-4',
    headerClass: 'mb-1',
    // validation: z.date().min(dayjs().subtract(1, 'day').toDate(), 'Fecha minima es hoy')
  },
  {
    field: 'description',
    header: 'Descripcion',
    dataType: 'textarea',
    class: 'field col-12',
    headerClass: 'mb-1',
    validation: z.string().min(1, 'This field is required').max(150, 'Max length is 150')
  },
  {
    field: 'province',
    header: 'Provincia',
    dataType: 'select',
    class: 'field col-12 md:col-4',
    headerClass: 'mb-1',
    validation: z.object({
      id: z.string().min(1, 'This field is required'),
      name: z.string().min(1, 'This field is required')
    }).nullable().refine(value => value && value.id && value.name, { message: 'This field is required' }),
  },
  {
    field: 'canton',
    header: 'Cantón',
    dataType: 'select',
    class: 'field col-12 md:col-4',
    headerClass: 'mb-1',
  },
  {
    field: 'parroquia',
    header: 'Parroquia',
    dataType: 'select',
    class: 'field col-12 md:col-4',
    headerClass: 'mb-1',
  },
  {
    field: 'isPregnant',
    header: 'Es Embarazada',
    dataType: 'check',
    class: 'field col-12 md:col-2 mt-4 required',
    headerClass: 'mb-1',
  },
  {
    field: 'gestationTime',
    header: 'Tiempo de Gestación',
    dataType: 'number',
    class: 'field col-12 md:col-2',
    headerClass: 'mb-1',
    disabled: true,
    hidden: false
  },
  {
    field: 'hasDisability',
    header: '¿Tiene discapacidad?',
    dataType: 'check',
    class: 'field col-12 md:col-2 mt-4 required',
    headerClass: 'mb-1',
  },
  {
    field: 'disabilityType',
    header: 'Tipo de Discapacidad',
    dataType: 'select',
    class: 'field col-12 md:col-2',
    disabled: true,
    hidden: false,
    headerClass: 'mb-1',
  },
  {
    field: 'country',
    header: 'Pais',
    dataType: 'multi-select',
    class: 'field col-12 md:col-4',
    headerClass: 'mb-1',
    hidden: false
  },
]

const item = ref({
  image: 'https://static.kynsoft.net/advertisin_2024-05-19_11-11-16.png',
  name: 'Maria',
  lastName: 'Perez',
  date: '',
  description: '',
  province: null,
  canton: null,
  parroquia: null,
  gestationTime: 0,
  isPregnant: false,
  hasDisability: false,
  disabilityType: null,
  country: [],
})

const objTemp = ref({})
const loadingSaveForm = ref(false)
const modelValueEMpresa = ref(0)
const listProvince = ref<any[]>([])
const listCanton = ref<any[]>([])
const listParroquia = ref<any[]>([])
const listCountriesTemp = ref<any>([])
const refModelValueEMpresa = ref(0)
function printValue(value: any) {
  objTemp.value = { ...value }
  item.value = { ...value }
}

async function getList(id: string = '', filter: FilterCriteria[] = []) {
  let listItem: any[] = []
  try {
    const payload
        = {
          filter: id ? [...filter, { key: 'parent.id', operator: 'EQUALS', value: id, logicalOperation: 'AND' }] : [...filter],
          query: '',
          pageSize: 200,
          page: 0
        }

    const response = await GenericService.search('patients', 'locations', payload)

    const { data: dataList } = response
    for (const iterator of dataList) {
      listItem = [...listItem, { id: iterator.id, name: iterator.name }]
    }
    return listItem
  }
  catch (error) {
    console.error('Error fetching Patient:', error)
    return listItem
  }
}

async function getCantonById(id: string) {
  // console.log('getCantonById', id)

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

type FieldProperty = keyof FieldDefinitionType
function updateFieldProperty(fieldName: string, fieldProperty: FieldProperty, propertyValue: any) {
  const field = fields.find(f => f.field === fieldName)
  if (field) {
    field[fieldProperty] = propertyValue
  }
}

listProvince.value = await getList('', [
  {
    key: 'type',
    operator: 'EQUALS',
    value: 'PROVINCE',
    logicalOperation: 'AND'
  },
])
</script>

<template>
  <!-- <div class="flex justify-content-center align-center">
    <pre>
      {{ item }}
    </pre>
  </div> -->
  <div class="card">
    <div class="p-4" style="width: 100%;">
      <EditFormV2WithImage
        :field-with-image="['description', 'name', 'lastName', 'image', 'date']"
        :fields="fields"
        :item="item"
        :loading-save="loadingSaveForm"
        :show-actions="true"
        @submit="printValue($event)"
      >
        <template #field-date="{ item: data, onUpdate }">
          <Calendar
            v-model="data.date"
            date-format="yy-mm-dd"
            :min-date="dayjs().subtract(2, 'day').toDate()"
            @update:model-value="(value) => onUpdate('date', value)"
          />
        </template>
        <template #field-province="{ item: data, onUpdate }">
          <Dropdown
            :key="refModelValueEMpresa"
            v-model="data.province"
            :options="[...listProvince]"
            option-label="name"
            return-object="false"
            show-clear
            @update:model-value="($event) => {
              if ($event) {
                getCantonById($event.id)
              }
              else {
                listCanton = []
                listParroquia = []
              }
              onUpdate('canton', null)
              onUpdate('parroquia', null)
              onUpdate('province', $event)
            }"
          />
        </template>
        <template #field-canton="{ item: data, onUpdate }">
          <Dropdown
            v-model="data.canton"
            :options="[...listCanton]"
            option-label="name"
            return-object="false"
            show-clear
            @update:model-value="($event) => {
              if ($event && $event.id) {
                getParroquiaById($event.id)
              // updateHiddenProperty('description', true)
              }
              else {
                listParroquia = []
              }
              onUpdate('parroquia', null)
              onUpdate('canton', $event)
            }"
          />
        </template>
        <template #field-parroquia="{ item: data, onUpdate }">
          <Dropdown
            v-model="data.parroquia"
            :options="[...listParroquia]"
            option-label="name"
            return-object="false"
            show-clear
            @change="($event) => {
              onUpdate('parroquia', $event.value)
            }"
          />
        </template>
        <template #field-country="{ item: data, onUpdate }">
          <MultiSelect
            v-model="data.country"
            :options="listCountriesTemp"
            option-label="label"
            return-object="false"
            :max-selected-labels="3"
            display="chip"
            @change="($event) => {
              onUpdate('country', $event.value)
            }"
          />
        </template>
        <template #field-isPregnant="{ item: data, onUpdate }">
          <Checkbox
            id="isPregnant"
            v-model="data.isPregnant"
            :binary="true"
            @update:model-value="($event) => {
              onUpdate('isPregnant', $event);
              if ($event) {
                updateFieldProperty('gestationTime', 'disabled', false)
              }
              else {
                updateFieldProperty('gestationTime', 'disabled', true)
              }
            }"
          />
          <label for="isPregnant" class="ml-2">
            Es Embarazada
            <span :class="fields.find(field => field.field === 'isPregnant')?.class.includes('required') ? 'p-error font-semibold' : ''">*</span>
          </label>
        </template>
        <template #field-disabilityType="{ item: data, onUpdate }">
          <Dropdown
            v-model="data.disabilityType"
            :options="[...ENUM_DISABILITY_TYPE]"
            option-label="name"
            return-object="false"
            show-clear
            :disabled="!data.hasDisability"
            @update:model-value="($event) => {
              onUpdate('disabilityType', $event)
            }"
          />
        </template>
      </EditFormV2WithImage>
    </div>
  </div>
</template>

<style scoped>
</style>
