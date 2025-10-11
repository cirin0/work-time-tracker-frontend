<template>
  <button class="button">
    <slot />
  </button>
</template>
<style scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4caf50;
  cursor: pointer;
  border-radius: 50px;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  color: white;
}

.button:hover {
  background-color: #45a049;
}
</style>
