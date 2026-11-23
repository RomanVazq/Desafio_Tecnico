<script setup lang="ts">
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_COLORS,
  STATUS_OPTIONS,
} from '../constants/activity'
import type { Activity, ActivityPriority, ActivityStatus } from '../types/activity'

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
  return PRIORITY_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function statusLabel(value: ActivityStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}
</script>

<template>
  <q-item class="q-px-md q-py-sm">
    <q-item-section avatar top style="min-width: 72px">
      <div class="row items-center q-gutter-xs">
        <q-btn
          flat
          dense
          round
          icon="schedule"
          :color="activity.status === 'en_progreso' ? 'primary' : 'grey-6'"
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
          :color="activity.status === 'completada' ? 'positive' : 'grey-6'"
          @click="emit('toggle')"
        >
          <q-tooltip>
            {{ activity.status === 'completada' ? 'Volver a pendiente' : 'Marcar como completada' }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-item-section>

    <q-item-section>
      <q-item-label
        :class="activity.status === 'completada' ? 'text-grey-6 text-strike' : 'text-grey-9'"
      >
        {{ activity.title }}
      </q-item-label>
      <q-item-label v-if="activity.description || activity.due_date" caption>
        {{ activity.description }}
        <span v-if="activity.due_date">· {{ activity.due_date }}</span>
      </q-item-label>
    </q-item-section>

    <q-item-section side top>
      <div class="row items-center q-gutter-sm">
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
