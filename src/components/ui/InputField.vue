<script setup lang="ts">
import EmailIcon from '@/icons/EmailIcon.vue'
import LockIcon from '@/icons/LockIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import { computed } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps<{
  name: string
  label: string
  type: string
  modelValue?: string
  placeholder?: string
  icon?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
}>()

const icons = {
  user: UserIcon,
  email: EmailIcon,
  lock: LockIcon,
}

const iconComponent = computed(() => icons[props.icon as keyof typeof icons] || UserIcon)

const { value: inputValue, errorMessage } = useField<string>(() => props.name)

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement)?.value ?? ''
  inputValue.value = value
  emit('update:modelValue', value)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}
</script>
<template>
  <div class="input-wrapper">
    <label class="input-label" :for="name">{{ label }}</label>
    <div class="input-container">
      <component :is="iconComponent" class="input-icon" v-if="icon" />
      <input
        :id="name"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :value="inputValue"
        @input="handleInput"
        @focus="handleFocus"
        :class="['input-field', { 'input-error': errorMessage }]"
      />
    </div>
    <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
  </div>
</template>
<style scoped>
.input-wrapper {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
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
  color: var(--text-muted);
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.input-error {
  border-color: var(--error-text) !important;
}

.input-error:focus {
  border-color: var(--error-text) !important;
  box-shadow: 0 0 0 3px var(--error-bg) !important;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--error-text);
  font-weight: 500;
}

@media (max-width: var(--bp-sm)) {
  .input-field {
    font-size: 1rem;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
  }
}
</style>
