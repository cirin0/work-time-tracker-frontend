<script setup lang="ts">
import type { User } from '@/types/interfaces/user.interface'
import type { UserProfile } from '@/types/responses/profile.api'
import { getAvatarUrl } from '@/core/utils/url'
import { useProfileStore } from '@/stores/profile.store'
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  user: User | UserProfile
}>()

const profileStore = useProfileStore()
const imageKey = ref(0)

watch(
  () => props.user.avatar,
  () => {
    imageKey.value++
  },
)

watch(
  () => profileStore.profile?.avatar,
  () => {
    imageKey.value++
  },
)

const avatarUrl = computed(() => getAvatarUrl(props.user.avatar))
</script>
<template>
  <div class="user">
    <div class="user-avatar">
      <img v-if="avatarUrl" :key="imageKey" :src="avatarUrl" alt="User Avatar" />
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
  padding: 0.4rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.user.active {
  background-color: var(--sand);
  border-color: var(--accent-2);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  border: 1px solid var(--border);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
