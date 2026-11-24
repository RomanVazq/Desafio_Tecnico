<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import ActivityFilterChips from '../components/ActivityFilterChips.vue'
import ActivityFormDialog from '../components/ActivityFormDialog.vue'
import ActivitySection from '../components/ActivitySection.vue'
import AppSidebar from '../components/AppSidebar.vue'
import DailyHeader from '../components/DailyHeader.vue'
import QuickAddForm from '../components/QuickAddForm.vue'
import { ACTIVITY_VIEW_TITLES, createDefaultActivityPayload } from '../constants/activity'
import { useActivities } from '../composables/useActivities'
import { useActivityViews } from '../composables/useActivityViews'
import { httpActivityRepository } from '../services/activityRepository'
import type {
  Activity,
  ActivityPayload,
  ActivityPriority,
  ActivityStatus,
} from '../types/activity.types'
import { TODAY_LABEL } from '../utils/activityDates'

const $q = useQuasar()
const activitiesModule = useActivities(httpActivityRepository)

const {
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
} = activitiesModule

const { activeView, chipFilter, sections, progress, counts, select } =
  useActivityViews(() => activities.value)

const drawerOpen = ref(false)
const isDesktopNavigation = computed(() => $q.screen.gt.sm)
const dialogOpen = ref(false)
const dialogMode = ref<'edit' | 'detail'>('edit')
const editing = ref<Activity | null>(null)
const quickAddRef = ref<InstanceType<typeof QuickAddForm> | null>(null)
const isQuickAdding = ref(false)
const isDialogSaving = ref(false)
const selectedIds = ref(new Set<number>())
const isBulkDeleting = ref(false)
const selectedCount = computed(() => selectedIds.value.size)
const sectionSelection = computed(() => ({
  selectedIds: selectedIds.value,
  selectionDisabled: isBulkDeleting.value,
}))

watch(isDesktopNavigation, () => {
  drawerOpen.value = false
})

watch(dialogOpen, (open) => {
  if (!open) editing.value = null
})

watch(
  [activeView, chipFilter, () => filters.value.q, () => filters.value.status, () => filters.value.priority],
  clearSelection,
)

watch(sections, (visibleSections) => {
  if (!selectedCount.value) return

  const visibleIds = new Set(
    visibleSections.flatMap(({ activities }) => activities.map(({ id }) => id)),
  )
  for (const id of selectedIds.value) {
    if (!visibleIds.has(id)) selectedIds.value.delete(id)
  }
})

onMounted(() => {
  void load()
})

function handleClearFilters(): void {
  chipFilter.value = 'all'
  void resetFilters()
}

async function handleQuickAdd(
  title: string,
  description: string | null,
  priority: ActivityPriority,
  dueDate: string | null,
): Promise<void> {
  if (isQuickAdding.value) return
  isQuickAdding.value = true

  const payload = createDefaultActivityPayload()
  payload.title = title
  payload.description = description
  payload.priority = priority
  payload.due_date = dueDate

  try {
    const ok = await create(payload)
    if (ok) {
      quickAddRef.value?.reset()
      $q.notify({ type: 'positive', message: 'Actividad agregada.' })
    } else {
      $q.notify({ type: 'negative', message: error.value ?? 'No se pudo agregar la actividad.' })
    }
  } finally {
    isQuickAdding.value = false
  }
}

function openEdit(activity: Activity): void {
  dialogMode.value = 'edit'
  editing.value = activity
  dialogOpen.value = true
}

function openDetail(activity: Activity): void {
  dialogMode.value = 'detail'
  editing.value = activity
  dialogOpen.value = true
}

function switchToEdit(): void {
  dialogMode.value = 'edit'
}

async function handleDialogSubmit(payload: ActivityPayload): Promise<void> {
  if (isDialogSaving.value) return
  isDialogSaving.value = true

  const target = editing.value

  try {
    const ok = target ? await update(target.id, payload) : await create(payload)
    if (ok) {
      $q.notify({ type: 'positive', message: target ? 'Actividad actualizada.' : 'Actividad creada.' })
      dialogOpen.value = false
    } else {
      $q.notify({ type: 'negative', message: error.value ?? 'No se pudo guardar la actividad.' })
    }
  } finally {
    isDialogSaving.value = false
  }
}

function handleToggle(activity: Activity): void {
  const next: ActivityStatus = activity.status === 'completada' ? 'pendiente' : 'completada'
  void changeStatus(activity.id, next)
}

function handleProgress(activity: Activity): void {
  const next: ActivityStatus = activity.status === 'en_progreso' ? 'pendiente' : 'en_progreso'
  void changeStatus(activity.id, next)
}

