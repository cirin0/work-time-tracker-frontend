<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppDownloadPopup from '@/components/ui/AppDownloadPopup.vue'
import PinSetupModal from '@/components/ui/PinSetupModal.vue'
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
    <PinSetupModal />
  </div>
</template>

<style scoped>
main {
  flex: 1;
}

main > div {
  padding-bottom: 2rem;
}
</style>
