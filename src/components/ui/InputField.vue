<script setup lang="ts">
import EmailIcon from '@/icons/EmailIcon.vue'
import LockIcon from '@/icons/LockIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  label: string
  type: string
  modelValue: string
  placeholder?: string
  icon?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const icons = {
  user: UserIcon,
  email: EmailIcon,
  lock: LockIcon,
}

const iconComponent = computed(() => icons[props.icon as keyof typeof icons] || UserIcon)
</script>
<template>
  <div class="input-wrapper">
    <label class="input-label" :for="name">{{ label }}</label>
    <div class="input-container">
      <component :is="iconComponent" class="input-icon" v-if="icon" />
      <input
        :id="name"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement)?.value ?? '')"
        class="input-field"
      />
    </div>
  </div>
</template>
<style scoped>
.input-wrapper {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}
</style>
