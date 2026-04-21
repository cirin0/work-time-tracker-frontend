<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Підтримка"
    description="Ми допомагаємо швидко вирішувати технічні питання та помилки під час роботи із системою."
  >
    <article class="info-card">
      <h2>Як звернутись</h2>
      <p>
        Опишіть проблему у внутрішньому чаті або через відповідальний канал вашої компанії. Додайте
        кроки відтворення, час помилки та скріншоти.
      </p>
    </article>

    <article class="info-card">
      <h2>Що пришвидшує рішення</h2>
      <ul class="info-list">
        <li>Роль користувача та розділ, де виникла проблема.</li>
        <li>Які дії виконувались перед помилкою.</li>
        <li>Текст помилки або очікуваний результат.</li>
      </ul>
    </article>
  </PublicInfoLayout>
</template>
