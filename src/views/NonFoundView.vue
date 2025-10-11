<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function redirectToMain() {
  router.push('/')
}
</script>
<template>
  <div class="not-found">
    <div class="not-found__form">
      <h1 class="not-found__header">404</h1>
      <ButtonMain @click="redirectToMain()">На головну</ButtonMain>
    </div>
  </div>
</template>
<style scoped>
.not-found {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
.not-found__header {
  font-size: 128px;
  font-weight: bold;
}
.not-found__form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 52px;
  flex-direction: column;
}
</style>
