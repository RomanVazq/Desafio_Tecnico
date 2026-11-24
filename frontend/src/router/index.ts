import { createRouter, createWebHistory } from 'vue-router'

import ActivitiesPage from '../modules/activities/pages/ActivitiesPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/activities' },
    { path: '/activities', name: 'activities', component: ActivitiesPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
})

export default router
