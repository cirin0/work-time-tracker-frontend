<template>
  <div class="landing-page">
    <LandingHeader />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content" :class="{ 'fade-in': isVisible }">
          <h1 class="hero-title">
            Керуйте робочим часом
            <span class="highlight">ефективно</span>
          </h1>
          <p class="hero-description">
            Сучасна система обліку робочого часу для команд будь-якого розміру. Автоматизуйте
            процеси, підвищуйте продуктивність та контролюйте витрати часу.
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="goToAuth">
              Почати безкоштовно
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button class="btn-secondary" @click="goToDemo">
              Дивитись демо
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="hero-image" :class="{ 'slide-in': isVisible }">
          <div class="floating-card card-1">
            <ClockIcon class="card-icon" />
            <div class="card-text">Облік часу</div>
          </div>
          <div class="floating-card card-2">
            <ChartBarIcon class="card-icon" />
            <div class="card-text">Статистика</div>
          </div>
          <div class="floating-card card-3">
            <UserIcon class="card-icon" />
            <div class="card-text">Команда</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Все необхідне в одному місці</h2>
          <p class="section-description">
            Потужні інструменти для управління робочим часом вашої команди
          </p>
        </div>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid">
          <div v-for="(stat, index) in stats" :key="index" class="stat-item">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Як це працює</h2>
          <p class="section-description">Почніть працювати за 3 простих кроки</p>
        </div>

        <div class="steps-grid">
          <div v-for="(step, index) in steps" :key="index" class="step-card">
            <div class="step-number">{{ index + 1 }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile App Section -->
    <section class="mobile-app-section">
      <div class="section-container">
        <div class="mobile-app-content">
          <div class="mobile-app-visual">
            <div class="phone-mockup">
              <div class="phone-screen">
                <div class="app-preview">
                  <div class="preview-header">
                    <div class="preview-time">09:00</div>
                    <div class="preview-status">
                      <div class="status-dot"></div>
                      <span>Активна сесія</span>
                    </div>
                  </div>
                  <div class="preview-content">
                    <div class="preview-card">
                      <MapPinIcon class="preview-icon" />
                      <span>GPS відмітка</span>
                    </div>
                    <div class="preview-card">
                      <ClockIcon class="preview-icon" />
                      <span>Облік часу</span>
                    </div>
                    <div class="preview-card">
                      <ChatIcon class="preview-icon" />
                      <span>Чат</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mobile-app-text">
            <h2 class="section-title">Мобільний додаток</h2>
            <p class="section-description description--mobile">
              Повний функціонал у вашій кишені. Відмічайтесь на роботі, спілкуйтесь з колегами та
              контролюйте свій робочий час з Android пристрою. iOS версія в розробці.
            </p>
            <ul class="mobile-features-list">
              <li class="mobile-feature-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>GPS та QR-код відмітки</span>
              </li>
              <li class="mobile-feature-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Push-сповіщення в реальному часі</span>
              </li>
              <li class="mobile-feature-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Автоматичні оновлення додатку</span>
              </li>
              <li class="mobile-feature-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Офлайн режим для перегляду даних</span>
              </li>
            </ul>
            <div class="app-badges">
              <div class="app-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"
                  />
                </svg>
                <span>Android</span>
              </div>
              <div class="app-badge app-badge-coming">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                  />
                </svg>
                <div>
                  <span>iOS</span>
                  <span class="coming-soon">Незабаром</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="benefits-section">
      <div class="section-container">
        <div class="benefits-content">
          <div class="benefits-text">
            <h2 class="section-title">Чому обирають нас</h2>
            <ul class="benefits-list">
              <li v-for="(benefit, index) in benefits" :key="index" class="benefit-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>
          <div class="benefits-visual">
            <div class="visual-card">
              <div class="visual-header">
                <div class="visual-dot"></div>
                <div class="visual-dot"></div>
                <div class="visual-dot"></div>
              </div>
              <div class="visual-content">
                <div class="visual-bar" style="width: 85%"></div>
                <div class="visual-bar" style="width: 92%"></div>
                <div class="visual-bar" style="width: 78%"></div>
                <div class="visual-bar" style="width: 95%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Готові розпочати?</h2>
          <p class="cta-description">
            Приєднуйтесь до тисяч компаній, які вже використовують наш сервіс
          </p>
          <button class="btn-cta" @click="goToAuth">Спробувати безкоштовно</button>
        </div>
      </div>
    </section>

    <PromoFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LandingHeader from '@/components/layouts/LandingHeader.vue'
import PromoFooter from '@/components/layouts/PromoFooter.vue'
import ClockIcon from '@/icons/ClockIcon.vue'
import ChartBarIcon from '@/icons/ChartBarIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import ChatIcon from '@/icons/ChatIcon.vue'
import MapPinIcon from '@/icons/MapPinIcon.vue'
import LockIcon from '@/icons/LockIcon.vue'
import DocumentTextIcon from '@/icons/DocumentTextIcon.vue'

const router = useRouter()
const isVisible = ref(false)

const features = [
  {
    icon: ClockIcon,
    title: 'Облік робочого часу',
    description:
      'Автоматичне відстеження часу з GPS та QR-кодами. Контроль запізнень та понаднормових годин',
  },
  {
    icon: ChartBarIcon,
    title: 'Детальна аналітика',
    description: 'Звіти та статистика по співробітникам. Експорт даних у Excel для аналізу',
  },
  {
    icon: CalendarIcon,
    title: 'Управління відпустками',
    description: 'Подача заявок на відпустку, лікарняні та відгули. Швидке затвердження менеджером',
  },
  {
    icon: UserIcon,
    title: 'Управління командою',
    description:
      'Організація співробітників за компаніями. Призначення менеджерів та гнучкі графіки роботи',
  },
  {
    icon: ChatIcon,
    title: 'Внутрішній чат',
    description: 'Зашифрований обмін повідомленнями між співробітниками в реальному часі',
  },
  {
    icon: MapPinIcon,
    title: 'GPS та QR відмітки',
    description: 'Геолокація для офісних працівників. Щоденні QR-коди для гібридного режиму',
  },
  {
    icon: LockIcon,
    title: 'PIN-код захист',
    description: 'Додатковий захист при завершенні робочого дня через PIN-код',
  },
  {
    icon: DocumentTextIcon,
    title: 'Аудит логи',
    description: 'Повна історія змін для прозорості та контролю всіх операцій',
  },
]

const stats = [
  { number: '3', label: 'Режими роботи' },
  { number: '24/7', label: 'Доступність' },
  { number: 'Android', label: 'Мобільний додаток' },
  { number: '100%', label: 'Безпека даних' },
]

const steps = [
  {
    title: 'Реєстрація компанії',
    description: 'Створіть акаунт адміністратора та налаштуйте компанію з геолокацією офісу',
  },
  {
    title: 'Додайте команду',
    description: 'Запросіть співробітників, призначте менеджерів та налаштуйте графіки роботи',
  },
  {
    title: 'Почніть відстежувати',
    description: 'Співробітники відмічаються через мобільний додаток з GPS або QR-кодом',
  },
]

const benefits = [
  'Окрема база даних для кожної компанії',
  'Можливість self-hosted розгортання',
  'Мобільний додаток для Android (iOS незабаром)',
  'Push-сповіщення через Firebase',
  'Автоматичне резервне копіювання',
  'Експорт звітів у Excel',
  'Реальний час через WebSocket',
  'JWT автентифікація',
]

const goToAuth = () => {
  router.push({ name: 'auth' })
}

const goToDemo = () => {
  const element = document.getElementById('how-it-works')
  if (!element) return

  const headerOffset = 80
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--bg);
}

