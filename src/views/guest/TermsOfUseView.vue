<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Умови використання"
    description="Основні принципи користування системою, відповідальність за дані та правила доступу до функціоналу."
  >
    <article class="info-card">
      <h2>Загальні правила</h2>
      <p>
        Використовуючи сервіс, користувач погоджується з політикою доступу, ролями та внутрішніми
        правилами компанії щодо роботи з робочими даними.
      </p>
    </article>

    <article class="info-card">
      <h2>Відповідальність і зміни</h2>
      <ul class="info-list">
        <li>Користувач відповідає за коректність введених даних.</li>
        <li>Адміністратор керує правами доступу відповідно до ролей.</li>
        <li>Правила можуть оновлюватись разом із розвитком продукту.</li>
      </ul>
    </article>
  </PublicInfoLayout>
</template>
