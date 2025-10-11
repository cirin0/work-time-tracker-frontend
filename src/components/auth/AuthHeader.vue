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
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: white;
}

.title {
  font-size: 2.25rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}
</style>
