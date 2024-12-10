<script setup lang="ts">
import AppMenuItem from './AppMenuItem.vue'
import { menuItems } from './data/MenuItems'
import type { MenuHeader, MenuItem } from '~/types'

const { data } = useAuth()
const businessStore = useBusinessStore()
const isAdmin = (data.value?.user as any)?.isAdmin === true

/**
 * Filters the menu headers by removing any headers that do not have any items.
 *
 * @param {MenuHeader[]} menuHeaders - The array of menu headers to filter.
 * @return {MenuHeader[]} The filtered array of menu headers.
 */
function filterMenuItems(menuHeaders: MenuHeader[]): MenuHeader[] {
  return menuHeaders.map((header: MenuHeader) => {
    if (header.items) {
      header.items = filterItems(header.items)
    }
    return header
  }).filter(header => header.items && header.items.length > 0)
}

/**
 * Filters the items based on certain conditions.
 *
 * @param {MenuItem[]} items - Array of MenuItem objects to filter
 * @return {MenuItem[]} Filtered array of MenuItem objects
 */
function filterItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    if (item.items) {
      item.items = filterItems(item.items)
    }
    return item
  })
    .filter(item => isAdmin || businessStore.can([item.perm ?? '']) || (item.items && item.items.length > 0))
    .map((item) => {
      delete item.perm
      return item
    })
}

const menuItemsFiltered = filterMenuItems(menuItems)
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in menuItemsFiltered" :key="item">
      <AppMenuItem v-if="!item.separator" :item="item" root :index="i" />

      <li v-else class="menu-separator" />
    </template>
  </ul>
</template>
