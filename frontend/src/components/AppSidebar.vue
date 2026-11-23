<script setup lang="ts">
import { PRIORITY_OPTIONS } from '../constants/activity'
import { TODAY_LABEL } from '../constants/theme'
import type { ActivityView } from '../types/activity'

defineProps<{
  counts: Record<ActivityView, number>
  active: ActivityView
}>()

const emit = defineEmits<{
  select: [view: ActivityView]
}>()

const primaryViews: { key: ActivityView; label: string; icon: string }[] = [
  { key: 'hoy', label: 'Hoy', icon: 'today' },
  { key: 'proximos', label: 'Próximos días', icon: 'date_range' },
  { key: 'todas', label: 'Todas', icon: 'inbox' },
]
</script>

<template>
  <aside
    class="column justify-between q-pa-md"
    style="width: 240px; height: 100vh; position: sticky; top: 0; border-right: 1px solid rgba(0, 0, 0, 0.08)"
  >
    <div class="column q-gutter-lg">
      <div class="row items-center q-gutter-sm q-px-sm">
        <div class="brand-mark">
          <q-icon name="check_circle" />
        </div>
        <span class="text-subtitle2 text-weight-medium">TaskFlow</span>
      </div>

      <nav class="column q-gutter-xs" aria-label="Vistas principales">
        <q-item
          v-for="item in primaryViews"
          :key="item.key"
          clickable
          dense
          class="rounded-borders"
          :active="active === item.key"
          active-class="bg-blue-1 text-primary"
          @click="emit('select', item.key)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section side>
            <span class="text-caption text-grey-7">{{ counts[item.key] }}</span>
          </q-item-section>
        </q-item>
      </nav>

      <div class="column q-gutter-sm">
        <div class="text-caption text-grey-7 q-px-md">Prioridades</div>
        <nav class="column q-gutter-xs" aria-label="Prioridades">
          <q-item
            v-for="option in PRIORITY_OPTIONS"
            :key="option.value"
            clickable
            dense
            class="rounded-borders"
            :active="active === option.value"
            active-class="bg-blue-1 text-primary"
            @click="emit('select', option.value)"
          >
            <q-item-section avatar>
              <q-icon name="flag" size="20px" />
            </q-item-section>
            <q-item-section>{{ option.label }}</q-item-section>
            <q-item-section side>
              <span class="text-caption text-grey-7">{{ counts[option.value] }}</span>
            </q-item-section>
          </q-item>
        </nav>
      </div>
    </div>

    <div
      class="q-pt-md row items-center justify-between text-caption text-grey-7"
      style="border-top: 1px solid rgba(0, 0, 0, 0.08)"
    >
      <span>Espacio personal</span>
      <span>{{ TODAY_LABEL }}</span>
    </div>
  </aside>
</template>
