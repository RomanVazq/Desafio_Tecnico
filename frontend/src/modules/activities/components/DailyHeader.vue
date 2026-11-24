<script setup lang="ts">
import { useQuasar } from 'quasar'

defineProps<{
  date: string
  title: string
  completed: number
  total: number
}>()

const $q = useQuasar()
</script>

<template>
  <header class="column q-gutter-sm">
    <div class="row items-end justify-between q-gutter-md wrap">
      <div class="column q-gutter-xs">
        <span class="text-caption text-muted">{{ date }}</span>
        <h1
          class="text-weight-medium q-ma-none text-headline"
          :class="$q.screen.lt.sm ? 'text-h5' : 'text-h4'"
        >
          {{ title }}
        </h1>
      </div>

      <div
        class="row items-center q-gutter-sm q-pa-sm rounded-borders surface-low subtle-border daily-header__progress"
      >
        <q-linear-progress
          :value="total ? completed / total : 0"
          color="primary"
          rounded
          size="8px"
          :style="{ width: $q.screen.lt.sm ? '72px' : '96px' }"
        />
        <span class="text-caption text-muted text-mono">{{ completed }} de {{ total }} hechas</span>
      </div>
    </div>
  </header>
</template>
