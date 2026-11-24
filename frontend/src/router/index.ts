import { createRouter, createWebHistory } from 'vue-router'

import ActivitiesPage from '../modules/activities/pages/ActivitiesPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/activities' },
    { path: '/activities', name: 'activities', component: ActivitiesPage },
  ],
})

export default router
