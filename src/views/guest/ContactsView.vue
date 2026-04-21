<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Контакти"
    description="Сторінка для зв'язку з командою продукту та уточнення комерційних і технічних питань."
  >
    <article class="info-card">
      <h2>Канали комунікації</h2>
      <p>
        Для робочих питань використовуйте корпоративні контакти вашої компанії та внутрішні канали,
        погоджені з адміністратором.
      </p>
    </article>

    <article class="info-card">
      <h2>Типи звернень</h2>
      <ul class="info-list">
        <li>Комерційні запити та підключення нових команд.</li>
        <li>Консультації щодо функціоналу продукту.</li>
        <li>Технічні інциденти через сторінку «Підтримка».</li>
      </ul>
    </article>
  </PublicInfoLayout>
</template>
