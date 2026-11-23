<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-dark text-center">
      <q-toolbar class="q-px-lg">
        <q-toolbar-title class="text-weight-medium text-dark">
          Gestor de Actividades
        </q-toolbar-title>
      </q-toolbar>

      <q-separator />
    </q-header>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
