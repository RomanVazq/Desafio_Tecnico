<script setup lang="ts">
import { ref } from 'vue'

import { PRIORITY_OPTIONS } from '../constants/activity'
import { TODAY_ISO } from '../constants/theme'
import { PRIORITIES, type ActivityPriority } from '../types/activity'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [title: string, description: string | null, priority: ActivityPriority, dueDate: string | null]
}>()

const title = ref('')
const description = ref('')
const priority = ref<ActivityPriority>(PRIORITIES[1])
const dueDate = ref<string | null>(TODAY_ISO)

const titleRules = [
  (value: string | null) => Boolean(value?.trim()) || 'El título es obligatorio.',
]

function handleSubmit(): void {
  const value = title.value.trim()
  if (!value) return

  const detail = description.value.trim()
  emit('submit', value, detail || null, priority.value, dueDate.value)

  title.value = ''
  description.value = ''
  dueDate.value = TODAY_ISO
}
</script>

<template>
  <q-form
    class="row items-center q-gutter-sm q-pa-md rounded-borders bg-white"
    style="border: 1px solid rgba(0, 0, 0, 0.12)"
    @submit.prevent="handleSubmit"
  >
    <div class="col-12 col-sm column q-gutter-xs">
      <div class="row items-center q-gutter-sm">
        <q-icon name="add_circle" color="primary" size="20px" />
        <q-input
          v-model="title"
          borderless
          dense
          placeholder="Añadir una tarea para hoy..."
          class="col"
          :rules="titleRules"
          lazy-rules="ondemand"
        />
      </div>
      <q-input
        v-model="description"
        borderless
        dense
        placeholder="Descripción (opcional)"
        class="q-pl-lg"
      />
    </div>

    <div class="col-12 col-sm-auto column q-gutter-sm" style="min-width: 150px">
      <q-select
        v-model="priority"
        :options="PRIORITY_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        label="Prioridad"
      />
      <q-input v-model="dueDate" type="date" label="Fecha límite" outlined dense clearable />
    </div>

    <q-btn
      type="submit"
      color="primary"
      label="Añadir tarea"
      no-caps
      unelevated
      :loading="loading"
      class="col-12 col-sm-auto"
    />
  </q-form>
</template>
