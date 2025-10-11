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
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/main',
      component: () => import('../views/MainView.vue'),
      children: [{ path: '', component: () => import('../views/IndexView.vue'), name: 'main' }],
    },
  ],
  history: createWebHistory(),
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if ((!authStore.getToken && to.name !== 'auth') || to.name == 'auth/logout') {
    return { name: 'auth' }
  }
})
