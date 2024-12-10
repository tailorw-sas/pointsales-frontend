<script setup>
import { ref } from 'vue'
import { usePrimeVue } from 'primevue/config'
import AppSidebar from './AppSidebar.vue'
import AppBreadcrumb from './AppBreadcrumb.vue'
import { useLayout } from '@/layouts/composables/layout'
import { useAuthStore } from '@/stores/authStore'
import ResetPasswordDialog from '~/pages/auth/resetPasswordDialog.vue'

const { signOut, data } = useAuth()

const $primevue = usePrimeVue()

defineExpose({
  $primevue
})

const { onMenuToggle, showConfigSidebar } = useLayout()
const loading = ref(false)
const visible = ref(false)

const dialogConfirmChangePassword = ref(false)
const changePassVisible = ref(false)
const bussinessInput = ref(null)
const bussinessSelected = ref({})
const currentBussiness = ref({})

const dialogConfirm = ref(false)
const messageDialog = ref('')

const authStore = useAuthStore()
const businessStore = useBusinessStore()

currentBussiness.value = businessStore.current

const { $api } = useNuxtApp()
const repo = repository($api)

const searchActive = ref(true)

function onMenuButtonClick() {
  onMenuToggle()
}

function onConfigButtonClick() {
  showConfigSidebar()
}

async function openDialogConfirm() {
  if (bussinessSelected.value != null) {
    messageDialog.value = `¿Desea cambiar de la Empresa ${currentBussiness.value.name} a la Empresa ${bussinessSelected.value.name} ?`
    dialogConfirm.value = true
  }
}

async function handleChange() {
  try {
    loading.value = true
    await repo.changeUserBusiness({ businessId: bussinessSelected.value.businessId })
    loading.value = false
    window.location.reload()
  }
  catch (error) {
    // TODO: Show toast error if there is an error
    // console.log(error)
  }
  finally {
    dialogConfirm.value = false
    visible.value = false
  }
}

async function openDialogConfirmChangePassword() {
  messageDialog.value = `¿Está seguro que desea cambiar su contraseña?`
  dialogConfirmChangePassword.value = true
  dialogConfirm.value = false
}

async function openResetPassword() {
  dialogConfirmChangePassword.value = false
  changePassVisible.value = true
}
</script>

