<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'AvatarComponent',
})

interface Props {
  src?: string
  alt?: string
  size?: 'small' | 'medium' | 'large'
  fallbackText?: string
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  bordered: false,
})

const sizeClasses = {
  small: 'avatar-small',
  medium: 'avatar-medium',
  large: 'avatar-large',
}

const imageUrl = computed(() => {
  if (!props.src) return undefined

  // If it's already a full URL, return as is
  if (props.src.startsWith('http://') || props.src.startsWith('https://')) {
    return props.src
  }

  // If it starts with /storage, prepend the API base URL
  if (props.src.startsWith('/storage')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}${props.src}`
  }

  return props.src
})
</script>

<template>
  <div :class="['avatar', sizeClasses[size], { 'avatar-bordered': bordered }]">
    <img v-if="imageUrl" :src="imageUrl" :alt="alt || 'avatar'" class="avatar-img" />
    <div v-else class="avatar-fallback">
      {{ fallbackText?.charAt(0)?.toUpperCase() || '?' }}
    </div>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.avatar-small {
  width: 32px;
  height: 32px;
}

.avatar-medium {
  width: 44px;
  height: 44px;
}

.avatar-large {
  width: 96px;
  height: 96px;
}

.avatar-bordered {
  border: 2px solid var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.3);
}

.avatar-bordered.avatar-large {
  border-width: 3px;
  box-shadow:
    0 0 0 3px rgba(255, 155, 81, 0.3),
    0 4px 16px var(--shadow);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--avatar-gradient-from), var(--avatar-gradient-to));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-2);
  font-weight: 700;
}

.avatar-small .avatar-fallback {
  font-size: 0.875rem;
}

.avatar-medium .avatar-fallback {
  font-size: 1.1rem;
}

.avatar-large .avatar-fallback {
  font-size: 2.5rem;
}
</style>
