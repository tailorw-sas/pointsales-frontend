<script lang="ts" setup>
const { status, data } = useAuth()
</script>

<template>
  <div class="wrapper">
    <slot
      v-if="status === 'authenticated'"
      :use-data="data"
    />
    <slot v-else name="unauthenticated" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: content;
}
</style>
