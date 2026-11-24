<script setup lang="ts">
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  labelFor,
} from '../constants/activity'
import type { Activity, ActivityPriority, ActivityStatus } from '../types/activity.types'

defineProps<{
  activity: Activity
}>()

const emit = defineEmits<{
  toggle: []
  progress: []
  detail: []
  edit: []
  remove: []
}>()

function priorityLabel(value: ActivityPriority): string {
  return labelFor(PRIORITY_OPTIONS, value)
}

function statusLabel(value: ActivityStatus): string {
  return labelFor(STATUS_OPTIONS, value)
}
</script>

<template>
  <q-item class="activity-item q-px-md q-py-sm">
    <q-item-section avatar top class="activity-actions" style="min-width: 0">
      <div class="row items-center q-gutter-xs">
        <q-btn
          flat
          dense
          round
          icon="schedule"
          :color="activity.status === 'en_progreso' ? 'tf-progress' : 'tf-muted'"
          @click="emit('progress')"
        >
          <q-tooltip>
            {{ activity.status === 'en_progreso' ? 'Volver a pendiente' : 'Marcar en progreso' }}
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          icon="check"
          :color="activity.status === 'completada' ? 'tf-done' : 'tf-muted'"
          @click="emit('toggle')"
        >
          <q-tooltip>
            {{ activity.status === 'completada' ? 'Volver a pendiente' : 'Marcar como completada' }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-item-section>

    <q-item-section class="activity-content">
      <q-item-label
        class="activity-title"
        :class="activity.status === 'completada' ? 'text-muted text-strike' : 'text-on-surface'"
      >
        {{ activity.title }}
      </q-item-label>
      <q-item-label
        v-if="activity.description || activity.due_date"
        caption
        class="activity-description"
      >
        {{ activity.description }}
        <span v-if="activity.due_date">· {{ activity.due_date }}</span>
        <q-tooltip v-if="activity.description" class="tooltip-description">
          {{ activity.description }}
        </q-tooltip>
      </q-item-label>
    </q-item-section>

    <q-item-section side top class="activity-side">
      <div class="row items-center justify-end q-gutter-sm wrap">
        <q-chip
          v-if="activity.status === 'en_progreso'"
          dense
          icon="schedule"
          :color="STATUS_COLORS[activity.status]"
          text-color="white"
          :label="statusLabel(activity.status)"
        />

        <q-chip
          dense
          icon="flag"
          :color="PRIORITY_COLORS[activity.priority]"
          text-color="white"
          :label="priorityLabel(activity.priority)"
        />

        <q-btn flat dense round icon="more_vert">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup @click="emit('detail')">
                <q-item-section>Ver detalle</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="emit('edit')">
                <q-item-section>Editar</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="emit('remove')">
                <q-item-section class="text-negative">Eliminar</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
</template>
