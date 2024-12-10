<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { reactive, ref } from 'vue'
import { useLayout } from '~/layouts/composables/layout'
import TextFieldComponnent from '~/@core/fields/TextFieldComponnent.vue'
import PasswordFieldComponnent from '~/@core/fields/PasswordFieldComponnent.vue'

const submitForm = ref(false)

const { $api } = useNuxtApp()
const repo = repository($api)
const toast = useToast()
const { layoutConfig } = useLayout()

definePageMeta({
  layout: 'empty',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  }
})

const form = reactive(
  {
    otp: {
      value: '',
      label: '',
      isRequired: true,
      showRequiredLabel: false,
      col: 12
    },
    username: {
      value: '',
      label: 'Correo Electrónico',
      type: 'text',
      isRequired: true,
      showRequiredLabel: false,
      placeholder: '',
      validationKeywords: ['isEmail'],
      errorMessage: [],
      haveError: false
    },
    oldPassword: {
      value: '',
      label: 'Contraseña Anterior',
      type: 'password',
      isRequired: true,
      showRequiredLabel: false,
      showFeedBack: false,
      placeholder: '',
      validationKeywords: [],
      errorMessage: [],
      haveError: false,
    },
    password: {
      value: '',
      label: 'Contraseña Nueva',
      type: 'password',
      isRequired: true,
      showRequiredLabel: false,
      showFeedBack: false,
      placeholder: '',
      validationKeywords: [],
      errorMessage: [],
      haveError: false
    },
  }
)
const loading = ref(false)
async function submitAndReloadForm() {
  submitForm.value = true
}

function validateForm() {
  let isValid = true
  Object.keys(form).forEach((key) => {
    const field = form[key]
    if (field.haveError) {
      isValid = false
    }
  })
  return isValid
}

async function changePass() {
  await submitAndReloadForm()
  const isValid = validateForm()
  if (!isValid) {
    return
  }
  try {
    loading.value = true
    const payload = { email: form.username.value, newPassword: form.password.value, oldPassword: form.oldPassword.value, otp: form.otp.value }
    await repo.changePasswordFirstTime(payload)
    toast.add({ severity: 'info', summary: 'Contraseña Cambiada', detail: 'Su contraseña ha sido cambiada exitosamente.', life: 3000 })
    setTimeout(() => {
      navigateTo('/auth/login')
    }, 3000)
  }
  catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 10000 })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="`login-body flex min-h-screen  ${layoutConfig.colorScheme.value === 'light' ? 'layout-light' : 'layout-dark'}`">
    <div id="login-image" class="login-image w-9 h-screen hidden md:block" />
    <div id="login-panel" class="w-full">
      <div
        class="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-center justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat"
        style="background: var(--exception-pages-image)"
      >
        <div class="flex flex-column align-items-center">
          <div class="flex justify-content-center mb-5 logo-container">
            <NuxtImg src="/layout/images/logo/logo-light.svg" class="login-logo" style="width: 150px" />
          </div>
          <div class="form-container flex flex-column align-items-center justify-content-center">
            <h4 class="mb-5">
              Cambiar contraseña
            </h4>
            <div class="flex flex-column align-items-center mb-4" style="width: 400px;">
              <p>
                Por razones de seguridad, es necesario cambiar su contraseña la primera vez que inicie sesión. Se ha enviado un código a su correo electrónico. Por favor, introdúzcalo a continuación.
              </p>
              <InputOtp v-model="form.otp.value" :length="6" style="width: 250px" />
            </div>
            <div class="mb-3">
              <TextFieldComponnent
                :submit="submitForm" :properties="form.username"
                :validation-keywords="form.username.validationKeywords" style="width: 300px;"
                @update:model-value="form.username.value = $event"
                @update:error-messages="form.username.errorMessage = $event"
                @invalid-field="form.username.haveError = $event"
              />
            </div>
            <div class="mb-3">
              <PasswordFieldComponnent
                :submit="submitForm" :properties="form.oldPassword"
                :validation-keywords="form.oldPassword.validationKeywords" style="width: 300px;"
                @update:model-value="form.oldPassword.value = $event"
                @update:error-messages="form.oldPassword.errorMessage = $event"
                @invalid-field="form.oldPassword.haveError = $event"
              />
            </div>
            <div class="mb-3">
              <PasswordFieldComponnent
                :submit="submitForm" :properties="form.password"
                :validation-keywords="form.password.validationKeywords" style="width: 300px;"
                @update:model-value="form.password.value = $event"
                @update:error-messages="form.password.errorMessage = $event"
                @invalid-field="form.password.haveError = $event"
              />
            </div>
          </div>
          <div class="button-container mb-3 mt-2 flex flex-column" style="width: 300px;">
            <Button
              type="button" label="Entrar" icon="pi pi-ref" class="w-full flex justify-content-center mb-2" style="height: 35px;"
              :disabled="loading" @click="changePass"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
              <span v-else class="font-semibold">Enviar</span>
            </Button>
            <Button
              type="button" label="Salir" icon="pi pi-ref" class="w-full flex justify-content-center" style="height: 35px;background-color: #D9D9D9; border-color: #D9D9D9;"
              :disabled="loading" @click="() => navigateTo('/auth/login')"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
              <span v-else class="font-semibold" style="color: #64748B">Cancelar</span>
            </Button>
          </div>
        </div>
        <div class="login-footer flex justify-content-center align-items-center" style="bottom: 75px;">
          <div class="flex align-items-center login-footer-logo-container pr-4 mr-4 border-right-1 surface-border">
            <NuxtImg
              src="/layout/images/logo/logo-light.svg"
              class="login-logo" style="width: 100px"
            />
          </div>
          <span class="text-sm text-color-secondary mr-3">Copyright 2024</span>
        </div>
      </div>
    </div>
    <Toast position="top-right" :base-z-index="5" />
  </div>
</template>

<style lang="scss" scoped>
#login-image {
    background-image: url('/demo/images/home.webp');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
}

#login-panel {
    background: var(--surface-ground)
}
</style>
