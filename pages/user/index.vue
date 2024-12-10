<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { PageState } from 'primevue/paginator'
import { z } from 'zod'
import { validate } from 'uuid'
import type { IColumn, IPagination } from '@/@core/table/interfaces/ITableInterfaces'
import type { IFilter, IQueryRequest } from '@/@core/fields/interfaces/IFieldInterfaces'
import DynamicTable from '@/@core/table/DynamicTable.vue'
import type { FieldDefinitionType } from '~/@core/form/EditFormV3'
import EditFormV3 from '~/@core/form/EditFormV3.vue'
import type { GenericObject } from '~/@core/interfaces/generic-interfaces'
import type { IData } from '~/@core/table/interfaces/IModelData'
import type { ITreeNode } from '~/app/user/interfaces/IInterfaces'
import getUrlByImage from '~/composables/files'
import { GenericService } from '~/@core/services/generic-services'
import { useAuthStore } from '@/stores/authStore'
import PasswordFieldComponnent from '~/@core/fields/PasswordFieldComponnent.vue'
import CheckBoxFieldComponnent from '~/@core/fields/CheckBoxFieldComponnent.vue'

// VARIABLES -----------------------------------------------------------------------------------------
const toast = useToast()
const confirm = useConfirm()
const authStore = useAuthStore()
const businessStore = useBusinessStore()
const listItems = ref<any[]>([])
const formReload = ref(0)
const { $api } = useNuxtApp()
const repo = repository($api)

const treeTableValue = ref<ITreeNode[]>([])
const userId = ref('')
const loadingSavePermissions = ref(false)
const loadingPermissions = ref(false)
const currentBussiness = ref<any>({})
currentBussiness.value = businessStore.current

const loadingSaveAll = ref(false)
const idItem = ref('')
const idItemToLoadFirstTime = ref('')
const loadingSearch = ref(false)
const loadingDelete = ref(false)
const filterToSearch = ref<IData>({
  criterial: null,
  search: '',
})
const treeViewPermissionRef = ref()
const selectedKey = ref({})
const treeNewViewPermissionRef = ref()
const newSelectedKey = ref({})

const bussinessSelected = ref({})
const newBussinessSelected = ref({})
const bussinessList = ref<any[]>([])
const visible = ref(false)
const submitForm = ref(false)
const visibleChangePass = ref(false)
const emailValue = ref('')

const fieldsWithImage = ['image', 'name', 'lastName', 'email', 'userType', 'userName', 'password']
// FORM CONFIG -------------------------------------------------------------------------------------------
const fields: Array<FieldDefinitionType> = [
  {
    field: 'image',
    header: '',
    disabled: false,
    dataType: 'image',
    class: 'field col-12 required mt-4',
    headerClass: 'mb-1',
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    toCapitalize: true,
    validation: z.string().trim().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
      .regex(/^[A-ZÁÉÍÓÚÑ]+(?: [A-ZÁÉÍÓÚÑ]+)*$/i, 'Solo letras permitidas'),
  },
  {
    field: 'lastName',
    header: 'Apellidos',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    toCapitalize: true,
    validation: z.string().trim().min(1, 'El campo apellido es requerido').max(50, 'Máximo 50 caracteres')
      .regex(/^[A-ZÁÉÍÓÚÑ]+(?: [A-ZÁÉÍÓÚÑ]+)*$/i, 'Solo letras permitidas'),
  },
  {
    field: 'email',
    header: 'Correo Electrônico',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo correo es requerido').max(50, 'Máximo 50 caracteres').email('Correo inválido')
  },
  {
    field: 'userType',
    header: 'Tipo de usuario',
    dataType: 'select',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    hidden: true,
  },
  {
    field: 'userName',
    header: 'Usuario',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    hidden: true,
  },
  {
    field: 'password',
    header: 'Contraseña',
    dataType: 'password',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo contraseña es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'permissions',
    header: 'Permisos',
    dataType: 'treeTable',
    class: 'field col-12 required mb-3 mt-3',
    headerClass: 'mb-1',
  }
]

