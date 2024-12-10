export interface SearchFilter {
  filter: Filter[]
  query: string
  pageSize: number
  page: number
}

export interface Filter {
  key: string
  operator: string
  value: string
  logicalOperation: string
}

export type UserMeData = Partial<{
  data: UserData
  error: string
}>

export interface UserData {
  userId: string
  email: string
  userName?: string
  name?: string
  lastName?: string
  image?: string
  selectedBusiness?: string
  businesses?: Business[]
}

export interface Business {
  businessId: string
  name: string
  permissions: string[]
}

export type MenuHeader = Partial<{
  label: string
  icon: string
  separator: boolean
  items: MenuItem[]
}>

export type MenuItem = Partial<{
  label: string
  icon: string
  to: string
  perm: string
  separator: boolean
  items: MenuItem[]
}>

export interface PaginatedResponse {
  [x: string]: { data: any, page: any, size: any, totalElements: any, totalPages: any }
  data: any[]
  totalPages: number
  totalElementsPage: number
  totalElements: number
  size: number
  page: number
}