function handleRemove(activity: Activity): void {
  $q.dialog({
    title: 'Eliminar actividad',
    message: `¿Eliminar "${activity.title}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void remove(activity.id).then((ok) => {
      if (ok) $q.notify({ type: 'positive', message: 'Actividad eliminada.' })
    })
  })
}

function setSelected(id: number, selected: boolean): void {
  if (isBulkDeleting.value) return
  if (selected) selectedIds.value.add(id)
  else selectedIds.value.delete(id)
}

function clearSelection(): void {
  selectedIds.value.clear()
}

async function deleteSelected(ids: readonly number[]): Promise<void> {
  if (isBulkDeleting.value) return
  isBulkDeleting.value = true

  try {
    const { removed, failed } = await removeMany(ids)
    const result = `Eliminadas: ${removed}.`
    $q.notify({
      type: failed ? 'negative' : 'positive',
      message: failed ? `${result} No se pudieron eliminar: ${failed}.` : result,
    })
  } finally {
    isBulkDeleting.value = false
  }
}

function confirmBulkDelete(): void {
  if (!selectedCount.value || isBulkDeleting.value || loading.value) return

  const ids = [...selectedIds.value]
  $q.dialog({
    title: 'Eliminar tareas seleccionadas',
    message: ids.length === 1
      ? '¿Eliminar la tarea seleccionada? Esta acción no se puede deshacer.'
      : `¿Eliminar las ${ids.length} tareas seleccionadas? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true },
    persistent: true,
  }).onOk(() => { void deleteSelected(ids) })
}

const sectionEvents = {
  select: setSelected,
  toggle: handleToggle,
  progress: handleProgress,
  detail: openDetail,
  edit: openEdit,
  remove: handleRemove,
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      id="navigation-drawer"
      :model-value="isDesktopNavigation || drawerOpen"
      :width="240"
      :behavior="isDesktopNavigation ? 'desktop' : 'mobile'"
      bordered
      class="surface-nav"
      @update:model-value="drawerOpen = !isDesktopNavigation && $event"
    >
      <AppSidebar :counts="counts" :active="activeView" @select="select" />
    </q-drawer>

    <q-header v-if="!isDesktopNavigation" class="surface-card text-on-surface" bordered>
      <q-toolbar :class="$q.screen.lt.sm ? 'q-px-sm' : 'q-px-lg'">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="q-mr-sm"
          aria-label="Abrir menú de vistas"
          aria-controls="navigation-drawer"
          :aria-expanded="drawerOpen"
          @click="drawerOpen = true"
        />
        <div class="brand-mark brand-mark--sm q-mr-sm">
          <q-icon name="check_circle" />
        </div>
        <q-toolbar-title class="text-weight-medium">TaskFlow</q-toolbar-title>
        <span class="text-caption text-muted text-mono ellipsis">{{ TODAY_LABEL }}</span>
      </q-toolbar>
    </q-header>

    <q-page-container class="surface-page">
      <q-page :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-lg'">
        <main id="contenido-principal" tabindex="-1">
          <div class="activities-content q-mx-auto column no-wrap">
            <DailyHeader
              :date="TODAY_LABEL"
              :title="ACTIVITY_VIEW_TITLES[activeView]"
              :completed="progress.completed"
              :total="progress.total"
            />

            <ActivityFilterChips
              v-model:filter="chipFilter"
              v-model:search="filters.q"
              v-model:status="filters.status"
              v-model:priority="filters.priority"
              @clear="handleClearFilters"
            />

            <QuickAddForm ref="quickAddRef" :loading="isQuickAdding" @submit="handleQuickAdd" />

            <div
              v-if="selectedCount || isBulkDeleting"
              class="row items-center justify-between q-gutter-sm q-pa-sm rounded-borders surface-low subtle-border selection-bar"
            >
              <span class="text-body2 text-muted" role="status">
                {{ selectedCount === 1 ? '1 tarea seleccionada' : `${selectedCount} tareas seleccionadas` }}
              </span>
              <div class="row items-center q-gutter-xs selection-actions">
                <q-btn
                  flat
                  no-caps
                  label="Quitar selección"
                  :disable="isBulkDeleting"
                  @click="clearSelection"
                />
                <q-btn
                  unelevated
                  no-caps
                  color="negative"
                  icon="delete_outline"
                  label="Eliminar selección"
                  :loading="isBulkDeleting"
                  :disable="loading"
                  @click="confirmBulkDelete"
                />
              </div>
            </div>

            <div v-if="error" class="q-pa-md error-banner rounded-borders" role="alert">
              {{ error }}
              <q-btn flat dense label="Reintentar" @click="load" />
            </div>

            <div
              v-if="loading"
              class="column items-center q-gutter-sm q-py-xl"
              role="status"
              aria-live="polite"
            >
              <q-spinner color="primary" size="32px" />
              <span class="text-caption text-muted">Cargando actividades…</span>
            </div>

            <template v-else>
              <ActivitySection
                v-for="section in sections"
                :key="section.key"
                :title="section.title"
                :activities="section.activities"
                :empty-message="section.emptyMessage"
                :completed="section.key === 'completed'"
                v-bind="sectionSelection"
                v-on="sectionEvents"
              />

              <div v-if="hasMore" class="row justify-center q-pt-md">
                <q-btn
                  outline
                  color="primary"
                  icon="expand_more"
                  label="Cargar más"
                  :loading="loadingMore"
                  :disable="!canLoadMore"
                  @click="loadMore"
                />
              </div>

              <div
                v-else-if="meta && activities.length > 0"
                class="text-center text-caption text-muted q-pt-md"
              >
                Mostrando {{ activities.length }} de {{ meta.total }} actividades
              </div>
            </template>
          </div>
        </main>
      </q-page>
    </q-page-container>

    <ActivityFormDialog
      v-model="dialogOpen"
      :activity="editing"
      :mode="dialogMode"
      :loading="isDialogSaving"
      @edit="switchToEdit"
      @submit="handleDialogSubmit"
    />
  </q-layout>
</template>