:global(html) {
  scroll-behavior: smooth;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%);
  padding: 8rem 1.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 155, 81, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.hero-container {
  max-width: var(--container-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.hero-content.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text);
  margin: 0 0 1.5rem 0;
}

.highlight {
  color: var(--accent-2);
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(255, 155, 81, 0.2);
  z-index: -1;
  animation: highlight 1.5s ease-out 0.5s forwards;
}

@keyframes highlight {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-muted);
  margin: 0 0 2.5rem 0;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-cta {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.3);
}

.btn-primary:hover {
  background: var(--accent-2-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 155, 81, 0.4);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-2px);
}

.hero-image {
  position: relative;
  height: 500px;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.8s ease-out 0.3s;
}

.hero-image.slide-in {
  opacity: 1;
  transform: translateX(0);
}

.floating-card {
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: float 3s ease-in-out infinite;
}

.card-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 45%;
  right: 5%;
  animation-delay: 1s;
}

.card-3 {
  bottom: 15%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.card-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-2);
}

.card-text {
  font-weight: 600;
  color: var(--text);
}

/* Sections */
.section-container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 1rem 0;
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-muted);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}
.description--mobile {
  margin: 0;
}

/* Features Section */
.features-section {
  background: var(--surface);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px var(--shadow);
  border-color: var(--accent-2);
}

