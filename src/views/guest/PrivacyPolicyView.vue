<script setup lang="ts">
import PublicInfoLayout from '@/components/layouts/PublicInfoLayout.vue'
</script>

<template>
  <PublicInfoLayout
    title="Конфіденційність"
    description="Пояснюємо, як обробляються персональні дані користувачів та які принципи безпеки застосовуються у сервісі."
  >
    <article class="info-card">
      <h2>Обробка даних</h2>
      <p>
        Дані використовуються для автентифікації, обліку робочого часу, комунікації між
        співробітниками та формування звітності в межах ролей доступу.
      </p>
    </article>

    <article class="info-card">
      <h2>Захист інформації</h2>
      <ul class="info-list">
        <li>Доступ до даних обмежений ролями користувачів.</li>
        <li>Передача інформації відбувається через захищені канали.</li>
        <li>Аудит дій допомагає контролювати зміни в системі.</li>
      </ul>
    </article>
  </PublicInfoLayout>
</template>
