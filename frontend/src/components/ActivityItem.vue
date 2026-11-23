<script setup lang="ts">
import { PRIORITY_COLORS, PRIORITY_OPTIONS } from '../constants/activity'
import type { Activity, ActivityPriority } from '../types/activity'

defineProps<{
  activity: Activity
}>()

const emit = defineEmits<{
  toggle: []
  detail: []
  edit: []
  remove: []
}>()

function priorityLabel(value: ActivityPriority): string {
  return PRIORITY_OPTIONS.find((option) => option.value === value)?.label ?? value
}
</script>

<template>
  <q-item class="q-px-md q-py-sm">
    <q-item-section avatar top style="min-width: 28px">
      <q-checkbox
        :model-value="activity.status === 'completada'"
        color="primary"
        dense
        @update:model-value="emit('toggle')"
      />
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
