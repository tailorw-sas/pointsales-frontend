<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CardShortCut from '@/app/home/components/CardShortCut.vue'
import type { ICardOptions } from '@/app/home/interfaces/IDashboard'

// CONSTANTS -----------------------------------------------------------------------------------------
const items = ref<ICardOptions[]>([
  { label: 'Añadir servicio', icon: 'pi pi-briefcase', perm: 'NOMENCLADOR:GESTION-SERVICIOS' },
  { label: 'Calendario', icon: 'pi pi-calendar', perm: 'CALENDARIO:GESTION-CITAS' },
  { label: 'Añadir cita', icon: 'pi pi-calendar-plus', perm: 'CALENDARIO:GESTION-CITAS' },
  { label: 'Añadir clientes', icon: 'pi pi-star' },
  // { label: 'Añadir vacuna', icon: 'pi pi-syringe' },
  { label: '', icon: 'pi pi-plus' },
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
    <TabMenu :model="items" />
  </div>
  <div class="flex flex-wrap mt-3 lg:mt-2" style="max-height: 65vh; overflow-y: auto;">
    <div v-for="(item, index) of items" :key="index" class="gap-4 col-6 w-auto sm:col-4 md:col-3 lg:col-2 xl:col-2">
      <IfCan v-if="item.perm" :perms="[item.perm]">
        <CardShortCut :items="item" />
      </IfCan>
    </div>
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
