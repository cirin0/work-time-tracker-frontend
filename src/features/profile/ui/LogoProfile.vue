<script setup lang="ts">
import type { User } from '@/features/profile/lib/user.interface'
import { getAvatarUrl } from '@/utils/url'
import { computed } from 'vue'

const props = defineProps<{
  user: User
}>()

const avatarUrl = computed(() => getAvatarUrl(props.user.avatar))
</script>
<template>
  <div class="user">
    <div class="user-avatar">
      <img :src="avatarUrl!" alt="User Avatar" v-if="avatarUrl" />
      <div v-else>{{ user.name.charAt(0).toUpperCase() }}</div>
    </div>
    <div class="user-info">
      <div class="user-name">{{ user.name }}</div>
    </div>
  </div>
</template>
<style scoped>
.user {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  cursor: pointer;
}

.user-item:hover {
  background-color: #f3f4f6;
}

.user-item.active {
  background-color: #eff6ff;
  border-left: 3px solid #2563eb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
