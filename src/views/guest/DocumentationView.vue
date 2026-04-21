<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Документація"
    description="Ключові інструкції з використання функцій Work Time Tracker для співробітників, менеджерів і адміністраторів."
  >
    <article class="info-card">
      <h2>Базові розділи</h2>
      <ul class="info-list">
        <li>Робочі сесії та облік часу.</li>
        <li>Управління графіками роботи й запитами на відпустку.</li>
        <li>Ролі, права доступу та аудит дій.</li>
      </ul>
    </article>

    <article class="info-card">
      <h2>Актуальність матеріалів</h2>
      <p>
        Матеріали оновлюються разом із функціоналом продукту. Якщо фактична поведінка відрізняється
        від опису, орієнтуйтесь на останню версію застосунку та зверніться в підтримку.
      </p>
    </article>
  </PublicInfoLayout>
</template>
