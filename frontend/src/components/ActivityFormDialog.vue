<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  createDefaultActivityPayload,
} from '../constants/activity'
import type { Activity, ActivityPayload, ActivityStatus } from '../types/activity'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    activity: Activity | null
    mode?: 'edit' | 'detail'
  }>(),
  { mode: 'edit' },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
  submit: [payload: ActivityPayload]
}>()

const isDetail = computed(() => props.mode === 'detail')
const form = ref<ActivityPayload>(createDefaultActivityPayload())

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

watch(
  () => props.activity,
  (activity) => {
    form.value = activity
      ? {
          title: activity.title,
          description: activity.description,
          status: activity.status as ActivityStatus,
          priority: activity.priority,
          due_date: activity.due_date,
        }
      : createDefaultActivityPayload()
  },
  { immediate: true },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  emit('submit', { ...form.value })
  close()
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', Boolean($event))">
    <q-card style="min-width: 320px; max-width: 480px">
      <q-card-section>
        <div class="text-h6 text-headline">
          {{ isDetail ? 'Detalle de la actividad' : 'Editar actividad' }}
        </div>
        <div v-if="isDetail && activity" class="text-caption text-grey-7 q-mt-xs">
          #{{ activity.id }}
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.title" label="Título" outlined dense :readonly="isDetail" />

        <q-input
          :model-value="form.description ?? ''"
          label="Descripción"
          type="textarea"
          outlined
          dense
          :readonly="isDetail"
          @update:model-value="form.description = String($event ?? '') || null"
        />

        <div class="row q-gutter-md">
          <q-select
            v-model="form.status"
            :options="STATUS_OPTIONS"
            emit-value
            map-options
            label="Estado"
            outlined
            dense
            class="col"
            :disable="isDetail"
          />
          <q-select
            v-model="form.priority"
            :options="PRIORITY_OPTIONS"
            emit-value
            map-options
            label="Prioridad"
            outlined
            dense
            class="col"
            :disable="isDetail"
          />
        </div>

        <q-input
          :model-value="form.due_date ?? ''"
          label="Fecha límite"
          placeholder="YYYY-MM-DD"
          outlined
          dense
          :readonly="isDetail"
          @update:model-value="form.due_date = String($event ?? '') || null"
        />

        <div v-if="isDetail && activity" class="column q-gutter-xs text-caption text-grey-7">
          <div>Creada: {{ formatDateTime(activity.created_at) }}</div>
          <div>Actualizada: {{ formatDateTime(activity.updated_at) }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="grey-7" @click="close" />
        <q-btn
          v-if="isDetail"
          unelevated
          label="Editar"
          icon="edit"
          color="primary"
          @click="emit('edit')"
        />
        <q-btn v-else unelevated label="Guardar" color="primary" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