.feature-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-2);
  margin-bottom: 1.5rem;
}

.feature-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.feature-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.75rem 0;
}

.feature-description {
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Stats Section */
.stats-section {
  background: var(--accent-1);
  color: var(--header-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  text-align: center;
}

.stat-number {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent-2);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.125rem;
  color: var(--header-text-muted);
}

/* How It Works Section */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.step-card {
  text-align: center;
  position: relative;
}

.step-card::after {
  content: '→';
  position: absolute;
  top: 40px;
  right: -2rem;
  font-size: 2rem;
  color: var(--accent-2);
  opacity: 0.3;
}

.step-card:last-child::after {
  display: none;
}

.step-number {
  width: 80px;
  height: 80px;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.3);
}

.step-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem 0;
}

.step-description {
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Mobile App Section */
.mobile-app-section {
  background: var(--bg);
  overflow: hidden;
}

.mobile-app-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.mobile-app-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-mockup {
  width: 300px;
  height: 600px;
  background: var(--accent-1);
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 20px 60px rgba(37, 52, 63, 0.3);
  position: relative;
}

.phone-mockup::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: rgba(234, 239, 239, 0.3);
  border-radius: 2px;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: var(--bg);
  border-radius: 32px;
  overflow: hidden;
}

.app-preview {
  padding: 2rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-time {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 155, 81, 0.1);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--accent-2);
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-2);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--text);
  font-weight: 500;
}

.preview-icon {
  width: 24px;
  height: 24px;
  color: var(--accent-2);
}

.mobile-features-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.0625rem;
  color: var(--text);
}

.mobile-feature-item svg {
  color: var(--accent-2);
  flex-shrink: 0;
}

.app-badges {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.app-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-weight: 600;
  color: var(--text);
  transition: all 0.3s;
}

.app-badge:hover {
  border-color: var(--accent-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.app-badge svg {
  width: 24px;
  height: 24px;
  color: var(--accent-2);
  flex-shrink: 0;
}

.app-badge-coming {
  opacity: 0.6;
  cursor: default;
}

.app-badge-coming:hover {
  transform: none;
  border-color: var(--border);
  box-shadow: none;
}

.app-badge-coming svg {
  color: var(--text-muted);
}

.app-badge-coming > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coming-soon {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* Benefits Section */
.benefits-section {
  background: var(--surface);
}

.benefits-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.125rem;
  color: var(--text);
}

.benefit-item svg {
  color: var(--accent-2);
  flex-shrink: 0;
}

.benefits-visual {
  display: flex;
  justify-content: center;
}

.visual-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 12px 32px var(--shadow);
}

.visual-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.visual-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
}

.visual-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.visual-bar {
  height: 40px;
  background: linear-gradient(90deg, var(--accent-2) 0%, var(--accent-2-hover) 100%);
  border-radius: 8px;
  animation: growBar 1.5s ease-out forwards;
  transform-origin: left;
}

@keyframes growBar {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--header-bg) 100%);
  color: var(--header-text);
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.cta-description {
  font-size: 1.25rem;
  color: var(--header-text-muted);
  margin: 0 0 2.5rem 0;
}

.btn-cta {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  font-size: 1.125rem;
  padding: 1.25rem 3rem;
  box-shadow: 0 8px 24px rgba(255, 155, 81, 0.4);
}

.btn-cta:hover {
  background: var(--accent-2-hover);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 155, 81, 0.5);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-image {
    height: 400px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .step-card::after {
    display: none;
  }

  .mobile-app-content {
    grid-template-columns: 1fr;
  }

  .benefits-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
