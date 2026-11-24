import {
  PRIORITIES,
  STATUSES,
  type ActivityFilterChip,
  type ActivityPayload,
  type ActivityPriority,
  type ActivityStatus,
  type ActivityView,
  type PriorityFilter,
  type StatusFilter,
} from '../types/activity.types'

export interface SelectOption<T extends string> {
  label: string
  value: T
}

export function labelFor<T extends string>(options: readonly SelectOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value
}

const STATUS_LABELS: Record<ActivityStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
}

const PRIORITY_LABELS: Record<ActivityPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

export const STATUS_OPTIONS: readonly SelectOption<ActivityStatus>[] = STATUSES.map((value) => ({
  label: STATUS_LABELS[value],
  value,
}))

export const STATUS_FILTER_OPTIONS: readonly SelectOption<StatusFilter>[] = [
  { label: 'Todos', value: '' },
  ...STATUS_OPTIONS,
]

export const PRIORITY_OPTIONS: readonly SelectOption<ActivityPriority>[] = PRIORITIES.map((value) => ({
  label: PRIORITY_LABELS[value],
  value,
}))

export const PRIORITY_FILTER_OPTIONS: readonly SelectOption<PriorityFilter>[] = [
  { label: 'Todas', value: '' },
  ...PRIORITY_OPTIONS,
]

export const ACTIVITY_VIEWS: readonly { key: ActivityView; label: string; icon: string }[] = [
  { key: 'hoy', label: 'Hoy', icon: 'today' },
  { key: 'proximos', label: 'Próximos días', icon: 'date_range' },
  { key: 'todas', label: 'Todas', icon: 'inbox' },
  { key: 'sin_fecha', label: 'Sin fecha límite', icon: 'event_busy' },
]

export const ACTIVITY_VIEW_TITLES = {
  ...Object.fromEntries(ACTIVITY_VIEWS.map(({ key, label }) => [key, label])),
  ...Object.fromEntries(
    PRIORITY_OPTIONS.map(({ value, label }) => [value, `Prioridad ${label.toLowerCase()}`]),
  ),
} as Record<ActivityView, string>

export function filterByChip<T extends { status: ActivityStatus }>(
  list: readonly T[],
  chip: ActivityFilterChip,
): T[] {
  if (chip === 'pending') return list.filter((activity) => activity.status === 'pendiente')
  if (chip === 'progress') return list.filter((activity) => activity.status === 'en_progreso')
  return [...list]
}

export const STATUS_COLORS: Record<ActivityStatus, string> = {
  pendiente: 'secondary',
  en_progreso: 'tf-progress',
  completada: 'positive',
}

export const PRIORITY_COLORS: Record<ActivityPriority, string> = {
  baja: 'secondary',
  media: 'tf-medium',
  alta: 'tf-high',
}

export const PRIORITY_RANK = Object.fromEntries(
  PRIORITIES.map((priority, index) => [priority, index]),
) as Record<ActivityPriority, number>

export function createDefaultActivityPayload(): ActivityPayload {
  return {
    title: '',
    description: null,
    status: STATUSES[0],
    priority: PRIORITIES[0],
    due_date: null,
  }
}