const fieldsEdit: Array<FieldDefinitionType> = [
  {
    field: 'image',
    header: '',
    disabled: false,
    dataType: 'image',
    class: 'field col-12 required mt-4',
    headerClass: 'mb-1',
  },
  {
    field: 'name',
    header: 'Nombre',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo nombre es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'lastName',
    header: 'Apellidos',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo apellido es requerido').max(50, 'Máximo 50 caracteres')
  },
  {
    field: 'email',
    header: 'Correo Electrônico',
    dataType: 'text',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
    validation: z.string().trim().min(1, 'El campo correo es requerido').max(50, 'Máximo 50 caracteres').email('Correo inválido')
  },
  {
    field: 'userType',
    header: 'Tipo de usuario',
    dataType: 'select',
    class: 'field col-12 md:col-6 required',
    headerClass: 'mb-1',
  },
  {
    field: 'userName',
    header: 'Usuario',
    dataType: 'text',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    hidden: true,
  },
  {
    field: 'password',
    header: 'Contraseña',
    dataType: 'password',
    class: 'field col-12 required',
    headerClass: 'mb-1',
    hidden: true,
  },
  {
    field: 'permissions',
    header: 'Permisos',
    dataType: 'treeTable',
    class: 'field col-12 required mb-3 mt-3',
    headerClass: 'mb-1',
  }
]

const form = reactive(
  {
    newPassword: {
      value: '',
      label: 'Introduzca la nueva contraseña',
      type: 'password',
      isRequired: true,
      showRequiredLabel: false,
      placeholder: 'Escriba la contraseña',
      validationKeywords: [],
      errorMessage: [],
      haveError: false
    },
    changePassword: {
      value: false,
      label: 'Cambiar contraseña',
      type: 'checkbox',
      isRequired: false,
      showRequiredLabel: false,
      placeholder: '',
      validationKeywords: [],
      errorMessage: [],
      haveError: false
    }
  }
)

const confApi = reactive({
  moduleApi: 'identity',
  uriApi: 'users',
})

const confReadPermissionApi = reactive({
  moduleApi: 'identity',
  uriApi: `user-permission-business/${idItem.value}/business/${currentBussiness.value.businessId}`,
})

const confChangePasswordApi = reactive({
  moduleApi: 'identity',
  uriApi: 'users',
})

const item = ref<GenericObject>({
  image: '',
  name: '',
  lastName: '',
  email: '',
  userName: '',
  userType: null,
  password: '',
  express: false,
})

const itemUpdate = ref<GenericObject>({
  image: '',
  name: '',
  lastName: '',
  email: '',
  userName: '',
  userType: null,
  password: '',
  managePermissionList: [],
})

const itemTemp = ref<GenericObject>({

  image: '',
  name: '',
  lastName: '',
  email: '',
  userName: '',
  userType: null,
  password: '',
})
// -------------------------------------------------------------------------------------------------------
const formTitle = computed(() => {
  return idItem.value ? 'Editar' : 'Crear'
})
// -------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------
const ENUM_FILTER = [
  { id: 'name', name: 'Nombre' },
  { id: 'email', name: 'Correo Electrónico' },
]
// TABLE COLUMNS -----------------------------------------------------------------------------------------
const columns: IColumn[] = [
  { field: 'image', header: '', type: 'image', sortable: false },
  { field: 'name', header: 'Nombre', type: 'text' },
  { field: 'lastName', header: 'Apellidos', type: 'text' },
  { field: 'email', header: 'Correo Electrónico', type: 'text' },
]
// -------------------------------------------------------------------------------------------------------

