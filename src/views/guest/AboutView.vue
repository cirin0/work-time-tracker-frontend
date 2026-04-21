<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Про нас"
    description="Work Time Tracker допомагає компаніям контролювати робочий час, комунікацію в команді та прозорість внутрішніх процесів."
  >
    <article class="info-card">
      <h2>Наша мета</h2>
      <p>
        Створити зрозумілий та надійний інструмент для співробітників, менеджерів і адміністраторів
        без складного впровадження.
      </p>
    </article>

    <article class="info-card">
      <h2>Що входить у платформу</h2>
      <ul class="info-list">
        <li>Облік робочого часу та активних змін.</li>
        <li>Управління графіками, заявками на відпустку і ролями користувачів.</li>
        <li>Внутрішній чат і аудит подій для прозорості дій.</li>
      </ul>
    </article>
  </PublicInfoLayout>
</template>
