<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppDownloadPopup from '@/components/ui/AppDownloadPopup.vue'
</script>

<template>
  <div>
    <AppHeader />
    <main>
      <div>
        <slot />
      </div>
    </main>
    <AppDownloadPopup />
  </div>
</template>

<style scoped>
main {
  flex: 1;
}

main > div {
  min-height: calc(100vh - 73px);
}
</style>
