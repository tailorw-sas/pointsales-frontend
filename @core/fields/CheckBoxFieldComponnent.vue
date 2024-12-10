<script setup lang="ts">
import { type PropType, ref, watchEffect, onUpdated, watch, onMounted } from 'vue';
import type { IOptionField } from './interfaces/IFieldInterfaces';
import {
  validEmail, 
  maxLength, 
  minLength, 
  onlyNumbers,
  validLongitud,
  validLatitud
} from '../utils/valid_form_fields'

interface ObjErrorMessage {
  key: string,
  message: string
}

interface ValidationMethods {
  [key: string]: (value: string) => string | undefined;
}

const props = defineProps({
  properties: {
    type: Object as PropType<IOptionField>,
    required: true,
  },
  validationKeywords: {
    type: Array as () => string[],
    default: () => [],
  },
  submit: {
    type: Boolean,
    required: true,
    default:   false
  }
});

const emits = defineEmits([
  'update:modelValue',
  'update:errorMessages',
  'invalidField'
])
const fieldModelValue = ref<any>(props.properties.value || null)
const fieldId = `text-field-${Math.random().toString(36).substring(7)}`;

const listError = ref<ObjErrorMessage[]>([])

const methods: ValidationMethods = ref({
  maxLength,
  minLength,
  isEmail: validEmail,
  longitude: validLongitud,
  latitude: validLongitud
});

const createValidationsMethods = () => {
  if (props.validationKeywords.length > 0) {
    for (const iterator of props.validationKeywords) {
      if (iterator.includes('isEmail')) {
        methods.value[iterator] = validEmail
      }
      if (iterator.includes('maxLength')) {
        methods.value[iterator] = maxLength
      }
      if (iterator.includes('minLength')) {
        methods.value[iterator] = minLength
      }
      if (iterator.includes('onlyNumbers')) {
        methods.value[iterator] = onlyNumbers
      }
    }
  }  
}

const handleInput = (event?: Event) => {  

  listError.value = []
  // listError.value = listError.value.filter(error => error.key !== 'required'); esta linea elimina solo el error que tiene que ver con la validacion especifica
  // Required
  if (props.properties.isRequired && !fieldModelValue.value) {
    listError.value = [...listError.value, { key: 'required', message: 'Este campo es requerido' }];
  }
  
  emits('update:modelValue', fieldModelValue.value);
  emits('update:errorMessages', []);
};

const setMessageBackendError = () => {
  listError.value = listError.value.filter(error => error.key !== 'backend');
  for (const iterator of props.properties.errorMessage) {
    listError.value = [...listError.value, { key: 'backend', message: iterator}]
  }
}
watchEffect(() => {
  setMessageBackendError()
});
watch(() => listError.value, (newValue) => {
    if (newValue.length > 0) {
      emits('invalidField', true)
    } else {
      emits('invalidField', false)
    }
});
watch(() => props.submit, (newValue) => {
    if (newValue) {
      handleInput()
    }
});

onMounted(() => {
  // createValidationsMethods()
})
</script>

<template>
    <div>
        <i v-if="false" class="pi pi-envelope"></i>
        <div class="mb-1 flex">
          <label :for="fieldId" class="text-900 font-semibold">
            {{ props.properties.label }}
            <span :class="{ 'required-label': props.properties.isRequired }" v-if="props.properties.isRequired && props.properties.showRequiredLabel">*</span>
          </label>
          <div>
            <Checkbox 
              :id="fieldId" 
              :binary="true"
              :type="props.properties.type"
              :required="props.properties.isRequired"
              :class="{'p-invalid': listError.length !== 0}"
              v-model="fieldModelValue" 
              autocomplete="off" 
              @update:modelValue="handleInput"
              class="text-field-size mx-2"
            />
          </div>
        </div>
        <div v-if="props.properties.showCounter && (props.properties.type === 'text' || props.properties.type === 'number')" class="flex justify-content-end py-0 my-0" style="font-size: 10px;">{{fieldModelValue ? fieldModelValue.length : 0}}/{{ props.properties.maxLength || 50 }}</div>
        <div :class="props.properties.showCounter ? 'margin-counter' : ''">
          <small :id="`${fieldId}-help`" class="p-error text-start">
            <transition-group name="error-fade">
              <span class="text-error block flex pl-2 mb-0" v-for="textError of listError" :key="textError.key">{{ textError.message }}</span>
            </transition-group>
          </small>
        </div>
    </div>
</template>

<style scoped>
.margin-counter {
  margin-top: -10px;
}

.text-field-size {
  width: 100%;
}
.error-fade-enter-active, .error-fade-leave-active {
  transition: opacity 0.5s;
}
.error-fade-enter, .error-fade-leave-to {
  opacity: 0;
}
.text-error {
  text-align: left;
}
.required-label {
  color: red;
}
</style>