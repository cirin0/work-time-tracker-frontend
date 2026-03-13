<script setup lang="ts">
import { useProfileStore } from '@/stores/profile.store'
import { ref, computed, watch } from 'vue'
import { getAvatarUrl } from '@/core/utils/url'

const store = useProfileStore()
const imageKey = ref(0)

watch(
  () => store.profile?.avatar,
  () => {
    imageKey.value++
  },
)

const avatarUrl = computed(() => getAvatarUrl(store.displayProfile?.avatar))
</script>
<template>
  <div class="profile-avatar" v-if="store.displayProfile">
    <div>
      <strong>Name:</strong> {{ store.displayProfile.name }} <br />
      <strong>Email:</strong> {{ store.displayProfile.email }} <br />
      <strong>Role:</strong> {{ store.displayProfile.role }} <br />
      <div v-if="avatarUrl">
        <img :key="imageKey" :src="avatarUrl" alt="User Avatar" />
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
