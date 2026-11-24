import { computed, ref } from 'vue'

import { TODAY_ISO, toIsoDate } from '../../../constants/theme'
import { PRIORITIES, type Activity, type ActivityPriority, type ActivityView } from '../types/activity.types'

function isoAfter(days: number): string {
  const date = new Date(`${TODAY_ISO}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

const UPCOMING_ISO = isoAfter(7)

export function useActivityViews(activities: () => Activity[]) {
  const activeView = ref<ActivityView>('hoy')

  const isDueNow = (activity: Activity): boolean =>
    Boolean(activity.due_date && activity.due_date <= TODAY_ISO)

  const isUpcoming = (activity: Activity): boolean =>
    Boolean(
      activity.due_date &&
        activity.due_date > TODAY_ISO &&
        activity.due_date <= UPCOMING_ISO,
    )

  const isUndated = (activity: Activity): boolean => !activity.due_date

  const visibleActivities = computed(() => {
    const view = activeView.value
    if (view === 'todas') return activities()
    if (view === 'hoy') return activities().filter(isDueNow)
    if (view === 'proximos') return activities().filter(isUpcoming)
    if (view === 'sin_fecha') return activities().filter(isUndated)
    return activities().filter((activity) => activity.priority === (view as ActivityPriority))
  })

  const undated = computed(() => {
    const view = activeView.value
    if (view === 'sin_fecha' || view === 'proximos') return []

    const source = view === 'hoy' || view === 'todas' ? activities() : visibleActivities.value
    return source.filter((activity) => isUndated(activity) && activity.status !== 'completada')
  })

  const pending = computed(() => visibleActivities.value.filter((activity) => activity.status !== 'completada'))
  const completed = computed(() => visibleActivities.value.filter((activity) => activity.status === 'completada'))

  const counts = computed<Record<ActivityView, number>>(() => {
    const all = activities()
    const open = (activity: Activity): boolean => activity.status !== 'completada'
    const byPriority = Object.fromEntries(
      PRIORITIES.map((priority) => [
        priority,
        all.filter((activity) => activity.priority === priority && open(activity)).length,
      ]),
    ) as Record<ActivityPriority, number>

    return {
      hoy: all.filter(
        (activity) => (isDueNow(activity) || isUndated(activity)) && open(activity),
      ).length,
      proximos: all.filter((activity) => isUpcoming(activity) && open(activity)).length,
      sin_fecha: all.filter((activity) => isUndated(activity) && open(activity)).length,
      todas: all.filter(open).length,
      ...byPriority,
    }
  })

  function select(view: ActivityView): void {
    activeView.value = view
  }

  return { activeView, visibleActivities, undated, pending, completed, counts, select }
}
