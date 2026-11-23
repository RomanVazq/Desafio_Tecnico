<script setup lang="ts">
defineProps<{
  date: string
  title: string
  completed: number
  total: number
}>()
</script>

<template>
  <header class="column q-gutter-md">
    <div class="row items-end justify-between q-gutter-md">
      <div class="column q-gutter-xs">
        <span class="text-caption text-grey-7">{{ date }}</span>
        <h1 class="text-h4 text-weight-medium q-ma-none text-headline">{{ title }}</h1>
      </div>

      <div
        class="row items-center q-gutter-md q-pa-sm rounded-borders bg-grey-1"
        style="border: 1px solid rgba(0, 0, 0, 0.08)"
      >
        <q-linear-progress
          :value="total ? completed / total : 0"
          color="primary"
          rounded
          size="8px"
          style="width: 96px"
        />
        <span class="text-caption text-grey-7">{{ completed }} de {{ total }} hechas</span>
      </div>
    </div>
  </header>
</template>
