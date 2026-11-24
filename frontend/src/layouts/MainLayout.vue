<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="surface-card text-on-surface text-center">
      <q-toolbar class="q-px-lg">
        <q-toolbar-title class="text-weight-medium text-on-surface">
          Gestor de Actividades
        </q-toolbar-title>
      </q-toolbar>

      <q-separator />
    </q-header>

    <q-page-container class="surface-page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
