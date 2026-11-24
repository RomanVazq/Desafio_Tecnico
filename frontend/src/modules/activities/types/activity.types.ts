export const STATUSES = ['pendiente', 'en_progreso', 'completada'] as const
export type ActivityStatus = (typeof STATUSES)[number]

/** El valor vacío representa "Todos" y nunca se envía como filtro a la API. */
export type StatusFilter = ActivityStatus | ''

export const PRIORITIES = ['baja', 'media', 'alta'] as const
export type ActivityPriority = (typeof PRIORITIES)[number]

/** El valor vacío representa "Todas" y nunca se envía como parámetro a la API. */
export type PriorityFilter = ActivityPriority | ''

export const ACTIVITY_VIEW_KEYS = ['hoy', 'proximos', 'todas', 'sin_fecha'] as const
export type ActivityView = (typeof ACTIVITY_VIEW_KEYS)[number] | ActivityPriority

export type ActivityFilterChip = 'all' | 'pending' | 'progress' | 'priority'

export interface Activity {
  id: number
  title: string
  description: string | null
  status: ActivityStatus
  priority: ActivityPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface ActivityPayload {
  title: string
  description: string | null
  status: ActivityStatus
  priority: ActivityPriority
  due_date: string | null
}

export type ActivityUpdatePayload = Partial<ActivityPayload>

export interface ActivityFilters {
  q: string
  status: StatusFilter
  priority: PriorityFilter
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface ItemResponse<T> {
  data: T
  message?: string
}

export interface MessageResponse {
  message: string
}

export type ValidationErrors = Record<string, string[]>

export interface ErrorResponse {
  message: string
  errors?: ValidationErrors
}
