<script setup lang="ts">
withDefaults(
  defineProps<{
    subtitle: string
  }>(),
  {
    subtitle: 'Track your productivity, boost your success',
  },
)
</script>
<template>
  <div class="header">
    <div class="logo-container">
      <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h1 class="title">Work Time Tracker</h1>
    <p class="subtitle">{{ subtitle }}</p>
  </div>
</template>
<style scoped>
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px var(--shadow);
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--surface);
}

.title {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 640px) {
  .logo-container {
    width: 4rem;
    height: 4rem;
  }

  .logo-icon {
    width: 2rem;
    height: 2rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }
}
</style>
