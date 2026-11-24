<script setup lang="ts">
import { computed } from 'vue'

import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants/activity'
import type {
  ActivityFilterChip,
  PriorityFilter,
  StatusFilter,
} from '../types/activity.types'

const props = defineProps<{
  filter: ActivityFilterChip
  search: string
  status: StatusFilter
  priority: PriorityFilter
}>()

const emit = defineEmits<{
  'update:filter': [value: ActivityFilterChip]
  'update:search': [value: string]
  'update:status': [value: StatusFilter]
  'update:priority': [value: PriorityFilter]
  clear: []
}>()

const chips: { value: ActivityFilterChip; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'progress', label: 'En progreso' },
  { value: 'priority', label: 'Ordenar' },
]

const hasActiveFilters = computed(() =>
  props.filter !== 'all' ||
  props.search.trim() !== '' ||
  props.status !== '' ||
  props.priority !== '',
)

function clearFilters(): void {
  emit('clear')
}

function setStatus(value: unknown): void {
  emit('update:status', (value ?? '') as StatusFilter)
}

function setPriority(value: unknown): void {
  emit('update:priority', (value ?? '') as PriorityFilter)
}
</script>

<template>
  <div class="filter-bar column no-wrap">
    <div class="filter-chips row wrap">
      <q-chip
        v-for="chip in chips"
        :key="chip.value"
        clickable
        :color="filter === chip.value ? 'primary' : undefined"
        :text-color="filter === chip.value ? 'white' : undefined"
        class="filter-chip"
        :class="{ 'filter-chip--active': filter === chip.value }"
        :label="chip.label"
        @click="emit('update:filter', chip.value)"
      />
    </div>

    <div class="filter-actions">
      <q-select
        :model-value="status"
        :options="STATUS_FILTER_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        label="Estado"
        class="filter-select"
        @update:model-value="setStatus"
      />

      <q-select
        :model-value="priority"
        :options="PRIORITY_FILTER_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        label="Prioridad"
        class="filter-select"
        @update:model-value="setPriority"
      />
      <q-input
        :model-value="search"
        dense
        outlined
        clearable
        label="Buscar tareas"
        stack-label
        placeholder="Ej. compras"
        prepend-inner-icon="search"
        class="activity-search"
        @update:model-value="emit('update:search', String($event ?? ''))"
      />

      <q-btn
        unelevated
        dense
        no-caps
        color="primary"
        class="filter-clear-btn"
        aria-label="Limpiar filtros"
        :disable="!hasActiveFilters"
        @click="clearFilters"
      >
        <template #default>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M15.5 3.3a2 2 0 0 0-2.8 0L3.3 12.7a2 2 0 0 0 0 2.8l3 3a2 2 0 0 0 2.8 0l9.4-9.4a2 2 0 0 0 0-2.8l-2.1-2.1a2 2 0 0 0-1.9-.9zM8.3 18.6l-2.9-2.9 8.1-8.1 2.9 2.9-8.1 8.1zm9.3-9.3-2.9-2.9 1.7-1.7a1.4 1.4 0 0 1 2 0l1.8 1.8a1.4 1.4 0 0 1 0 2l-1.8 1.7-2.8-2.9zM4 20.5h16V22H4z"
            />
          </svg>
          <span class="filter-clear-label">Limpiar filtros</span>
        </template>
      </q-btn>
    </div>
  </div>
</template>
