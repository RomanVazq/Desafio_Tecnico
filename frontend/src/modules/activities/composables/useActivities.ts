import { computed, onScopeDispose, ref, watch } from 'vue'

import { ApiError } from '../services/api'
import { httpActivityRepository, type ActivityRepository } from '../services/activityRepository'
import type {
  Activity,
  ActivityFilters,
  ActivityPayload,
  ActivityStatus,
  ActivityUpdatePayload,
  PaginationMeta,
} from '../types/activity.types'

const SEARCH_DEBOUNCE_MS = 300

function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const first = error.errors ? Object.values(error.errors)[0]?.[0] : undefined
    return first ?? error.message
  }

  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}


export function useActivities(repository: ActivityRepository = httpActivityRepository) {
  const activities = ref<Activity[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const filters = ref<ActivityFilters>({ q: '', status: '', priority: '' })
  const page = ref(1)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  const hasMore = computed(() =>
    meta.value !== null && meta.value.current_page < meta.value.last_page,
  )

  let requestId = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let suppressFiltersWatch = false

  async function fetchPage(targetPage: number, append: boolean): Promise<void> {
    const current = ++requestId
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      loadingMore.value = false
    }
    error.value = null

    try {
      const response = await repository.list(filters.value, targetPage)
      if (current !== requestId) return

      if (append) {
        const known = new Set(activities.value.map((activity) => activity.id))
        activities.value = [
          ...activities.value,
          ...response.data.filter((activity) => !known.has(activity.id)),
        ]
      } else {
        activities.value = response.data
      }
      meta.value = response.meta
      page.value = response.meta.current_page
    } catch (caught) {
      if (current !== requestId) return

      if (!append) {
        activities.value = []
        meta.value = null
      }
      error.value = toMessage(caught)
    } finally {
      if (current === requestId) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  function load(): Promise<void> {
    page.value = 1
    return fetchPage(1, false)
  }

  function loadMore(): Promise<void> {
    if (!hasMore.value || loading.value || loadingMore.value) return Promise.resolve()
    return fetchPage(page.value + 1, true)
  }

  function resetFilters(): Promise<void> {
    suppressFiltersWatch = true
    clearTimeout(debounceTimer)
    filters.value = { q: '', status: '', priority: '' }
    return load().finally(() => {
      suppressFiltersWatch = false
    })
  }

  async function mutate(action: () => Promise<unknown>): Promise<boolean> {
    error.value = null

    try {
      await action()
      await load()
      return true
    } catch (caught) {
      error.value = toMessage(caught)
      return false
    }
  }

  function create(payload: ActivityPayload): Promise<boolean> {
    return mutate(() => repository.create(payload))
  }

  function update(id: number, payload: ActivityUpdatePayload): Promise<boolean> {
    return mutate(() => repository.update(id, payload))
  }

  function remove(id: number): Promise<boolean> {
    return mutate(() => repository.remove(id))
  }

  function changeStatus(id: number, status: ActivityStatus): Promise<boolean> {
    return update(id, { status })
  }

  watch(
    () => filters.value.status,
    () => {
      if (!suppressFiltersWatch) void load()
    },
  )

  watch(
    () => filters.value.priority,
    () => {
      if (!suppressFiltersWatch) void load()
    },
  )

  watch(
    () => filters.value.q,
    () => {
      if (suppressFiltersWatch) return
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => { void load() }, SEARCH_DEBOUNCE_MS)
    },
  )

  onScopeDispose(() => {
    clearTimeout(debounceTimer)
  })

  return {
    activities,
    meta,
    filters,
    loading,
    loadingMore,
    hasMore,
    error,
    load,
    loadMore,
    resetFilters,
    create,
    update,
    remove,
    changeStatus,
  }
}