// TABLE OPTIONS -----------------------------------------------------------------------------------------
const options = ref({
  tableName: 'Usuarios',
  moduleApi: 'identity',
  uriApi: 'users',
  loading: false,
  actionsAsMenu: false,
  showAcctions: false,
  showHeaderToolBar: false,
  showDelete: false,
  isUser: true,
  messageToDelete: '¿Estás seguro que deseas eliminar el usuario: {{name}}?'
})
const payloadOnChangePage = ref<PageState>()
const payload = ref<IQueryRequest>({
  filter: [],
  query: '',
  pageSize: 50,
  page: 0,
  sortBy: 'updatedAt',
  sortType: 'DES'
})
const pagination = ref<IPagination>({
  page: 0,
  limit: 20,
  totalElements: 0,
  totalPages: 0,
  search: ''
})
// -------------------------------------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------------------------
function clearForm() {
  item.value = { ...itemTemp.value }
  idItem.value = ''
  fields[0].disabled = false
  selectedKey.value = {}
  newSelectedKey.value = {}
  itemUpdate.value.managePermissionList = []
  formReload.value++
}

async function getList() {
  try {
    options.value.loading = true
    listItems.value = []
    const response = await GenericService.search(options.value.moduleApi, options.value.uriApi, payload.value)

    const { data: dataList, page, size, totalElements, totalPages } = response

    pagination.value.page = page
    pagination.value.limit = size
    pagination.value.totalElements = totalElements
    pagination.value.totalPages = totalPages

    for (const iterator of dataList) {
      listItems.value = [...listItems.value, { ...iterator, loadingEdit: false, loadingDelete: false }]
    }
    if (listItems.value.length > 0) {
      idItemToLoadFirstTime.value = listItems.value[0].id
    }
  }
  catch (error) {
    console.error(error)
  }
  finally {
    options.value.loading = false
  }
}
function searchAndFilter() {
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type !== 'filterSearch')]
  if (filterToSearch.value.criterial || filterToSearch.value.search) {
    payload.value.filter = [...payload.value.filter, {
      key: filterToSearch.value.criterial ? filterToSearch.value.criterial.id : '',
      operator: 'LIKE',
      value: filterToSearch.value.search,
      logicalOperation: 'AND',
      type: 'filterSearch',
    }]
  }
  getList()
}

function clearFilterToSearch() {
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type !== 'filterSearch')]
  filterToSearch.value.criterial = ENUM_FILTER[0]
  filterToSearch.value.search = ''
  getList()
} async function resetListItems() {
  payload.value.page = 0
  getList()
}

async function getItemById(id: string) {
  if (id) {
    idItem.value = id
    userId.value = id
    loadingSaveAll.value = true
    selectedKey.value = {}
    newSelectedKey.value = {}
    itemUpdate.value.managePermissionList = []
    try {
      const response = await GenericService.getById(confApi.moduleApi, confApi.uriApi, id)
      if (response) {
        itemUpdate.value.id = response.id
        itemUpdate.value.image = response.image
        itemUpdate.value.name = response.name
        itemUpdate.value.lastName = response.lastName
        itemUpdate.value.email = response.email
        itemUpdate.value.userType = ENUM_USER_TYPE.find(item => item.id === response.userType)

        const responsePermission = await GenericService.searchById(confReadPermissionApi.moduleApi, `user-permission-business/${idItem.value}/business/${currentBussiness.value.businessId}`)
        if (responsePermission) {
          itemUpdate.value.managePermissionList = responsePermission.permissions.map((item: any) => item.id)
          await setSelectedElements(itemUpdate.value.managePermissionList, selectedKey, treeViewPermissionRef)
          await setSelectedElements(itemUpdate.value.managePermissionList, newSelectedKey, treeNewViewPermissionRef)
        }
      }
      updateFieldProperty(fieldsEdit, 'userType', 'disabled', true)
      formReload.value += 1
    }
    catch (error) {
      if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el registro', life: 3000 })
      }
    }
    finally {
      loadingSaveAll.value = false
    }
  }
}

