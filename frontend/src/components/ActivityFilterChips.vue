<script setup lang="ts">
import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants/activity'
import type {
  ActivityFilterChip,
  PriorityFilter,
  StatusFilter,
} from '../types/activity'

defineProps<{
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
}>()

const chips: { value: ActivityFilterChip; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'progress', label: 'En progreso' },
  { value: 'priority', label: 'Ordenar' },
]

function setStatus(value: unknown): void {
  emit('update:status', (value ?? '') as StatusFilter)
}

function setPriority(value: unknown): void {
  emit('update:priority', (value ?? '') as PriorityFilter)
}
</script>

<template>
  <div class="filter-bar row items-center justify-between q-gutter-md wrap">
    <div class="row q-gutter-sm wrap">
      <q-chip
        v-for="chip in chips"
        :key="chip.value"
        clickable
        :color="filter === chip.value ? 'primary' : 'white'"
        :text-color="filter === chip.value ? 'white' : 'grey-8'"
        class="filter-chip"
        :class="{ 'filter-chip--active': filter === chip.value }"
        :label="chip.label"
        @click="emit('update:filter', chip.value)"
      />
    </div>

    <div class="row items-center q-gutter-sm wrap">
      <q-select
        :model-value="status"
        :options="STATUS_FILTER_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        label="Estado"
        class="filter-select col-12 col-sm-auto"
        style="width: 140px"
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
        class="filter-select col-12 col-sm-auto"
        style="width: 140px"
        @update:model-value="setPriority"
      />
    </div>

    <q-input
      :model-value="search"
      dense
      outlined
      clearable
      placeholder="Buscar tarea..."
      prepend-inner-icon="search"
      class="activity-search col-12 col-sm-auto"
      style="width: 288px"
      @update:model-value="emit('update:search', String($event ?? ''))"
    />
  </div>
</template>
