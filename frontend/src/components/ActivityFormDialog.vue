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

const titleRules = [
  (value: string | null) => Boolean(value?.trim()) || 'El título es obligatorio.',
]

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
    <q-card class="surface-card" style="width: 100%; max-width: 480px">
      <q-form @submit.prevent="submit">
        <q-card-section>
          <div class="text-h6 text-headline">
            {{ isDetail ? 'Detalle de la actividad' : 'Editar actividad' }}
          </div>
          <div v-if="isDetail && activity" class="text-caption text-muted q-mt-xs">
            #{{ activity.id }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.title"
            label="Título"
            outlined
            dense
            :readonly="isDetail"
            :rules="titleRules"
            lazy-rules="ondemand"
          />

          <q-input
            :model-value="form.description ?? ''"
            label="Descripción"
            type="textarea"
            outlined
            dense
            :readonly="isDetail"
            @update:model-value="form.description = String($event ?? '') || null"
          />

          <div class="row q-gutter-sm wrap">
            <q-select
              v-model="form.status"
              :options="STATUS_OPTIONS"
              emit-value
              map-options
              label="Estado"
              outlined
              dense
              class="col-12 col-sm"
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
              class="col-12 col-sm"
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

          <div v-if="isDetail && activity" class="column q-gutter-xs text-caption text-muted">
            <div>Creada: {{ formatDateTime(activity.created_at) }}</div>
            <div>Actualizada: {{ formatDateTime(activity.updated_at) }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="wrap">
          <q-btn flat label="Cerrar" color="secondary" @click="close" />
          <q-btn
            v-if="isDetail"
            unelevated
            label="Editar"
            icon="edit"
            color="primary"
            @click="emit('edit')"
          />
          <q-btn v-else type="submit" unelevated label="Guardar" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
