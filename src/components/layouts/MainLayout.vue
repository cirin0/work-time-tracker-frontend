<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AppDownloadPopup from '@/components/ui/AppDownloadPopup.vue'
import PinSetupModal from '@/components/ui/PinSetupModal.vue'
</script>

<template>
  <div class="layout-wrapper">
    <AppHeader />
    <main>
      <div>
        <slot />
      </div>
    </main>
    <AppFooter />
    <AppDownloadPopup />
    <PinSetupModal />
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
