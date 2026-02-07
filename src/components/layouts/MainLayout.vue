<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div>
    <AppHeader />
    <main>
      <div>
        <slot />
      </div>
    </main>
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
