<script setup lang="ts">
import { useProfileStore } from '@/stores/profile.store'
import { onMounted, computed } from 'vue'
import { getAvatarUrl } from '@/utils/url'

const store = useProfileStore()

const avatarUrl = computed(() => getAvatarUrl(store.profile?.avatar))

onMounted(() => {
  store.fetchProfile()
})
</script>
<template>
  <div class="profile-avatar" v-if="store.profile">
    <div>
      <strong>Name:</strong> {{ store.profile.name }} <br />
      <strong>Email:</strong> {{ store.profile.email }} <br />
      <strong>Role:</strong> {{ store.profile.role }} <br />
      <div v-if="avatarUrl">
        <img :src="avatarUrl" alt="User Avatar" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.profile-avatar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-size: 18px;
  margin-bottom: 40px;
}
</style>
