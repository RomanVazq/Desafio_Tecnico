<script setup lang="ts">
import { ref } from 'vue'

import ActivityItem from './ActivityItem.vue'
import type { Activity } from '../types/activity'

defineProps<{
  title: string
  activities: Activity[]
  emptyMessage: string
  completed?: boolean
}>()

const emit = defineEmits<{
  toggle: [activity: Activity]
  progress: [activity: Activity]
  detail: [activity: Activity]
  edit: [activity: Activity]
  remove: [activity: Activity]
}>()

const visible = ref(true)
</script>

<template>
  <section class="column q-gutter-sm">
    <div class="row items-center justify-between q-px-xs">
      <h2
        class="text-subtitle2 text-weight-medium q-ma-none"
        :class="completed ? 'text-grey-7' : 'text-grey-9'"
      >
        {{ title }}
      </h2>

      <div class="row items-center q-gutter-sm">
        <span class="text-caption text-grey-7">
          {{ activities.length }} {{ activities.length === 1 ? 'tarea' : 'tareas' }}
        </span>
        <q-btn
          v-if="completed"
          flat
          dense
          no-caps
          size="sm"
          :label="visible ? 'Ocultar' : 'Mostrar'"
          @click="visible = !visible"
        />
      </div>
    </div>

    <q-list v-if="visible && activities.length" bordered separator class="rounded-borders bg-white">
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        @toggle="emit('toggle', activity)"
        @progress="emit('progress', activity)"
        @detail="emit('detail', activity)"
        @edit="emit('edit', activity)"
        @remove="emit('remove', activity)"
      />
    </q-list>

    <div
      v-else-if="visible"
      class="q-pa-xl text-center rounded-borders bg-grey-1 text-grey-7"
    >
      {{ emptyMessage }}
    </div>
  </section>
</template>
