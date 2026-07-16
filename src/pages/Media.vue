<template>
  <div class="bio-links">
    <div class="bio-links__container">
      <!-- ============ HEADER : Brand & Bio ============ -->
      <header class="bio-header">
        <div class="bio-header__avatar">
          <!-- Cute bakery SVG icon as an avatar -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="avatar-icon">
            <path d="M12 2a9 9 0 0 1 9 9c0 2.2-1.3 4.1-3.2 5l-1.8 5.4a1 1 0 0 1-1 .6H9a1 1 0 0 1-1-.6L6.2 16C4.3 15.1 3 13.2 3 11a9 9 0 0 1 9-9z"/>
            <path d="M12 6v4M9 8h6M7 13h10"/>
          </svg>
        </div>
        <h1 class="bio-header__title">WonderBakes</h1>
        <p class="bio-header__tagline">
          Baking the orders. Building the trust. <br />
          Follow our daily kitchen chaos and tech updates! 🍰💻
        </p>
      </header>

      <!-- ============ PRIMARY SOCIALS : Main Cards ============ -->
      <main class="links-list">
        <a 
          v-for="link in primarySocials" 
          :key="link.label" 
          :href="link.url" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="link-btn"
          :style="{ '--hover-color': link.color }"
        >
          <span class="link-btn__icon" v-html="link.icon"></span>
          <div class="link-btn__text">
            <strong>{{ link.label }}</strong>
            <span class="link-btn__sub">{{ link.subtext }}</span>
          </div>
          <span class="link-btn__arrow" aria-hidden="true">&#8599;</span>
        </a>
      </main>

      <!-- ============ SECONDARY SOCIALS : Minimalist Tray ============ -->
      <section class="secondary-tray">
        <h2 class="tray-title">Also find us on</h2>
        <div class="tray-grid">
          <a 
            v-for="link in secondarySocials" 
            :key="link.label" 
            :href="link.url" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="tray-btn"
            :aria-label="link.label"
            :style="{ '--hover-color': link.color }"
          >
            <span class="tray-btn__icon" v-html="link.icon"></span>
          </a>
        </div>
      </section>

      <!-- ============ FOOTER ============ -->
      <footer class="bio-footer">
        <p class="bio-footer__domain">wonderbakes.shop</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * ---------------------------------------------------------------
 * PRIMARY SOCIALS (Detailed Cards)
 * Best for platforms with rich content or direct messaging.
 * ---------------------------------------------------------------
 */
const primarySocials = ref([
  {
    label: 'WhatsApp',
    subtext: 'Chat with our kitchen & place a custom order',
    url: 'https://wa.me/yourphonenumber',
    color: '#25D366',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.453 4.957 1.453 5.332 0 9.67-4.33 9.673-9.648.002-2.577-1.002-5.001-2.83-6.83-1.83-1.829-4.255-2.83-6.837-2.83-5.337 0-9.674 4.334-9.677 9.656-.001 1.848.499 3.51 1.447 5.086l-.997 3.637 3.737-.98z"/></svg>`
  },
  {
    label: 'Instagram',
    subtext: 'Fresh bakes, behind-the-scenes, & design showcases',
    url: 'https://instagram.com/wonderbakes',
    color: '#E1306C',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
  },
  {
    label: 'daily.dev',
    subtext: 'Read our tech logs & engineering insights',
    url: 'https://daily.dev',
    color: '#E11D48',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.999 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.626 0 11.999 0zm4.243 14.908l-4.243 4.243-4.243-4.243V12h8.486v2.908zM12 7.092l2.121 2.121H9.879L12 7.092z"/></svg>`
  },
  {
    label: 'YouTube',
    subtext: 'Long-form cake decoration tutorials & tech deep-dives',
    url: 'https://youtube.com/@wonderbakes',
    color: '#FF0000',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>`
  }
])

/**
 * ---------------------------------------------------------------
 * SECONDARY SOCIALS (Clean Icons)
 * Keep the screen compact by using icon buttons for remaining profiles.
 * ---------------------------------------------------------------
 */
const secondarySocials = ref([
  {
    label: 'Pinterest',
    url: 'https://pinterest.com/wonderbakes',
    color: '#BD081C',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.166-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.36 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>`
  },
  {
    label: 'X (formerly Twitter)',
    url: 'https://x.com/wonderbakes',
    color: '#000000',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  },
  {
    label: 'Facebook',
    url: 'https://facebook.com/wonderbakes',
    color: '#1877F2',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
  }
])
</script>