async function createItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }
  if (payload.image) {
    const imageURL = await getUrlByImage(payload.image)
    if (imageURL) {
      payload.image = imageURL
    }
  }
  payload.userType = 'SYSTEM'// typeof payload.userType === 'object' ? payload.userType.id : payload.userType

  const user = { userName: payload.email, email: payload.email, name: payload.name, lastName: payload.lastName, password: payload.password, userType: payload.userType, image: payload.image }
  const responseUser = await GenericService.create(confApi.moduleApi, confApi.uriApi, user)
  if (responseUser) {
    // Permission
    userId.value = responseUser.id
    await assignPermissions()
  }
  loadingSaveAll.value = false
}

async function updateItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  const payload: { [key: string]: any } = { ...item }

  payload.image = typeof payload.image === 'object' && payload.image ? await getUrlByImage(payload.image) : payload.image
  payload.userType = typeof payload.userType === 'object' ? payload.userType.id : payload.userType

  const user = { userName: payload.email, email: payload.email, name: payload.name, lastName: payload.lastName, userType: payload.userType, image: payload.image }
  const responseUser = await GenericService.update(confApi.moduleApi, confApi.uriApi, idItem.value || '', user)

  if (!payload.image && itemUpdate.value.image) {
    GenericService.deleteUrlByImage('cloudbridges', 'files/delete', itemUpdate.value.image)
  }

  if (responseUser) {
    // Permission
    userId.value = idItem.value
    await assignPermissions()

    loadingSaveAll.value = false
  }
}

async function deleteItem(id: string) {
  try {
    loadingDelete.value = true
    await GenericService.deleteItem(options.value.moduleApi, options.value.uriApi, id)
    clearForm()
    getList()
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro', life: 3000 })
    loadingDelete.value = false
  }
  finally {
    loadingDelete.value = false
  }
}

async function saveItem(item: { [key: string]: any }) {
  loadingSaveAll.value = true
  let successOperation = true

  if (idItem.value) {
    try {
      await updateItem(item)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 5000 })
    }
    catch (error: any) {
      successOperation = false
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
    // idItem.value = ''
  }
  else {
    try {
      await createItem(item)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 5000 })
    }
    catch (error: any) {
      successOperation = false
      toast.add({ severity: 'error', summary: 'Error', detail: error.data.data.error.errorMessage, life: 5000 })
    }
  }
  loadingSaveAll.value = false
  if (successOperation) {
    clearForm()
    getList()
  }
}

async function getListPermissionsByBusiness(idBusiness: string) {
  if (idBusiness) {
    await getListModulesAndPermissions(idBusiness)
  }
}

function setSelectedElements(elements: Array<any>, selected: any, treeViewRef: any) {
  for (const iterator of elements) {
    selected.value[iterator] = {
      checked: true,
      partialChecked: false
    }
  }
  nextTick(() => {
    setTimeout(() => {
      if (treeViewRef.value) {
        treeViewRef.value.updateParentSelection()
      }
    }, 400)
  })
}

function transformData(data: any) {
  return data.map((item: any, index?: number) => {
    return {
      key: index,
      label: item.name ? item.name.trim().toUpperCase() : '',
      data: item.description ? item.description.trim().toUpperCase() : '',
      icon: '', // 'pi pi-fw pi-folder',
      children: item.permissions.length > 0
        ? item.permissions.map((permission: any, pIndex: number) => ({
          key: item.permissions[pIndex].id,
          label: permission.action ? permission.action.trim().toUpperCase() : '',
          data: permission.description ? permission.description.trim().toUpperCase() : '',
          icon: '',
          isHighRisk: permission?.isHighRisk || false,
          isIT: permission?.isIT || false,
          status: permission?.status || ''
        }))
        : []
    }
  })
}

