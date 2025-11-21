import { useAuthStore } from '@/features/auth/model/auth.store'
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
      component: () => import('../features/home/ui/IndexPage.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../features/chat/ui/ChatPage.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: () => import('../features/profile/ui/ProfilePage.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../features/auth/ui/AuthPage.vue'),
      meta: { requiresAuth: false },
    },
  ],
  history: createWebHistory(),
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (authStore.isAuthenticated && to.name === 'auth') {
    return { name: 'main' }
  }

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      return { name: 'auth' }
    }

    if (!authStore.currentUser) {
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        console.error('Failed to load user:', error)
        authStore.clearToken()
        return { name: 'auth' }
      }
    }
  }
})
