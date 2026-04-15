<template>
  <footer class="promo-footer">
    <div class="footer-content">
      <div class="footer-container">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="footer-brand-logo-row">
              <img src="@/assets/logo.png" alt="Logo" class="footer-logo" />
              <span class="footer-brand-name">Work Time Tracker</span>
            </div>
            <p class="footer-tagline">Керуйте часом ефективно</p>
          </div>

          <nav class="footer-nav">
            <div class="footer-nav-group">
              <a href="#" class="footer-nav-link">Головна</a>
              <a href="#" class="footer-nav-link">Функції</a>
              <a href="#" class="footer-nav-link">Ціни</a>
            </div>
            <div class="footer-nav-group">
              <a href="#" class="footer-nav-link">Підтримка</a>
              <a href="#" class="footer-nav-link">Документація</a>
              <a href="#" class="footer-nav-link">Контакти</a>
            </div>
          </nav>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            © {{ currentYear }} Work Time Tracker. Створено з ❤️ в Україні
          </p>
          <div class="footer-legal">
            <a href="#" class="legal-link">Конфіденційність</a>
            <span class="separator">•</span>
            <a href="#" class="legal-link">Умови</a>
            <span class="separator">•</span>
            <a href="#" class="legal-link">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.promo-footer {
  background: var(--surface);
  color: var(--text);
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-content {
  padding: 3rem 3.5rem 2rem;
}

.footer-container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem;
  align-items: start;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.75rem;
}

/* Brand */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.footer-brand-logo-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.footer-logo {
  height: 28px;
  width: auto;
  flex-shrink: 0;
}

.footer-brand-name {
  font-family: var(--font-heading);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--accent-1);
  letter-spacing: -0.01em;
}

.footer-tagline {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.5;
  padding-left: calc(28px + 0.625rem); /* вирівнювання під назвою */
}

/* Nav */
.footer-nav {
  display: flex;
  gap: 3.5rem;
}

.footer-nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.footer-nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition:
    color 0.2s,
    padding-left 0.2s;
  white-space: nowrap;
}

.footer-nav-link:hover {
  color: var(--accent-2);
  padding-left: 3px;
}

/* Bottom bar */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.footer-legal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legal-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}

.legal-link:hover {
  color: var(--accent-2);
}

.separator {
  color: var(--border);
  font-size: 0.875rem;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    padding: 2.5rem 1.5rem 1.75rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-tagline {
    padding-left: 0;
  }

  .footer-nav {
    gap: 2.5rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-legal {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
