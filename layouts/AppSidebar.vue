<script setup>
import { useRouter } from 'vue-router'
import AppMenu from './AppMenu.vue'
import { useLayout } from '@/layouts/composables/layout'

const { layoutState, layoutConfig } = useLayout()
const router = useRouter()

let timeout = null

function onMouseEnter() {
  if (!layoutState.anchored.value) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    layoutState.sidebarActive.value = true
  }
}

function onMouseLeave() {
  if (!layoutState.anchored.value) {
    if (!timeout) {
      timeout = setTimeout(() => (layoutState.sidebarActive.value = false), 300)
    }
  }
}

function anchor() {
  layoutState.anchored.value = !layoutState.anchored.value
}
function navigateToHome() {
  router.push('/')
}
</script>

<template>
  <div class="layout-sidebar" @mouseenter="onMouseEnter()" @mouseleave="onMouseLeave()">
    <div class="sidebar-header">
      <a class="app-logo" style="cursor: pointer" @click="navigateToHome">
        <div class="app-1small h-2rem">
          <NuxtImg
            :src="`/layout/images/logo/logo-simple-${layoutConfig.colorScheme.value === 'light' ? 'light' : 'dark'}.svg`"
          />
        </div>
        <div class="app-logo-normal">
          <NuxtImg
            class="h-3rem light-mode"
            :src="`/layout/images/logo/logo-${layoutConfig.colorScheme.value === 'light' ? 'light' : 'dark'}.svg`"
            style="width: 140px"
          />
        </div>
      </a>
      <Button class="layout-sidebar-anchor p-link z-2" type="button" @click="anchor()" />
    </div>

    <div class="layout-menu-container">
      <AppMenu />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
