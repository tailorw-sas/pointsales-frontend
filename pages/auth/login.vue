<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'

import { any, string } from 'zod'
import PasswordFieldComponnent from '@/@core/fields/PasswordFieldComponnent.vue'
import TextFieldComponnent from '@/@core/fields/TextFieldComponnent.vue'
import { useLayout } from '@/layouts/composables/layout'
import useGoogleRecaptcha from '~/layouts/composables/useGoogleRecaptcha'

const submitForm = ref(false)

const { signIn } = useAuth()
const toast = useToast()

definePageMeta({
  layout: 'empty',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  }
})

const form = reactive(
  {
    username: {
      value: '',
      label: 'Correo Electrónico',
      type: 'text',
      isRequired: true,
      showRequiredLabel: false,
      placeholder: 'Escriba su correo',
      validationKeywords: ['isEmail'],
      errorMessage: [],
      haveError: false
    },
    password: {
      value: '',
      label: 'Contraseña',
      type: 'password',
      isRequired: true,
      showRequiredLabel: false,
      showFeedBack: false,
      placeholder: 'Escriba su contraseña',
      validationKeywords: [],
      errorMessage: [],
      haveError: false
    },
  }
)
const loading = ref(false)
const { layoutConfig } = useLayout()
const { executeRecaptcha } = useGoogleRecaptcha()

function onError(errorMessage: string) {
  toast.add({ severity: 'error', summary: 'Error', detail: `${errorMessage}`, life: 5000 })
}

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

async function login() {
  const username = form.username.value
  const password = form.password.value
  await submitAndReloadForm()
  const isValid = validateForm()
  if (!isValid) {
    return
  }
  loading.value = true
  const { token } = await executeRecaptcha('login')
  const { error, url } = await signIn('credentials', { username, password, redirect: false, tokenCaptcha: token })
  if (error && error === 'Se requiere cambio de contraseña') {
    navigateTo('/auth/change-password')
  }
  else if (error) {
    onError(error)
    loading.value = false
  }
  else {
    navigateTo(url, { external: true })
  }
}

async function goToRecoverPassword() {
  await navigateTo('/auth/forgotPassword')
}
</script>

<template>
  <div
    class="login-body flex min-h-screen layout-light"
    @keydown.enter="login"
  >
    <div id="login-image" class="login-image w-9 h-screen hidden md:block" />
    <div class="login-panel w-full" style="background: var(--surface-ground)">
      <div
        class="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-center justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat"
        style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image)"
      >
        <div class="flex flex-column align-items-center">
          <div class="flex justify-content-center mb-6 logo-container">
            <NuxtImg
              src="/layout/images/logo/logo-light.svg"
              class="login-logo" style="width: 150px"
            />
          </div>

          <div class="form-container">
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
                :submit="submitForm" :properties="form.password"
                :validation-keywords="form.password.validationKeywords" style="width: 300px;"
                @update:model-value="form.password.value = $event"
                @update:error-messages="form.password.errorMessage = $event"
                @invalid-field="form.password.haveError = $event"
              />
            </div>
          </div>

          <div class="button-container mb-3 mt-2" style="width: 300px;">
            <Button
              type="button" label="Entrar" icon="pi pi-ref" class="w-full flex justify-content-center" style="height: 35px;" :disabled="loading"
              @click="login" @keydown.enter="login"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
              <span v-else class="font-semibold">Entrar</span>
            </Button>
          </div>
          <a href="/auth/forgotPassword" class="flex align-self-end text-color-secondary mb-4 text-sm" @click="goToRecoverPassword">¿Olvidaste tu contraseña?</a>

          <div class="login-footer flex justify-content-center align-items-center absolute" style="bottom: 75px;">
            <div class="flex align-items-center login-footer-logo-container pr-4 mr-4 border-right-1 surface-border">
              <NuxtImg
                src="/layout/images/logo/logo-light.svg"
                class="login-logo" style="width: 100px"
              />
            </div>
            <span class="text-sm text-color-secondary mr-3" style="margin-top: 1rem;">Copyright 2024</span>
          </div>
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
    background-position: 50%;
}

#login-panel {
    background: var(--surface-ground)
}
</style>
