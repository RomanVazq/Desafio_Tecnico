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

function sameFilters(left: ActivityFilters, right: ActivityFilters): boolean {
  return left.q === right.q && left.status === right.status && left.priority === right.priority
}

export function useActivities(repository: ActivityRepository = httpActivityRepository) {
  const activities = ref<Activity[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const filters = ref<ActivityFilters>({ q: '', status: '', priority: '' })
  const loadedFilters = ref<ActivityFilters | null>(null)
  const searchPending = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  const hasMore = computed(() =>
    meta.value !== null && meta.value.current_page < meta.value.last_page,
  )
  const canLoadMore = computed(() =>
    hasMore.value &&
    !loading.value &&
    !loadingMore.value &&
    !searchPending.value &&
    loadedFilters.value !== null &&
    sameFilters(loadedFilters.value, filters.value),
  )

  let requestId = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let suppressFiltersWatch = false

  async function fetchPage(
    targetPage: number,
    requestFilters: ActivityFilters,
    append: boolean,
  ): Promise<void> {
    const current = ++requestId
    const isCurrent = () =>
      current === requestId && !searchPending.value && sameFilters(requestFilters, filters.value)

    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      loadingMore.value = false
    }
    error.value = null

    try {
      const response = await repository.list(requestFilters, targetPage)
      if (!isCurrent()) return

      if (append) {
        const known = new Set(activities.value.map((activity) => activity.id))
        activities.value = [
          ...activities.value,
          ...response.data.filter((activity) => !known.has(activity.id)),
        ]
      } else {
        activities.value = response.data
        loadedFilters.value = requestFilters
      }
      meta.value = response.meta
    } catch (caught) {
      if (!isCurrent()) return

      if (!append) {
        activities.value = []
        meta.value = null
        loadedFilters.value = null
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
    clearTimeout(debounceTimer)
    searchPending.value = false
    return fetchPage(1, { ...filters.value }, false)
  }

  function loadMore(): Promise<void> {
    if (!canLoadMore.value || !meta.value || !loadedFilters.value) return Promise.resolve()
    return fetchPage(meta.value.current_page + 1, loadedFilters.value, true)
  }

  function resetFilters(): Promise<void> {
    suppressFiltersWatch = true
    try {
      filters.value = { q: '', status: '', priority: '' }
    } finally {
      suppressFiltersWatch = false
    }
    return load()
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

  async function removeMany(ids: readonly number[]): Promise<{ removed: number; failed: number }> {
    let removed = 0
    let failed = 0

    for (const id of ids) {
      try {
        await repository.remove(id)
        removed++
      } catch {
        failed++
      }
    }

    if (removed > 0) await load()
    return { removed, failed }
  }

  function changeStatus(id: number, status: ActivityStatus): Promise<boolean> {
    return update(id, { status })
  }

  watch(
    [() => filters.value.q, () => filters.value.status, () => filters.value.priority],
    ([, status, priority], [, previousStatus, previousPriority]) => {
      if (suppressFiltersWatch) return

      if (status !== previousStatus || priority !== previousPriority) {
        void load()
        return
      }

      clearTimeout(debounceTimer)
      searchPending.value = true
      debounceTimer = setTimeout(() => { void load() }, SEARCH_DEBOUNCE_MS)
    },
    { flush: 'sync' },
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
    canLoadMore,
    error,
    load,
    loadMore,
    resetFilters,
    create,
    update,
    remove,
    removeMany,
    changeStatus,
  }
}
