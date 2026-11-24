<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

import { PRIORITY_OPTIONS } from '../constants/activity'
import { titleRules } from '../constants/validation'
import { PRIORITIES, type ActivityPriority } from '../types/activity.types'
import { TODAY_ISO } from '../utils/activityDates'

const props = defineProps<{
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
  if (props.loading) return

  const value = title.value.trim()
  if (!value) return

  const detail = description.value.trim()
  emit('submit', value, detail || null, priority.value, dueDate.value)
}

function reset(): void {
  title.value = ''
  description.value = ''
  dueDate.value = TODAY_ISO
}

defineExpose({ reset })
</script>

<template>
  <q-form
    class="quick-add q-pa-md rounded-borders surface-card subtle-border"
    @submit.prevent="handleSubmit"
  >
    <div class="quick-add__header row items-center justify-between">
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

    <div class="quick-add__fields column no-wrap">
      <q-input
        v-model="title"
        borderless
        dense
        label="Título"
        stack-label
        placeholder="Ej. Comprar leche"
        :rules="titleRules"
        lazy-rules="ondemand"
      />
      <q-input
        v-model="description"
        type="textarea"
        borderless
        dense
        label="Descripción (opcional)"
        stack-label
        placeholder="Ej. Pasar al súper de camino a casa"
        class="full-width"
        :input-style="{ height: '72px', resize: 'none', overflowY: 'auto' }"
      />
    </div>

    <div class="quick-add__fields column no-wrap">
      <q-select
        v-model="priority"
        :options="PRIORITY_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        label="Prioridad"
      />
      <q-input v-model="dueDate" type="date" label="Fecha límite (opcional)" outlined dense clearable />
    </div>
  </q-form>
</template>
