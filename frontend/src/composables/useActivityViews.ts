import { computed, ref } from 'vue'

import { TODAY_ISO } from '../constants/theme'
import type { Activity, ActivityPriority, ActivityView } from '../types/activity'

function isoAfter(days: number): string {
  const date = new Date(`${TODAY_ISO}T00:00:00`)
  date.setDate(date.getDate() + days)
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const UPCOMING_ISO = isoAfter(7)

/** Concentra la lógica de las vistas del sidebar, sin tocar la API ni el estado del composable. */
export function useActivityViews(activities: () => Activity[]) {
  const activeView = ref<ActivityView>('hoy')

  // La vista decide por fecha; el status se separa después en `pending` / `completed`.
  // Si filtráramos acá las completadas, la sección "Completadas" siempre quedaría vacía.
  const isToday = (activity: Activity): boolean =>
    Boolean(activity.due_date && activity.due_date <= TODAY_ISO)

  const isUpcoming = (activity: Activity): boolean =>
    Boolean(
      activity.due_date &&
        activity.due_date > TODAY_ISO &&
        activity.due_date <= UPCOMING_ISO,
    )

  const visibleActivities = computed(() => {
    const view = activeView.value
    if (view === 'todas') return activities()
    if (view === 'hoy') return activities().filter(isToday)
    if (view === 'proximos') return activities().filter(isUpcoming)
    return activities().filter((activity) => activity.priority === (view as ActivityPriority))
  })

  const pending = computed(() => visibleActivities.value.filter((activity) => activity.status !== 'completada'))
  const completed = computed(() => visibleActivities.value.filter((activity) => activity.status === 'completada'))

  const counts = computed<Record<ActivityView, number>>(() => {
    const all = activities()
    const open = (activity: Activity): boolean => activity.status !== 'completada'
    return {
      // Los badges del sidebar muestran tareas abiertas, como en el diseño original.
      hoy: all.filter((activity) => isToday(activity) && open(activity)).length,
      proximos: all.filter((activity) => isUpcoming(activity) && open(activity)).length,
      todas: all.filter(open).length,
      baja: all.filter((activity) => activity.priority === 'baja' && open(activity)).length,
      media: all.filter((activity) => activity.priority === 'media' && open(activity)).length,
      alta: all.filter((activity) => activity.priority === 'alta' && open(activity)).length,
    }
  })

  function select(view: ActivityView): void {
    activeView.value = view
  }

  return { activeView, visibleActivities, pending, completed, counts, select }
}
