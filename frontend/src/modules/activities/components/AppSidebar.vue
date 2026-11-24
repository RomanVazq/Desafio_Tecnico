<script setup lang="ts">
import { ACTIVITY_VIEWS, PRIORITY_COLORS, PRIORITY_OPTIONS } from '../constants/activity'
import type { ActivityView } from '../types/activity.types'
import { TODAY_LABEL } from '../utils/activityDates'

defineProps<{
  counts: Record<ActivityView, number>
  active: ActivityView
}>()

const emit = defineEmits<{
  select: [view: ActivityView]
}>()

</script>

<template>
  <aside class="column justify-between q-pa-md full-height">
    <div class="column q-gutter-md" style="min-height: 0; overflow-y: auto">
      <div class="row items-center q-gutter-sm q-px-sm">
        <div class="brand-mark">
          <q-icon name="check_circle" />
        </div>
        <span class="text-subtitle2 text-weight-medium">TaskFlow</span>
      </div>

      <nav class="column q-gutter-xs" aria-label="Vistas principales">
        <q-item
          v-for="item in ACTIVITY_VIEWS"
          :key="item.key"
          clickable
          dense
          class="sidebar-item rounded-borders"
          :active="active === item.key"
          :aria-current="active === item.key ? 'page' : undefined"
          active-class="nav-active"
          @click="emit('select', item.key)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section side>
            <span class="sidebar-count text-caption text-muted text-mono">{{ counts[item.key] }}</span>
          </q-item-section>
        </q-item>
      </nav>

      <div class="column q-gutter-sm">
        <div class="text-caption text-muted q-px-md">Prioridades</div>
        <nav class="column q-gutter-xs" aria-label="Prioridades">
          <q-item
            v-for="option in PRIORITY_OPTIONS"
            :key="option.value"
            clickable
            dense
            class="sidebar-item rounded-borders"
            :active="active === option.value"
            :aria-current="active === option.value ? 'page' : undefined"
            active-class="nav-active"
            @click="emit('select', option.value)"
          >
            <q-item-section avatar>
              <q-icon name="flag" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-chip
                dense
                class="priority-chip"
                :color="PRIORITY_COLORS[option.value]"
                text-color="white"
                :label="option.label"
              />
            </q-item-section>
            <q-item-section side>
              <span class="sidebar-count text-caption text-muted text-mono">{{ counts[option.value] }}</span>
            </q-item-section>
          </q-item>
        </nav>
      </div>
    </div>

    <div
      class="q-pt-md row items-center justify-between text-caption text-muted subtle-border-top"
    >
      <span>Espacio personal</span>
      <span>{{ TODAY_LABEL }}</span>
    </div>
  </aside>
</template>
