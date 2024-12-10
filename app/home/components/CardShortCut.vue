<script setup lang="ts">
import type { PropType } from 'vue'
import type { ICardOptions } from '../interfaces/IDashboard'

defineProps({
  items: {
    type: Object as PropType<ICardOptions>,
    required: true,
  },
})
</script>

<template>
  <NuxtLink :to="items.link">
    <div
      class="p-ripple card card-container card-hover flex flex-column lx:flex-row justify-content-center align-items-center py-8 card-border"
      style="max-width: 300px; max-height: 300px; width: 200px; height: 200px;"
      :style="{ backgroundColor: items.bgColor, color: items.color }"
    >
      <!-- :style="{border: '2px solid #2399b5'}" -->
      <i class="mb-4" :class="items.icon" style="font-size: 6.5rem;" />
      <div v-if="items.label !== ''" class="flex select-none justify-content-center align-items-center border-round font-bold">
        {{ items.label }}
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
.card-hover {
  transition: transform 0.3s ease-in-out !important;
}

.card-hover:hover {
  transform: scale(1.2) !important;
}
.card-border {
    border: 2px solid;
    border-color: #0f8afd00;
  }
  // .card-border:hover {
  //   border: 2px solid;
  //   border-color: var(--primary-color);
  // }

  .card-container {
  background-color: rgba(255, 255, 255, 0.1); /* Fondo blanco con opacidad baja */
  backdrop-filter: blur(10px); /* Efecto de desenfoque */
  -webkit-backdrop-filter: blur(10px); /* Efecto de desenfoque para Safari */
  border-radius: 15px; /* Bordes redondeados */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Borde sutil */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra para dar profundidad */
  padding: 20px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

// .card-container:hover {
//   border-color: var(--primary-color); /* Color del borde al pasar el cursor */
//   box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15); /* Sombra más intensa al pasar el cursor */
// }
</style>