async function getListModulesAndPermissions(idBusiness: string) {
  try {
    loadingPermissions.value = true
    treeTableValue.value = []

    const response = await GenericService.getById('identity', 'module', idBusiness, 'build')
    const transformedData = transformData(response.data)
    treeTableValue.value = [...transformedData]

    // read permissions
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loadingPermissions.value = false
  }
}

function filterSelectedIds(data: any) {
  const uuidList: string[] = []

  for (const key in data) {
    if (Number.isNaN(Number(key))) {
      uuidList.push(key)
    }
  }
  return uuidList
}

async function assignPermissions() {
  try {
    loadingSavePermissions.value = true
    const hasProperties = Object.keys(selectedKey.value).length > 0
    if (hasProperties) {
      const listIds = filterSelectedIds(selectedKey.value)
      const payload = {
        userId: userId.value,
        businessId: currentBussiness.value.businessId,
        permissionIds: listIds
      }
      await GenericService.create('identity', 'user-permission-business', { ...payload })
    }
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loadingSavePermissions.value = false
  }
}

async function linkUserBussiness() {
  bussinessList.value = authStore.availableCompanies
  visible.value = true
}

async function saveLinkUserBussiness() {
  try {
    loadingSavePermissions.value = true
    const hasProperties = Object.keys(newSelectedKey.value).length > 0
    if (!newBussinessSelected.value) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una empresa', life: 5000 })
      return
    }
    if (!hasProperties) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar al menos un permiso', life: 5000 })
      return
    }
    if (hasProperties) {
      const listIds = filterSelectedIds(newSelectedKey.value)
      const payload = {
        userId: userId.value,
        businessId: newBussinessSelected.value,
        permissionIds: listIds
      }
      await GenericService.create('identity', 'user-permission-business', { ...payload })
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Permisos asignados correctamente', life: 5000 })
    }
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loadingSavePermissions.value = false
  }
}

async function changePassByAdmin() {
  form.newPassword.value = ''
  form.changePassword.value = false
  visibleChangePass.value = true
}

