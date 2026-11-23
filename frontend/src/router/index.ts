import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '../layouts/MainLayout.vue'
import ActivitiesPage from '../pages/ActivitiesPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', redirect: '/activities' },
        { path: 'activities', name: 'activities', component: ActivitiesPage },
      ],
    },
  ],
})

export default router