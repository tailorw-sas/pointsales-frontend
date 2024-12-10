<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { IOptionField } from './interfaces/IFieldInterfaces'
import type { ITreeNode } from '~/interfaces/IInterfaces'

interface CheckedStatus {
  checked: boolean
  partialChecked: boolean
}

interface MainStructure {
  [key: string]: CheckedStatus
}

interface TreeNode {
  key: string
  label: string
  data: string
  icon: string
  children?: TreeNode[]
}

const props = defineProps({
  properties: {
    type: Object as PropType<IOptionField>,
    required: false,
  },
  items: {
    type: Array as PropType<ITreeNode[]>,
    required: true,
    default: () => [],
  },
  selectedKey: {
    type: Object as PropType<MainStructure>,
    required: false,
  },
})

const emits = defineEmits([
  'update:listItems',
  'update:selectedKey',
  'update:modelValue',
  'onSelectedNodeHighrisk',
  'onSelectInactiveNode',
])

const expandedKeys = ref<Record<string, boolean>>({})
const itemsListLocal = ref<ITreeNode[]>([])
const selectedKeyLocal = ref<MainStructure>({})

watch(
  () => props.items,
  (newItems) => {
    itemsListLocal.value = newItems
  },
  { immediate: true, deep: true }
)

watch(
  () => props.selectedKey,
  (newSelectedKey) => {
    if (newSelectedKey) {
      selectedKeyLocal.value = newSelectedKey
      // updateParentSelection()
    }
  },
  { immediate: true, deep: true }
)

const collapseAndExpandAll = ref(false)
const checkOrUncheckAll = ref(false)

function toggleExpandAll() {
  if (collapseAndExpandAll.value) {
    expandAll()
  }
  else {
    collapseAll()
  }
}

function expandAll() {
  for (const node of itemsListLocal.value) {
    expandNode(node)
  }
  expandedKeys.value = { ...expandedKeys.value }
}

function collapseAll() {
  expandedKeys.value = {}
}

function expandNode(node: TreeNode) {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true
    for (const child of node.children) {
      expandNode(child)
    }
  }
}

function transformToCheckedObject(data: TreeNode[]): MainStructure {
  const result: MainStructure = {}
  function processItem(item: TreeNode) {
    result[item.key] = {
      checked: true,
      partialChecked: false,
    }
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => processItem(child))
    }
  }
  data.forEach(item => processItem(item))
  return result
}

function checkOrUncheckAllFn() {
  if (checkOrUncheckAll.value) {
    selectedKeyLocal.value = transformToCheckedObject(itemsListLocal.value)
  }
  else {
    selectedKeyLocal.value = {}
  }
}

function getHighRiskKeys(node: any) {
  if (node.children && node.children.length > 0) {
    let result = node.children.filter((child: any) => child.isHighRisk).map((child: any) => child.key)
    result = [...result, node.key]
    return result
  }
  return []
}

function onNodeSelect(node: any) {
  const hasHighRisk = getHighRiskKeys(node)

  if (node.status === 'INACTIVE') {
    emits('onSelectInactiveNode', node.key)
  }
  else if (hasHighRisk.length > 0) {
    emits('onSelectedNodeHighrisk', hasHighRisk)
  }
  else {
    if (node.isHighRisk) {
      emits('onSelectedNodeHighrisk', node.key)
    }
  }

  // toast.add({ severity: 'success', summary: 'Node Selected', detail: node.label, life: 3000 })
}

function updateParentSelection() {
  const updateParent = (node: TreeNode) => {
    if (!node.children || node.children.length === 0) {
      return
    }

    let allChecked = true
    let anyChecked = false

    for (const child of node.children) {
      updateParent(child)
      const childStatus = selectedKeyLocal.value[child.key]
      if (childStatus) {
        if (childStatus.checked) {
          anyChecked = true
        }
        else if (childStatus.partialChecked) {
          anyChecked = true
          allChecked = false
        }
        else {
          allChecked = false
        }
      }
      else {
        allChecked = false
      }
    }

    const nodeStatus = selectedKeyLocal.value[node.key] || { checked: false, partialChecked: false }
    if (allChecked) {
      nodeStatus.checked = true
      nodeStatus.partialChecked = false
    }
    else if (anyChecked) {
      nodeStatus.checked = false
      nodeStatus.partialChecked = true
    }
    else {
      nodeStatus.checked = false
      nodeStatus.partialChecked = false
    }

    selectedKeyLocal.value[node.key] = nodeStatus
  }

  for (const node of itemsListLocal.value) {
    updateParent(node)
  }
}

watch(itemsListLocal, () => {
  emits('update:listItems', itemsListLocal.value)
}, { deep: true })
watch(selectedKeyLocal, () => {
  emits('update:selectedKey', selectedKeyLocal.value)
}, { deep: true })

defineExpose({ updateParentSelection })
</script>

<template>
  <div>
    <hr class="mb-3">
    <div class="flex justify-content-between">
      <div class="mr-5 flex align-items-center mb-3 mt-3">
        <Checkbox v-model="collapseAndExpandAll" input-id="ingredient1" name="collapseAndExpandAll" :binary="true" @change="toggleExpandAll" />
        <label for="ingredient1" class="ml-2 font-bold"> Expandir/Contraer Todos </label>
      </div>
      <div class="flex align-items-center mb-3 mt-3">
        <Checkbox v-model="checkOrUncheckAll" input-id="ingredient2" name="checkOrUncheckAll" :binary="true" @change="checkOrUncheckAllFn" />
        <label for="ingredient2" class="ml-2 font-bold"> Marcar/Desmarcar Todos </label>
      </div>
    </div>

    <Tree
      v-model:selectionKeys="selectedKeyLocal"
      v-model:expandedKeys="expandedKeys"
      :value="itemsListLocal"
      :filter="true"
      filter-mode="lenient"
      class="w-full"
      selection-mode="checkbox"
      @node-select="onNodeSelect"
    >
      <template #default="slotProps">
        <div class="flex align-items-center" style="width: 100%;">
          <div class="flex align-items-center">
            <i
              v-if="slotProps.node.children && slotProps.node.children.length"
              :class="expandedKeys[slotProps.node.key] ? 'pi pi-folder-open' : 'pi pi-folder'"
              class="mr-2"
            />
            <i v-else class="pi pi-file mr-2" />
            <span>{{ slotProps.node.label }}</span>
            <span
              v-if="slotProps.node.isHighRisk"
              v-tooltip="'HIGH RISK'"
              class="ml-4 p-tag p-tag-rounded p-tag-danger font-bold text-sm"
              style="padding-top: 2px; padding-bottom: 2px;"
            >
              High Risk
            </span>
          </div>
          <!-- <div class="flex align-items-center" :class="slotProps.node.isHighRisk ? 'ml-1' : 'ml-4'">
            <span
              v-if="slotProps.node.status"
              v-tooltip="slotProps.node.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'"
              class="p-tag p-tag-rounded font-bold text-sm"
              :class="slotProps.node.status === 'ACTIVE' ? 'p-tag-success' : 'p-tag-danger'"
              style="padding-top: 2px; padding-bottom: 2px;"
            >
              {{ slotProps.node.status ? slotProps.node.status.toLowerCase()[0].toUpperCase() + slotProps.node.status.slice(1).toLowerCase() : '' }}
            </span>
          </div> -->
        </div>
      </template>
    </Tree>
  </div>
</template>

<style scoped>
</style>
