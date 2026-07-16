<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 120
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header class="sticky-nav" :class="{ visible: isScrolled }">
    <span class="sticky-logo">WonderBakes</span>
    <a href="#download" class="btn btn-primary btn-sm">Download Now</a>
  </header>

  <section class="hero">
    <div class="hero-wrapper">
      <div class="hero-content">
        <h1>🎂 Celebrate in Style with <span>WonderBakes</span></h1>
        <p>
          From beautiful artisanal custom cakes and fresh hand-tied bouquets to curated party supplies. Order from the best local bakeries right to your door.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn btn-primary">Download Now</a>
          <a href="#features" class="btn btn-secondary">Learn More</a>
        </div>
      </div>
      <div class="hero-mockup">
        <div class="glow"></div>
        <img
          src="../assets/wonderbakes.png"
          alt="WonderBakes app showcase with birthday cake, cupcakes, and celebration decorations"
          class="hero-image"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* STICKY TOP NAV (appears on scroll) */
.sticky-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(255, 250, 245, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(106, 27, 154, 0.08);
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.06);

  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.sticky-nav.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.sticky-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}

.btn-sm {
  padding: 8px 18px;
  font-size: 0.9rem;
}

.hero-wrapper {
  background: linear-gradient(180deg, #fffaf5 0%, #fdf5f8 100%);
  border: 1px solid rgba(106, 27, 154, 0.08);
  border-radius: var(--radius-lg);
  padding: 60px;
  box-shadow: var(--shadow-soft);
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  align-items: center;
  margin-top: 40px;
  transition: box-shadow 0.3s ease;
}

.hero-wrapper:hover {
  box-shadow: var(--shadow-hover);
}

.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.15;
  margin-bottom: 20px;
}

.hero-content h1 span {
  color: var(--accent);
}

.hero-content p {
  font-size: 1.15rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  max-width: 550px;
}

.hero-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* WONDERBAKES PROMO IMAGE */
.hero-mockup {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glow {
  position: absolute;
  width: 320px;
  height: 320px;
  background: radial-gradient(
    circle,
    rgba(255, 111, 165, 0.35) 0%,
    rgba(106, 27, 154, 0.2) 45%,
    transparent 70%
  );
  filter: blur(40px);
  z-index: 0;
  animation: pulse-glow 6s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.hero-image {
  position: relative;
  z-index: 1;
  max-width: 100%;
  height: auto;
  width: 420px;
  animation: float-image 5s ease-in-out infinite;
  will-change: transform;
  filter: drop-shadow(0 20px 25px rgba(106, 27, 154, 0.18));
}

@keyframes float-image {
  0% {
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 15px 20px rgba(106, 27, 154, 0.15));
  }
  50% {
    transform: translateY(-12px) rotate(1deg);
    filter: drop-shadow(0 30px 30px rgba(106, 27, 154, 0.25));
  }
  100% {
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 15px 20px rgba(106, 27, 154, 0.15));
  }
}

@media(max-width: 968px) {
  .hero-wrapper {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 30px;
  }
  .hero-content h1 {
    font-size: 2.8rem;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-mockup {
    display: none;
  }
  .sticky-nav {
    padding: 12px 20px;
  }
}
</style>