async function saveChangePass() {
  try {
    loadingSaveAll.value = true
    const obj = {
      userId: userId.value,
      newPassword: form.newPassword.value,
      changePassword: form.changePassword.value
    }
    await repo.adminChangePassword({
      userId: userId.value,
      newPassword: form.newPassword.value,
      changePassword: form.changePassword.value
    })
    toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 5000 })
    visibleChangePass.value = false
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar la contraseña', life: 5000 })
  }
  finally {
    loadingSaveAll.value = false
  }
}
function requireConfirmationToSave(item: any) {
  const { event } = item
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Guardar registro',
    message: 'Desea guardar el registro?',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Aceptar',
    accept: () => {
      saveItem(item)
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}
function requireConfirmationToDelete(item: any) {
  const { event } = item
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    header: 'Eliminar registro',
    message: 'Desea eliminar el registro?',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Aceptar',
    accept: () => {
      deleteItem(idItem.value)
      toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Operación exitosa', life: 3000 })
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}

async function parseDataTableFilter(payloadFilter: any) {
  const parseFilter: IFilter[] | undefined = await getEventFromTable(payloadFilter, columns)
  payload.value.filter = [...payload.value.filter.filter((item: IFilter) => item?.type === 'filterSearch')]
  payload.value.filter = [...payload.value.filter, ...parseFilter || []]
  getList()
}

function onSortField(event: any) {
  if (event) {
    payload.value.sortBy = event.sortField
    payload.value.sortType = event.sortOrder
    parseDataTableFilter(event.filter)
  }
}

function unCheckItemSelected(key: string | string[]) {
  if (Array.isArray(key)) {
    key.forEach((k) => {
      if (selectedKey.value.hasOwnProperty(k)) {
        delete selectedKey.value[k]
      }
    })
  }
  else {
    if (selectedKey.value.hasOwnProperty(key)) {
      delete selectedKey.value[key]
    }
  }
}

function requireConfirmationToSelectItem(item: any) {
  if (item.isHighRisk) {
    confirm.require({
      header: 'Permiso de alto riesgo',
      message: 'Estás seguro que deseas asignar este permiso de alto riesgo?',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Acceptar',
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary',
      acceptClass: 'p-button-danger',
      accept: () => {
        toast.add({ severity: 'info', summary: 'Rejected', detail: 'Se asignó un permiso de alto riesgo', life: 3000 })
      },
      reject: () => {
        unCheckItemSelected(item)
      }
    })
  }
}

async function rejectInactiveItem(item: any) {
  if (item) {
    await nextTick()
    unCheckItemSelected(item)
  }

  toast.add({ severity: 'error', summary: 'Rechazado', detail: 'El permiso fue rechazado', life: 3000 })
}

function unNewCheckItemSelected(key: string | string[]) {
  if (Array.isArray(key)) {
    key.forEach((k) => {
      if (newSelectedKey.value.hasOwnProperty(k)) {
        delete newSelectedKey.value[k]
      }
    })
  }
  else {
    if (newSelectedKey.value.hasOwnProperty(key)) {
      delete newSelectedKey.value[key]
    }
  }
}

async function rejectNewInactiveItem(item: any) {
  if (item) {
    await nextTick()
    unNewCheckItemSelected(item)
  }

  toast.add({ severity: 'error', summary: 'Rechazado', detail: 'El permiso fue rechazado', life: 3000 })
}

async function validateExistEmail(email: string) {
  const newValue = email
  if (newValue && newValue !== itemUpdate.value.email) {
    payload.value.filter = [...payload.value.filter, {
      key: 'email',
      operator: 'EQUALS',
      value: newValue,
      logicalOperation: 'AND'
    }]
    const exist = await GenericService.search(options.value.moduleApi, options.value.uriApi, payload.value)
    if (exist.data.length > 0) {
      toast.add({ severity: 'error', summary: 'Error', detail: `Ya existe un usuario con el correo ${newValue}`, life: 5000 })
      return true
    }
  }
  return false
}

const disabledSearch = computed(() => {
  // return !(filterToSearch.value.criterial || filterToSearch.value.search)
  return false
})

const disabledClearSearch = computed(() => {
  return !(filterToSearch.value.criterial || filterToSearch.value.search)
})

// -------------------------------------------------------------------------------------------------------

// WATCH FUNCTIONS -------------------------------------------------------------------------------------
watch(payloadOnChangePage, (newValue) => {
  payload.value.page = newValue?.page ? newValue?.page : 0
  payload.value.pageSize = newValue?.rows ? newValue.rows : 10

  getList()
})

watch(() => idItemToLoadFirstTime.value, async (newValue) => {
  if (!newValue) {
    clearForm()
  }
  else {
    await getItemById(newValue)
  }
})

watch(() => item.value.email, async (newValue) => {
  if (!newValue) {
    // updateFieldProperty(fields, 'email', 'validation', { required: true })
  }
})
// -------------------------------------------------------------------------------------------------------

// TRIGGER FUNCTIONS -------------------------------------------------------------------------------------
onMounted(async () => {
  filterToSearch.value.criterial = ENUM_FILTER[0]
  await getListPermissionsByBusiness(currentBussiness.value?.businessId)

  bussinessList.value = authStore.availableCompanies
  getList()
})
// -------------------------------------------------------------------------------------------------------
</script>

<template>
  <div class="flex justify-content-between align-items-center">
    <h3 class="mb-0">
      Usuarios
    </h3>
    <IfCan :perms="['USERS:CREATE']">
      <div v-if="options?.hasOwnProperty('showCreate') ? options?.showCreate : true" class="my-2 flex justify-content-end px-0">
        <Button v-tooltip.left="'Nuevo'" label="Nuevo" icon="pi pi-plus" severity="primary" @click="clearForm" />
      </div>
    </IfCan>
  </div>
  <div class="grid">
    <div class="col-12 order-0 md:order-1 md:col-6 xl:col-7">
      <div class="card p-0">
        <Accordion :active-index="0" class="mb-2">
          <AccordionTab>
            <template #header>
              <div class="text-white font-bold custom-accordion-header">
                Filtros
              </div>
            </template>
            <div class="flex gap-4 flex-column lg:flex-row">
              <div class="flex align-items-center gap-2">
                <label for="email3">Criterio</label>
                <div class="w-full lg:w-auto">
                  <Dropdown
                    v-model="filterToSearch.criterial"
                    :options="[...ENUM_FILTER]"
                    option-label="name"
                    placeholder="Criterio"
                    return-object="false"
                    class="align-items-center w-full"
                    show-clear
                  />
                </div>
              </div>
              <div class="flex align-items-center gap-2">
                <label for="email">Buscar</label>
                <div class="w-full lg:w-auto">
                  <IconField icon-position="left" class="w-full">
                    <InputText v-model="filterToSearch.search" type="text" placeholder="Escriba un texto" class="w-full" />
                    <InputIcon class="pi pi-search" />
                  </IconField>
                </div>
              </div>
              <div class="flex align-items-center">
                <Button v-tooltip.top="'Buscar'" class="w-3rem mx-2" icon="pi pi-search" :disabled="disabledSearch" :loading="loadingSearch" @click="searchAndFilter" />
                <Button v-tooltip.top="'Limpiar'" outlined class="w-3rem" icon="pi pi-filter-slash" :disabled="disabledClearSearch" :loading="loadingSearch" @click="clearFilterToSearch" />
              </div>
            <!-- <div class="col-12 md:col-3 sm:mb-2 flex align-items-center">
            </div> -->
            <!-- <div class="col-12 md:col-5 flex justify-content-end">
            </div> -->
            </div>
          </AccordionTab>
        </Accordion>
      </div>
      <DynamicTable
        :data="listItems"
        :columns="columns"
        :options="options"
        :pagination="pagination"
        @on-confirm-create="clearForm"
        @open-edit-dialog="getItemById($event)"
        @update:clicked-item="getItemById($event)"
        @on-change-pagination="payloadOnChangePage = $event"
        @on-change-filter="parseDataTableFilter"
        @on-list-item="resetListItems"
        @on-sort-field="onSortField"
      />
    </div>
    <div class="col-12 order-1 md:order-0 md:col-6 xl:col-5">
      <div class="bg-white">
        <div class="font-bold text-lg px-4 bg-primary custom-card-header" style="padding-top: 10px; padding-bottom: 10px">
          {{ formTitle }}
        </div>
        <div class="card">
          <EditFormV3
            :key="formReload"
            :fields="idItem ? fieldsEdit : fields"
            :field-with-image="[...fieldsWithImage]"
            :item="idItem ? itemUpdate : item"
            :show-actions="true"
            :hide-delete-button="true"
            :show-link-user-bussiness="true"
            :show-change-pass="true"
            :loading-save="loadingSaveAll"
            :permission-save="idItem ? ['USERS:EDIT'] : ['USERS:CREATE']"
            :permission-delete="['USERS:DELETE']"
            @cancel="clearForm"
            @delete="requireConfirmationToDelete($event)"
            @submit="requireConfirmationToSave($event)"
            @link-user-bussiness="linkUserBussiness()"
            @change-pass-by-admin="changePassByAdmin()"
          >
            <template #field-email="{ item: data, onUpdate }">
              <InputText
                v-if="!loadingSaveAll"
                v-model="data.email"
                type="email"
                class="w-full"
                @update:model-value="($event) => {
                  onUpdate('email', $event)
                }"
                @blur="async () => {
                  const exist = await validateExistEmail(data.email)
                  if (exist) {
                    onUpdate('email', '')
                  }
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>

            <template #field-userType="{ item: data, onUpdate }">
              <Dropdown
                v-if="!loadingSaveAll"
                v-model="data.userType"
                :options="[...ENUM_USER_TYPE]"
                option-label="name"
                return-object="false"
                show-clear
                :disabled="true"
                @update:model-value="($event) => {
                  onUpdate('userType', $event)
                }"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>

            <template #field-permissions="{ item: data, onUpdate }">
              <TreeView
                v-if="!loadingSaveAll"
                ref="treeViewPermissionRef"
                :items="treeTableValue"
                :selected-key="selectedKey"
                @update:selected-key="($event) => selectedKey = $event"
                @on-selected-node-highrisk="requireConfirmationToSelectItem($event)"
                @on-select-inactive-node="rejectInactiveItem($event)"
              />
              <Skeleton v-else height="2rem" class="mb-2" />
            </template>
          </EditFormV3>
        </div>
      </div>
    </div>
    <div class="12">
      <Dialog
        v-model:visible="visible"
        modal
        header="Empresas"
        class="mx-3 sm:mx-0 sm:w-full md:w-5"
        content-class="border-top-1 surface-border"
        @hide="visible = false"
      >
        <div class="grid p-2" style="border-radius: 0px !important;">
          <div class="col-12 field mt-3">
            <label class="font-bold">Empresas</label>
            <Dropdown
              v-model="newBussinessSelected"
              :options="bussinessList"
              option-label="name"
              option-value="businessId"
              empty-message="No hay ningun elemento en la lista."
              class="w-full md:w-56"
              list-style="height:250px"
              striped
            />
          </div>
          <div class="col-12 field mt-0" style="margin-top: 0px !important;">
            <TreeView
              v-if="!loadingSaveAll"
              ref="treeNewViewPermissionRef"
              :items="treeTableValue"
              :selected-key="newSelectedKey"
              @update:selected-key="($event) => newSelectedKey = $event"
              @on-selected-node-highrisk="requireConfirmationToSelectItem($event)"
              @on-select-inactive-node="rejectNewInactiveItem($event)"
            />
            <Skeleton v-else height="2rem" class="mb-2" />
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" class="p-button" @click="visible = !visible" />
          <Button label="Aceptar" icon="pi pi-check" class="p-button mr-3" :loading="loadingSaveAll" @click="saveLinkUserBussiness()" />
        </template>
      </Dialog>
    </div>

    <div class="12">
      <Dialog
        v-model:visible="visibleChangePass"
        modal
        header="Cambiar contraseña"
        class="mx-3 sm:mx-0 sm:w-full md:w-3"
        content-class="border-top-1 surface-border"
        @hide="visibleChangePass = false"
      >
        <div class="grid p-fluid formgrid p-2" style="border-radius: 0px !important;">
          <div class="col-12 field mt-3">
            <!-- <PasswordFieldComponnent
              :submit="submitForm" :properties="form.newPassword"
              :validation-keywords="form.newPassword.validationKeywords" style="width: 300px;"
              @update:model-value="form.newPassword.value = $event"
              @update:error-messages="form.newPassword.errorMessage = $event"
              @invalid-field="form.newPassword.haveError = $event"
            /> -->
            <label class="font-bold">Nueva contraseña</label>
            <Password
              v-model="form.newPassword.value"
              :feedback="false"
              :toggle-mask="true"
              placeholder="Nueva contraseña"
              class="w-full"
            />
          </div>
          <div class="col-12 field">
            <div class="flex align-items-center">
              <Checkbox
                v-model="form.changePassword.value" :binary="true"
              />
              <label class="ml-2"> Cambiar contraseña?
              </label>
            </div>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" class="p-button" @click="visibleChangePass = !visibleChangePass" />
          <Button label="Aceptar" icon="pi pi-check" class="p-button mr-3" :loading="loadingSaveAll" @click="saveChangePass()" />
        </template>
      </Dialog>
    </div>
  </div>
</template>
