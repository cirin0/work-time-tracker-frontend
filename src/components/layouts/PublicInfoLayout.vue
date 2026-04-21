<script setup lang="ts">
import LandingHeader from '@/components/layouts/LandingHeader.vue'
import PromoFooter from '@/components/layouts/PromoFooter.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="public-layout">
    <LandingHeader />

    <main class="public-layout__main">
      <section class="hero">
        <div class="container">
          <h1 class="hero__title">{{ title }}</h1>
          <p class="hero__description">{{ description }}</p>
        </div>
      </section>

      <section class="content">
        <div class="container content__inner">
          <slot />
        </div>
      </section>
    </main>

    <PromoFooter />
  </div>
</template>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.public-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 5.5rem;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero {
  padding: 2.25rem 0 1.5rem;
}

.hero__title {
  margin: 0 0 0.75rem;
  color: var(--accent-1);
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

.hero__description {
  max-width: 760px;
  margin: 0;
  color: var(--text-muted);
  line-height: 1.65;
}

.content {
  flex: 1;
  padding: 0 0 3rem;
}

.content__inner {
  display: grid;
  gap: 1rem;
}

:deep(.info-card) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: 0 8px 24px var(--shadow);
}

:deep(.info-card h2) {
  margin: 0 0 0.75rem;
  color: var(--accent-1);
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

:deep(.info-card p) {
  margin: 0 0 0.75rem;
  line-height: 1.65;
}

:deep(.info-card p:last-child) {
  margin-bottom: 0;
}

:deep(.info-list) {
  margin: 0.25rem 0 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .public-layout__main {
    padding-top: 5rem;
  }

  .hero {
    padding: 1.75rem 0 1.25rem;
  }
}
</style>