<style scoped>
/* ============ BRAND THEME VARIABLES ============ */
.bio-links {
  --cocoa: #2f1c14;
  --cocoa-soft: #6b4a37;
  --dough: #f6ede0;
  --dough-deep: #ebdcc7;
  --raspberry: #b7355c;
  --raspberry-deep: #8f2a49;
  --pistachio: #7f9b76;
  --ink: #241511;

  font-family: 'Inter', 'Work Sans', system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--dough);
  min-height: 100vh;
  padding: 3.5rem 1.25rem 2.5rem;
  display: flex;
  justify-content: center;
}

.bio-links__container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ============ HEADER ============ */
.bio-header {
  text-align: center;
  margin-bottom: 2.25rem;
}

.bio-header__avatar {
  width: 80px;
  height: 80px;
  background: var(--cocoa);
  color: var(--dough);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.15rem;
  box-shadow: 0 4px 12px rgba(47, 28, 20, 0.1);
  border: 3px solid #fff;
}

.avatar-icon {
  width: 40px;
  height: 40px;
}

.bio-header__title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.bio-header__tagline {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--cocoa-soft);
  max-width: 42ch;
  margin: 0;
}

/* ============ PRIMARY LINK LIST ============ */
.links-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 2.5rem;
}

/* Individual Link Button */
.link-btn {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.25rem;
  border-radius: 16px;
  background: #fff;
  border: 1.5px solid var(--dough-deep);
  text-decoration: none;
  color: var(--ink);
  position: relative;
  transition: all 0.2s ease;
}

.link-btn__icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--dough);
  color: var(--cocoa);
  transition: color 0.2s/ease, background-color 0.2s ease;
}

.link-btn__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.link-btn__text strong {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--cocoa);
}

.link-btn__sub {
  font-size: 0.8rem;
  color: var(--cocoa-soft);
  margin-top: 0.15rem;
}

.link-btn__arrow {
  font-size: 1rem;
  color: var(--dough-deep);
  transition: color 0.2s ease;
}

/* Hover States for Primary Links */
.link-btn:hover {
  transform: translateY(-2px);
  border-color: var(--hover-color, var(--raspberry));
  box-shadow: 0 6px 16px rgba(47, 28, 20, 0.05);
}

.link-btn:hover .link-btn__icon {
  background: var(--hover-color, var(--raspberry));
  color: #fff;
}

.link-btn:hover .link-btn__arrow {
  color: var(--hover-color, var(--raspberry));
}

/* ============ SECONDARY SOCIAL TRAY ============ */
.secondary-tray {
  width: 100%;
  text-align: center;
  margin-bottom: 3.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--dough-deep);
}

.tray-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--cocoa-soft);
  margin-bottom: 1.25rem;
}

.tray-grid {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
}

.tray-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid var(--dough-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cocoa-soft);
  transition: all 0.2s ease;
}

.tray-btn:hover {
  transform: translateY(-3px);
  border-color: var(--hover-color, var(--raspberry));
  color: #fff;
  background: var(--hover-color, var(--raspberry));
  box-shadow: 0 4px 12px rgba(47, 28, 20, 0.08);
}

/* ============ FOOTER ============ */
.bio-footer {
  text-align: center;
}

.bio-footer__domain {
  font-family: 'Fraunces', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--raspberry);
  margin: 0;
}
</style>

