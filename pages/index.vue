<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TabView from 'primevue/tabview'
import Dashboard from './dashboards/Dashboard.vue'
import CardShortCut from '@/app/home/components/CardShortCut.vue'
import type { ICardOptions } from '@/app/home/interfaces/IDashboard'

// CONSTANTS -----------------------------------------------------------------------------------------
const items = ref<ICardOptions[]>([
  { label: 'Usuarios', icon: 'pi pi-users', bgColor: '#effbfc91', color: '#2399b5', link: '/user', perm: 'ADMINISTRACION:GESTION-USUARIOS' },
])
// -------------------------------------------------------------------------------------------------------
// TABLE OPTIONS -----------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------

// TRIGGER FUNCTIONS -------------------------------------------------------------------------------------
onMounted(() => {
})

// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="mb-4">
    <!-- <TabMenu :model="items" /> -->
  </div>
  <div class="flex flex-wrap mt-2 lg:mt-2">
    <TabView class="w-full">
      <TabPanel header="Inicio" :pt="{ root: { class: 'p-container' } }">
        <div v-for="(item, index) of items" :key="index">
          <IfCan v-if="item.perm" :perms="[item.perm]">
            <div class="gap-4 col-6 w-auto sm:col-4 md:col-3 lg:col-2 xl:col-2 justify-content-center">
              <CardShortCut :items="item" />
            </div>
          </IfCan>
        </div>
      </TabPanel>
      <TabPanel header="Indicadores">
        <Dashboard />
      </TabPanel>
    </TabView>
  </div>
  <div v-if="false" class="grid py-4">
    <div class="col-12 lg:col-6">
      Logo
    </div>
    <div class="col-12 lg:col-6 flex justify-content-end">
      Nombre de la Organizacion
    </div>
  </div>
</template>

<style scoped>
.p-container {
    min-height: 75vh;
}
</style>
