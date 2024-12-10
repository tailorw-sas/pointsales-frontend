<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { usePrimeVue } from 'primevue/config'
import ConfirmPopup from 'primevue/confirmpopup'
import AppTopbar from '@/layouts/AppTopbar.vue'
import AppConfig from '@/layouts/AppConfig.vue'
import AppProfileMenu from '@/layouts/AppProfileMenu.vue'
import AppBreadCrumb from '@/layouts/AppBreadcrumb.vue'
import { useLayout } from '@/layouts/composables/layout'
import { useAuthStore } from '@/stores/authStore'

const { signOut } = useAuth()
const $primevue = usePrimeVue()
const { layoutConfig, layoutState, isSidebarActive } = useLayout()

const outsideClickListener = ref(null)
const topbarRef = ref(null)

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener()
  }
  else {
    unbindOutsideClickListener()
  }
})

onBeforeUnmount(() => {
  unbindOutsideClickListener()
})

const containerClass = computed(() => {
  return [
    {
      'layout-light': layoutConfig.colorScheme.value === 'light',
      'layout-dark': layoutConfig.colorScheme.value === 'dark',
      'layout-overlay': layoutConfig.menuMode.value === 'overlay',
      'layout-static': layoutConfig.menuMode.value === 'static',
      'layout-slim': layoutConfig.menuMode.value === 'slim',
      'layout-slim-plus': layoutConfig.menuMode.value === 'slim-plus',
      'layout-horizontal': layoutConfig.menuMode.value === 'horizontal',
      'layout-reveal': layoutConfig.menuMode.value === 'reveal',
      'layout-drawer': layoutConfig.menuMode.value === 'drawer',
      'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
      'layout-overlay-active': layoutState.overlayMenuActive.value,
      'layout-mobile-active': layoutState.staticMenuMobileActive.value,
      'p-ripple-disabled': $primevue.config.ripple === false,
      'layout-sidebar-active': layoutState.sidebarActive.value,
      'layout-sidebar-anchored': layoutState.anchored.value
    }
  ]
})

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive.value = false
        layoutState.overlaySubmenuActive.value = false
        layoutState.staticMenuMobileActive.value = false
        layoutState.menuHoverActive.value = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener)
    outsideClickListener.value = null
  }
}

function isOutsideClicked(event) {
  if (!topbarRef.value) { return }

  const sidebarEl = topbarRef?.value?.$el instanceof HTMLElement ? topbarRef?.value?.$el?.querySelector('.layout-sidebar') : null
  const topbarEl = topbarRef?.value?.$el instanceof HTMLElement ? topbarRef?.value?.$el?.querySelector('.topbar-start > button') : null

  return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target))
}

const businessStore = useBusinessStore()
const authStore = useAuthStore()

try {
  await useAsyncData('userMe', () => authStore.getUserMe().then(true))

  const orderedBusinesses = authStore.userData.data.businesses.sort((a, b) => {
    return a.businessId > b.businessId ? 1 : -1
  })

  const bussinessSelected = authStore.userData.data.selectedBusiness
    ? authStore.userData.data.businesses.find(item => item.businessId === authStore.userData.data.selectedBusiness)
    : orderedBusinesses[0]

  businessStore.setCurrent(bussinessSelected)
}
catch (error) {
  signOut()
}
</script>

<template>
  <div class="layout-container bg-home" :class="containerClass">
    <div class="layout-content-wrapper">
      <AppTopbar ref="topbarRef" />

      <div class="content-breadcrumb">
        <AppBreadCrumb />
      </div>

      <!-- Estaba contenido dentro el Layout Content  -->
      <slot />
      <!-- <div class="layout-content card p-ripple card-container">
      </div> -->

      <!-- <NuxtPage /> -->

      <div class="layout-mask" />
      <AppProfileMenu />
      <AppConfig />
      <ConfirmPopup group="headless" />

      <ConfirmDialog>
        <template #container="{ message, acceptCallback, rejectCallback }">
          <div class="flex flex-column align-items-center p-5 surface-overlay border-round">
            <div class="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">
              <i class="pi pi-question text-5xl" />
            </div>
            <span class="font-bold text-2xl block mb-2 mt-4">{{ message.header }}</span>
            <p class="mb-0">
              {{ message.message }}
            </p>
            <div class="flex align-items-center gap-2 mt-4">
              <Button label="Aceptar" class="w-8rem" @click="acceptCallback" />
              <Button label="Cancelar" outlined class="w-8rem" @click="rejectCallback" />
            </div>
          </div>
        </template>
      </ConfirmDialog>

      <Toast />
    </div>
  </div>
</template>

<style lang="scss">
  .bg-home {
  position: relative;
  background-image: url('/layout/images/home/bg2.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.card-container {
  background-color: rgba(255, 255, 255, 0.1); /* Fondo blanco con opacidad baja */
  backdrop-filter: blur(25px); /* Efecto de desenfoque */
  -webkit-backdrop-filter: blur(25px); /* Efecto de desenfoque para Safari */
  border-radius: 15px; /* Bordes redondeados */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Borde sutil */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra para dar profundidad */
  padding: 20px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  height: 88vh;
}
</style>
