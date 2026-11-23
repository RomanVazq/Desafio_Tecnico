<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import ActivityFilterChips from '../components/ActivityFilterChips.vue'
import ActivityFormDialog from '../components/ActivityFormDialog.vue'
import ActivitySection from '../components/ActivitySection.vue'
import AppSidebar from '../components/AppSidebar.vue'
import DailyHeader from '../components/DailyHeader.vue'
import QuickAddForm from '../components/QuickAddForm.vue'
import { PRIORITY_RANK, createDefaultActivityPayload } from '../constants/activity'
import { TODAY_LABEL } from '../constants/theme'
import { useActivities } from '../composables/useActivities'
import { useActivityViews } from '../composables/useActivityViews'
import { httpActivityRepository } from '../services/activityRepository'
import type {
  Activity,
  ActivityFilterChip,
  ActivityPayload,
  ActivityPriority,
  ActivityStatus,
  ActivityView,
} from '../types/activity'

const $q = useQuasar()
const activitiesModule = useActivities(httpActivityRepository)

const {
  activities,
  filters,
  loading,
  saving,
  error,
  load,
  create,
  update,
  remove,
  changeStatus,
} = activitiesModule

const views = useActivityViews(() => activities.value)
const { activeView, pending, completed, counts, select } = views

const viewTitles: Record<ActivityView, string> = {
  hoy: 'Hoy',
  proximos: 'Próximos días',
  todas: 'Todas',
  baja: 'Prioridad baja',
  media: 'Prioridad media',
  alta: 'Prioridad alta',
}

const chipFilter = ref<ActivityFilterChip>('all')
const drawerOpen = ref(false)
const dialogOpen = ref(false)
const dialogMode = ref<'edit' | 'detail'>('edit')
const editing = ref<Activity | null>(null)

function sortByPriority(list: Activity[]): Activity[] {
  if (chipFilter.value !== 'priority') return list
  return [...list].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
}

const filteredPending = computed(() => {
  const result = chipFilter.value === 'pending'
    ? pending.value.filter((activity) => activity.status === 'pendiente')
    : pending.value
  return sortByPriority(result)
})

const filteredCompleted = computed(() => sortByPriority(completed.value))

const progress = computed(() => {
  const total = filteredPending.value.length + filteredCompleted.value.length
  const done = filteredCompleted.value.length
  return { completed: done, total }
})

onMounted(() => {
  void load()
})

function handleQuickAdd(
  title: string,
  description: string | null,
  priority: ActivityPriority,
  dueDate: string | null,
): void {
  const payload = createDefaultActivityPayload()
  payload.title = title
  payload.description = description
  payload.priority = priority
  payload.due_date = dueDate

  void create(payload).then((ok) => {
    if (ok) {
      $q.notify({ type: 'positive', message: 'Actividad agregada.' })
    } else {
      $q.notify({ type: 'negative', message: error.value ?? 'No se pudo agregar la actividad.' })
    }
  })
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

function handleDialogSubmit(payload: ActivityPayload): void {
  const target = editing.value
  const operation = target
    ? update(target.id, payload as Partial<ActivityPayload>)
    : create(payload)

  void operation.then((ok) => {
    if (ok) {
      $q.notify({ type: 'positive', message: target ? 'Actividad actualizada.' : 'Actividad creada.' })
      editing.value = null
    } else {
      $q.notify({ type: 'negative', message: error.value ?? 'No se pudo guardar la actividad.' })
    }
  })
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
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      :model-value="$q.screen.gt.md || drawerOpen"
      :width="240"
      :breakpoint="1024"
      bordered
      class="bg-white"
      @update:model-value="drawerOpen = Boolean($event)"
    >
      <AppSidebar :counts="counts" :active="activeView" @select="select" />
    </q-drawer>

    <q-header class="bg-white text-dark lt-md" bordered>
      <q-toolbar class="q-px-lg">
        <q-btn flat dense round icon="menu" class="q-mr-sm" @click="drawerOpen = true" />
        <div class="brand-mark brand-mark--sm q-mr-sm">
          <q-icon name="check_circle" />
        </div>
        <q-toolbar-title class="text-weight-medium">TaskFlow</q-toolbar-title>
        <span class="text-caption text-grey-7">{{ TODAY_LABEL }}</span>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-1">
      <q-page class="q-pa-lg">
        <div class="q-mx-auto column q-gutter-xl" style="max-width: 860px">
          <DailyHeader
            :date="TODAY_LABEL"
            :title="viewTitles[activeView]"
            :completed="progress.completed"
            :total="progress.total"
          />

          <ActivityFilterChips
            v-model:filter="chipFilter"
            v-model:search="filters.q"
          />

          <QuickAddForm :loading="saving" @submit="handleQuickAdd" />

          <div v-if="error" class="q-pa-md bg-red-1 text-negative rounded-borders">
            {{ error }}
            <q-btn flat dense label="Reintentar" @click="load" />
          </div>

          <div v-if="loading" class="column items-center q-gutter-sm q-py-xl">
            <q-spinner color="primary" size="32px" />
            <span class="text-caption text-grey-7">Cargando actividades…</span>
          </div>

          <template v-else>
            <ActivitySection
              title="Pendientes"
              :activities="filteredPending"
              empty-message="No quedan tareas pendientes con este filtro."
              @toggle="handleToggle"
              @progress="handleProgress"
              @detail="openDetail"
              @edit="openEdit"
              @remove="handleRemove"
            />

            <ActivitySection
              title="Completadas"
              :activities="filteredCompleted"
              empty-message="Todavía no hay tareas completadas."
              completed
              @toggle="handleToggle"
              @progress="handleProgress"
              @detail="openDetail"
              @edit="openEdit"
              @remove="handleRemove"
            />
          </template>
        </div>
      </q-page>
    </q-page-container>

    <ActivityFormDialog
      v-model="dialogOpen"
      :activity="editing"
      :mode="dialogMode"
      @edit="switchToEdit"
      @submit="handleDialogSubmit"
    />
  </q-layout>
</template>
