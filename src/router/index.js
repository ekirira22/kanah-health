import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

import { Home, Dashboard, GetStarted } from '../views'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/get-started',
    name: 'GetStarted',
    component: GetStarted
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    next('/')
  } else {
    next()
  }
})

export default router
