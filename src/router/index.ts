import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  routes: [
    {
      path: '/:pathMath(.*)*',
      name: 'NotFound',
      component: () => import('../views/NonFoundView.vue'),
    },
    {
      path: '/',
      name: 'main',
      component: () => import('../views/IndexView.vue'),
      meta: { layout: 'main' },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { layout: 'main' },
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { layout: 'main' },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
  ],
  history: createWebHistory(),
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (authStore.getToken && to.name === 'auth') {
    return { name: 'main' }
  }

  if (!authStore.getToken && to.name !== 'auth') {
    return { name: 'auth' }
  }
})
