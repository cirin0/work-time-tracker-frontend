<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const route = useRoute()

const useLayout = computed(() => route.meta.layout === 'main')
</script>

<template>
  <ErrorBoundary>
    <MainLayout v-if="useLayout">
      <RouterView />
    </MainLayout>
    <RouterView v-else />
  </ErrorBoundary>
</template>
