<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="@/assets/logo.png" alt="Logo" class="footer-logo" />
          <p class="footer-tagline">Ефективне управління робочим часом</p>
        </div>

        <nav class="footer-links">
          <RouterLink :to="{ name: 'about' }" class="footer-link">Про нас</RouterLink>
          <RouterLink :to="{ name: 'support' }" class="footer-link">Підтримка</RouterLink>
          <RouterLink :to="{ name: 'privacy-policy' }" class="footer-link">Конфіденційність</RouterLink>
          <RouterLink :to="{ name: 'terms-of-use' }" class="footer-link">Умови використання</RouterLink>
        </nav>

        <!-- <div class="footer-social">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
          </a>
        </div> -->
      </div>

      <!-- <div class="footer-bottom">
        <p class="footer-copyright">© {{ currentYear }} Work Time Tracker. Всі права захищені.</p>
      </div> -->
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--surface);
  padding: 1.5rem 3.5rem;
  margin-top: auto;
}

.footer-container {
  max-width: var(--container-max);
  margin: 0 auto;
  border-top: 1px solid var(--border);
  padding: 20px 0px 10px 0px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr auto auto;
  /* gap: 4rem; */
  align-items: end;
  /* padding-bottom: 2rem; */
  /* border-bottom: 1px solid var(--border); */
}

.footer-brand {
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 1rem;
}

.footer-logo {
  height: 36px;
  width: auto;
  flex-shrink: 0;
}

.footer-tagline {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}

.footer-link {
  color: var(--text);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
  white-space: nowrap;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-2);
  transition: width 0.3s;
}

.footer-link:hover {
  color: var(--accent-2);
}

.footer-link:hover::after {
  width: 100%;
}

.footer-social {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg);
  color: var(--text-muted);
  border: 1px solid var(--border);
  transition:
    background 0.25s,
    color 0.25s,
    transform 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
}

.social-link:hover {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border-color: var(--accent-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.25);
}

.footer-bottom {
  padding-top: 1.5rem;
  text-align: center;
}

.footer-copyright {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin: 0;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 2rem 1.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    grid-template-rows: unset;
    gap: 1.75rem;
    text-align: center;
  }

  .footer-brand {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem 2rem;
  }

  .footer-social {
    justify-content: center;
  }
}
</style>
