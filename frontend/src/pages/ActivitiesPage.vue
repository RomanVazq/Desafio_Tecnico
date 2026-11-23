<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')
const status = ref('todos')

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En progreso', value: 'en_progreso' },
  { label: 'Completada', value: 'completada' },
]
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="q-mx-auto" style="max-width: 1100px">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-medium text-dark">Actividades</div>
        </div>
      </div>

      <q-card flat bordered class="q-mb-md">
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-sm-6 col-md-5">
              <q-input
                v-model="search"
                dense
                outlined
                clearable
                placeholder="Buscar por título..."
                prepend-inner-icon="search"
              />
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="status"
                :options="statusOptions"
                emit-value
                map-options
                dense
                outlined
                label="Estado"
              />
            </div>

            <div class="col-12 col-sm-12 col-md-4 text-right">
              <q-btn
                color="primary"
                icon="add"
                label="Nueva actividad"
                no-caps
                unelevated
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="q-pa-lg text-center text-grey-7">
          <q-icon name="inbox" size="48px" color="grey-4" class="q-mb-sm" />
          <div>Sin actividades para mostrar</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>