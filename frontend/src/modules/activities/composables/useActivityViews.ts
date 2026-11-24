import { computed, ref } from 'vue'

import { TODAY_ISO, toIsoDate } from '../../../constants/theme'
import { ACTIVITY_VIEWS, PRIORITY_RANK } from '../constants/activity'
import { PRIORITIES, type Activity, type ActivityFilterChip, type ActivityView } from '../types/activity.types'

const VIEW_KEYS = [...ACTIVITY_VIEWS.map(({ key }) => key), ...PRIORITIES]

const SECTIONS = [
  { key: 'undated', title: 'Sin fecha límite', emptyMessage: 'No hay tareas sin fecha límite.' },
  { key: 'pending', title: 'Pendientes', emptyMessage: '¡ Sin tareas pendientes !' },
  { key: 'completed', title: 'Completadas', emptyMessage: 'Todavía no hay tareas completadas.' },
] as const

function isoAfter(days: number): string {
  const date = new Date(`${TODAY_ISO}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

const UPCOMING_ISO = isoAfter(7)

function isOpen(activity: Activity): boolean {
  return activity.status !== 'completada'
}

function matchesView(activity: Activity, view: ActivityView): boolean {
  const date = activity.due_date
  switch (view) {
    case 'hoy':
      return date ? date <= TODAY_ISO : isOpen(activity)
    case 'proximos':
      return Boolean(date && date > TODAY_ISO && date <= UPCOMING_ISO)
    case 'sin_fecha':
      return !date
    case 'todas':
      return true
    default:
      return activity.priority === view
  }
}

function matchesChip(activity: Activity, chip: ActivityFilterChip): boolean {
  if (chip === 'pending') return activity.status === 'pendiente'
  if (chip === 'progress') return activity.status === 'en_progreso'
  return true
}

export function useActivityViews(activities: () => readonly Activity[]) {
  const activeView = ref<ActivityView>('hoy')
  const chipFilter = ref<ActivityFilterChip>('all')

  const groups = computed(() => {
    const grouped: Record<(typeof SECTIONS)[number]['key'], Activity[]> = {
      undated: [],
      pending: [],
      completed: [],
    }
    const view = activeView.value
    const chip = chipFilter.value

    for (const activity of activities()) {
      if (!matchesView(activity, view)) continue

      if (!isOpen(activity)) {
        grouped.completed.push(activity)
      } else if (matchesChip(activity, chip)) {
        const section = !activity.due_date && view !== 'sin_fecha' ? 'undated' : 'pending'
        grouped[section].push(activity)
      }
    }

    if (chip === 'priority') {
      for (const list of Object.values(grouped)) {
        list.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
      }
    }

    return grouped
  })

  const sections = computed(() =>
    SECTIONS.filter(({ key }) => key !== 'undated' || groups.value.undated.length > 0)
      .map((section) => ({ ...section, activities: groups.value[section.key] })),
  )

  const progress = computed(() => {
    const { undated, pending, completed } = groups.value
    return { completed: completed.length, total: undated.length + pending.length + completed.length }
  })

  const counts = computed(() => {
    const openActivities = activities().filter(isOpen)
    return Object.fromEntries(
      VIEW_KEYS.map((view) => [view, openActivities.filter((activity) => matchesView(activity, view)).length]),
    ) as Record<ActivityView, number>
  })

  function select(view: ActivityView): void {
    activeView.value = view
  }

  return { activeView, chipFilter, sections, progress, counts, select }
}
