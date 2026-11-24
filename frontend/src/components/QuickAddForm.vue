<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

import { PRIORITY_OPTIONS } from '../constants/activity'
import { TODAY_ISO } from '../constants/theme'
import { titleRules } from '../constants/validation'
import { PRIORITIES, type ActivityPriority } from '../types/activity'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [title: string, description: string | null, priority: ActivityPriority, dueDate: string | null]
}>()

const $q = useQuasar()

const title = ref('')
const description = ref('')
const priority = ref<ActivityPriority>(PRIORITIES[1])
const dueDate = ref<string | null>(TODAY_ISO)

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
    class="row items-center q-gutter-sm q-pa-md rounded-borders surface-card subtle-border"
    @submit.prevent="handleSubmit"
  >
    <div class="col-12 row items-center justify-between q-gutter-xs q-mb-xs">
      <q-icon name="add_circle" color="primary" size="20px" />

      <h2
        class="col text-center text-subtitle1 text-weight-medium q-ma-none text-headline text-on-surface"
      >
        Agregar nueva tarea
      </h2>

      <q-btn
        type="submit"
        color="primary"
        :label="$q.screen.lt.sm ? undefined : 'Añadir tarea'"
        :icon="$q.screen.lt.sm ? 'add' : undefined"
        aria-label="Añadir tarea"
        no-caps
        unelevated
        class="quick-add__submit"
        :loading="loading"
      >
        <q-tooltip v-if="$q.screen.lt.sm">Añadir tarea</q-tooltip>
      </q-btn>
    </div>

    <div class="col-12 col-sm column q-gutter-xs">
      <q-input
        v-model="title"
        borderless
        dense
        placeholder="Añadir una tarea para hoy..."
        :rules="titleRules"
        lazy-rules="ondemand"
      />
      <q-input
        v-model="description"
        type="textarea"
        borderless
        dense
        placeholder="Descripción (opcional)"
        class="full-width"
        :input-style="{ height: '72px', resize: 'none', overflowY: 'auto' }"
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
  </q-form>
</template>