<template>
  <div class="layout-topbar w-full">
    <div class="topbar-start">
      <Button type="button" class="topbar-menubutton p-link p-trigger" @click="onMenuButtonClick">
        <i class="pi pi-bars" />
      </Button>

      <div class="topbar-breadcrumb">
        <AppBreadcrumb />
      </div>
    </div>
    <div class="layout-topbar-menu-section">
      <AppSidebar />
    </div>
    <div class="topbar-end mr-5" style="width: 60%; max-width: 60%;">
      <ul class="topbar-menu">
        <li class="profile-item topbar-item" style="justify-content: end !important; width: 100%; max-width: 100%; display: flex;">
          <!-- <div class="search-input-wrapper" style="width: 100%;">
            <InputGroup>
              <InputText ref="bussinessInput" v-model="currentBussiness.name" type="text" placeholder="Empresa" disabled style="text-align: end" />
              <Button v-if="authStore.userData.data.businesses.length > 1" label="currentBussiness.name" icon="pi pi-search" severity="secondary" text rounded @click="visible = !visible" />
            </InputGroup>
          </div> -->
          <div class="topbar-search " :class="{ 'topbar-search-active': searchActive }">
            <div class="search-input-wrapper  " style="width: 100%;" @click="authStore.userData.data.businesses.length > 1 ? visible = !visible : null">
              <IconField class=" bg-secondary">
                <InputIcon v-if="authStore.userData.data.businesses.length > 1" class="pi pi-search cursor-pointer" />
                <InputText
                  ref="bussinessInput"
                  v-model="currentBussiness.name"
                  type="text"
                  placeholder="Buscar"
                  :style="{ width: `${currentBussiness.name.length + 10}ch` }"
                  class="cursor-pointer"
                />
              </IconField>
            </div>
          </div>
        </li>

        <IfCan :perms="['CHANGE_STYLE']">
          <li class="ml-3">
            <Button type="button" icon="pi pi-cog" class="text-color-secondary flex-shrink-0" severity="secondary" text rounded @click="onConfigButtonClick()" />
          </li>
        </IfCan>

        <li class="profile-item topbar-item">
          <a v-ripple v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }" class="p-ripple cursor-pointer">
            <Avatar v-if="data?.user?.image" :image="data?.user?.image" shape="circle" />
            <Avatar v-else icon="pi pi-user" style="background-color: transparent;" shape="circle" />
          </a>

          <ul class="topbar-menu active-topbar-menu p-4 w-15rem z-5 hidden border-round">
            <li role="menuitem" class="m-0 mb-3">
              <a
                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                href="/user/profile"
                class="flex align-items-center hover:text-primary-500 transition-duration-200"
              >
                <i class="pi pi-fw pi-user mr-2" />
                <span>Mi Perfil</span>
              </a>
            </li>

            <li v-if="currentBussiness" role="menuitem" class="m-0 mb-3">
              <a
                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                :href="`/business/profile/${currentBussiness.businessId}`"
                class="flex align-items-center hover:text-primary-500 transition-duration-200"
              >
                <i class="pi pi-fw pi-folder mr-2" />
                <span>Mi Empresa</span>
              </a>
            </li>

            <li role="menuitem" class="m-0 mb-3" @click="openDialogConfirmChangePassword">
              <a
                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                href="#"
                class="flex align-items-center hover:text-primary-500 transition-duration-200"
              >
                <i class="pi pi-fw pi-key mr-2" />
                <span>Cambiar contraseña</span>
              </a>
            </li>
            <li role="menuitem" class="m-0" @click="signOut({ callbackUrl: '/auth/login' })">
              <a
                v-styleclass="{ selector: '@grandparent', enterClass: 'hidden', enterActiveClass: 'px-scalein', leaveToClass: 'hidden', leaveActiveClass: 'px-fadeout', hideOnOutsideClick: true }"
                href="#"
                class="flex align-items-center hover:text-primary-500 transition-duration-200"
              >
                <i class="pi pi-fw pi-sign-out mr-2" />
                <span>Salir</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>

      <div class="12">
        <Dialog
          v-model:visible="visible"
          modal
          header="Empresas"
          class="mx-3 sm:mx-0 sm:w-full md:w-4"
          content-class="border-top-1 surface-border"
          @hide="visible = false"
        >
          <div class="grid p-2" style="border-radius: 0px !important;">
            <div class="col-12 field mt-3">
              <Listbox
                v-model="bussinessSelected"
                :options="authStore.availableCompanies"
                option-label="name"
                empty-message="No hay ningun elemento en la lista."
                class="w-full md:w-56"
                list-style="height:250px"
                striped
              >
                <template #option="slotProps">
                  <div class="flex items-center">
                    <div><i class="pi pi-fw pi-home mr-2" /> {{ slotProps.option.name }}</div>
                  </div>
                </template>
              </Listbox>
            </div>
          </div>
          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" severity="secondary" class="p-button" @click="visible = !visible" />
            <Button label="Aceptar" icon="pi pi-check" class="p-button" @click="openDialogConfirm" />
          </template>
        </Dialog>
      </div>

      <div v-if="changePassVisible" class="col-12">
        <ResetPasswordDialog :open-dialog="changePassVisible" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="dialogConfirm" :style="{ width: '450px' }" :modal="true" :closable="false">
    <div class="flex align-items-center justify-content-center my-3">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span>{{ messageDialog }}</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" severity="secondary" class="p-button" @click="dialogConfirm = false" />
      <Button label="Si" icon="pi pi-check" class="p-button" :disabled="loading" @click="handleChange" />
    </template>
  </Dialog>

  <Dialog v-model:visible="dialogConfirmChangePassword" :style="{ width: '450px' }" :modal="true" :closable="false">
    <template #header>
      <h5 class="mx-2 mb-0">
        Cambiar Contraseña
      </h5>
    </template>
    <div class="flex align-items-center justify-content-center" style="height: 60px;">
      <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: orange" />
    </div>
    <div class="flex align-items-center justify-content-center my-3">
      <span>{{ messageDialog }}</span>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" class="p-button" @click="dialogConfirmChangePassword = false" />
      <Button label="Aceptar" severity="primary" class="p-button" :disabled="loading" @click="openResetPassword" />
    </template>
  </Dialog>
</template>

<style lang="scss">
.p-dialog .p-dialog-header .p-dialog-header-icon {
  color: white; /* Cambia el color del icono de cerrar a blanco */
}
</style>
