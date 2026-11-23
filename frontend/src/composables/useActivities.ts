import { onScopeDispose, ref, watch } from 'vue'

import { ApiError } from '../services/api'
import { httpActivityRepository, type ActivityRepository } from '../services/activityRepository'
import type {
  Activity,
  ActivityFilters,
  ActivityPayload,
  ActivityStatus,
  ActivityUpdatePayload,
  PaginationMeta,
} from '../types/activity'

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
  const filters = ref<ActivityFilters>({ q: '', status: '' })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  let requestId = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  async function load(): Promise<void> {
    const current = ++requestId
    loading.value = true
    error.value = null

    try {
      const response = await repository.list(filters.value)
      if (current !== requestId) return

      activities.value = response.data
      meta.value = response.meta
    } catch (caught) {
      if (current !== requestId) return

      activities.value = []
      meta.value = null
      error.value = toMessage(caught)
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  async function mutate(action: () => Promise<unknown>): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await action()
      await load()
      return true
    } catch (caught) {
      error.value = toMessage(caught)
      return false
    } finally {
      saving.value = false
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
    () => { void load() },
  )

  watch(
    () => filters.value.q,
    () => {
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
    saving,
    error,
    load,
    create,
    update,
    remove,
    changeStatus,
  }
}
