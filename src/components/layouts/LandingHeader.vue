<template>
  <header class="landing-header" :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <div class="header-logo">
        <img src="@/assets/logo.svg" alt="Work Time Tracker" class="logo-image" />
        <span class="logo-text">Work Time Tracker</span>
      </div>

      <nav class="header-nav" :class="{ open: isMobileMenuOpen }">
        <a href="#features" class="nav-link" @click.prevent="scrollToSection('features')"
          >Функції</a
        >
        <a href="#how-it-works" class="nav-link" @click.prevent="scrollToSection('how-it-works')"
          >Як це працює</a
        >
        <a href="#benefits" class="nav-link" @click.prevent="scrollToSection('benefits')"
          >Переваги</a
        >
        <a href="#pricing" class="nav-link" @click.prevent="scrollToSection('pricing')">Ціни</a>
      </nav>

      <div class="header-actions">
        <button class="btn-login" @click="goToAuth">Увійти</button>
        <button class="btn-signup" @click="goToAuth">Почати безкоштовно</button>
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
        <svg
          v-if="!isMobileMenuOpen"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
        <svg
          v-else
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMenu = () => {
  isMobileMenuOpen.value = false
}

const scrollToSection = (sectionId: string) => {
  closeMenu()
  const element = document.getElementById(sectionId)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

const goToAuth = () => {
  router.push({ name: 'auth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  transition: all 0.3s;
  padding: 1.5rem 0;
}

.landing-header.scrolled {
  background: var(--surface);
  box-shadow: 0 2px 12px var(--shadow);
  padding: 1rem 0;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-image {
  height: 36px;
  width: auto;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-link {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: color 0.2s;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-2);
  transition: width 0.3s;
}

.nav-link:hover {
  color: var(--accent-2);
}

.nav-link:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-login,
.btn-signup {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-login {
  background: transparent;
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-login:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.btn-signup {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  box-shadow: 0 2px 8px rgba(255, 155, 81, 0.3);
}

.btn-signup:hover {
  background: var(--accent-2-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .header-nav {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: var(--surface);
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    box-shadow: 0 4px 12px var(--shadow);
    transform: translateY(-120%);
    opacity: 0;
    transition: all 0.3s;
  }

  .header-nav.open {
    transform: translateY(0);
    opacity: 1;
  }

  .header-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .nav-link::after {
    display: none;
  }
}
</style>
