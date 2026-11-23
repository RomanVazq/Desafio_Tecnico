<script setup lang="ts">
import type { ActivityFilterChip } from '../types/activity'

defineProps<{
  filter: ActivityFilterChip
  search: string
}>()

const emit = defineEmits<{
  'update:filter': [value: ActivityFilterChip]
  'update:search': [value: string]
}>()

const chips: { value: ActivityFilterChip; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'priority', label: 'Prioridad' },
]
</script>

<template>
  <div class="row items-center justify-between q-gutter-md">
    <div class="row q-gutter-sm">
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

    <q-input
      :model-value="search"
      dense
      outlined
      clearable
      placeholder="Buscar tarea..."
      prepend-inner-icon="search"
      style="width: 260px"
      @update:model-value="emit('update:search', String($event ?? ''))"
    />
  </div>
</template>
